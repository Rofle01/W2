import { useEffect } from 'react';
import useWidgetStore from '../store/useWidgetStore';
import { useSharedWidgetData } from './useSharedWidgetData';

/**
 * Helper: Circular Dependency Check (DFS)
 * Checks if adding candidateId as a dependency to targetId would create a cycle.
 */
export const hasCircularDependency = (candidateId, targetId, allItems, visited = new Set()) => {
    if (candidateId === targetId) return true;
    if (visited.has(candidateId)) return false;

    visited.add(candidateId);
    const candidateItem = allItems.find(i => i.id === candidateId);
    if (!candidateItem || !candidateItem.contents) return false;

    return candidateItem.contents.some(content => {
        if (content.sourceType === 'crafting') {
            return hasCircularDependency(content.itemId, targetId, allItems, visited);
        }
        return false;
    });
};

/**
 * Hook to sync crafting item costs with market prices.
 * Calculates the cost of crafted items based on their recipe/contents and updates the market store.
 * 
 * FEATURES:
 * - Supports Recipes, Containers, and Fragments.
 * - Prevents Infinite Loops: Only updates the store if pricing actually changes.
 */
export const useCraftingSync = () => {
    // Shared Data Hooks
    const { metinList, marketItems } = useSharedWidgetData();
    const craftingItems = useWidgetStore((state) => state.craftingItems);
    const syncCraftedItems = useWidgetStore((state) => state.syncCraftedItems);

    useEffect(() => {
        if (!craftingItems.length) return;

        const updates = [];

        craftingItems.forEach(item => {
            let calculatedCost = 0;

            if (item.type === 'recipe' && item.contents) {
                // Reçete: İçeriklerin toplamı
                calculatedCost = item.contents.reduce((total, content) => {
                    const ingredient = marketItems.find(i => i.id === content.itemId || i.originalId === content.itemId);
                    const price = ingredient ? ingredient.price : 0;
                    return total + (price * content.count);
                }, 0);
            }
            else if (item.type === 'fragment' && item.targetId) {
                // Parça: Hedef item / Adet
                if (item.targetType === 'metin') {
                    const metin = metinList.find(m => m.id === item.targetId);
                    if (metin) {
                        const totalDropValue = metin.drops.reduce((acc, drop) => {
                            const dropItem = marketItems.find(i => i.id === drop.itemId || i.originalId === drop.itemId);
                            const price = dropItem ? dropItem.price : 0;
                            const count = drop.minCount ? (drop.minCount + drop.maxCount) / 2 : drop.count;
                            return acc + (price * count * (drop.chance / 100));
                        }, 0);
                        calculatedCost = totalDropValue / (item.amount || 1);
                    }
                } else {
                    const target = marketItems.find(i => i.id === item.targetId || i.originalId === item.targetId);
                    const targetPrice = target ? target.price : 0;
                    const amount = item.amount || 1;
                    calculatedCost = targetPrice / amount;
                }
            }
            else if (item.type === 'container' && item.contents) {
                // Sandık: Beklenen Değer (Expected Value)
                calculatedCost = item.contents.reduce((total, content) => {
                    const dropItem = marketItems.find(i => i.id === content.itemId || i.originalId === content.itemId);
                    const price = dropItem ? dropItem.price : 0;
                    const chance = (content.chance || 0) / 100;
                    return total + (price * content.count * chance);
                }, 0);
            }

            // Check if price is significantly different from current market price
            // to avoid infinite loops and unnecessary updates.
            const currentPluginItem = marketItems.find(i => i.id === item.id);
            const currentPrice = currentPluginItem ? currentPluginItem.price : 0;

            // Use a small epsilon for float comparison if needed, or strict equality since we calculate direct sums
            if (Math.abs(calculatedCost - currentPrice) > 0.01) {
                updates.push({
                    id: item.id,
                    name: item.name,
                    price: calculatedCost
                });
            }
        });

        // Only dispatch if there are actual changes
        if (updates.length > 0) {
            // console.log("Syncing Crafting Prices:", updates.length, "items updated.");
            syncCraftedItems(updates);
        }

    }, [craftingItems, marketItems, metinList, syncCraftedItems]);
};
