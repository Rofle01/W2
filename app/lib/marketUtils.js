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
// Helper for robust string matching
const normalizeForMatch = (str) => {
    if (!str) return '';
    return String(str)
        .normalize('NFC')
        .replace(/['".,\/#!$%\^&\*;:{}=\-_`~()]/g, "") // Noktalama işaretlerini at
        .replace(/\s/g, "") // TÜM BOŞLUKLARI sil (Zehir Kılıcı -> zehirkılıcı)
        .toLocaleLowerCase('tr');
};

// Helper for item id generation
export function generateStableId(name) {
    const trMap = { 'ç': 'c', 'Ç': 'c', 'ğ': 'g', 'Ğ': 'g', 'ş': 's', 'Ş': 's', 'ü': 'u', 'Ü': 'u', 'ı': 'i', 'I': 'i', 'İ': 'i', 'ö': 'o', 'Ö': 'o' };
    return 'item_' + String(name).trim().split('').map(char => trMap[char] || char).join('').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

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
            return;
        }

        // 1. İsim Normalizasyonu
        const importNameNorm = normalizeForMatch(itemName);

        // 2. Önce Mevcut Katalogda Ara (ID'yi kurtarmak için)
        // Eğer katalogda bu isimde bir eşya zaten varsa, ONUN ID'sini kullan
        let match = safeRegistry.find(
            (regItem) => normalizeForMatch(regItem.name) === importNameNorm
        );

        // 3. Eğer katalogda yoksa, şu an oluşturduğumuz "yeni eklenecekler" listesinde var mı?
        // (Aynı Excel içinde mükerrer kayıt varsa engellemek için)
        if (!match) {
            match = newRegistryItems.find(
                (newItem) => normalizeForMatch(newItem.name) === importNameNorm
            );
        }

        const mapKey = importedItem.tempId || itemName; // Use tempId if available, otherwise use name

        if (match) {
            // ✅ KRİTİK: Eşleşme varsa ESKİ ID'yi kullan!
            // Böylece fiyat güncellemesi doğru itema gider. (Yeni ID üretme!)
            idMap[mapKey] = match.id;
        } else {
            // Eşleşme yoksa yeni oluştur -> ARTIK STABLE ID KULLAN
            const newId = generateStableId(itemName);
            newRegistryItems.push({
                id: newId,
                originalId: null,
                name: itemName.trim(), // Orijinal yazımı koru
                category: importedItem.category || 'ithal',
                icon: 'Circle', // Varsayılan ikon
                origin: 'market',
                isSystemItem: false
            });
            idMap[mapKey] = newId;
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
