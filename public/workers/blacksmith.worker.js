/**
 * Blacksmith (Demirci) Monte Carlo Simulation Worker
 * 
 * State Machine based simulation for weapon/armor upgrade system.
 * Supports:
 * - Additive vs Multiplicative chance calculation
 * - Pity systems (none, incremental, hard)
 * - Priority-based material usage
 * - Protection and degradation mechanics
 */

// ============================================================================
// CONSTANTS
// ============================================================================

const SAFETY_LIMIT = 1_000_000;

// Material definitions with their properties
const MATERIALS = {
    blessing_scroll: {
        name: 'Kutsama Kağıdı',
        bonusChance: 0,          // Base bonus %
        protected: false,        // Item not destroyed on fail
        degradeOnFail: true,     // Level decreases on fail
        price: 1000000           // Default price
    },
    magic_stone: {
        name: 'Büyülü Metal',
        bonusChance: 5,          // +5% bonus
        protected: true,         // Item protected on fail
        degradeOnFail: false,
        price: 5000000
    },
    ritual_stone: {
        name: 'Ritüel Taşı',
        bonusChance: 10,         // +10% bonus
        protected: true,
        degradeOnFail: false,
        price: 15000000
    },
    blacksmith_book: {
        name: 'Demirci El Kitabı',
        bonusChance: 15,         // +15% bonus (buff item)
        protected: true,
        degradeOnFail: false,
        price: 50000000
    },
    raw: {
        name: 'Demirci (Korumasız)',
        bonusChance: 0,
        protected: false,
        degradeOnFail: false,    // Item destroyed on fail
        price: 0
    }
};

// Default level-based upgrade chances
// Each level: { baseChance, pityLimit, upgradeCost }
const DEFAULT_LEVEL_CONFIG = {
    0: { baseChance: 90, pityLimit: 5, upgradeCost: 0 },
    1: { baseChance: 85, pityLimit: 5, upgradeCost: 0 },
    2: { baseChance: 80, pityLimit: 6, upgradeCost: 0 },
    3: { baseChance: 75, pityLimit: 6, upgradeCost: 0 },
    4: { baseChance: 70, pityLimit: 7, upgradeCost: 100000 },
    5: { baseChance: 60, pityLimit: 8, upgradeCost: 200000 },
    6: { baseChance: 50, pityLimit: 10, upgradeCost: 300000 },
    7: { baseChance: 40, pityLimit: 12, upgradeCost: 400000 },
    8: { baseChance: 30, pityLimit: 15, upgradeCost: 500000 },
    9: { baseChance: 20, pityLimit: 20, upgradeCost: 1000000 }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate final success chance based on config
 */
function calculateChance(baseChance, itemBonus, calcMode, pityBonus = 0) {
    let finalChance;

    if (calcMode === 'multiplicative') {
        // Multiplicative: Base * (1 + bonus/100)
        finalChance = baseChance * (1 + itemBonus / 100);
    } else {
        // Additive: Base + bonus
        finalChance = baseChance + itemBonus;
    }

    // Add pity bonus
    finalChance += pityBonus;

    // Cap at 100%
    return Math.min(finalChance, 100);
}

/**
 * Get pity bonus based on system type
 */
function getPityBonus(pitySystem, failCount, pityLimit) {
    if (pitySystem === 'none') {
        return 0;
    }

    if (pitySystem === 'hard') {
        // Hard pity: 100% at limit
        // If limit is 0, pity is disabled for this level (True RNG)
        if (pityLimit > 0 && failCount >= pityLimit) {
            return 100; // Force success
        }
        return 0;
    }

    if (pitySystem === 'incremental') {
        // Incremental: +5% per fail
        return failCount * 5;
    }

    return 0;
}

/**
 * Select material from priority list based on available stock
 */
function selectMaterial(priorityList, stock, fallbackToRaw = true) {
    for (const materialId of priorityList) {
        if (stock[materialId] && stock[materialId] > 0) {
            return materialId;
        }
    }

    // No materials available
    if (fallbackToRaw) {
        return 'raw'; // Blacksmith mode (no protection)
    }

    return null; // Stop simulation
}

/**
 * Deep clone object
 */
function cloneObject(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// ============================================================================
// SINGLE SIMULATION
// ============================================================================

/**
 * Run a single upgrade attempt from startLevel to targetLevel
 * State-based approach: while (currentStage !== targetStage)
 * @returns {Object} { success, finalLevel, materialsUsed, attempts, stuckAt, isDestroyed, yangCost }
 */
function simulateSingleUpgrade(startLevel, targetLevel, inventory, config, strategy, materialBonuses, marketPrices) {
    let currentLevel = startLevel;
    let stock = cloneObject(inventory);
    let attempts = 0;
    let materialsUsed = {};
    let pityCounters = {}; // Per-level pity tracking
    let isDestroyed = false;
    let stuckAtLevel = null;
    let stockOutWarnings = [];
    let totalYangCost = 0; // Track upgrade (Yang) costs

    // Initialize materials used tracking
    Object.keys(MATERIALS).forEach(m => {
        materialsUsed[m] = 0;
    });

    let safetyCounter = 0;

    // State-based loop: continue until we reach target state
    while (currentLevel !== targetLevel && safetyCounter < SAFETY_LIMIT) {
        safetyCounter++;
        attempts++;

        // Get strategy for current level (Refine Table entry)
        const defaultConfig = DEFAULT_LEVEL_CONFIG[currentLevel] || { baseChance: 30, pityLimit: 10, upgradeCost: 0 };
        const levelStrategy = strategy[currentLevel] || {
            baseChance: defaultConfig.baseChance,
            pityLimit: defaultConfig.pityLimit,
            priorityList: ['blessing_scroll'],
            upgradeCost: defaultConfig.upgradeCost
        };

        // Add upgrade cost for this attempt (applied on every attempt, success or fail)
        const attemptYangCost = levelStrategy.upgradeCost || 0;

        // Calculate extra material costs (from Market DB)
        let extraMaterialCost = 0;
        if (levelStrategy.requiredMaterials) {
            levelStrategy.requiredMaterials.forEach(req => {
                const price = marketPrices[req.itemId] || 0;
                extraMaterialCost += price * req.count;
            });
        }

        // Add both to total Yang Cost (Money spent)
        totalYangCost += attemptYangCost + extraMaterialCost;

        // Initialize pity counter for this level if needed
        if (pityCounters[currentLevel] === undefined) {
            pityCounters[currentLevel] = 0;
        }

        // Step 1: Select material from priority list
        const selectedMaterialId = selectMaterial(
            levelStrategy.priorityList || ['blessing_scroll'],
            stock,
            config.fallbackToRaw !== false
        );

        if (selectedMaterialId === null) {
            // No materials and fallback disabled - stop
            stuckAtLevel = currentLevel;
            break;
        }

        // Consume material (except 'raw')
        if (selectedMaterialId !== 'raw') {
            if (stock[selectedMaterialId] > 0) {
                stock[selectedMaterialId]--;
                materialsUsed[selectedMaterialId]++;
            } else {
                // Track stock-out event
                stockOutWarnings.push({
                    level: currentLevel,
                    material: selectedMaterialId,
                    attempt: attempts
                });
            }
        }

        const material = MATERIALS[selectedMaterialId];

        // Step 2: Calculate success chance
        // Use user-defined bonus if available, otherwise 0 (or fallback to material default if needed, but logic says user defines it)
        // For 'raw', bonus is always 0.
        const bonusChance = selectedMaterialId === 'raw'
            ? 0
            : (materialBonuses[selectedMaterialId] ?? 0);

        const pityBonus = getPityBonus(
            config.pitySystem,
            pityCounters[currentLevel],
            levelStrategy.pityLimit
        );

        const finalChance = calculateChance(
            levelStrategy.baseChance,
            bonusChance,
            config.calcMode,
            pityBonus
        );

        // Step 3: Roll the dice
        const roll = Math.random() * 100;
        const success = roll < finalChance;

        if (success) {
            // SUCCESS: Level up
            currentLevel++;
            pityCounters[currentLevel - 1] = 0; // Reset pity for previous level
        } else {
            // FAIL: Apply consequences based on Strategy Table (NOT material properties)
            // The Strategy Table is the Source of Truth. Materials only provide Cost & Bonus.
            pityCounters[currentLevel]++;

            // Determine consequence solely from Strategy Table
            // Default to 'downgrade' if undefined to maintain backward compatibility
            const failAction = levelStrategy.onFail || 'downgrade';

            switch (failAction) {
                case 'keep_level':
                    // User selected "Safe" - Item stays, only materials are lost.
                    // Useful for: Magic Stone OR Low level safe upgrades with simple Scrolls.
                    // No level change, just continue.
                    break;

                case 'downgrade':
                    // User selected "Downgrade" - Item drops 1 level.
                    // Useful for: Blessing Scroll logic on most servers.
                    currentLevel = Math.max(0, currentLevel - 1);
                    break;

                case 'destroy':
                    // User selected "Destroy" - Item is gone.
                    // Useful for: Demon Tower / Guild Blacksmith / Raw upgrade.
                    isDestroyed = true;
                    break;

                case 'reset':
                    // User selected "Reset" - Returns to startLevel (or +0).
                    // Useful for: Tower climbing scenarios where fail means restart.
                    currentLevel = startLevel;
                    break;

                default:
                    // Unknown action, default to downgrade for safety
                    currentLevel = Math.max(0, currentLevel - 1);
                    break;
            }

            // If item was destroyed, exit the upgrade loop
            if (isDestroyed) break;
        }
    }

    return {
        success: currentLevel >= targetLevel,
        finalLevel: currentLevel,
        materialsUsed,
        attempts,
        stuckAtLevel,
        isDestroyed,
        stockOutWarnings,
        remainingStock: stock,
        yangCost: totalYangCost // Upgrade fees (separate from material cost)
    };
}

// ============================================================================
// MONTE CARLO SIMULATION
// ============================================================================

/**
 * Run Monte Carlo simulation
 */
function runSimulation(params) {
    const {
        startLevel,
        targetLevel,
        inventory,
        config,
        strategy,
        materialBonuses,
        prices, // Custom prices for fixed mats (Blessing Scroll etc)
        marketPrices, // Live market prices for dynamic mats
        simCount
    } = params;

    const updateInterval = Math.max(1, Math.floor(simCount / 20));

    // Results tracking
    let successCount = 0;
    let totalAttempts = 0;
    let totalMaterialCost = 0;  // Cost from materials
    let totalYangCost = 0;      // Cost from upgrade fees
    let destroyedCount = 0;

    // Material usage tracking
    const totalMaterialsUsed = {};
    Object.keys(MATERIALS).forEach(m => {
        totalMaterialsUsed[m] = 0;
    });

    // Level stuck tracking (for chart)
    const levelAttempts = {};
    for (let i = startLevel; i <= targetLevel; i++) {
        levelAttempts[i] = 0;
    }

    // Stock-out analysis
    const stockOutEvents = {};

    for (let sim = 0; sim < simCount; sim++) {
        const result = simulateSingleUpgrade(
            startLevel,
            targetLevel,
            inventory,
            config,
            strategy,
            materialBonuses,
            marketPrices // Pass market prices
        );

        if (result.success) {
            successCount++;
        }

        if (result.isDestroyed) {
            destroyedCount++;
        }

        totalAttempts += result.attempts;

        // Sum up materials and material costs
        Object.entries(result.materialsUsed).forEach(([mat, count]) => {
            totalMaterialsUsed[mat] += count;
            // Calculate material cost using custom price or default
            const unitPrice = prices?.[mat] ?? MATERIALS[mat]?.price ?? 0;
            totalMaterialCost += count * unitPrice;
        });

        // Sum up Yang (upgrade) costs
        totalYangCost += result.yangCost || 0;

        // Track where people got stuck (final level)
        if (levelAttempts[result.finalLevel] !== undefined) {
            levelAttempts[result.finalLevel]++;
        }

        // Track stock-out events
        result.stockOutWarnings.forEach(warning => {
            const key = `${warning.level}_${warning.material}`;
            if (!stockOutEvents[key]) {
                stockOutEvents[key] = { ...warning, count: 0, totalAttempt: 0 };
            }
            stockOutEvents[key].count++;
            stockOutEvents[key].totalAttempt += warning.attempt;
        });

        // Progress update
        if ((sim + 1) % updateInterval === 0 || sim === simCount - 1) {
            self.postMessage({
                type: 'progress',
                progress: Math.round(((sim + 1) / simCount) * 100),
                currentStep: sim + 1,
                totalSteps: simCount
            });
        }
    }

    // Calculate averages
    const avgAttempts = totalAttempts / simCount;
    const avgMaterialCost = totalMaterialCost / simCount;
    const avgYangCost = totalYangCost / simCount;
    const avgTotalCost = avgMaterialCost + avgYangCost;
    const successRate = (successCount / simCount) * 100;
    const destroyRate = (destroyedCount / simCount) * 100;

    // Average materials per simulation
    const avgMaterials = {};
    Object.entries(totalMaterialsUsed).forEach(([mat, total]) => {
        avgMaterials[mat] = parseFloat((total / simCount).toFixed(2));
    });

    // Stock analysis - calculate if user's inventory is sufficient
    const stockAnalysis = {};
    Object.entries(avgMaterials).forEach(([mat, avgUsed]) => {
        const userStock = inventory[mat] || 0;
        const deficit = avgUsed - userStock;
        stockAnalysis[mat] = {
            required: avgUsed,
            available: userStock,
            deficit: deficit > 0 ? parseFloat(deficit.toFixed(2)) : 0,
            sufficient: deficit <= 0
        };
    });

    // Stock-out warnings summary
    const stockOutSummary = Object.values(stockOutEvents)
        .filter(e => e.count > simCount * 0.1) // More than 10% of sims
        .map(e => ({
            level: e.level,
            material: e.material,
            materialName: MATERIALS[e.material]?.name || e.material,
            frequency: parseFloat(((e.count / simCount) * 100).toFixed(1)),
            avgAttempt: Math.round(e.totalAttempt / e.count)
        }))
        .sort((a, b) => b.frequency - a.frequency);

    // Level distribution for chart
    const levelDistribution = Object.entries(levelAttempts).map(([level, count]) => ({
        level: parseInt(level),
        count,
        percentage: parseFloat(((count / simCount) * 100).toFixed(1))
    }));

    return {
        successRate: parseFloat(successRate.toFixed(2)),
        destroyRate: parseFloat(destroyRate.toFixed(2)),
        avgAttempts: parseFloat(avgAttempts.toFixed(1)),
        avgCost: Math.round(avgTotalCost),           // Total (Material + Yang)
        avgMaterialCost: Math.round(avgMaterialCost), // Material cost breakdown
        avgYangCost: Math.round(avgYangCost),        // Upgrade fee breakdown
        avgMaterials,
        stockAnalysis,
        stockOutSummary,
        levelDistribution,
        simCount,
        startLevel,
        targetLevel
    };
}

// ============================================================================
// MESSAGE HANDLER
// ============================================================================

self.onmessage = (e) => {
    const { action, ...params } = e.data;

    if (action === 'run_simulation') {
        try {
            console.log('[Blacksmith Worker] Starting simulation:', params);

            const startTime = performance.now();

            const result = runSimulation({
                startLevel: params.startLevel ?? 0,
                targetLevel: params.targetLevel ?? 9,
                inventory: params.inventory ?? {},
                config: params.config ?? { calcMode: 'additive', pitySystem: 'none' },
                strategy: params.strategy ?? {},
                materialBonuses: params.materialBonuses ?? {},
                prices: params.prices ?? {},
                marketPrices: params.marketPrices ?? {}, // Pass market prices
                simCount: params.simCount ?? 1000
            });

            const endTime = performance.now();

            self.postMessage({
                type: 'complete',
                ...result,
                duration: (endTime - startTime).toFixed(2)
            });
        } catch (error) {
            console.error('[Blacksmith Worker] Error:', error);
            self.postMessage({
                type: 'error',
                message: error.message || 'Simulation failed'
            });
        }
    }

    if (action === 'get_materials') {
        // Return material definitions for UI
        self.postMessage({
            type: 'materials',
            materials: MATERIALS,
            defaultLevelConfig: DEFAULT_LEVEL_CONFIG
        });
    }
};
