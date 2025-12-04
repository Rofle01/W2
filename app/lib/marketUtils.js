/**
 * ============================================================================
 * MARKET UTILITIES - Global Catalog + Profile Price Architecture
 * ============================================================================
 * 
 * Bu modül, "Global Katalog + Profil Fiyatı" mimarisine tam uyumlu
 * yardımcı fonksiyonlar sağlar.
 */

/**
 * Global item kataloğu ile seçili profildeki fiyatları birleştirir.
 * 
 * @param {Array} registry - Global item kataloğu (tüm item tanımları)
 * @param {Object} priceMap - Seçili profildeki fiyat objesi { itemId: price }
 * @returns {Array} Birleştirilmiş market verileri
 * 
 * @example
 * const registry = [
 *   { id: '1', name: 'Kılıç', category: 'silah' },
 *   { id: '2', name: 'Kalkan', category: 'zırh' }
 * ];
 * const priceMap = { '1': 5000, '2': 3000 };
 * const merged = mergeMarketData(registry, priceMap);
 * // Result: [
 * //   { id: '1', name: 'Kılıç', category: 'silah', price: 5000, originalId: '1' },
 * //   { id: '2', name: 'Kalkan', category: 'zırh', price: 3000, originalId: '2' }
 * // ]
 */
export function mergeMarketData(registry, priceMap) {
    // Güvenlik: Boş registry gelirse boş dizi döndür
    if (!registry || !Array.isArray(registry)) {
        console.warn('mergeMarketData: registry is empty or invalid');
        return [];
    }

    // Güvenlik: priceMap yoksa boş obje olarak kullan
    const safePriceMap = priceMap || {};

    // Registry'deki her item için fiyat bilgisini ekle
    return registry.map(item => ({
        ...item,
        price: safePriceMap[item.id] ?? 0, // Fiyat yoksa 0
        originalId: item.id // Calculator uyumluluğu için
    }));
}

/**
 * Excel'den gelen ham veriyi işler, katalogla eşleştirir ve sonuç üretir.
 * 
 * @param {Array} importedData - Excel'den gelen item listesi
 *   Market Import: [{name, price, category}]
 *   Metin Import: [{tempId, originalName}]
 * @param {Array} registry - Global item kataloğu
 * @returns {Object} { newRegistryItems, idMap }
 * 
 * @example
 * // Market Import
 * const importedData = [
 *   { name: 'Kılıç', price: 5000, category: 'silah' },
 *   { name: 'Yeni Item', price: 2000, category: 'genel' }
 * ];
 * const result = syncLocalMarketItems(importedData, registry);
 * // Result: {
 * //   newRegistryItems: [{ id: 'uuid', name: 'Yeni Item', ... }],
 * //   idMap: { 'Kılıç': 'existing-id', 'Yeni Item': 'uuid' }
 * // }
 * 
 * @example
 * // Metin Import
 * const importedData = [
 *   { tempId: 'temp-1', originalName: 'Efsun Nesnesi' }
 * ];
 * const result = syncLocalMarketItems(importedData, registry);
 * // Result: {
 * //   newRegistryItems: [],
 * //   idMap: { 'temp-1': 'existing-id' }
 * // }
 */
export function syncLocalMarketItems(importedData, registry) {
    const newRegistryItems = [];
    const idMap = {}; // TempID/Name -> RealID

    // Güvenlik: Boş veri gelirse işlem yapma
    if (!importedData || !Array.isArray(importedData)) {
        console.warn('syncLocalMarketItems: importedData is empty or invalid');
        return { newRegistryItems: [], idMap: {} };
    }

    // Güvenlik: Registry yoksa boş dizi olarak kullan
    const safeRegistry = registry || [];

    // Her import edilen item'ı işle
    importedData.forEach((importedItem) => {
        // Determine the name field (supports both 'name' and 'originalName')
        const itemName = importedItem.originalName || importedItem.name;

        // Güvenlik: İsim yoksa atla
        if (!itemName) {
            console.warn('syncLocalMarketItems: Skipping item without name', importedItem);
            return;
        }

        // 1. İsim Normalizasyonu (Büyük/Küçük harf ve boşluk temizliği)
        const cleanName = itemName.toString().trim().toLowerCase();

        // 2. Katalogda Ara
        let match = safeRegistry.find(
            (regItem) => regItem.name.trim().toLowerCase() === cleanName
        );

        // 3. Eğer katalogda yoksa, şu an oluşturduğumuz "yeni eklenecekler" listesinde var mı?
        // (Aynı Excel içinde mükerrer kayıt varsa engellemek için)
        if (!match) {
            match = newRegistryItems.find(
                (newItem) => newItem.name.trim().toLowerCase() === cleanName
            );
        }

        let itemId;
        const mapKey = importedItem.tempId || itemName; // Use tempId if available, otherwise use name

        if (match) {
            // Eşleşme Var: Mevcut ID'yi kullan
            itemId = match.id;
            idMap[mapKey] = itemId;
        } else {
            // Eşleşme Yok: Yeni Item Oluştur
            itemId = crypto.randomUUID();
            newRegistryItems.push({
                id: itemId,
                originalId: null,
                name: itemName.trim(), // Orijinal yazımı koru (Örn: "Zehir Kılıcı")
                category: importedItem.category || 'ithal',
                icon: 'Circle', // Varsayılan ikon
                isSystemItem: false
            });
            idMap[mapKey] = itemId;
        }
    });

    return { newRegistryItems, idMap };
}

/**
 * Validate merged market data
 * 
 * @param {Array} marketItems - Merged market items
 * @returns {boolean} True if valid
 */
export function validateMarketData(marketItems) {
    if (!marketItems || !Array.isArray(marketItems)) {
        console.error('validateMarketData: marketItems is not an array');
        return false;
    }

    const hasInvalidItems = marketItems.some(item => {
        if (!item.id || !item.name) {
            console.error('validateMarketData: Item missing id or name', item);
            return true;
        }
        if (typeof item.price !== 'number' || item.price < 0) {
            console.error('validateMarketData: Item has invalid price', item);
            return true;
        }
        return false;
    });

    return !hasInvalidItems;
}

/**
 * Get items by category from merged market data
 * 
 * @param {Array} marketItems - Merged market items
 * @param {string} category - Category to filter by
 * @returns {Array} Filtered items
 */
export function getItemsByCategory(marketItems, category) {
    if (!marketItems || !Array.isArray(marketItems)) {
        return [];
    }

    if (!category) {
        return marketItems;
    }

    return marketItems.filter(item => item.category === category);
}

/**
 * Search items by name
 * 
 * @param {Array} marketItems - Merged market items
 * @param {string} query - Search query
 * @returns {Array} Matching items
 */
export function searchItems(marketItems, query) {
    if (!marketItems || !Array.isArray(marketItems)) {
        return [];
    }

    if (!query || query.trim() === '') {
        return marketItems;
    }

    const cleanQuery = query.trim().toLowerCase();

    return marketItems.filter(item =>
        item.name.toLowerCase().includes(cleanQuery)
    );
}
