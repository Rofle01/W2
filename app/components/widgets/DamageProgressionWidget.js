"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { X, EyeOff, TrendingUp, Target, ArrowDown, Check, Trophy, AlertCircle, Filter, CheckSquare } from "lucide-react";
import { calculateDamageZones, analyzeNextTier, formatCompactCurrency, formatCurrency } from "../../lib/calculator";
import { useSharedWidgetData } from "../../hooks/useSharedWidgetData";
import useWidgetStore from "../../store/useWidgetStore";

// ============================================================================
// HELPER: FIND SIBLING WIDGETS (CONTEXT-AWARE)
// ============================================================================
// ============================================================================
// HELPER: FIND SIBLING WIDGETS (CONTEXT-AWARE)
// ============================================================================
// useSiblingWidgetData replaced by useSharedWidgetData hook

// ============================================================================
// SUMMARY VIEW
// ============================================================================
function DamageProgressionSummaryView({ userStats, metinList, craftingItems, prices, multipliers }) {
    const zones = useMemo(() => {
        return calculateDamageZones(metinList, prices, multipliers, userStats, craftingItems);
    }, [metinList, prices, multipliers, userStats, craftingItems]);

    const currentDamage = userStats.damage || 0;
    const maxSimulationDamage = zones.length > 0 ? zones[zones.length - 1].maxDamage : 30000;
    const markerPosition = Math.min(100, Math.max(0, (currentDamage / maxSimulationDamage) * 100));

    return (
        <div className="flex flex-col items-center justify-center h-full w-full px-4">
            <div className="flex items-center gap-2 mb-4">
                <Target className="w-6 h-6 text-fuchsia-400 drop-shadow-[0_0_8px_rgba(232,121,249,0.5)]" />
                <span className="text-lg font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">Hasar Analizi</span>
            </div>

            {/* Progress Bar Container */}
            <div className="w-full h-8 bg-black/60 rounded-full overflow-hidden relative flex border border-white/10 shadow-inner">
                {zones.map((zone, index) => {
                    const widthPercent = ((zone.maxDamage - zone.minDamage) / maxSimulationDamage) * 100;
                    return (
                        <div
                            key={index}
                            style={{ width: `${widthPercent}%` }}
                            className="h-full relative group first:rounded-l-full last:rounded-r-full hover:brightness-110 transition-all bg-gradient-to-r from-yellow-400/80 to-cyan-400/80 backdrop-blur-sm border-r border-white/10 last:border-r-0"
                        >
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity z-10 border border-white/20">
                                {zone.bestMetinName}
                            </div>
                        </div>
                    );
                })}

                {/* User Marker */}
                <div
                    className="absolute top-0 bottom-0 w-1 bg-cyan-400 shadow-[0_0_10px_#06b6d4] z-10 transition-all duration-500"
                    style={{ left: `${markerPosition}%` }}
                >
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1">
                        <div className="bg-cyan-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded shadow-lg whitespace-nowrap">
                            Siz
                        </div>
                        <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-cyan-500 mx-auto"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// DETAIL VIEW
// ============================================================================
function DamageProgressionDetailView({ userStats, metinList, craftingItems, prices, multipliers }) {
    const zones = useMemo(() => {
        return calculateDamageZones(metinList, prices, multipliers, userStats, craftingItems);
    }, [metinList, prices, multipliers, userStats, craftingItems]);

    const currentDamage = userStats.damage || 0;

    // Analyze next tier
    const analysis = useMemo(() => {
        return analyzeNextTier(currentDamage, zones);
    }, [currentDamage, zones]);

    // Find current zone for display
    const currentZone = zones.find(z => currentDamage >= z.minDamage && currentDamage <= z.maxDamage);

    if (!currentZone || !analysis) {
        return (
            <div className="flex items-center justify-center h-full text-white/50">
                Veri bekleniyor...
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto w-full py-4">

            {/* 1. CURRENT STATUS CARD */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full bg-black/40 backdrop-blur-xl p-6 rounded-2xl border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.1)] relative overflow-hidden hover:border-cyan-500/50 transition-colors"
            >
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Check className="w-24 h-24 text-cyan-500" />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-cyan-500/20 rounded-lg border border-cyan-500/30">
                            <Check className="w-6 h-6 text-cyan-400" />
                        </div>
                        <span className="text-cyan-400 font-bold tracking-wide uppercase text-sm">Mevcut Durum</span>
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-1">
                        Şu an <span className="text-cyan-400">{currentZone.bestMetinName}</span> kesiyorsun.
                    </h3>
                    <p className="text-white/60">
                        Ortalama Kazanç: <strong className="text-white">{formatCompactCurrency(currentZone.maxProfit)} Yang/Saat</strong>
                    </p>
                </div>
            </motion.div>

            {/* 2. PROGRESS INDICATOR */}
            <div className="h-16 flex items-center justify-center relative w-full my-2">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-0.5 h-full bg-gradient-to-b from-cyan-500/50 to-fuchsia-500/50"></div>
                </div>

                {!analysis.isMaxLevel && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="relative z-10 bg-[#000000] border border-white/20 px-4 py-2 rounded-full shadow-xl flex items-center gap-2"
                    >
                        <ArrowDown className="w-4 h-4 text-white/60" />
                        <span className="text-sm font-bold text-white">
                            Sonraki Seviyeye: <span className="text-fuchsia-400">+{formatCompactCurrency(analysis.requiredDamage)} Hasar</span> Kaldı
                        </span>
                    </motion.div>
                )}
            </div>

            {/* 3. TARGET CARD */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`w-full p-6 rounded-2xl border shadow-lg relative overflow-hidden ${analysis.isMaxLevel
                    ? "bg-gradient-to-br from-violet-900/40 to-blue-900/40 border-violet-500/30"
                    : "bg-gradient-to-br from-fuchsia-900/40 to-purple-900/40 border-fuchsia-500/30 shadow-[0_0_30px_rgba(217,70,239,0.15)]"
                    }`}
            >
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Trophy className="w-24 h-24 text-fuchsia-500" />
                </div>

                <div className="relative z-10">
                    {analysis.isMaxLevel ? (
                        // MAX LEVEL VIEW
                        <div className="text-center py-4">
                            <div className="inline-flex p-3 bg-violet-500/20 rounded-full border border-violet-500/30 mb-4">
                                <Trophy className="w-8 h-8 text-violet-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Zirvedesiniz!</h3>
                            <p className="text-white/70 max-w-md mx-auto">
                                Tebrikler! Mevcut ekipmanınızla ulaşabileceğiniz en yüksek verimlilik seviyesindesiniz.
                                Artık keyfini çıkarma vakti! 👑
                            </p>
                        </div>
                    ) : (
                        // NEXT GOAL VIEW
                        <>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-fuchsia-500/20 rounded-lg border border-fuchsia-500/30">
                                    <Target className="w-6 h-6 text-fuchsia-400" />
                                </div>
                                <span className="text-fuchsia-400 font-bold tracking-wide uppercase text-sm">Sonraki Hedef</span>
                            </div>

                            <h3 className="text-3xl font-bold text-white mb-2">
                                {analysis.nextMetin}
                            </h3>

                            <div className="flex items-start gap-3 mt-4 bg-black/20 p-3 rounded-xl border border-white/5">
                                <TrendingUp className="w-5 h-5 text-cyan-400 mt-0.5" />
                                <div>
                                    <p className="text-white/90 font-medium">
                                        Bu hedefe ulaşırsan kazancın <span className="text-cyan-400 font-bold">%{analysis.percentGain.toFixed(1)}</span> artacak!
                                    </p>
                                    <p className="text-white/50 text-xs mt-1">
                                        Tahmini Artış: +{formatCompactCurrency(analysis.profitIncrease)} Yang/Saat
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </motion.div>

            {/* Softcap Warning (if applicable) */}
            {currentZone.isSoftcap && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-4 flex items-center gap-2 text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20"
                >
                    <AlertCircle className="w-4 h-4" />
                    <span>Dikkat: Şu an softcap bölgesindesiniz. Hasar artışı verimi düşürebilir.</span>
                </motion.div>
            )}
        </div>
    );
}

// ============================================================================
// MAIN WIDGET
// ============================================================================
export default function DamageProgressionWidget({ id, data, isSelected, onClick, onHide }) {
    // Get context-aware data from sibling widgets
    const { userStats, metinList, marketItems, craftingItems, prices, multipliers } = useSharedWidgetData();
    const [showFilter, setShowFilter] = useState(false);

    // Modüler Filtreleme: Hesaplama motoruna girmeden veriyi süzüyoruz
    const filteredMetinList = useMemo(() => {
        const hiddenIds = data.hiddenMetinIds || [];
        return metinList.filter(m => !hiddenIds.includes(m.id));
    }, [metinList, data.hiddenMetinIds]);

    // Filter Logic
    const toggleMetinVisibility = (metinId) => {
        const currentHidden = data.hiddenMetinIds || [];
        const isHidden = currentHidden.includes(metinId);

        let newHidden;
        if (isHidden) {
            newHidden = currentHidden.filter(id => id !== metinId); // Göster
        } else {
            newHidden = [...currentHidden, metinId]; // Gizle
        }

        // Widget hafızasına kaydet
        const updateWidgetData = useWidgetStore.getState().updateWidgetData;
        updateWidgetData(id, { hiddenMetinIds: newHidden });
    };

    const showAllMetins = () => {
        const updateWidgetData = useWidgetStore.getState().updateWidgetData;
        updateWidgetData(id, { hiddenMetinIds: [] });
    };

    return (
        <motion.div
            layoutId={`card-${id}`}
            layout
            onClick={!isSelected ? onClick : undefined}
            className={`group rounded-3xl shadow-2xl cursor-pointer overflow-hidden backdrop-blur-xl border border-white/10 ${isSelected
                ? "fixed inset-0 m-auto w-[90%] h-[90%] max-w-6xl z-[100] bg-black/90 border border-white/10"
                : "relative h-64 hover:-translate-y-1 hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.1)] transition-all duration-300 bg-black/40 hover:bg-black/50 border border-white/10"
                }`}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
            {/* Hide Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                    e.stopPropagation();
                    onHide && onHide();
                }}
                className="absolute top-4 right-4 z-20 p-2 bg-white/10 backdrop-blur-sm shadow-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-white/60 hover:text-red-400 hover:bg-red-500/20 border border-white/20"
            >
                <EyeOff className="w-4 h-4" />
            </motion.button>

            {/* Summary View */}
            {!isSelected && (
                <div className="w-full h-full p-6 relative">
                    <TrendingUp className="absolute -bottom-4 -right-4 w-32 h-32 text-white/5 opacity-50 rotate-12 pointer-events-none" />
                    <DamageProgressionSummaryView
                        userStats={userStats}
                        metinList={filteredMetinList}
                        craftingItems={craftingItems}
                        prices={prices}
                        multipliers={multipliers}
                    />
                </div>
            )}

            {/* Detail View */}
            {isSelected && (
                <div className="flex flex-col h-full bg-black/20">
                    <div className="flex items-center justify-between p-8 border-b border-white/20 bg-white/5 backdrop-blur-xl relative z-20">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                                <TrendingUp className="w-8 h-8 text-cyan-400" />
                            </div>
                            <div>
                                <motion.h2 layoutId={`title-${id}`} className="text-2xl font-bold text-white">
                                    Hasar Yol Haritası
                                </motion.h2>
                                <p className="text-white/60">Gelişim hedefleri ve sonraki adımlar</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Filter Button */}
                            <div className="relative">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowFilter(!showFilter);
                                    }}
                                    className={`p-2 rounded-lg transition-colors border ${showFilter
                                        ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/50"
                                        : "bg-white/5 text-white/70 hover:bg-white/10 border-white/10"
                                        }`}
                                >
                                    <Filter className="w-5 h-5" />
                                </button>

                                {/* Filter Panel */}
                                {showFilter && (
                                    <div
                                        className="absolute right-0 top-full mt-2 w-64 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-4 z-50"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="font-semibold text-white">Metin Filtresi</h3>
                                            <button
                                                onClick={showAllMetins}
                                                className="text-xs text-cyan-400 hover:text-cyan-300"
                                            >
                                                Tümünü Göster
                                            </button>
                                        </div>
                                        <div className="max-h-60 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                                            {metinList.map(metin => {
                                                const isHidden = (data.hiddenMetinIds || []).includes(metin.id);
                                                return (
                                                    <label
                                                        key={metin.id}
                                                        className="flex items-center gap-2 p-2 rounded hover:bg-white/5 cursor-pointer group"
                                                    >
                                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${!isHidden
                                                            ? "bg-cyan-500 border-cyan-500"
                                                            : "border-white/30 group-hover:border-white/50"
                                                            }`}>
                                                            {!isHidden && <CheckSquare className="w-3 h-3 text-black" />}
                                                        </div>
                                                        <input
                                                            type="checkbox"
                                                            checked={!isHidden}
                                                            onChange={() => toggleMetinVisibility(metin.id)}
                                                            className="hidden"
                                                        />
                                                        <span className={`text-sm ${isHidden ? "text-white/50" : "text-white/90"}`}>
                                                            {metin.name}
                                                        </span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onClick();
                                }}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors backdrop-blur-sm border border-white/10 hover:border-white/20"
                            >
                                <X className="w-6 h-6 text-white/80" />
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 p-8 overflow-y-auto">
                        <DamageProgressionDetailView
                            userStats={userStats}
                            metinList={filteredMetinList}
                            craftingItems={craftingItems}
                            prices={prices}
                            multipliers={multipliers}
                        />
                    </div>
                </div>
            )}
        </motion.div>
    );
}
