import { MASTER_REGISTRY } from "../data/initialData";

// ============================================================================
// 1. OYUN MEKANİKLERİ (ENUMS)
// ============================================================================

// Eşya Kaynakları
export const ITEM_SOURCES = {
    MARKET: 'market',
    CRAFTING: 'crafting',
    SYSTEM: 'system' // Oyunun kendi itemları
};

// Crafting Tipleri
export const CRAFTING_TYPES = {
    RECIPE: 'recipe',       // X + Y = Z
    CONTAINER: 'container', // Sandık / Boss
    FRAGMENT: 'fragment'    // Parça
};

// Boss Soğuma Tipleri
export const COOLDOWN_TYPES = {
    ENTRY: 'entry', // Girişten itibaren
    EXIT: 'exit'    // Çıkıştan itibaren
};

// ============================================================================
// 2. WIDGET TİPLERİ (ENUM) - Tek Gerçeklik Kaynağı
// ============================================================================
export const WIDGET_TYPES = {
    MARKET: "market-prices",
    CHARACTER: "character-stats",
    METIN_SETTINGS: "metin-settings",
    ANALYSIS: "analysis-tool",
    DAMAGE_PROGRESSION: "damage-progression",
    MARKET_SUPPLY: "market-supply",
    CRAFTING: "crafting-manager",
    BOSS_SETTINGS: "boss-settings"
};

// ============================================================================
// 3. WIDGET KAYDI
// ============================================================================
export const WIDGET_REGISTRY = {
    [WIDGET_TYPES.MARKET]: {
        title: "Piyasa Fiyatları",
        icon: "Coins",
        defaultData: { prices: {} },
        description: "Eşya fiyatlarını görüntüle ve düzenle"
    },
    [WIDGET_TYPES.CHARACTER]: {
        title: "Karakterim",
        icon: "Sword",
        defaultData: {
            damage: 5000,
            hitsPerSecond: 2.5,
            findTime: 10
        },
        description: "Karakter istatistiklerini yönet"
    },
    [WIDGET_TYPES.METIN_SETTINGS]: {
        title: "Metin Ayarları",
        icon: "Settings",
        defaultData: {
            metins: MASTER_REGISTRY.metinTemplates
        },
        description: "Metin HP ve drop ayarlarını düzenle"
    },
    [WIDGET_TYPES.ANALYSIS]: {
        title: "Analiz & Simülasyon",
        icon: "Calculator",
        defaultData: {},
        description: "Karlılık analizi ve farming stratejisi"
    },
    [WIDGET_TYPES.DAMAGE_PROGRESSION]: {
        title: "Hasar Yol Haritası",
        icon: "Map",
        defaultData: {},
        description: "Hasarınıza göre en verimli metin bölgelerini gösterir."
    },
    [WIDGET_TYPES.MARKET_SUPPLY]: {
        title: "Piyasa Arzı",
        icon: "Package",
        defaultData: {},
        description: "Kişisel ve sunucu geneli eşya birikim simülasyonu"
    },
    [WIDGET_TYPES.CRAFTING]: {
        title: "Üretim & Boss",
        icon: "Hammer",
        defaultData: { items: [] },
        description: "Dönüşüm reçeteleri ve boss sandık içeriklerini yönetin."
    },
    [WIDGET_TYPES.BOSS_SETTINGS]: {
        title: "Boss Ayarları",
        icon: "Shield",
        defaultData: {},
        description: "Boss rotasyonlarını, soğuma sürelerini ve dropları yönetin."
    },
};
