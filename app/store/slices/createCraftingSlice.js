/**
 * Crafting Slice - Üretim, Boss Sandıkları ve Dönüşüm Zincirleri
 * 
 * Bu slice, oyun içi crafting sistemini yönetir:
 * - 'recipe' tipi: Reçete (X + Y = Z)
 * - 'container' tipi: Sandık/Boss (İçinden %X şansla Y çıkar)
 */
export const createCraftingSlice = (set) => ({
    craftingItems: [],

    /**
     * Yeni boş bir crafting öğesi oluşturur
     * @param {string} name - Öğenin adı (Örn: "Azrail Sandığı")
     * @param {'recipe'|'container'} type - Öğe tipi
     */
    addCraftingItem: (name, type) =>
        set((state) => {
            const newItem = {
                id: crypto.randomUUID(),
                name: name || 'Yeni Öğe',
                type: type || 'recipe',
                contents: [],
            };
            state.craftingItems.push(newItem);
        }),

    /**
     * Crafting öğesini siler
     * @param {string} id - Silinecek öğenin ID'si
     */
    removeCraftingItem: (id) =>
        set((state) => {
            const index = state.craftingItems.findIndex((item) => item.id === id);
            if (index !== -1) {
                state.craftingItems.splice(index, 1);
            }
        }),

    /**
     * Crafting öğesini günceller (isim, tip vb.)
     * @param {string} id - Güncellenecek öğenin ID'si
     * @param {object} updates - Güncellenecek alanlar (name, type vb.)
     */
    updateCraftingItem: (id, updates) =>
        set((state) => {
            const item = state.craftingItems.find((item) => item.id === id);
            if (item) {
                Object.assign(item, updates);
            }
        }),

    /**
     * Bir crafting öğesinin içine hammadde/içerik ekler
     * @param {string} parentId - Ana öğenin ID'si
     * @param {object} content - Eklenecek içerik
     * @param {string} content.itemId - Bağlanan eşyanın ID'si
     * @param {'market'|'crafting'} content.sourceType - Kaynak tipi (market veya crafting)
     * @param {number} content.count - Adet
     * @param {number} content.chance - Şans (0-100 arası, container için)
     */
    addContentToItem: (parentId, content) =>
        set((state) => {
            const parentItem = state.craftingItems.find((item) => item.id === parentId);
            if (parentItem) {
                const newContent = {
                    id: crypto.randomUUID(),
                    itemId: content.itemId,
                    sourceType: content.sourceType || 'market', // 'market' veya 'crafting'
                    count: content.count || 1,
                    chance: content.chance || 100, // Container için şans (%)
                };
                parentItem.contents.push(newContent);
            }
        }),

    /**
     * Bir crafting öğesinden hammadde/içerik siler
     * @param {string} parentId - Ana öğenin ID'si
     * @param {string} contentId - Silinecek içeriğin ID'si
     */
    removeContentFromItem: (parentId, contentId) =>
        set((state) => {
            const parentItem = state.craftingItems.find((item) => item.id === parentId);
            if (parentItem) {
                const index = parentItem.contents.findIndex((c) => c.id === contentId);
                if (index !== -1) {
                    parentItem.contents.splice(index, 1);
                }
            }
        }),

    /**
     * Bir crafting öğesinin içeriğini günceller (adet, şans vb.)
     * @param {string} parentId - Ana öğenin ID'si
     * @param {string} contentId - Güncellenecek içeriğin ID'si
     * @param {object} updates - Güncellenecek alanlar (count, chance vb.)
     */
    updateContentInItem: (parentId, contentId, updates) =>
        set((state) => {
            const parentItem = state.craftingItems.find((item) => item.id === parentId);
            if (parentItem) {
                const content = parentItem.contents.find((c) => c.id === contentId);
                if (content) {
                    Object.assign(content, updates);
                }
            }
        }),
});
