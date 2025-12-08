/**
 * Metin2 Drop Simulator - Simulation Logic
 */

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
