"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Target,
    ChevronDown,
    Shield,
    Skull,
    Lock,
    RotateCcw,
    ArrowRight,
    Copy,
    Coins,
    Package,
    AlertTriangle,
    Plus,
    X,
    Sparkles
} from "lucide-react";
import SmartInput from "@/app/components/ui/SmartInput";

// ============================================================================
// CONSTANTS
// ============================================================================

const MATERIAL_OPTIONS = [
    { value: 'ritual_stone', label: 'Ritüel Taşı', icon: '💎', color: 'purple' },
    { value: 'magic_stone', label: 'Büyülü Metal', icon: '🔮', color: 'blue' },
    { value: 'blessing_scroll', label: 'Kutsama Kağıdı', icon: '📜', color: 'yellow' },
    { value: 'blacksmith_book', label: 'El Kitabı', icon: '📕', color: 'orange' }
];

const FAIL_OPTIONS = [
    { value: 'downgrade', label: 'Seviye Düş (-1)', icon: ArrowRight, color: 'text-orange-400' },
    { value: 'destroy', label: 'Yok Ol (Destroy)', icon: Skull, color: 'text-red-400' },
    { value: 'keep_level', label: 'Seviye Koru (Safe)', icon: Shield, color: 'text-green-400' },
    { value: 'reset', label: 'Başa Dön (Reset)', icon: RotateCcw, color: 'text-violet-400' }
];

const DEFAULT_STRATEGY = {
    0: { baseChance: 90, pityLimit: 5, priorityList: ['blessing_scroll'], upgradeCost: 0, onFail: 'downgrade', requiredMaterials: [] },
    1: { baseChance: 85, pityLimit: 5, priorityList: ['blessing_scroll'], upgradeCost: 0, onFail: 'downgrade', requiredMaterials: [] },
    2: { baseChance: 80, pityLimit: 6, priorityList: ['blessing_scroll'], upgradeCost: 0, onFail: 'downgrade', requiredMaterials: [] },
    3: { baseChance: 75, pityLimit: 6, priorityList: ['blessing_scroll'], upgradeCost: 0, onFail: 'downgrade', requiredMaterials: [] },
    4: { baseChance: 70, pityLimit: 7, priorityList: ['blessing_scroll'], upgradeCost: 100000, onFail: 'downgrade', requiredMaterials: [] },
    5: { baseChance: 60, pityLimit: 8, priorityList: ['blessing_scroll', 'magic_stone'], upgradeCost: 200000, onFail: 'downgrade', requiredMaterials: [] },
    6: { baseChance: 50, pityLimit: 10, priorityList: ['magic_stone', 'blessing_scroll'], upgradeCost: 300000, onFail: 'downgrade', requiredMaterials: [] },
    7: { baseChance: 40, pityLimit: 12, priorityList: ['ritual_stone', 'magic_stone'], upgradeCost: 400000, onFail: 'downgrade', requiredMaterials: [] },
    8: { baseChance: 30, pityLimit: 15, priorityList: ['ritual_stone', 'magic_stone', 'blessing_scroll'], upgradeCost: 500000, onFail: 'keep_level', requiredMaterials: [] }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getChanceColor = (chance) => {
    if (chance >= 70) return { border: 'border-l-green-500', text: 'text-green-400', bg: 'bg-green-500/10' };
    if (chance >= 40) return { border: 'border-l-yellow-500', text: 'text-yellow-400', bg: 'bg-yellow-500/10' };
    return { border: 'border-l-red-500', text: 'text-red-400', bg: 'bg-red-500/10' };
};

const formatCurrency = (value) => {
    if (value === undefined || value === null || isNaN(value)) return "0";
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return Math.round(value).toLocaleString("tr-TR");
};

// ============================================================================
// SUB-COMPONENT: StageCard
// ============================================================================

function StageCard({
    level,
    strategy,
    config,
    onChange,
    onOpenMaterials,
    onApplyToHigher,
    isExpanded,
    onToggle
}) {
    const chanceColors = getChanceColor(strategy.baseChance);
    const showPityLimit = config.pitySystem === 'hard';
    const totalCost = (strategy.upgradeCost || 0);
    const materialCount = strategy.requiredMaterials?.length || 0;

    // Get active protection icons
    const getProtectionIcons = () => {
        const icons = [];
        if (strategy.priorityList?.includes('ritual_stone')) icons.push({ icon: '💎', label: 'Ritüel' });
        if (strategy.priorityList?.includes('magic_stone')) icons.push({ icon: '🔮', label: 'Büyülü' });
        if (strategy.onFail === 'keep_level') icons.push({ icon: '🛡️', label: 'Safe' });
        if (materialCount > 0) icons.push({ icon: '📦', label: `+${materialCount}` });
        return icons;
    };

    const protectionIcons = getProtectionIcons();

    return (
        <div className={`
            rounded-xl border border-l-4 overflow-hidden transition-all duration-200
            ${chanceColors.border}
            ${isExpanded ? 'bg-zinc-900/80 border-zinc-700' : 'bg-zinc-900/40 border-zinc-800 hover:bg-zinc-900/60'}
        `}>
            {/* HEADER - Always Visible (Collapsed Dashboard View) */}
            <button
                onClick={onToggle}
                className="w-full px-4 py-3 flex items-center gap-4 text-left"
            >
                {/* Level Badge */}
                <div className="flex items-center gap-2 min-w-[90px]">
                    <span className="text-lg font-bold text-white">+{level}</span>
                    <ArrowRight className="w-4 h-4 text-zinc-600" />
                    <span className="text-lg font-bold text-white">+{level + 1}</span>
                </div>

                {/* Chance Display */}
                <div className={`
                    px-3 py-1 rounded-lg font-mono font-bold text-lg min-w-[70px] text-center
                    ${chanceColors.bg} ${chanceColors.text}
                `}>
                    %{strategy.baseChance}
                </div>

                {/* Cost Preview */}
                <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 rounded-lg">
                    <Coins className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-mono font-semibold text-yellow-400">
                        {formatCurrency(totalCost)}
                    </span>
                </div>

                {/* Protection Summary Badges */}
                <div className="flex items-center gap-1 flex-1">
                    {protectionIcons.map((item, idx) => (
                        <span
                            key={idx}
                            className="px-2 py-0.5 bg-zinc-800 rounded text-xs"
                            title={item.label}
                        >
                            {item.icon}
                        </span>
                    ))}
                </div>

                {/* Expand Icon */}
                <ChevronDown className={`
                    w-5 h-5 text-zinc-500 transition-transform duration-200
                    ${isExpanded ? 'rotate-180' : ''}
                `} />
            </button>

            {/* BODY - Expanded Control Center */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 space-y-4 border-t border-zinc-800">

                            {/* ZONE 1: Core Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4">
                                {/* Base Chance */}
                                <div>
                                    <label className="block text-xs text-zinc-500 mb-1">Başarı Şansı %</label>
                                    <SmartInput
                                        value={strategy.baseChance}
                                        onChange={(val) => onChange(level, 'baseChance', val)}
                                        min={1}
                                        max={100}
                                        className={`w-full px-3 py-2 text-lg font-mono font-bold bg-zinc-950 border border-zinc-700 rounded-lg ${chanceColors.text}`}
                                    />
                                </div>

                                {/* Pity Limit */}
                                {showPityLimit && (
                                    <div>
                                        <label className="block text-xs text-zinc-500 mb-1">Pity Limit</label>
                                        <SmartInput
                                            value={strategy.pityLimit ?? 10}
                                            onChange={(val) => onChange(level, 'pityLimit', val)}
                                            min={0}
                                            max={100}
                                            className="w-full px-3 py-2 text-lg font-mono font-bold text-orange-400 bg-zinc-950 border border-orange-500/30 rounded-lg"
                                        />
                                    </div>
                                )}

                                {/* Upgrade Cost */}
                                <div>
                                    <label className="block text-xs text-zinc-500 mb-1">Yükseltme Ücreti</label>
                                    <SmartInput
                                        value={strategy.upgradeCost ?? 0}
                                        onChange={(val) => onChange(level, 'upgradeCost', val)}
                                        min={0}
                                        className="w-full px-3 py-2 text-lg font-mono font-bold text-yellow-400 bg-zinc-950 border border-yellow-500/30 rounded-lg"
                                    />
                                </div>

                                {/* Extra Materials Button */}
                                <div>
                                    <label className="block text-xs text-zinc-500 mb-1">Ekstra Malzeme</label>
                                    <button
                                        onClick={() => onOpenMaterials(level)}
                                        className={`
                                            w-full px-3 py-2 rounded-lg border flex items-center justify-center gap-2 transition-all
                                            ${materialCount > 0
                                                ? 'bg-blue-500/20 border-blue-500/50 text-blue-400 hover:bg-blue-500/30'
                                                : 'bg-zinc-950 border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600'
                                            }
                                        `}
                                    >
                                        <Package className="w-4 h-4" />
                                        {materialCount > 0 ? `${materialCount} Malzeme` : 'Ekle'}
                                    </button>
                                </div>
                            </div>

                            {/* ZONE 2: Protection Strategy */}
                            <div className="bg-zinc-950/50 p-3 rounded-lg border border-zinc-800">
                                <h4 className="text-xs font-semibold text-zinc-400 mb-3 flex items-center gap-2">
                                    <Shield className="w-3.5 h-3.5 text-green-400" />
                                    Koruma Önceliği
                                </h4>
                                <div className="grid grid-cols-3 gap-2">
                                    {[0, 1, 2].map((idx) => (
                                        <div key={idx}>
                                            <label className="block text-[10px] text-zinc-600 mb-1">
                                                {idx + 1}. Öncelik
                                            </label>
                                            <select
                                                value={strategy.priorityList?.[idx] || ''}
                                                onChange={(e) => {
                                                    const newList = [...(strategy.priorityList || [])];
                                                    if (e.target.value) {
                                                        newList[idx] = e.target.value;
                                                    } else {
                                                        newList.splice(idx, 1);
                                                    }
                                                    onChange(level, 'priorityList', newList.filter(Boolean));
                                                }}
                                                className="w-full px-2 py-1.5 text-xs text-white bg-zinc-900 border border-zinc-700 rounded-lg focus:border-green-500/50 focus:outline-none"
                                            >
                                                {idx > 0 && <option value="">- Yok -</option>}
                                                {MATERIAL_OPTIONS.map(opt => (
                                                    <option key={opt.value} value={opt.value}>
                                                        {opt.icon} {opt.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* ZONE 3: Risk Management */}
                            <div className="bg-zinc-950/50 p-3 rounded-lg border border-zinc-800">
                                <h4 className="text-xs font-semibold text-zinc-400 mb-3 flex items-center gap-2">
                                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                                    Başarısız Olursa
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {FAIL_OPTIONS.map((opt) => {
                                        const IconComponent = opt.icon;
                                        const isSelected = strategy.onFail === opt.value;
                                        return (
                                            <button
                                                key={opt.value}
                                                onClick={() => onChange(level, 'onFail', opt.value)}
                                                className={`
                                                    p-2 rounded-lg border text-xs font-medium transition-all flex flex-col items-center gap-1
                                                    ${isSelected
                                                        ? `bg-zinc-800 border-zinc-600 ${opt.color}`
                                                        : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                                                    }
                                                `}
                                            >
                                                <IconComponent className={`w-4 h-4 ${isSelected ? opt.color : ''}`} />
                                                <span className="text-[10px] text-center leading-tight">{opt.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Action Footer */}
                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    onClick={() => onApplyToHigher(level)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-violet-400 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 rounded-lg transition-colors"
                                >
                                    <Copy className="w-3.5 h-3.5" />
                                    Üst Seviyelere Uygula
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ============================================================================
// MAIN COMPONENT: StrategyTable
// ============================================================================

export default function StrategyTable({
    levelRange,
    strategy,
    config,
    onStrategyChange,
    onOpenMaterials
}) {
    const [expandedLevel, setExpandedLevel] = useState(null);
    const [globalProtection, setGlobalProtection] = useState('blessing_scroll');
    const [globalFailMode, setGlobalFailMode] = useState('downgrade');

    // Toggle card expansion
    const handleToggle = useCallback((level) => {
        setExpandedLevel(prev => prev === level ? null : level);
    }, []);

    // Apply settings to all higher levels
    const handleApplyToHigher = useCallback((fromLevel) => {
        const sourceStrategy = strategy[fromLevel] || DEFAULT_STRATEGY[fromLevel];
        levelRange.forEach(lvl => {
            if (lvl > fromLevel) {
                onStrategyChange(lvl, 'priorityList', [...(sourceStrategy.priorityList || [])]);
                onStrategyChange(lvl, 'onFail', sourceStrategy.onFail);
            }
        });
    }, [levelRange, strategy, onStrategyChange]);

    // Apply global settings to all levels
    const handleApplyGlobal = useCallback(() => {
        levelRange.forEach(lvl => {
            onStrategyChange(lvl, 'priorityList', [globalProtection]);
            onStrategyChange(lvl, 'onFail', globalFailMode);
        });
    }, [levelRange, globalProtection, globalFailMode, onStrategyChange]);

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-400 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Seviye Stratejileri
                </h3>
                <span className="text-xs text-zinc-600">
                    {levelRange.length} seviye
                </span>
            </div>

            {/* Global Action Bar */}
            <div className="flex items-center gap-2 p-3 bg-zinc-900/50 rounded-xl border border-zinc-800">
                <Sparkles className="w-4 h-4 text-violet-400 flex-shrink-0" />
                <span className="text-xs text-zinc-400 flex-shrink-0">Hepsine Uygula:</span>

                <select
                    value={globalProtection}
                    onChange={(e) => setGlobalProtection(e.target.value)}
                    className="px-2 py-1 text-xs text-white bg-zinc-950 border border-zinc-700 rounded-lg flex-1 max-w-[150px]"
                >
                    {MATERIAL_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.icon} {opt.label}</option>
                    ))}
                </select>

                <select
                    value={globalFailMode}
                    onChange={(e) => setGlobalFailMode(e.target.value)}
                    className="px-2 py-1 text-xs text-white bg-zinc-950 border border-zinc-700 rounded-lg flex-1 max-w-[140px]"
                >
                    {FAIL_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>

                <button
                    onClick={handleApplyGlobal}
                    className="px-3 py-1 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors flex-shrink-0"
                >
                    Uygula
                </button>
            </div>

            {/* Stage Cards List */}
            <div className="space-y-2">
                {levelRange.map(level => (
                    <StageCard
                        key={level}
                        level={level}
                        strategy={strategy[level] || DEFAULT_STRATEGY[level] || {
                            baseChance: 30,
                            pityLimit: 10,
                            priorityList: ['blessing_scroll'],
                            upgradeCost: 0,
                            onFail: 'downgrade',
                            requiredMaterials: []
                        }}
                        config={config}
                        onChange={onStrategyChange}
                        onOpenMaterials={onOpenMaterials}
                        onApplyToHigher={handleApplyToHigher}
                        isExpanded={expandedLevel === level}
                        onToggle={() => handleToggle(level)}
                    />
                ))}
            </div>

            {/* Footer Tips */}
            <div className="flex items-start gap-2 p-3 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
                <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-zinc-500">
                    <p className="font-medium text-zinc-400 mb-1">Strateji İpuçları:</p>
                    <ul className="space-y-0.5 list-disc list-inside">
                        <li>Yüksek seviyeler için "Seviye Koru" modunu tercih edin</li>
                        <li>Koruma öncelikleri envanter durumuna göre otomatik seçilir</li>
                        <li>Kartlara tıklayarak detaylı ayarları görüntüleyin</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

// Export constants for use in other components
export { MATERIAL_OPTIONS, DEFAULT_STRATEGY, FAIL_OPTIONS };
