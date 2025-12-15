/**
 * RECURSIVE 'K' FORMATTER
 * 
 * Mantık:
 * 0-999 -> 999
 * 1,000 -> 1k
 * 1,000,000 -> 1kk (Milyon yerine)
 * 1,000,000,000 -> 1kkk (Milyar yerine)
 */

// 1. KISA FORMAT (Genel Görünüm için: 1.5kk)
export function formatCompactK(number) {
    if (!number || isNaN(number)) return "0";
    if (number < 1000) return Math.floor(number).toString();

    // Kaç tane 'k' grubu var? (log1000)
    const tier = Math.floor(Math.log10(number) / 3);

    // Eğer tier 0 ise (1000 altı)
    if (tier === 0) return Math.floor(number).toString();

    // Suffix oluştur (tier kadar 'k' ekle)
    const suffix = 'k'.repeat(tier);

    // Sayıyı küçült (Örn: 1500 -> 1.5)
    const scale = Math.pow(1000, tier);
    const scaled = number / scale;

    // Ondalık temizliği (Tam sayıysa .0 koyma, değilse max 2 basamak)
    const formattedNum = parseFloat(scaled.toFixed(2)); // 1.50 -> 1.5

    return `${formattedNum}${suffix}`;
}

// 2. DETAYLI FORMAT (Hover için: 1kkk 350kk 240k 422)
export function formatDetailedK(number) {
    if (!number || isNaN(number)) return "0";
    if (number < 1000) return Math.floor(number).toString();

    let str = "";
    let temp = Math.floor(number);

    // Sayıyı 1000'e bölerek parçala
    const groups = [];
    while (temp > 0) {
        groups.push(temp % 1000);
        temp = Math.floor(temp / 1000);
    }

    // Tersten (En büyükten en küçüğe) birleştir
    // Örn: groups = [422, 240, 350, 1] -> Tier 0, 1, 2, 3
    for (let i = groups.length - 1; i >= 0; i--) {
        const val = groups[i];
        if (val > 0) {
            const suffix = i > 0 ? 'k'.repeat(i) : '';
            str += ` ${val}${suffix}`;
        }
    }

    return str.trim();
}

/**
 * 3. SUFFIX PARSER (Input için: "40k" -> 40000)
 * 
 * Desteklenen formatlar:
 * - "1.5k" -> 1500
 * - "1kk" veya "1m" -> 1000000
 * - "1kkk" veya "1b" -> 1000000000
 * - "40k" -> 40000
 * - "2.5kk" -> 2500000
 */
export function parseSuffixValue(input) {
    if (input === null || input === undefined) return 0;

    // String'e çevir ve temizle
    let str = String(input).trim().toLowerCase();

    // Boş string kontrolü
    if (!str || str === "") return 0;

    // Virgülü noktaya çevir (Türkçe format desteği)
    str = str.replace(",", ".");

    // Sadece sayı ise direkt parse et
    if (/^-?[\d.]+$/.test(str)) {
        return parseFloat(str) || 0;
    }

    let multiplier = 1;

    // "kk" veya "kkk" gibi tekrarlayan k'ları say
    const kMatch = str.match(/k+$/i);
    if (kMatch) {
        const kCount = kMatch[0].length;
        multiplier = Math.pow(1000, kCount);
        str = str.replace(/k+$/i, "");
    }
    // "m" suffix (milyon)
    else if (/m$/i.test(str)) {
        multiplier = 1_000_000;
        str = str.replace(/m$/i, "");
    }
    // "b" suffix (milyar)
    else if (/b$/i.test(str)) {
        multiplier = 1_000_000_000;
        str = str.replace(/b$/i, "");
    }

    // Kalan sayıyı parse et
    const baseNumber = parseFloat(str) || 0;

    return Math.round(baseNumber * multiplier);
}

// Eskilerle uyumluluk için (Yenilere yönlendir)
export const formatCurrency = formatCompactK;
export const formatCompactCurrency = formatCompactK;

/**
 * Format time in seconds to readable format
 */
export function formatTime(seconds) {
    if (seconds >= 60) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.round(seconds % 60);
        return `${minutes}m ${secs}s`;
    }
    return `${seconds.toFixed(1)}s`;
}

