/**
 * Metin2 Drop Simulator - Damage Progression Logic
 */

import { calculateAllMetins, getBestMetin, calculateSmartLimit } from './core';

// Helper colors
const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#a855f7", "#ec4899"];
export const getColor = (name) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
};

/**
 * Calculate damage progression zones
 * DÜZELTİLMİŞ VERSİYON
 */
export function calculateDamageZones(metinList, prices, multipliers, userStats, marketItems = []) {
    const zones = [];
    let currentZone = null;

    // calculateSmartLimit fonksiyonunun dosyada tanımlı olduğundan emin olun, değilse 30000 varsayalım
    // Eğer calculateSmartLimit yoksa: const maxDamage = 30000; yapabilirsiniz.
    const maxDamage = typeof calculateSmartLimit === 'function'
        ? calculateSmartLimit(metinList, userStats.hitsPerSecond)
        : 30000;

    let step = 100;

    // --- DÖNGÜ BAŞLANGICI ---
    // continue sadece bu parantezler { } içinde çalışır
    for (let damage = 1000; damage <= maxDamage; damage += step) {

        // Akıllı Adım Aralığı (Performans için)
        if (damage > 50000) step = 500;
        if (damage > 200000) step = 1000;

        const tempStats = { ...userStats, damage };

        // Hesaplama
        const calculations = calculateAllMetins(metinList, prices, multipliers, tempStats, marketItems);
        const bestMetin = getBestMetin(calculations);

        // KORUMA: Eğer uygun metin yoksa bu adımı atla (continue burada çalışır)
        if (!bestMetin) continue;

        const isSoftcap = bestMetin.killTime < (userStats.findTime * 0.1);

        // Zone Mantığı
        if (!currentZone || currentZone.bestMetinName !== bestMetin.metinName) {
            // Yeni Zone Başlat
            currentZone = {
                minDamage: damage,
                maxDamage: damage,
                bestMetinName: bestMetin.metinName,
                minProfit: bestMetin.hourlyProfit,
                maxProfit: bestMetin.hourlyProfit,
                color: getColor(bestMetin.metinName),
                isSoftcap: isSoftcap,
                rankings: calculations.slice(0, 3).map(c => ({
                    name: c.metinName,
                    profit: c.hourlyProfit,
                    efficiency: (c.hourlyProfit / bestMetin.hourlyProfit) * 100
                }))
            };
            zones.push(currentZone);
        } else {
            // Mevcut Zone'u Genişlet
            currentZone.maxDamage = damage;
            currentZone.maxProfit = bestMetin.hourlyProfit;
            if (isSoftcap) currentZone.isSoftcap = true;
        }
    }
    // --- DÖNGÜ BİTİŞİ ---

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
