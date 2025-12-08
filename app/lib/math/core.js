/**
 * Metin2 Drop Simulator - Core Calculation Engine
 */

import { ITEM_SOURCES, COOLDOWN_TYPES } from '../../store/constants';

/**
 * @typedef {Object} UserStats
 * @property {number} damage
 * @property {number} hitsPerSecond
 * @property {number} findTime
 */

/**
 * @typedef {Object} Boss
 * @property {string} id
 * @property {string} name
 * @property {number} hp
 * @property {number} fixedRunTime
 * @property {Object} constraints
 * @property {number} constraints.cooldown
 * @property {string} constraints.cooldownType
 * @property {number} [constraints.dailyLimit]
 * @property {Array} drops
 */

/**
 * @typedef {Object} Metin
 * @property {string} id
 * @property {string} name
 * @property {number} hp
 * @property {Array} drops
 */

/**
 * Simple Price Resolver (Basit Fiyat Çözücü)
 * 
 * Artık recursive değil! Sadece market listesinden fiyatı bulur.
 * Crafting itemlarının fiyatları zaten market store'una pushlandığı için
 * burada ekstra bir hesaplama yapmaya gerek yoktur.
 * 
 * @param {string} itemId - ID of the item to resolve
 * @param {string} sourceType - Source type of the item (unused but kept for compatibility)
 * @param {Array} marketItems - Array of market items with prices
 * @returns {number} Unit price of the item
 */
export function resolveItemPrice(itemId, sourceType, marketItems = []) {
    if (!itemId) return 0;
    const safeMarketItems = marketItems || [];

    // 1. Kesin Eşleşme (ID veya OriginalID)
    let item = safeMarketItems.find(i => i.id === itemId || i.originalId === itemId);

    // 2. Bulunamadıysa: Esnek Eşleşme (ID string karşılaştırması)
    if (!item) {
        const searchId = String(itemId).toLowerCase();
        item = safeMarketItems.find(i => String(i.id).toLowerCase() === searchId);
    }

    return item ? (item.price || 0) : 0;
}

/**
 * Calculate profit metrics for a single Metin
 * 
 * @param {Metin} metin
 * @param {Object} prices
 * @param {Object} multipliers
 * @param {UserStats} userStats
 * @param {Array} marketItems
 * @returns {Object} Calculated metrics
 */
export function calculateMetinProfit(metin, prices, multipliers, userStats, marketItems = []) {
    // ARTIK STORE VERİSİ AYIKLAMAK YOK. DOĞRUDAN VERİ İLE ÇALIŞIYORUZ.
    const safePrices = prices || {};
    const safeMultipliers = multipliers || { drop: 1.0 };

    let totalDropValue = 0;
    if (metin && metin.drops) {
        metin.drops.forEach(drop => {
            // ✅ DÜZELTME: Fiyatı bulmak için merkezi hesaplayıcıyı kullanıyoruz.
            // Artık sadece marketItems yeterli, çünkü crafting fiyatları oraya pushlanıyor.
            const price = resolveItemPrice(
                drop.itemId,
                drop.sourceType || ITEM_SOURCES.MARKET,
                marketItems
            );

            // Drop çarpanını hesaba kat
            const count = drop.count * safeMultipliers.drop;

            totalDropValue += count * (drop.chance / 100) * price;
        });
    }

    const { damage, hitsPerSecond, findTime } = userStats;

    // Güvenlik: 0'a bölme hatası önlemi
    const dps = (damage || 0) * (hitsPerSecond || 0);
    const killTime = dps > 0 ? metin.hp / dps : 0;
    const cycleTime = killTime + (findTime || 0);
    const metinsPerHour = cycleTime > 0 ? 3600 / cycleTime : 0;

    const hourlyProfit = metinsPerHour * totalDropValue;

    return {
        metinId: metin.id,
        metinName: metin.name,
        killTime,
        cycleTime,
        metinsPerHour,
        dropValuePerMetin: totalDropValue,
        hourlyProfit,
    };
}

/**
 * Calculate profit metrics for all Metins and sort by hourly profit
 */
export function calculateAllMetins(metinList = [], prices = {}, multipliers = {}, userStats = {}, marketItems = []) {
    if (!metinList || !Array.isArray(metinList) || metinList.length === 0) {
        return [];
    }

    const calculations = metinList.map((metin) =>
        calculateMetinProfit(metin, prices, multipliers, userStats, marketItems)
    );

    return calculations.sort((a, b) => b.hourlyProfit - a.hourlyProfit);
}

/**
 * Get the best (most profitable) Metin
 */
export function getBestMetin(calculations) {
    return calculations.length > 0 ? calculations[0] : null;
}

/**
 * Helper: Calculate a smart upper limit for damage simulation
 * Eğer veri yoksa varsayılan bir tavan değer belirler.
 */
export function calculateSmartLimit(metinList, hitsPerSecond) {
    // KORUMA: Liste boşsa varsayılan 30k hasar sınırı koy
    if (!metinList || metinList.length === 0) return 30000;

    const maxHp = Math.max(...metinList.map(m => m.hp));
    const hps = hitsPerSecond || 1;
    const limit = (maxHp / hps) * 1.2; // +20% buffer

    // Clamp between reasonable bounds
    return Math.max(5000, Math.min(200000, Math.ceil(limit / 500) * 500));
}

/**
 * Calculate profit metrics for a single Boss
 * Robust version with Type Safety
 * 
 * @param {Boss} boss
 * @param {UserStats} userStats
 * @param {number} dailyPlayHours
 * @param {Array} marketItems
 * @returns {Object} Boss metrics
 */
export function calculateBossMetrics(boss, userStats, dailyPlayHours = 4, marketItems = []) {
    // 1. Force Number Types (Prevent String Concatenation bugs)
    const damage = Number(userStats.damage) || 0;
    const hitsPerSecond = Number(userStats.hitsPerSecond) || 0;
    // NOTE: userStats.findTime is intentionally ignored here.
    const bossHp = Number(boss.hp) || 1;

    // 2. Calculate DPS & Kill Time
    const dps = damage * hitsPerSecond;
    // If DPS is 0, time is Infinity. Using a safe large number for logic.
    const killTime = dps > 0 ? bossHp / dps : Infinity;

    // 3. Cycle & Active Time Calculations
    const fixedRunTimeMinutes = Number(boss.fixedRunTime) || 5;
    const fixedRunTimeSeconds = fixedRunTimeMinutes * 60;

    // FIX 1: Active Time (Zaman Şişmesini Önle)
    // Zindan süresi (fixedRunTime), genellikle toplam süreyi ifade eder.
    // Kesim süresi (killTime) bunun içindedir. Eğer kesim çok uzun sürerse, süre uzar.
    const activeTimeSeconds = Math.max(killTime, fixedRunTimeSeconds);
    const activeTimeMinutes = activeTimeSeconds / 60;

    // FIX 2: Cycle Time (Giriş/Çıkış Ayrımı)
    const cooldownMinutes = Number(boss.constraints?.cooldown) || 0;
    const cooldownSeconds = cooldownMinutes * 60;
    const cooldownType = boss.constraints?.cooldownType || COOLDOWN_TYPES.ENTRY;

    let cycleTimeSeconds;
    if (cooldownType === COOLDOWN_TYPES.ENTRY) {
        // Giriş: Soğuma, içerideken de işler. 
        // Döngü = Max(Aktif Süre, Soğuma Süresi)
        cycleTimeSeconds = Math.max(activeTimeSeconds, cooldownSeconds);
    } else {
        // Çıkış: Soğuma, çıktıktan sonra başlar.
        // Döngü = Aktif Süre + Soğuma Süresi
        cycleTimeSeconds = activeTimeSeconds + cooldownSeconds;
    }

    // 4. Calculate Total Drop Value
    let totalDropValue = 0;
    if (boss.drops) {
        boss.drops.forEach(drop => {
            const price = resolveItemPrice(
                drop.itemId,
                drop.sourceType || ITEM_SOURCES.MARKET,
                marketItems
            );
            totalDropValue += (Number(drop.count) || 1) * (Number(drop.chance) / 100) * price;
        });
    }

    const dailyLimit = Number(boss.constraints?.dailyLimit) || 0;

    return {
        bossId: boss.id,
        bossName: boss.name,
        killTime,
        activeTimeMinutes, // Pure playtime per run
        cycleTimeMinutes: cycleTimeSeconds / 60, // Total rotation time per run
        dailyLimit,
        totalDropValue,
        profitPerCycle: totalDropValue,
        // Flags
        isUnkillable: dps <= 0, // Flag for UI
    };
}

/**
 * Calculate metrics for all bosses using a Timeline Simulation
 * 
 * @param {Array<Boss>} bossList
 * @param {UserStats} userStats
 * @param {number} dailyPlayHours
 * @param {Array} marketItems
 * @returns {Array} Simulation results
 */
export function calculateAllBosses(bossList = [], userStats = {}, dailyPlayHours = 4, marketItems = []) {
    if (!bossList || !Array.isArray(bossList) || bossList.length === 0) {
        return { results: [], totalDurationMinutes: 0 };
    }

    const maxTimeMinutes = Number(dailyPlayHours) * 60;

    // 1. Initialize Simulation State
    let bossStates = bossList.map(boss => {
        const metrics = calculateBossMetrics(boss, userStats, dailyPlayHours, marketItems);

        // Calculate Efficiency (Profit per Minute of Active Play)
        // Prevent division by zero or infinity
        let efficiency = 0;
        if (!metrics.isUnkillable && metrics.activeTimeMinutes > 0) {
            efficiency = metrics.profitPerCycle / metrics.activeTimeMinutes;
        }

        return {
            ...boss,
            metrics,
            // Simulation State
            nextAvailableTime: 0,
            remainingDailyLimit: metrics.dailyLimit > 0 ? metrics.dailyLimit : Infinity,
            runCount: 0,
            totalProfit: 0
        };
    });

    // 2. Run Simulation Loop
    let currentTime = 0;

    // Safety break to prevent infinite loops
    let loopCount = 0;
    const MAX_LOOPS = 10000;

    while (currentTime < maxTimeMinutes && loopCount < MAX_LOOPS) {
        loopCount++;

        // Find available candidates
        const availableBosses = bossStates.filter(b =>
            !b.metrics.isUnkillable && // Hasar yetiyorsa
            b.nextAvailableTime <= currentTime && // Süresi geldiyse
            b.remainingDailyLimit > 0 && // Limiti dolmadıysa
            (currentTime + b.metrics.activeTimeMinutes) <= maxTimeMinutes // Vakit yetiyorsa
        );

        if (availableBosses.length > 0) {
            // Pick best (Greedy)
            availableBosses.sort((a, b) => b.efficiency - a.efficiency); // Sort desc
            const selected = availableBosses[0];

            // Execute Run
            const startTime = currentTime;
            const runDuration = selected.metrics.activeTimeMinutes;
            const finishTime = startTime + runDuration;

            // Update State
            selected.runCount++;
            selected.remainingDailyLimit--;
            selected.totalProfit += selected.metrics.profitPerCycle;
            currentTime = finishTime;

            // Update Cooldown
            const cooldownMin = Number(selected.constraints?.cooldown) || 0;
            const type = selected.constraints?.cooldownType || COOLDOWN_TYPES.ENTRY;

            if (type === COOLDOWN_TYPES.ENTRY) {
                selected.nextAvailableTime = Math.max(finishTime, startTime + cooldownMin);
            } else {
                selected.nextAvailableTime = finishTime + cooldownMin;
            }

        } else {
            // No boss available right now. Fast forward.
            const pendingBosses = bossStates.filter(b =>
                !b.metrics.isUnkillable &&
                b.remainingDailyLimit > 0
            );

            if (pendingBosses.length === 0) {
                break; // Nothing left to kill today
            }

            const nextEventTime = Math.min(...pendingBosses.map(b => b.nextAvailableTime));

            if (nextEventTime > maxTimeMinutes) {
                break; // Next event is too late
            }

            // Jump time
            currentTime = Math.max(currentTime + 0.1, nextEventTime);
        }
    }

    // 3. Format Results
    const results = bossStates.map(b => ({
        bossId: b.id,
        bossName: b.name,

        // Stats
        cycleTimeMinutes: b.metrics.cycleTimeMinutes, // FIX: Display FULL cycle time (Run + Cooldown)
        realDailyKills: b.runCount,
        dailyProfit: b.totalProfit,
        profitPerCycle: b.metrics.profitPerCycle,

        // Total Time Spent (Active Only)
        timeRequiredHours: (b.runCount * b.metrics.activeTimeMinutes) / 60,

        dailyLimit: b.metrics.dailyLimit,
        isUnkillable: b.metrics.isUnkillable
    })).sort((a, b) => b.dailyProfit - a.dailyProfit);

    return {
        results,
        totalDurationMinutes: currentTime // Return total simulation time
    };
}

/**
 * Calculate expected item yields for a specific duration
 */
export function calculateItemYields(metin, userStats, durationHours) {
    const { damage, hitsPerSecond, findTime } = userStats;

    // Calculate Metins Per Hour (reusing logic for consistency)
    const dps = damage * hitsPerSecond;
    const killTime = dps > 0 ? metin.hp / dps : 0;
    const cycleTime = killTime + findTime;
    const metinsPerHour = cycleTime > 0 ? 3600 / cycleTime : 0;

    const totalMetins = metinsPerHour * durationHours;
    const yields = [];

    metin.drops.forEach(drop => {
        // Expected count = Total Metins * Count per drop * Chance
        const expectedCount = totalMetins * drop.count * (drop.chance / 100);

        yields.push({
            itemId: drop.itemId,
            count: expectedCount,
            // Note: We don't have item names here directly, caller should map them
            chance: drop.chance
        });
    });

    return {
        metinsCount: totalMetins,
        yields: yields
    };
}
