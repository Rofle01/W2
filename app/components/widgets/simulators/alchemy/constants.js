// ============================================================================
// ALCHEMY PANEL CONSTANTS
// ============================================================================

export const ELEMENTS = {
    diamond: { name: 'Elmas', color: 'cyan-200', bgColor: 'bg-cyan-500/20', borderColor: 'border-cyan-500/30', textColor: 'text-cyan-300' },
    ruby: { name: 'Yakut', color: 'rose-500', bgColor: 'bg-rose-500/20', borderColor: 'border-rose-500/30', textColor: 'text-rose-300' },
    jade: { name: 'Yeşim', color: 'emerald-500', bgColor: 'bg-emerald-500/20', borderColor: 'border-emerald-500/30', textColor: 'text-emerald-300' },
    sapphire: { name: 'Safir', color: 'blue-500', bgColor: 'bg-blue-500/20', borderColor: 'border-blue-500/30', textColor: 'text-blue-300' },
    garnet: { name: 'Garnet', color: 'orange-500', bgColor: 'bg-orange-500/20', borderColor: 'border-orange-500/30', textColor: 'text-orange-300' },
    onyx: { name: 'Oniks', color: 'zinc-400', bgColor: 'bg-zinc-700/50', borderColor: 'border-zinc-500/30', textColor: 'text-zinc-300' },
    amethyst: { name: 'Ametist', color: 'purple-500', bgColor: 'bg-purple-500/20', borderColor: 'border-purple-500/30', textColor: 'text-purple-300' }
};

export const CLASS_LEVELS = {
    rough: { name: 'İşlenmemiş', shortName: 'Rough' },
    cut: { name: 'Yontulmuş', shortName: 'Cut' },
    rare: { name: 'Nadir', shortName: 'Rare' },
    antique: { name: 'Antika', shortName: 'Antique' },
    legendary: { name: 'Efsanevi', shortName: 'Legend' },
    mythic: { name: 'Mitsi', shortName: 'Mythic' }
};

export const CLARITY_LEVELS = {
    matte: { name: 'Mat', shortName: 'Mat' },
    clear: { name: 'Berrak', shortName: 'Clear' },
    brilliant: { name: 'Parlak', shortName: 'Brill' },
    excellent: { name: 'Mükemmel', shortName: 'Exc' },
    flawless: { name: 'Kusursuz', shortName: 'Flaw' }
};

export const TARGET_CLASS_OPTIONS = [
    { value: 'antique', label: 'Antika' },
    { value: 'legendary', label: 'Efsanevi' },
    { value: 'mythic', label: 'Mitsi' }
];

export const COR_OUTPUT_OPTIONS = [
    { value: 'rough', label: 'İşlenmemiş (Rough)' },
    { value: 'cut', label: 'Yontulmuş (Cut)' },
    { value: 'rare', label: 'Nadir (Rare)' },
    { value: 'antique', label: 'Antika (Antique)' },
    { value: 'legendary', label: 'Efsanevi (Legendary)' },
    { value: 'mythic', label: 'Mitsi (Mythic)' }
];

export const DEFAULT_CONFIG = {
    activeElements: ['diamond', 'ruby', 'jade', 'sapphire', 'garnet', 'onyx'],
    corOutput: 'rough',
    targetClass: 'mythic',
    upgradeClarity: false,
    requirements: {
        classUpgrade: 2,
        clarityUpgrade: 2
    },
    rates: {
        class: 50,
        clarity: 70
    }
};

export const DEFAULT_INPUT = {
    corCount: 1000,
    corPrice: 0,
    simCount: 100
};

export const DEFAULT_INPUT_CONFIG = {
    mode: 'cor', // 'cor' | 'material'
    itemClass: 'mythic',
    itemClarity: 'matte'
};

export const DEFAULT_TARGET_CONFIG = {
    baseElement: 'ruby',
    targetGrade: 'mythic',
    targetClarity: 'excellent'
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const formatNumber = (num) => {
    if (num === undefined || num === null || isNaN(num)) return "0";
    if (num >= 1) return num.toFixed(1);
    if (num >= 0.01) return num.toFixed(2);
    if (num > 0) return num.toFixed(3);
    return "0";
};

export const formatCurrency = (value) => {
    if (value === undefined || value === null || isNaN(value)) return "0";
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(2)}B`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return Math.round(value).toLocaleString("tr-TR");
};
