"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { X, EyeOff, Calculator, Filter, CheckSquare } from "lucide-react";
import useWidgetStore from "../../store/useWidgetStore";
import {
    calculateAllMetins,
    getBestMetin,
    calculateMetinProfit,
    resolveItemPrice
} from "../../lib/calculator";
import { MASTER_REGISTRY } from "../../data/initialData";
import { useSharedWidgetData } from "../../hooks/useSharedWidgetData";
import AnalysisKPIs from "./analysis/AnalysisKPIs";
import AnalysisSummaryView from "./analysis/AnalysisSummaryView";
import AnalysisChart from "./analysis/AnalysisChart";
import AnalysisTable from "./analysis/AnalysisTable";
import BossRotationView from "./analysis/BossRotationView";

// ============================================================================
// HELPER: FIND SIBLING WIDGETS (CONTEXT-AWARE)
// ============================================================================
// ============================================================================
// HELPER: FIND SIBLING WIDGETS (CONTEXT-AWARE)
// ============================================================================
// useSiblingWidgetData replaced by useSharedWidgetData hook

// ============================================================================
// DETAIL VIEW CONTAINER (Logic Layer)
// ============================================================================
function AnalysisDetailView({ userStats, metinList, prices, multipliers, marketItems }) {
    const [chartType, setChartType] = useState("comparison"); // 'comparison' | 'efficiency'
    const [hourlyCost, setHourlyCost] = useState(0);

    // 2. Hesaplama: Tüm Metinler
    const calculations = useMemo(() => {
        return calculateAllMetins(metinList, prices, multipliers, userStats, marketItems);
    }, [metinList, prices, multipliers, userStats, marketItems]);

    const bestMetin = getBestMetin(calculations);
    const topMetins = calculations.slice(0, 5);

    // 2. Chart Data: Comparison (Top 5)
    const comparisonData = useMemo(() => {
        return topMetins.map(calc => ({
            name: calc.metinName,
            profit: calc.hourlyProfit
        }));
    }, [topMetins]);

    // 3. Chart Data: Efficiency Curve (Multi-Line for Top 5)
    const efficiencyData = useMemo(() => {
        if (!bestMetin || !userStats || !userStats.damage) {
            return null;
        }

        const currentDamage = userStats.damage;
        const minDamage = 100; // Start from near zero
        const maxDamage = Math.max(currentDamage * 2, 10000); // Go up to 2x or at least 10k
        const step = Math.max(100, Math.floor(maxDamage / 50)); // Adaptive step

        const simulations = [];

        // Get full metin objects for top 5
        const targetMetins = topMetins.map(calc =>
            metinList.find(m => m.id === calc.metinId)
        ).filter(Boolean);

        for (let dmg = minDamage; dmg <= maxDamage; dmg += step) {
            const modifiedStats = { ...userStats, damage: dmg };

            const dataPoint = { damage: dmg };

            targetMetins.forEach(metin => {
                const result = calculateMetinProfit(metin, prices, multipliers, modifiedStats, marketItems);
                // Store profit with metin name as key
                dataPoint[metin.name] = result.hourlyProfit - hourlyCost;
            });

            simulations.push(dataPoint);
        }

        return simulations;
    }, [bestMetin, prices, multipliers, userStats, hourlyCost, metinList, topMetins]);

    // 4. Softcap Detection
    const softcapWarning = useMemo(() => {
        if (!bestMetin || !userStats) return null;
        const killTime = bestMetin.killTime;
        const findTime = userStats.findTime;

        if (killTime < findTime * 0.1) {
            return {
                active: true,
                message: "Metin kesme süreniz, bulma sürenize göre çok düşük. Hasar artışı artık verimsiz."
            };
        }
        return { active: false };
    }, [bestMetin, userStats]);

    if (!bestMetin) {
        return (
            <div className="flex items-center justify-center h-full text-white/50">
                Veri bekleniyor...
            </div>
        );
    }

    const netHourlyProfit = bestMetin.hourlyProfit - hourlyCost;

    return (
        <div className="h-full flex flex-col space-y-6 overflow-y-auto pr-2">
            {/* KPI Cards */}
            <AnalysisKPIs
                bestMetin={bestMetin}
                netHourlyProfit={netHourlyProfit}
                hourlyCost={hourlyCost}
                setHourlyCost={setHourlyCost}
            />

            {/* Chart Section */}
            <AnalysisChart
                chartType={chartType}
                setChartType={setChartType}
                comparisonData={comparisonData}
                efficiencyData={efficiencyData}
                userStats={userStats}
                topMetins={topMetins}
            />

            {/* Softcap & Table Section */}
            <AnalysisTable
                calculations={calculations}
                softcapWarning={softcapWarning}
            />
        </div>
    );
}

// ============================================================================
// MAIN ANALYSIS WIDGET COMPONENT (Container)
// ============================================================================
export default function AnalysisWidget({ id, data, isSelected, onClick, onHide }) {
    // Get context-aware data from sibling widgets
    const { userStats, metinList, prices, multipliers, marketItems, bosses } = useSharedWidgetData();
    const [showFilter, setShowFilter] = useState(false);

    // UI State
    const [activeTab, setActiveTab] = useState("metin"); // 'metin' | 'boss'
    const [dailyPlayHours, setDailyPlayHours] = useState(4); // Default 4 hours

    // Modüler Filtreleme: Hesaplama motoruna girmeden veriyi süzüyoruz
    const filteredMetinList = useMemo(() => {
        const hiddenIds = data.hiddenMetinIds || [];
        return metinList.filter(m => !hiddenIds.includes(m.id));
    }, [metinList, data.hiddenMetinIds]);

    // Calculate best metin for summary view (using filtered list)
    const calculations = useMemo(() => {
        return calculateAllMetins(filteredMetinList, prices, multipliers, userStats, marketItems);
    }, [filteredMetinList, prices, multipliers, userStats, marketItems]);

    const bestMetin = getBestMetin(calculations);

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
            {/* SUMMARY VIEW (Collapsed) */}
            {!isSelected && (
                <>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            onHide && onHide();
                        }}
                        className="absolute top-4 right-4 z-20 p-2 bg-white/10 backdrop-blur-sm shadow-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-white/60 hover:text-cyan-400 hover:bg-cyan-500/20 border border-white/20"
                    >
                        <EyeOff className="w-4 h-4" />
                    </motion.button>

                    <div className="w-full h-full p-6 relative">
                        <Calculator className="absolute -bottom-4 -right-4 w-32 h-32 text-white/5 opacity-50 rotate-12 pointer-events-none" />
                        <AnalysisSummaryView bestMetin={bestMetin} />
                    </div>
                </>
            )}

            {/* DETAIL VIEW (Expanded) */}
            {isSelected && (
                <div className="flex flex-col h-full bg-black/20">
                    {/* Header */}
                    <div className="flex items-center justify-between p-8 border-b border-white/20 bg-white/5 backdrop-blur-xl relative z-20">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                                <Calculator className="w-8 h-8 text-cyan-400" />
                            </div>
                            <div>
                                <motion.h2
                                    layoutId={`title-${id}`}
                                    className="text-2xl font-bold text-white"
                                >
                                    Analiz & Simülasyon
                                </motion.h2>
                                <p className="text-white/60">
                                    Karlılık analizi ve en iyi farming stratejisi
                                </p>
                            </div>
                        </div>

                        {/* Top Controls */}
                        <div className="flex items-center gap-4">
                            {/* Daily Play Hours Input */}
                            <div className="flex items-center gap-2 px-4 py-2 bg-black/40 rounded-xl border border-white/10">
                                <span className="text-sm text-white/60">Günlük Süre (Sa):</span>
                                <input
                                    type="number"
                                    min="1" max="24"
                                    value={dailyPlayHours}
                                    onChange={(e) => setDailyPlayHours(Number(e.target.value))}
                                    className="w-12 bg-transparent text-white font-bold text-center border-b border-white/20 focus:border-cyan-400 focus:outline-none"
                                />
                            </div>

                            {/* Tab Switcher */}
                            <div className="flex p-1 bg-black/40 rounded-xl border border-white/10">
                                <button
                                    onClick={() => setActiveTab("metin")}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "metin"
                                            ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20"
                                            : "text-white/60 hover:text-white hover:bg-white/5"
                                        }`}
                                >
                                    Metin Analizi
                                </button>
                                <button
                                    onClick={() => setActiveTab("boss")}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "boss"
                                            ? "bg-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/20"
                                            : "text-white/60 hover:text-white hover:bg-white/5"
                                        }`}
                                >
                                    Boss Rotasyonu
                                </button>
                            </div>

                            {/* Filter Button (Only for Metin Tab) */}
                            {activeTab === "metin" && (
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
                            )}

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

                    {/* Content */}
                    <div className="flex-1 p-8 overflow-hidden">
                        {activeTab === "metin" ? (
                            <AnalysisDetailView
                                userStats={userStats}
                                metinList={filteredMetinList}
                                prices={prices}
                                multipliers={multipliers}
                                marketItems={marketItems}
                            />
                        ) : (
                            <BossRotationView
                                userStats={userStats}
                                bosses={bosses}
                                prices={prices}
                                marketItems={marketItems}
                                dailyPlayHours={dailyPlayHours}
                            />
                        )}
                    </div>
                </div>
            )}
        </motion.div>
    );
}
