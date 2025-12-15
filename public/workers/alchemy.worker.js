/**
 * Dragon Soul Alchemy Simulation Worker - Revised
 * 
 * Ejderha Taşı Simyası Monte Carlo Simülasyonu
 */

// ============================================================================
// CONSTANTS
// ============================================================================

const SAFETY_LIMIT = 100_000;

// Element definitions
const ELEMENTS = {
    diamond: { name: 'Elmas', color: 'cyan' },
    ruby: { name: 'Yakut', color: 'rose' },
    jade: { name: 'Yeşim', color: 'emerald' },
    sapphire: { name: 'Safir', color: 'blue' },
    garnet: { name: 'Garnet', color: 'orange' },
    onyx: { name: 'Oniks', color: 'zinc' },
    amethyst: { name: 'Ametist', color: 'purple' }
};

// Stone class levels (ascending order)
const CLASS_LEVELS = ['rough', 'cut', 'rare', 'antique', 'legendary', 'mythic'];

// Stone clarity levels (ascending order)
const CLARITY_LEVELS = ['matte', 'clear', 'brilliant', 'excellent', 'flawless'];

// Default configuration
const DEFAULT_CONFIG = {
    activeElements: ['diamond', 'ruby', 'jade', 'sapphire', 'garnet', 'onyx'],
    corOutput: 'rough',
    targetClass: 'mythic',       // Hedef sınıf (antique, legendary, mythic)
    upgradeClarity: false,       // Saflık yükseltmesi yapılsın mı?
    requirements: {
        classUpgrade: 2,
        clarityUpgrade: 2
    },
    rates: {
        class: 50,
        clarity: 70
    }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getRandomElement(activeElements) {
    const idx = Math.floor(Math.random() * activeElements.length);
    return activeElements[idx];
}

function createEmptyInventory(activeElements) {
    const inventory = {};
    activeElements.forEach(element => {
        inventory[element] = {};
        CLASS_LEVELS.forEach(classLevel => {
            inventory[element][classLevel] = {};
            CLARITY_LEVELS.forEach(clarity => {
                inventory[element][classLevel][clarity] = 0;
            });
        });
    });
    return inventory;
}

function getClassIndex(classLevel) {
    return CLASS_LEVELS.indexOf(classLevel);
}

function simulateCorOpening(corCount, config) {
    const inventory = createEmptyInventory(config.activeElements);
    const outputLevel = config.corOutput || 'rough';
    const startClarity = 'matte';

    for (let i = 0; i < corCount; i++) {
        const element = getRandomElement(config.activeElements);
        inventory[element][outputLevel][startClarity]++;
    }

    return inventory;
}

function populateInventory(count, inputConfig, activeElements) {
    const inventory = createEmptyInventory(activeElements);
    const { itemClass, itemClarity } = inputConfig;

    // Distribute count across active elements randomly or evenly?
    // Let's assume the user has X count of EACH active element or TOTAL?
    // User says "16 Mythic Rubies". Usually implies specific element.
    // If multiple elements active, we should probably distribute?
    // Ideally, for "Direct Material", we might want to simulate ONE element type if the user meant "I have 16 Rubies".
    // But current UI selects "Active Elements" globally.
    // Let's assume the input count is TOTAL distributed randomly among active.

    for (let i = 0; i < count; i++) {
        const element = getRandomElement(activeElements);
        inventory[element][itemClass][itemClarity]++;
    }

    return inventory;
}

// ============================================================================
// UPGRADE FUNCTIONS
// ============================================================================

function upgradeClassOnly(inventory, config) {
    const { classUpgrade } = config.requirements;
    const classRate = config.rates.class / 100;
    const targetClassIndex = getClassIndex(config.targetClass);

    Object.keys(inventory).forEach(element => {
        for (let classIdx = 0; classIdx < targetClassIndex; classIdx++) {
            const currentClass = CLASS_LEVELS[classIdx];
            const nextClass = CLASS_LEVELS[classIdx + 1];

            CLARITY_LEVELS.forEach(clarity => {
                let safetyCounter = 0;
                while (inventory[element][currentClass][clarity] >= classUpgrade && safetyCounter < SAFETY_LIMIT) {
                    safetyCounter++;
                    inventory[element][currentClass][clarity] -= classUpgrade;

                    if (Math.random() < classRate) {
                        inventory[element][nextClass][clarity]++;
                    } else {
                        inventory[element][currentClass][clarity]++;
                    }
                }
            });
        }
    });
    return inventory;
}

function upgradeClarityOnly(inventory, config) {
    const { clarityUpgrade } = config.requirements;
    const clarityRate = config.rates.clarity / 100;
    const targetClass = config.targetClass;

    Object.keys(inventory).forEach(element => {
        for (let clarityIdx = 0; clarityIdx < CLARITY_LEVELS.length - 1; clarityIdx++) {
            const currentClarity = CLARITY_LEVELS[clarityIdx];
            const nextClarity = CLARITY_LEVELS[clarityIdx + 1];
            let safetyCounter = 0;

            while (inventory[element][targetClass][currentClarity] >= clarityUpgrade && safetyCounter < SAFETY_LIMIT) {
                safetyCounter++;
                inventory[element][targetClass][currentClarity] -= clarityUpgrade;

                if (Math.random() < clarityRate) {
                    inventory[element][targetClass][nextClarity]++;
                } else {
                    inventory[element][targetClass][currentClarity]++;
                }
            }
        }
    });

    return inventory;
}

// ============================================================================
// INVENTORY UTILITIES
// ============================================================================

function sumInventories(inv1, inv2, activeElements) {
    const result = createEmptyInventory(activeElements);
    activeElements.forEach(element => {
        CLASS_LEVELS.forEach(classLevel => {
            CLARITY_LEVELS.forEach(clarity => {
                result[element][classLevel][clarity] =
                    (inv1[element]?.[classLevel]?.[clarity] || 0) +
                    (inv2[element]?.[classLevel]?.[clarity] || 0);
            });
        });
    });
    return result;
}

function averageInventory(inventory, divisor, activeElements) {
    const result = createEmptyInventory(activeElements);
    activeElements.forEach(element => {
        CLASS_LEVELS.forEach(classLevel => {
            CLARITY_LEVELS.forEach(clarity => {
                result[element][classLevel][clarity] =
                    (inventory[element][classLevel][clarity] || 0) / divisor;
            });
        });
    });
    return result;
}

function calculateSummary(inventory, config) {
    const summary = {
        targetClassTotal: {},
        targetClassByClarity: {},
        leftoversByClass: {}
    };
    const targetClass = config.targetClass;
    const targetClassIndex = getClassIndex(targetClass);

    config.activeElements.forEach(element => {
        let targetTotal = 0;
        const clarityBreakdown = {};

        CLARITY_LEVELS.forEach(clarity => {
            const count = inventory[element][targetClass][clarity] || 0;
            targetTotal += count;
            if (count > 0.001) clarityBreakdown[clarity] = count;
        });

        summary.targetClassTotal[element] = targetTotal;
        summary.targetClassByClarity[element] = clarityBreakdown;

        const leftovers = {};
        for (let i = 0; i < targetClassIndex; i++) {
            const classLevel = CLASS_LEVELS[i];
            let classTotal = 0;
            CLARITY_LEVELS.forEach(clarity => {
                classTotal += inventory[element][classLevel][clarity] || 0;
            });
            if (classTotal > 0.001) leftovers[classLevel] = classTotal;
        }

        if (Object.keys(leftovers).length > 0) {
            summary.leftoversByClass[element] = leftovers;
        }
    });
    return summary;
}

function calculateFinancials(summary, corCount, corPrice, config) {
    const totalCost = corCount * corPrice;
    let totalTargetStones = 0;
    let totalFlawlessStones = 0;

    Object.values(summary.targetClassTotal).forEach(count => totalTargetStones += count);

    if (config.upgradeClarity) {
        Object.values(summary.targetClassByClarity).forEach(clarityBreakdown => {
            totalFlawlessStones += clarityBreakdown.flawless || 0;
        });
    }

    return {
        totalCost,
        costPerTargetStone: totalTargetStones > 0 ? Math.round(totalCost / totalTargetStones) : 0,
        costPerFlawless: totalFlawlessStones > 0 ? Math.round(totalCost / totalFlawlessStones) : 0,
        totalTargetStones: parseFloat(totalTargetStones.toFixed(2)),
        totalFlawlessStones: parseFloat(totalFlawlessStones.toFixed(2))
    };
}

// ============================================================================
// MAIN SIMULATION
// ============================================================================

function runSimulation(corCount, simCount, config, corPrice, inputConfig) {
    const updateInterval = Math.max(1, Math.floor(simCount / 20));
    let totalInventory = createEmptyInventory(config.activeElements);

    // Default to 'cor' mode if undefined
    const mode = inputConfig?.mode || 'cor';
    const startClass = mode === 'material' ? inputConfig.itemClass : (config.corOutput || 'rough');

    // Determine if we need to run Class Upgrade
    // If starting class index < target class index, we run it.
    const startClassIdx = getClassIndex(startClass);
    const targetClassIdx = getClassIndex(config.targetClass);
    const shouldUpgradeClass = startClassIdx < targetClassIdx;

    for (let sim = 0; sim < simCount; sim++) {
        let inventory;

        // Step 1: Initialize Inventory
        if (mode === 'material') {
            inventory = populateInventory(corCount, inputConfig, config.activeElements);
        } else {
            inventory = simulateCorOpening(corCount, config);
        }

        // Step 2: Upgrade Class (if needed)
        if (shouldUpgradeClass) {
            inventory = upgradeClassOnly(inventory, config);
        }

        // Step 3: Upgrade Clarity (if enabled)
        if (config.upgradeClarity) {
            inventory = upgradeClarityOnly(inventory, config);
        }

        totalInventory = sumInventories(totalInventory, inventory, config.activeElements);

        if ((sim + 1) % updateInterval === 0) {
            self.postMessage({ type: 'progress', progress: Math.round(((sim + 1) / simCount) * 100) });
        }
    }

    const averageResults = averageInventory(totalInventory, simCount, config.activeElements);
    const summary = calculateSummary(averageResults, config);
    // Adjust financials to treat "cor count" as "start material count" if in material mode? 
    // Yes, essentially initial cost calculation might differ, but logic remains "Input Qty * Unit Price"
    const financials = calculateFinancials(summary, corCount, corPrice || 0, config);

    return {
        averageInventory: averageResults,
        summary,
        financials,
        corCount,
        corPrice: corPrice || 0,
        simCount,
        config: { ...config }
    };
}

// ============================================================================
// REVERSE CALCULATOR (TARGET COST)
// ============================================================================

function determineTargetCost(targetConfig, simCount, config, corPrice) {
    const { baseElement, targetGrade, targetClarity } = targetConfig;
    const updateInterval = Math.max(1, Math.floor(simCount / 10));

    let totalCorsUsed = 0;
    let minCors = Infinity;
    let maxCors = 0;

    // Optimization
    const outputLevel = config.corOutput || 'rough';
    const runConfig = {
        ...config,
        activeElements: [baseElement],
        targetClass: targetGrade,
        upgradeClarity: true
    };
    const checkClarity = config.upgradeClarity || targetClarity !== 'matte';
    if (checkClarity) runConfig.upgradeClarity = true;

    const BATCH_SIZE = 100; // Fast batch size
    const MAX_CORS = SAFETY_LIMIT * 5;

    for (let sim = 0; sim < simCount; sim++) {
        let corsUsed = 0;
        let found = false;
        let inventory = createEmptyInventory([baseElement]);

        while (corsUsed < MAX_CORS) {
            corsUsed += BATCH_SIZE;

            // 1. Add Cors
            inventory[baseElement][outputLevel]['matte'] += BATCH_SIZE;

            // 2. Upgrade Class
            inventory = upgradeClassOnly(inventory, runConfig);

            // 3. Upgrade Clarity
            if (checkClarity) {
                inventory = upgradeClarityOnly(inventory, runConfig);
            }

            // 4. Check for Target
            if (inventory[baseElement][targetGrade][targetClarity] >= 1) {
                found = true;
                break;
            }
        }

        if (found) {
            totalCorsUsed += corsUsed;
            minCors = Math.min(minCors, corsUsed);
            maxCors = Math.max(maxCors, corsUsed);
        } else {
            totalCorsUsed += MAX_CORS;
            maxCors = Math.max(maxCors, MAX_CORS);
        }

        if ((sim + 1) % updateInterval === 0) {
            self.postMessage({ type: 'progress', progress: Math.round(((sim + 1) / simCount) * 100) });
        }
    }

    const avgCors = totalCorsUsed / simCount;

    return {
        targetCost: {
            avgCors,
            minCors: minCors === Infinity ? 0 : minCors,
            maxCors,
            targetConfig
        },
        corPrice: corPrice || 0,
        simCount,
        config
    };
}

// ============================================================================
// MESSAGE HANDLER
// ============================================================================

self.onmessage = (e) => {
    const { action, corCount, corPrice, simCount, config, targetConfig, inputConfig } = e.data;

    try {
        const actualConfig = {
            ...DEFAULT_CONFIG,
            ...config,
            requirements: { ...DEFAULT_CONFIG.requirements, ...config?.requirements },
            rates: { ...DEFAULT_CONFIG.rates, ...config?.rates }
        };

        if (action === 'run_simulation') {
            console.log('[Alchemy Worker] Starting Inv Sim');
            const startTime = performance.now();
            const result = runSimulation(
                corCount || 100,
                simCount || 100,
                actualConfig,
                corPrice || 0,
                inputConfig // Pass input config
            );
            const endTime = performance.now();
            self.postMessage({ type: 'complete', ...result, duration: (endTime - startTime).toFixed(2) });

        } else if (action === 'calculate_target_cost') {
            console.log('[Alchemy Worker] Starting Target Cost');
            const startTime = performance.now();
            const result = determineTargetCost(targetConfig, simCount || 50, actualConfig, corPrice || 0);
            const endTime = performance.now();
            self.postMessage({ type: 'complete', ...result, duration: (endTime - startTime).toFixed(2) });
        }
    } catch (error) {
        self.postMessage({ type: 'error', message: error.message || 'Simulation failed' });
    }
};
