// ============================================================================
// SASH CRAFTING PANEL CONSTANTS
// ============================================================================

export const TARGET_GRADES = [
    { value: 18, label: "%18 Emiş" },
    { value: 20, label: "%20 Emiş" },
    { value: 25, label: "%25 Emiş" },
    { value: 30, label: "%30 Emiş" }
];

export const DEFAULT_CONFIG = {
    clothPrice: 1000000,
    clothCount: 40,
    clothBudget: 1000,      // Bütçe modu için kumaş
    targetGrade: 25,
    simCount: 5000,
    mode: 'target',          // 'target' veya 'budget'
    absorptionCap: 25,       // Sunucu emiş sınırı (hardcap)
    rates: {
        grade1: 90,
        grade2: 80,
        grade3: 70,
        upgrade: 50
    }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const formatCurrency = (value) => {
    if (value === undefined || value === null || isNaN(value)) return "0";
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(2)}B`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return Math.round(value).toLocaleString("tr-TR");
};

export const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString("tr-TR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
    });
};
