import { MASTER_REGISTRY } from "../data/initialData";

// 1. WIDGET TİPLERİ (ENUM) - Tek Gerçeklik Kaynağı
export const WIDGET_TYPES = {
    MARKET: "market-prices",
    CHARACTER: "character-stats",
    METIN_SETTINGS: "metin-settings",
    ANALYSIS: "analysis-tool",
    DAMAGE_PROGRESSION: "damage-progression",
    MARKET_SUPPLY: "market-supply",
    CRAFTING: "crafting-manager"
};

// 2. WIDGET KAYDI
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
};
