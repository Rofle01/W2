/**
 * Excel and JSON Import/Export Utilities
 * Handles file operations for market data and other spreadsheet-based data
 */

import * as XLSX from 'xlsx';

/**
 * Column name mappings for Excel export/import
 */
const COLUMN_MAPPINGS = {
    // English to Turkish (for export)
    toTurkish: {
        name: 'Eşya Adı',
        price: 'Fiyat',
        originalId: 'ID'
    },
    // Turkish to English (for import)
    toEnglish: {
        'Eşya Adı': 'name',
        'Fiyat': 'price',
        'ID': 'originalId'
    }
};

/**
 * Export data to Excel or JSON file
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Name of the file (without extension)
 * @param {string} format - 'excel' or 'json'
 */
export async function exportToFile(data, filename, format = 'excel') {
    try {
        if (!data || data.length === 0) {
            throw new Error('Dışa aktarılacak veri bulunamadı.');
        }

        if (format === 'excel') {
            // Convert data to Turkish column names
            const translatedData = data.map(item => {
                const translated = {};
                Object.keys(item).forEach(key => {
                    const turkishKey = COLUMN_MAPPINGS.toTurkish[key] || key;
                    translated[turkishKey] = item[key];
                });
                return translated;
            });

            // Create worksheet
            const worksheet = XLSX.utils.json_to_sheet(translatedData);

            // Auto-size columns
            const maxWidth = 30;
            const colWidths = Object.keys(translatedData[0] || {}).map(key => ({
                wch: Math.min(
                    Math.max(
                        key.length,
                        ...translatedData.map(row => String(row[key] || '').length)
                    ),
                    maxWidth
                )
            }));
            worksheet['!cols'] = colWidths;

            // Create workbook and add worksheet
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Veriler');

            // Generate Excel file and trigger download
            XLSX.writeFile(workbook, `${filename}.xlsx`);

        } else if (format === 'json') {
            // Create JSON blob
            const jsonString = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });

            // Create download link and trigger
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${filename}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

        } else {
            throw new Error(`Desteklenmeyen format: ${format}`);
        }

        return { success: true, message: 'Dosya başarıyla indirildi.' };

    } catch (error) {
        console.error('Export error:', error);
        return { success: false, message: error.message || 'Dışa aktarma sırasında hata oluştu.' };
    }
}

/**
 * Parse and import data from Excel or JSON file
 * @param {File} file - File object from input
 * @returns {Promise<Object>} - { success: boolean, data: Array, message: string }
 */
export async function parseImportFile(file) {
    try {
        if (!file) {
            throw new Error('Dosya seçilmedi.');
        }

        const fileName = file.name.toLowerCase();
        const fileExtension = fileName.split('.').pop();

        if (fileExtension === 'json') {
            // Parse JSON file
            return new Promise((resolve, reject) => {
                const reader = new FileReader();

                reader.onload = (e) => {
                    try {
                        const jsonData = JSON.parse(e.target.result);

                        if (!Array.isArray(jsonData)) {
                            throw new Error('JSON dosyası bir dizi içermelidir.');
                        }

                        resolve({
                            success: true,
                            data: jsonData,
                            message: `${jsonData.length} kayıt başarıyla yüklendi.`
                        });
                    } catch (parseError) {
                        reject(new Error('JSON dosyası okunamadı: ' + parseError.message));
                    }
                };

                reader.onerror = () => {
                    reject(new Error('Dosya okuma hatası.'));
                };

                reader.readAsText(file);
            });

        } else if (fileExtension === 'xlsx' || fileExtension === 'xls' || fileExtension === 'csv') {
            // Parse Excel/CSV file
            return new Promise((resolve, reject) => {
                const reader = new FileReader();

                reader.onload = (e) => {
                    try {
                        const data = new Uint8Array(e.target.result);
                        const workbook = XLSX.read(data, { type: 'array' });

                        // Get first sheet
                        const firstSheetName = workbook.SheetNames[0];
                        const worksheet = workbook.Sheets[firstSheetName];

                        // Convert to JSON
                        const jsonData = XLSX.utils.sheet_to_json(worksheet);

                        if (jsonData.length === 0) {
                            throw new Error('Excel dosyası boş.');
                        }

                        // Map Turkish column names back to English
                        const translatedData = jsonData.map(item => {
                            const translated = {};
                            Object.keys(item).forEach(key => {
                                const englishKey = COLUMN_MAPPINGS.toEnglish[key] || key;
                                translated[englishKey] = item[key];
                            });
                            return translated;
                        });

                        resolve({
                            success: true,
                            data: translatedData,
                            message: `${translatedData.length} kayıt başarıyla yüklendi.`
                        });
                    } catch (parseError) {
                        reject(new Error('Excel dosyası okunamadı: ' + parseError.message));
                    }
                };

                reader.onerror = () => {
                    reject(new Error('Dosya okuma hatası.'));
                };

                reader.readAsArrayBuffer(file);
            });

        } else {
            throw new Error(`Desteklenmeyen dosya formatı: .${fileExtension}\nSadece .json, .xlsx, .xls veya .csv dosyaları desteklenir.`);
        }

    } catch (error) {
        console.error('Import error:', error);
        return { success: false, data: [], message: error.message || 'İçe aktarma sırasında hata oluştu.' };
    }
}

// ============================================================================
// METIN LIST IMPORT/EXPORT
// ============================================================================

/**
 * Export metin list to Excel with flattened drop data
 * @param {Array} metinList - Array of metin objects with drops
 * @param {Array} marketItems - Market items for name lookup
 * @param {string} filename - Name of the file (without extension)
 */
export async function exportMetinsToExcel(metinList, marketItems, filename = 'metin-listesi') {
    try {
        if (!metinList || metinList.length === 0) {
            throw new Error('Dışa aktarılacak metin bulunamadı.');
        }

        // Flatten data: one row per drop
        const flattenedData = [];

        metinList.forEach(metin => {
            if (metin.drops && metin.drops.length > 0) {
                metin.drops.forEach(drop => {
                    // Find item name from market items
                    const item = marketItems.find(i => i.originalId === drop.itemId);
                    const itemName = item ? item.name : drop.itemId;

                    flattenedData.push({
                        'Metin Adı': metin.name,
                        'HP': metin.hp,
                        'Eşya Adı': itemName,
                        'Adet': drop.count,
                        'Şans': drop.chance
                    });
                });
            } else {
                // Metin with no drops - add one row with empty drop data
                flattenedData.push({
                    'Metin Adı': metin.name,
                    'HP': metin.hp,
                    'Eşya Adı': '',
                    'Adet': 0,
                    'Şans': 0
                });
            }
        });

        // Create worksheet
        const worksheet = XLSX.utils.json_to_sheet(flattenedData);

        // Auto-size columns
        const colWidths = [
            { wch: 20 }, // Metin Adı
            { wch: 12 }, // HP
            { wch: 25 }, // Eşya Adı
            { wch: 8 },  // Adet
            { wch: 8 }   // Şans
        ];
        worksheet['!cols'] = colWidths;

        // Create workbook and add worksheet
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Metin Listesi');

        // Generate Excel file and trigger download
        XLSX.writeFile(workbook, `${filename}.xlsx`);

        return { success: true, message: 'Metin listesi başarıyla indirildi.' };

    } catch (error) {
        console.error('Metin export error:', error);
        return { success: false, message: error.message || 'Metin dışa aktarma sırasında hata oluştu.' };
    }
}

// HELPER: Metinleri Sterilize Eden Fonksiyon 🧼
const sanitizeText = (text) => {
    if (!text) return '';
    return String(text)
        .normalize('NFC') // Türkçe karakterlerin kodlamasını standartlaştırır (İ vs i+nokta)
        .replace(/\u00A0/g, ' ') // Non-breaking space (NBSP) karakterini normal boşluğa çevirir
        .replace(/\s+/g, ' ') // Çift boşlukları ve tabları tek boşluğa indirir
        .trim(); // Baştaki ve sondaki boşlukları atar
};

// HELPER: İsimden Sabit ID Üretici (Slugify)
function generateStableId(name) {
    const trMap = {
        'ç': 'c', 'Ç': 'c',
        'ğ': 'g', 'Ğ': 'g',
        'ş': 's', 'Ş': 's',
        'ü': 'u', 'Ü': 'u',
        'ı': 'i', 'I': 'i',
        'İ': 'i',
        'ö': 'o', 'Ö': 'o'
    };

    return 'metin_' + name
        .trim()
        .split('')
        .map(char => trMap[char] || char) // Türkçe karakterleri çevir
        .join('')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_') // Harf ve sayı dışındakileri _ yap
        .replace(/^_+|_+$/g, ''); // Baştaki ve sondaki _ leri sil
}

/**
 * Parse and import metin list from Excel or JSON file
 * Groups rows by metin name and detects new items
 * @param {File} file - File object from input
 * @returns {Promise<Object>} - { success: boolean, metinList: Array, detectedItems: Array, message: string }
 */
export async function parseMetinImport(file) {
    try {
        if (!file) {
            throw new Error('Dosya seçilmedi.');
        }

        const fileName = file.name.toLowerCase();
        const fileExtension = fileName.split('.').pop();

        let rawData = [];

        // Read file based on extension
        if (fileExtension === 'json') {
            // Parse JSON file
            const result = await new Promise((resolve, reject) => {
                const reader = new FileReader();

                reader.onload = (e) => {
                    try {
                        const jsonData = JSON.parse(e.target.result);
                        if (!Array.isArray(jsonData)) {
                            throw new Error('JSON dosyası bir dizi içermelidir.');
                        }
                        resolve(jsonData);
                    } catch (parseError) {
                        reject(new Error('JSON dosyası okunamadı: ' + parseError.message));
                    }
                };

                reader.onerror = () => reject(new Error('Dosya okuma hatası.'));
                reader.readAsText(file);
            });

            rawData = result;

        } else if (fileExtension === 'xlsx' || fileExtension === 'xls' || fileExtension === 'csv') {
            // Parse Excel/CSV file
            const result = await new Promise((resolve, reject) => {
                const reader = new FileReader();

                reader.onload = (e) => {
                    try {
                        const data = new Uint8Array(e.target.result);
                        const workbook = XLSX.read(data, { type: 'array' });

                        // Get first sheet
                        const firstSheetName = workbook.SheetNames[0];
                        const worksheet = workbook.Sheets[firstSheetName];

                        // Convert to JSON
                        const jsonData = XLSX.utils.sheet_to_json(worksheet);

                        if (jsonData.length === 0) {
                            throw new Error('Excel dosyası boş.');
                        }

                        resolve(jsonData);
                    } catch (parseError) {
                        reject(new Error('Excel dosyası okunamadı: ' + parseError.message));
                    }
                };

                reader.onerror = () => reject(new Error('Dosya okuma hatası.'));
                reader.readAsArrayBuffer(file);
            });

            rawData = result;

        } else {
            throw new Error(`Desteklenmeyen dosya formatı: .${fileExtension}\nSadece .json, .xlsx, .xls veya .csv dosyaları desteklenir.`);
        }

        // Group rows by metin name and detect items
        const metinMap = new Map();
        const detectedItemsMap = new Map();

        rawData.forEach(row => {
            const rawName = row['Metin Adı'] || row.metinName || row.name;
            const metinName = sanitizeText(rawName);
            const hp = parseInt(row['HP'] || row.hp) || 100000;
            const itemName = row['Eşya Adı'] || row.itemName || row.item;
            const count = parseInt(row['Adet'] || row.count) || 1;
            const chance = parseFloat(row['Şans'] || row.chance) || 100;

            if (!metinName) {
                console.warn('Satırda metin adı bulunamadı, atlanıyor:', row);
                return;
            }

            // Get or create metin entry
            if (!metinMap.has(metinName)) {
                // ✅ ARTIK İSİM TABANLI SABİT ID KULLANIYORUZ
                const stableId = generateStableId(metinName);

                metinMap.set(metinName, {
                    id: stableId,
                    name: metinName,
                    hp: hp,
                    drops: []
                });
            }

            const metin = metinMap.get(metinName);

            // Add drop if item name exists
            if (itemName && itemName.trim() !== '') {
                // Detect and register item
                if (!detectedItemsMap.has(itemName)) {
                    detectedItemsMap.set(itemName, {
                        originalName: itemName,
                        tempId: `temp-item-${crypto.randomUUID()}`,
                        icon: 'Circle'
                    });
                }

                const detectedItem = detectedItemsMap.get(itemName);

                // Add drop to metin
                metin.drops.push({
                    id: `drop-${crypto.randomUUID()}`,
                    itemId: detectedItem.tempId,
                    count: count,
                    chance: chance
                });
            }
        });

        // Convert maps to arrays
        const metinList = Array.from(metinMap.values());
        const detectedItems = Array.from(detectedItemsMap.values());

        return {
            success: true,
            metinList: metinList,
            detectedItems: detectedItems,
            message: `${metinList.length} metin ve ${detectedItems.length} benzersiz eşya yüklendi.`
        };

    } catch (error) {
        console.error('Metin import error:', error);
        return {
            success: false,
            metinList: [],
            detectedItems: [],
            message: error.message || 'Metin içe aktarma sırasında hata oluştu.'
        };
    }
}
