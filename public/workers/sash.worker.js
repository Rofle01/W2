/**
 * Sash (Kuşak) Monte Carlo Simulation Worker
 * 
 * Bu worker, kuşak birleştirme maliyetini simüle eder.
 * 
 * Logic:
 * - 1 → 5 (%90 başarı)
 * - 5 → 10 (%80 başarı)
 * - 10 → Hakim (%70 başarı)
 * - Hakim (Acced): 10+10 birleşince 11-20 arası emiş atar
 *   - Weighted Random: 11-15 yüksek, 16-18 orta, 19-20 düşük ihtimal
 * - Upgrade: Hedef emişe ulaşana kadar iki hakimi birleştir
 *   - %50 başarı, artış +1 ile +5 arası
 */

// ============================================================================
// CONSTANTS
// ============================================================================

// Güvenlik limiti - sonsuz döngüden korunma (1 milyon deneme)
const SAFETY_LIMIT = 1_000_000;

// Varsayılan oranlar (kullanıcı göndermezse)
const DEFAULT_RATES = {
    grade1: 90,   // 1 -> 5 geçme şansı (%)
    grade2: 80,   // 5 -> 10 geçme şansı (%)
    grade3: 70,   // 10 -> Hakim geçme şansı (%)
    upgrade: 50   // Hakim emiş arttırma şansı (%)
};

const UPGRADE_MIN_INCREASE = 1;
const UPGRADE_MAX_INCREASE = 5;

// Hakim emiş ağırlıkları (11-20 arası)
// 11-15: yüksek ihtimal, 16-18: orta, 19-20: çok düşük
const HAKIM_WEIGHTS = {
    11: 25,
    12: 22,
    13: 18,
    14: 14,
    15: 10,
    16: 5,
    17: 3,
    18: 2,
    19: 0.7,
    20: 0.3
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Weighted random seçim
 * @param {Object} weights - { value: weight } formatında ağırlıklar
 * @returns {number} Seçilen değer
 */
function weightedRandom(weights) {
    const entries = Object.entries(weights);
    const totalWeight = entries.reduce((sum, [, w]) => sum + w, 0);
    let random = Math.random() * totalWeight;

    for (const [value, weight] of entries) {
        random -= weight;
        if (random <= 0) {
            return parseInt(value, 10);
        }
    }

    // Fallback (olmamalı ama güvenlik için)
    return 11;
}

/**
 * Random int between min and max (inclusive)
 */
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Bir adet Lv1 kuşağı Lv5'e yükseltme maliyeti
 * @param {number} clothPrice - Kumaş fiyatı
 * @param {number} clothCount - 1 adet %1 kuşak için gereken kumaş sayısı
 * @param {Object} rates - Dinamik başarı oranları
 * @returns {{ cost: number, clothUsed: number, success: boolean }}
 */
function combineTo5(clothPrice, clothCount, rates) {
    // Her deneme 2 kuşak kullanır (2 adet Lv1 kuşak)
    // Her kuşak clothCount kadar kumaş gerektirir
    let totalCost = 0;
    let clothUsed = 0;
    let safetyCounter = 0;
    const successRate = rates.grade1 / 100; // Yüzdeyi ondalığa çevir

    while (true) {
        safetyCounter++;
        if (safetyCounter > SAFETY_LIMIT) {
            throw new Error("İşlem limiti aşıldı! 1✙5 oranı çok düşük olabilir.");
        }

        // 2 adet Lv1 kuşak = 2 * clothCount kumaş
        const clothNeeded = clothCount * 2;
        totalCost += clothPrice * clothNeeded;
        clothUsed += clothNeeded;

        if (Math.random() < successRate) {
            return { cost: totalCost, clothUsed, success: true };
        }
    }
}

/**
 * İki adet Lv5 kuşağı Lv10'a yükseltme maliyeti
 * @param {number} clothPrice - Kumaş fiyatı
 * @param {number} clothCount - 1 adet %1 kuşak için gereken kumaş sayısı
 * @param {Object} rates - Dinamik başarı oranları
 * @returns {{ cost: number, clothUsed: number, success: boolean }}
 */
function combineTo10(clothPrice, clothCount, rates) {
    let totalCost = 0;
    let clothUsed = 0;
    let safetyCounter = 0;
    const successRate = rates.grade2 / 100;

    while (true) {
        safetyCounter++;
        if (safetyCounter > SAFETY_LIMIT) {
            throw new Error("İşlem limiti aşıldı! 5➑10 oranı çok düşük olabilir.");
        }

        // 2 adet Lv5 kuşak gerekli - her birinin maliyetini hesapla
        const lv5_1 = combineTo5(clothPrice, clothCount, rates);
        const lv5_2 = combineTo5(clothPrice, clothCount, rates);

        totalCost += lv5_1.cost + lv5_2.cost;
        clothUsed += lv5_1.clothUsed + lv5_2.clothUsed;

        if (Math.random() < successRate) {
            return { cost: totalCost, clothUsed, success: true };
        }
    }
}

/**
 * İki adet Lv10 kuşağı Hakim'e yükseltme (11-20 arası emiş atar)
 * @param {number} clothPrice - Kumaş fiyatı
 * @param {number} clothCount - 1 adet %1 kuşak için gereken kumaş sayısı
 * @param {Object} rates - Dinamik başarı oranları
 * @returns {{ cost: number, clothUsed: number, grade: number }}
 */
function combineToHakim(clothPrice, clothCount, rates) {
    let totalCost = 0;
    let clothUsed = 0;
    let safetyCounter = 0;
    const successRate = rates.grade3 / 100;

    while (true) {
        safetyCounter++;
        if (safetyCounter > SAFETY_LIMIT) {
            throw new Error("İşlem limiti aşıldı! 10➑Hakim oranı çok düşük olabilir.");
        }

        // 2 adet Lv10 kuşak gerekli
        const lv10_1 = combineTo10(clothPrice, clothCount, rates);
        const lv10_2 = combineTo10(clothPrice, clothCount, rates);

        totalCost += lv10_1.cost + lv10_2.cost;
        clothUsed += lv10_1.clothUsed + lv10_2.clothUsed;

        if (Math.random() < successRate) {
            const grade = weightedRandom(HAKIM_WEIGHTS);
            return { cost: totalCost, clothUsed, grade };
        }
    }
}

/**
 * Hakim kuşağı hedef emişe yükseltme
 * @param {number} clothPrice - Kumaş fiyatı
 * @param {number} clothCount - 1 adet %1 kuşak için gereken kumaş sayısı
 * @param {number} targetGrade - Hedef emiş (örn: 25)
 * @param {Object} rates - Dinamik başarı oranları
 * @returns {{ cost: number, clothUsed: number, finalGrade: number }}
 */
function upgradeToTarget(clothPrice, clothCount, targetGrade, rates) {
    // İlk hakim kuşağını al
    let current = combineToHakim(clothPrice, clothCount, rates);
    let totalCost = current.cost;
    let clothUsed = current.clothUsed;
    let currentGrade = current.grade;
    let safetyCounter = 0;
    const upgradeRate = rates.upgrade / 100;

    // Hedef emişe ulaşana kadar upgrade
    while (currentGrade < targetGrade) {
        safetyCounter++;
        if (safetyCounter > SAFETY_LIMIT) {
            throw new Error("İşlem limiti aşıldı! Upgrade oranı çok düşük olabilir.");
        }

        // İkinci bir hakim kuşak gerekli
        const second = combineToHakim(clothPrice, clothCount, rates);
        totalCost += second.cost;
        clothUsed += second.clothUsed;

        // Dinamik başarı şansı
        if (Math.random() < upgradeRate) {
            // Başarılı - +1 ile +5 arası artış
            const increase = randomInt(UPGRADE_MIN_INCREASE, UPGRADE_MAX_INCREASE);
            currentGrade = Math.min(currentGrade + increase, 100); // Max %100
        }
        // Başarısız - ikinci hakim kaybedilir, mevcut kuşak kalır
    }

    return { cost: totalCost, clothUsed, finalGrade: currentGrade };
}

/**
 * Monte Carlo simülasyonu çalıştır
 * @param {number} clothPrice - Kumaş fiyatı
 * @param {number} clothCount - 1 adet %1 kuşak için gereken kumaş sayısı
 * @param {number} targetGrade - Hedef emiş oranı
 * @param {number} simCount - Simülasyon sayısı
 * @param {Object} rates - Dinamik başarı oranları
 */
function runSimulation(clothPrice, clothCount, targetGrade, simCount, rates) {
    const results = [];
    const updateInterval = Math.max(1, Math.floor(simCount / 20)); // Her %5'te güncelle

    let totalCost = 0;
    let totalCloth = 0;
    let minCost = Infinity;
    let maxCost = 0;

    for (let i = 0; i < simCount; i++) {
        const result = upgradeToTarget(clothPrice, clothCount, targetGrade, rates);

        results.push(result.cost);
        totalCost += result.cost;
        totalCloth += result.clothUsed;

        if (result.cost < minCost) minCost = result.cost;
        if (result.cost > maxCost) maxCost = result.cost;

        // Progress update
        if ((i + 1) % updateInterval === 0 || i === simCount - 1) {
            self.postMessage({
                type: "progress",
                progress: Math.round(((i + 1) / simCount) * 100),
                currentStep: i + 1,
                totalSteps: simCount
            });
        }
    }

    const avgCost = totalCost / simCount;
    const avgCloth = totalCloth / simCount;

    // Maliyet dağılımı için histogram (10 bucket)
    const distribution = calculateDistribution(results, 10);

    return {
        avgCost: Math.round(avgCost),
        minCost: Math.round(minCost),
        maxCost: Math.round(maxCost),
        totalClothUsed: Math.round(avgCloth),
        simCount,
        targetGrade,
        distribution
    };
}

// ============================================================================
// BUDGET SIMULATION (GÖREV 3) - OPTIMIZED BATCH PROCESSING
// ============================================================================

/**
 * Fisher-Yates shuffle for array randomization
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/**
 * Single budget simulation using iterative batch processing
 * @param {number} clothBudget - Total cloth available
 * @param {number} clothPerSash - Cloth needed for 1 sash (e.g., 40)
 * @param {Object} rates - Success rates { grade1, grade2, grade3, upgrade }
 * @param {number} absorptionCap - Maximum absorption limit (e.g., 25)
 * @returns {number} - Final best grade achieved
 */
function simulateBatchBudget(clothBudget, clothPerSash, rates, absorptionCap = 25) {
    // Convert rates to decimals
    const r1 = rates.grade1 / 100;  // 1 -> 5
    const r2 = rates.grade2 / 100;  // 5 -> 10
    const r3 = rates.grade3 / 100;  // 10 -> Hakim
    const rUp = rates.upgrade / 100; // Upgrade

    // Inventory pools
    let grade1 = 0;
    let grade5 = 0;
    let grade10 = 0;
    let acced = []; // Array of absorption values (11-20)

    // =============================================
    // STEP 1: Cloth -> Grade 1 sashes
    // =============================================
    // Each sash attempt uses 2 * clothPerSash cloth
    const sashAttempts = Math.floor(clothBudget / (clothPerSash * 2));

    for (let i = 0; i < sashAttempts; i++) {
        if (Math.random() < r1) {
            grade1++;
        }
    }

    // =============================================
    // STEP 2: Grade 1 -> Grade 5
    // =============================================
    // Combine 2 Grade 1 to attempt Grade 5
    const g5Attempts = Math.floor(grade1 / 2);
    grade1 = grade1 % 2; // Leftover

    for (let i = 0; i < g5Attempts; i++) {
        if (Math.random() < r1) { // Note: using grade1 rate for 1->5
            grade5++;
        }
    }

    // =============================================
    // STEP 3: Grade 5 -> Grade 10
    // =============================================
    const g10Attempts = Math.floor(grade5 / 2);
    grade5 = grade5 % 2; // Leftover

    for (let i = 0; i < g10Attempts; i++) {
        if (Math.random() < r2) {
            grade10++;
        }
    }

    // =============================================
    // STEP 4: Grade 10 -> Hakim (Acced)
    // =============================================
    const hakimAttempts = Math.floor(grade10 / 2);
    grade10 = grade10 % 2; // Leftover

    for (let i = 0; i < hakimAttempts; i++) {
        if (Math.random() < r3) {
            // Generate random absorption (11-20) using weighted distribution
            const absorption = weightedRandom(HAKIM_WEIGHTS);
            acced.push(absorption);
        }
    }

    // =============================================
    // STEP 5: Hakim Upgrade (combine acced sashes)
    // =============================================
    if (acced.length === 0) {
        // No Hakim sashes created - fallback to best leftover grade
        if (grade10 > 0) return 10;
        if (grade5 > 0) return 5;
        if (grade1 > 0) return 1;
        return 0; // Complete failure
    }

    // Shuffle for randomness
    shuffleArray(acced);

    // Track sashes that reached the cap
    let finishedSashes = [];

    // Keep upgrading while we have 2+ sashes in the active pool
    while (acced.length >= 2) {
        // Take base and fodder
        const baseSash = acced.shift();
        const fodderSash = acced.shift(); // Fodder is always consumed

        if (Math.random() < rUp) {
            // Success: increase absorption by 1-5
            const increase = randomInt(UPGRADE_MIN_INCREASE, UPGRADE_MAX_INCREASE);
            // Clamp to absorptionCap instead of 100
            const newGrade = Math.min(baseSash + increase, absorptionCap);

            // If sash reached the cap, move to finished pool
            if (newGrade >= absorptionCap) {
                finishedSashes.push(newGrade);
            } else {
                acced.push(newGrade);
            }
        } else {
            // Fail: base stays the same, fodder is lost
            // Check if base was already at cap (shouldn't happen but safety check)
            if (baseSash >= absorptionCap) {
                finishedSashes.push(baseSash);
            } else {
                acced.push(baseSash);
            }
        }
    }

    // Combine remaining active sashes with finished sashes
    const allSashes = [...finishedSashes, ...acced];

    // Return the best sash (highest grade)
    return allSashes.length > 0 ? Math.max(...allSashes) : 0;
}

/**
 * Run budget simulation monte carlo
 * @param {number} clothBudget - Mevcut kumaş adedi
 * @param {number} clothCount - 1 adet %1 kuşak için gereken kumaş
 * @param {number} clothPrice - Kumaş fiyatı (maliyet için)
 * @param {number} simCount - Simülasyon sayısı
 * @param {Object} rates - Başarı oranları
 * @param {number} absorptionCap - Maksimum emiş sınırı (sunucu limiti)
 */
function runBudgetSimulation(clothBudget, clothCount, clothPrice, simCount, rates, absorptionCap = 25) {
    const updateInterval = Math.max(1, Math.floor(simCount / 20));

    const gradeDistribution = {}; // Her emiş değerinin kaç kez elde edildiği
    let totalGrade = 0;
    let maxGrade = 0;
    let minGrade = Infinity;

    for (let i = 0; i < simCount; i++) {
        const finalGrade = simulateBatchBudget(clothBudget, clothCount, rates, absorptionCap);

        totalGrade += finalGrade;

        if (finalGrade > maxGrade) maxGrade = finalGrade;
        if (finalGrade < minGrade) minGrade = finalGrade;

        // Grade dağılımını kaydet
        gradeDistribution[finalGrade] = (gradeDistribution[finalGrade] || 0) + 1;

        // Progress update
        if ((i + 1) % updateInterval === 0 || i === simCount - 1) {
            self.postMessage({
                type: "progress",
                progress: Math.round(((i + 1) / simCount) * 100),
                currentStep: i + 1,
                totalSteps: simCount
            });
        }
    }

    const avgGrade = totalGrade / simCount;

    // Handle edge case where no sashes were created
    if (minGrade === Infinity) minGrade = 0;

    // Dağılımı yüzde olarak hesapla
    const percentageDistribution = {};
    Object.entries(gradeDistribution).forEach(([grade, count]) => {
        percentageDistribution[grade] = {
            count,
            percentage: ((count / simCount) * 100).toFixed(1)
        };
    });

    return {
        avgGrade: parseFloat(avgGrade.toFixed(2)),
        minGrade,
        maxGrade,
        totalCost: clothBudget * clothPrice,
        clothUsed: clothBudget,
        simCount,
        gradeDistribution: percentageDistribution
    };
}

/**
 * Sonuç dağılımını hesapla (histogram için)
 * @param {number[]} results - Maliyet listesi
 * @param {number} bucketCount - Bucket sayısı
 */
function calculateDistribution(results, bucketCount) {
    if (results.length === 0) return [];

    const min = Math.min(...results);
    const max = Math.max(...results);
    const range = max - min || 1;
    const bucketSize = range / bucketCount;

    const buckets = Array(bucketCount).fill(0);

    for (const value of results) {
        const bucketIndex = Math.min(
            Math.floor((value - min) / bucketSize),
            bucketCount - 1
        );
        buckets[bucketIndex]++;
    }

    return buckets.map((count, i) => ({
        range: `${formatCurrency(min + i * bucketSize)} - ${formatCurrency(min + (i + 1) * bucketSize)}`,
        count,
        percentage: ((count / results.length) * 100).toFixed(1)
    }));
}

/**
 * Para formatla
 */
function formatCurrency(value) {
    if (value >= 1000000000) {
        return `${(value / 1000000000).toFixed(1)}B`;
    }
    if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
    }
    return Math.round(value).toString();
}

// ============================================================================
// MESSAGE HANDLER
// ============================================================================

self.onmessage = (e) => {
    const { action, clothPrice, clothCount, clothBudget, targetGrade, simCount, rates, mode, absorptionCap } = e.data;

    if (action === "run_simulation") {
        try {
            const actualClothCount = clothCount || 40;
            const actualRates = rates || DEFAULT_RATES;
            const actualAbsorptionCap = absorptionCap || 25;

            console.log("[Sash Worker] Starting simulation:", {
                mode: mode || 'target',
                clothPrice,
                clothCount: actualClothCount,
                targetGrade,
                clothBudget,
                absorptionCap: actualAbsorptionCap,
                simCount,
                rates: actualRates
            });

            const startTime = performance.now();
            let result;

            // Mode kontrolü: budget veya target
            if (mode === 'budget') {
                result = runBudgetSimulation(
                    clothBudget || 1000,
                    actualClothCount,
                    clothPrice || 1000000,
                    simCount || 1000,
                    actualRates,
                    actualAbsorptionCap
                );
            } else {
                result = runSimulation(
                    clothPrice || 1000000,
                    actualClothCount,
                    targetGrade || 25,
                    simCount || 1000,
                    actualRates
                );
            }

            const endTime = performance.now();

            self.postMessage({
                type: "complete",
                mode: mode || 'target',
                ...result,
                clothCount: actualClothCount,
                rates: actualRates,
                duration: (endTime - startTime).toFixed(2)
            });
        } catch (error) {
            self.postMessage({
                type: "error",
                message: error.message || "Simulation failed"
            });
        }
    }
};
