/**
 * Metin2 Drop Simulator - Calculation Engine
 * Calculates profitability for each Metin based on user stats and market prices
 */

/**
 * Calculate profit metrics for a single Metin
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
                drop.sourceType || 'market',
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
 * Format currency (Yang) with proper separators
 */
export function formatCurrency(amount) {
    return new Intl.NumberFormat('tr-TR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

/**
 * Format currency compactly (e.g., 1.5M, 20k)
 */
export function formatCompactCurrency(amount) {
    if (amount >= 1000000000) {
        return `${(amount / 1000000000).toFixed(1)}B`;
    } else if (amount >= 1000000) {
        return `${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
        return `${(amount / 1000).toFixed(1)}k`;
    }
    return amount.toString();
}

/**
 * Format time in seconds to readable format
 */
export function formatTime(seconds) {
    if (seconds >= 60) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.round(seconds % 60);
        return `${minutes}m ${secs}s`;
    }
    return `${seconds.toFixed(1)}s`;
}

/**
 * Helper: Calculate a smart upper limit for damage simulation
 * Eğer veri yoksa varsayılan bir tavan değer belirler.
 */
function calculateSmartLimit(metinList, hitsPerSecond) {
    // KORUMA: Liste boşsa varsayılan 30k hasar sınırı koy
    if (!metinList || metinList.length === 0) return 30000;

    const maxHp = Math.max(...metinList.map(m => m.hp));
    const hps = hitsPerSecond || 1;
    const limit = (maxHp / hps) * 1.2; // +20% buffer

    // Clamp between reasonable bounds
    return Math.max(5000, Math.min(200000, Math.ceil(limit / 500) * 500));
}

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

    // Basit Lookup: ID veya OriginalID ile ara
    const item = safeMarketItems.find(i => i.id === itemId || i.originalId === itemId);

    return item ? (item.price || 0) : 0;
}

/**
 * Calculate damage progression zones
 */
export function calculateDamageZones(metinList, prices, multipliers, userStats, marketItems = []) {
    const zones = [];
    let currentZone = null;

    // Helper colors
    const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#a855f7", "#ec4899"];
    const getColor = (name) => {
        let hash = 0;
        for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
        return colors[Math.abs(hash) % colors.length];
    };

    const maxDamage = calculateSmartLimit(metinList, userStats.hitsPerSecond);
    let step = 100;

    for (let damage = 1000; damage <= maxDamage; damage += step) {
        // Smart Step
        if (damage > 50000) step = 500;
        if (damage > 200000) step = 1000;

        const tempStats = { ...userStats, damage };
        // Note: We pass marketItems here now
        const calculations = calculateAllMetins(metinList, prices, multipliers, tempStats, marketItems);
        const bestMetin = getBestMetin(calculations);

        if (!bestMetin) continue;

        const isSoftcap = bestMetin.killTime < (userStats.findTime * 0.1);

        // Start new zone if metin changes
        if (!currentZone || currentZone.bestMetinName !== bestMetin.metinName) {
            currentZone = {
                minDamage: damage,
                maxDamage: damage,
                bestMetinName: bestMetin.metinName,
                minProfit: bestMetin.hourlyProfit,
                maxProfit: bestMetin.hourlyProfit,
                color: getColor(bestMetin.metinName),
                isSoftcap: isSoftcap,
                // Top 3 rankings for this zone start
                rankings: calculations.slice(0, 3).map(c => ({
                    name: c.metinName,
                    profit: c.hourlyProfit,
                    efficiency: (c.hourlyProfit / bestMetin.hourlyProfit) * 100
                }))
            };
            zones.push(currentZone);
        } else {
            // Extend existing zone
            currentZone.maxDamage = damage;
            currentZone.maxProfit = bestMetin.hourlyProfit;
            if (isSoftcap) currentZone.isSoftcap = true;
        }
    }

    return zones;
}

/**
 * Analyze next tier requirements and potential gains
 */
export function analyzeNextTier(currentDamage, zones) {
    if (!zones || zones.length === 0) return null;

    // Find current zone
    const currentZoneIndex = zones.findIndex(
        z => currentDamage >= z.minDamage && currentDamage <= z.maxDamage
    );

    // If damage is beyond max calculated range or in the last zone
    if (currentZoneIndex === -1 || currentZoneIndex === zones.length - 1) {
        // Check if damage is higher than the last zone's max
        const lastZone = zones[zones.length - 1];
        if (currentDamage > lastZone.maxDamage) {
            return { isMaxLevel: true, message: "Zirvedesiniz! Daha verimli bir metin yok." };
        }
        // If inside the last zone
        return { isMaxLevel: true, message: "En verimli metin bölgesindesiniz." };
    }

    const currentZone = zones[currentZoneIndex];
    const nextZone = zones[currentZoneIndex + 1];

    // Calculate requirements
    const requiredDamage = nextZone.minDamage - currentDamage;

    // Calculate profit potential (using averages for smoother comparison)
    const currentAvgProfit = (currentZone.minProfit + currentZone.maxProfit) / 2;
    const nextAvgProfit = (nextZone.minProfit + nextZone.maxProfit) / 2;

    const profitIncrease = nextAvgProfit - currentAvgProfit;
    const percentGain = currentAvgProfit > 0
        ? (profitIncrease / currentAvgProfit) * 100
        : 0;

    return {
        isMaxLevel: false,
        nextMetin: nextZone.bestMetinName,
        requiredDamage: requiredDamage,
        profitIncrease: profitIncrease,
        percentGain: percentGain
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

/**
 * Generate simulated player distribution across damage ranges
 */
export function generatePlayerDistribution(minDmg, maxDmg, playerCount, type, timeStrategy, baseHours = 4) {
    const segments = [];
    const segmentCount = 20; // Number of buckets
    const range = maxDmg - minDmg;
    const step = range / segmentCount;

    let totalWeight = 0;
    const weights = [];

    // 1. Calculate weights based on distribution type
    for (let i = 0; i < segmentCount; i++) {
        const normalizedPos = i / (segmentCount - 1); // 0 to 1
        let weight = 0;

        switch (type) {
            case "normal": // Bell curve
                // Gaussian function centered at 0.5
                weight = Math.exp(-Math.pow(normalizedPos - 0.5, 2) / 0.1);
                break;
            case "left-skewed": // Majority low damage (Gamma-like)
                weight = Math.pow(1 - normalizedPos, 2);
                break;
            case "right-skewed": // Majority high damage
                weight = Math.pow(normalizedPos, 2);
                break;
            case "uniform":
            default:
                weight = 1;
                break;
        }
        weights.push(weight);
        totalWeight += weight;
    }

    // 2. Distribute players and calculate play time
    for (let i = 0; i < segmentCount; i++) {
        const segmentMid = minDmg + (step * i) + (step / 2);
        const normalizedPos = i / (segmentCount - 1);

        // Player Count for this segment
        const count = Math.round(playerCount * (weights[i] / totalWeight));

        // Average Play Time (Hours) based on strategy
        let avgPlayTime = baseHours;

        switch (timeStrategy) {
            case "linear": // Stronger players play more
                // Weak: 50%, Strong: 150%
                avgPlayTime = baseHours * (0.5 + normalizedPos);
                break;
            case "linear-inverse": // Weaker players play more
                // Weak: 150%, Strong: 50%
                avgPlayTime = baseHours * (1.5 - normalizedPos);
                break;
            case "exponential": // Elites play significantly more
                // Quadratic increase
                avgPlayTime = baseHours * (0.2 + 1.8 * Math.pow(normalizedPos, 2));
                break;
            case "exponential-inverse": // Beginners play significantly more
                // Quadratic increase for low damage
                avgPlayTime = baseHours * (0.2 + 1.8 * Math.pow(1 - normalizedPos, 2));
                break;
            case "constant":
            default:
                avgPlayTime = baseHours;
                break;
        }

        if (count > 0) {
            segments.push({
                minDamage: minDmg + (step * i),
                maxDamage: minDmg + (step * (i + 1)),
                avgDamage: segmentMid,
                playerCount: count,
                avgPlayTime: avgPlayTime,
                totalHours: count * avgPlayTime
            });
        }
    }

    return segments;
}
