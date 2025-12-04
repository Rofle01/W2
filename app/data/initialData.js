/**
 * ============================================================================
 * INITIAL DATA - ZERO STATE
 * ============================================================================
 * Kullanıcı kendi verisini gireceği için tüm hazır listeler temizlendi.
 */

// 1. MASTER REGISTRY (Global Sabit Katalog - BOŞ)
export const MASTER_REGISTRY = {
  items: [],          // Market bomboş
  metinTemplates: []  // Metin listesi bomboş
};

// 2. SERVER CONFIGURATIONS (Başlangıç Profili - BOŞ)
export const INITIAL_SERVERS = [
  {
    id: "default_server",
    name: "Sunucum",
    currency: "Won",
    prices: {},       // Fiyatlar boş
    multipliers: { drop: 1.0, yang: 1.0 }
  }
];
