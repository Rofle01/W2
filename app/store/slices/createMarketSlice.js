import { MASTER_REGISTRY, INITIAL_SERVERS } from "../../data/initialData";

export const createMarketSlice = (set, get) => ({
    // --- STATE ---
    masterRegistry: MASTER_REGISTRY.items, // Global Katalog
    serverProfiles: INITIAL_SERVERS,       // Sunucu Listesi
    activeServerId: INITIAL_SERVERS[0]?.id || "server_marmara", // Seçili Sunucu

    // --- ACTIONS ---

    // 1. Sunucu Yönetimi
    setActiveServer: (serverId) => set((state) => {
        const exists = state.serverProfiles.some(p => p.id === serverId);
        if (exists) state.activeServerId = serverId;
    }),

    addServerProfile: (name) => set((state) => {
        state.serverProfiles.push({
            id: `server_${Date.now()}`,
            name: name,
            currency: "Won",
            prices: {},
            multipliers: { drop: 1.0 }
        });
    }),

    // 2. Fiyat Yönetimi (Sadece Aktif Sunucuya Yazar)
    updatePrice: (itemId, newPrice) => set((state) => {
        const activeProfile = state.serverProfiles.find(p => p.id === state.activeServerId);

        // 🛡️ KORUMA: Eğer bu item "crafting" kökenli ise elle değiştirmeyi engelle
        const itemRegistry = state.masterRegistry;
        const itemDef = itemRegistry.find(i => i.id === itemId);

        // Eğer item üretimden geliyorsa ve fiyatı elle değiştirilmeye çalışılıyorsa engelle
        if (itemDef && itemDef.origin === 'crafting') {
            console.warn(`Item ${itemId} is a crafted item. Price cannot be updated manually.`);
            return;
        }

        if (activeProfile) {
            activeProfile.prices[itemId] = parseFloat(newPrice) || 0;
        }
    }),

    // ✅ YENİ: Crafting Widget'ından gelen hesaplanmış fiyatları senkronize eder
    // Bu fonksiyon "Boğucu İncir" taktiğinin kalbidir. 
    syncCraftedItems: (craftedItems) => set((state) => {
        const activeProfile = state.serverProfiles.find(p => p.id === state.activeServerId);
        if (!activeProfile) return;

        craftedItems.forEach(cItem => {
            // 1. Item Market Kataloğunda yoksa ekle (Origin: 'crafting' olarak işaretle)
            const exists = state.masterRegistry.some(i => i.id === cItem.id);
            if (!exists) {
                state.masterRegistry.push({
                    id: cItem.id,
                    name: cItem.name,
                    category: "üretim", // Otomatik kategori
                    icon: "Hammer",     // Üretim ikonu
                    origin: "crafting", // 🔒 KİLİT MEKANİZMASI
                    isSystemItem: false
                });
            } else {
                // Varsa ismini ve origin'i güncelle (belki kullanıcı üretimde ismini değiştirdi)
                const itemIndex = state.masterRegistry.findIndex(i => i.id === cItem.id);
                if (itemIndex !== -1) {
                    // Sadece ismi güncelle, mevcut kategoriyi bozma
                    state.masterRegistry[itemIndex].name = cItem.name;
                    // Emin olmak için origin set et
                    if (!state.masterRegistry[itemIndex].origin) {
                        state.masterRegistry[itemIndex].origin = "crafting";
                    }
                }
            }

            // 2. Fiyatı Güncelle (Crafting'den gelen maliyeti yaz)
            if (cItem.price !== undefined) {
                activeProfile.prices[cItem.id] = cItem.price;
            }
        });
    }),

    // Toplu Fiyat Güncelleme (Import işlemleri için performans optimizasyonu)
    batchUpdatePrices: (priceMap) => set((state) => {
        const activeProfile = state.serverProfiles.find(p => p.id === state.activeServerId);
        if (activeProfile) {
            activeProfile.prices = {
                ...activeProfile.prices,
                ...priceMap
            };
        }
    }),

    // 3. Katalog Yönetimi (Yeni Item Ekleme - Tekli)
    registerItem: (item) => set((state) => {
        const generatedId = item.id || item.name.toLowerCase().trim().replace(/\s+/g, '_');
        const exists = state.masterRegistry.some(i => i.id === generatedId);

        if (!exists) {
            state.masterRegistry.push({
                id: generatedId,
                name: item.name,
                category: item.category || "genel",
                icon: item.icon || "Circle",
                origin: "user", // Kullanıcı ekledi
                isSystemItem: false
            });
        }
    }),

    // Toplu Item Kaydı (Import için)
    registerItems: (items) => set((state) => {
        items.forEach(item => {
            const generatedId = item.id || item.name.toLowerCase().trim().replace(/\s+/g, '_');
            const exists = state.masterRegistry.some(i => i.id === generatedId);

            if (!exists) {
                state.masterRegistry.push({
                    id: generatedId,
                    name: item.name,
                    category: item.category || "genel",
                    icon: item.icon || "Circle",
                    origin: "user",
                    isSystemItem: false
                });
            }
        });
    }),

    // 4. Veri Sıfırlama
    resetMarketData: (scope) => set((state) => {
        const activeProfile = state.serverProfiles.find(p => p.id === state.activeServerId);

        if (scope === 'prices') {
            if (activeProfile) {
                activeProfile.prices = {};
            }
        } else if (scope === 'full') {
            if (activeProfile) {
                activeProfile.prices = {};
            }
            // Sadece sistem itemlarını ve crafting itemlarını tut
            // User tarafından eklenenleri sil
            state.masterRegistry = state.masterRegistry.filter(item => item.isSystemItem || item.origin === 'crafting');
        }
    }),
});
