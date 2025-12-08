
import { ITEM_SOURCES, COOLDOWN_TYPES } from '../constants';

export const createBossSlice = (set, get) => ({
    // State
    bosses: [],

    // Actions
    addBoss: (boss) => set((state) => {
        const newBoss = {
            id: boss.id || crypto.randomUUID(),
            name: boss.name || "Yeni Boss",
            hp: boss.hp || 1000000,
            fixedRunTime: boss.fixedRunTime || 5, // Zindan/Tur süresi (Dk) - Sabit koşu süresi
            constraints: {
                cooldown: boss.constraints?.cooldown || 60, // Dakika
                dailyLimit: boss.constraints?.dailyLimit || 0, // 0 = Sınırsız
                minLevel: boss.constraints?.minLevel || 75,
                cooldownType: boss.constraints?.cooldownType || COOLDOWN_TYPES.ENTRY // 'entry' | 'exit'
            },
            drops: boss.drops || []
        };
        state.bosses.push(newBoss);
    }),

    updateBoss: (id, updates) => set((state) => {
        const boss = state.bosses.find(b => b.id === id);
        if (boss) {
            // Constraints mergesini manuel yap
            if (updates.constraints) {
                boss.constraints = { ...boss.constraints, ...updates.constraints };
                delete updates.constraints; // Kalanları normal merge yap
            }
            Object.assign(boss, updates);
        }
    }),

    removeBoss: (id) => set((state) => {
        state.bosses = state.bosses.filter(b => b.id !== id);
    }),

    addDropToBoss: (bossId, drop) => set((state) => {
        const boss = state.bosses.find(b => b.id === bossId);
        if (boss) {
            boss.drops.push({
                itemId: drop.itemId,
                chance: drop.chance || 10,
                count: drop.count || 1,
                sourceType: drop.sourceType || ITEM_SOURCES.MARKET
            });
        }
    }),

    removeDropFromBoss: (bossId, dropIndex) => set((state) => {
        const boss = state.bosses.find(b => b.id === bossId);
        if (boss) {
            boss.drops.splice(dropIndex, 1);
        }
    }),

    updateBossDrop: (bossId, dropIndex, updates) => set((state) => {
        const boss = state.bosses.find(b => b.id === bossId);
        if (boss && boss.drops[dropIndex]) {
            Object.assign(boss.drops[dropIndex], updates);
        }
    })
});
