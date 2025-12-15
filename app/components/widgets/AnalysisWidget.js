"use client";

import { useState, useMemo } from "react";
import { Calculator, Filter, CheckSquare } from "lucide-react";
import useWidgetStore from "../../store/useWidgetStore";
import {
    calculateAllMetins,
    getBestMetin,
    calculateMetinProfit
} from "../../lib/calculator";
import { useSharedWidgetData } from "../../hooks/useSharedWidgetData";
import AnalysisKPIs from "./analysis/AnalysisKPIs";
import AnalysisChart from "./analysis/AnalysisChart";
import AnalysisTable from "./analysis/AnalysisTable";
import BossRotationView from "./analysis/BossRotationView";
import SmartInput from "../ui/SmartInput";

// ============================================================================
// DETAIL VIEW LOGIC (Unchanged but adapted)
// ============================================================================
function AnalysisDetailView({ userStats, metinList, prices, multipliers, marketItems }) {
    const [chartType, setChartType] = useState("comparison");
    const [hourlyCost, setHourlyCost] = useState(0);

    const calculations = useMemo(() => {
        return calculateAllMetins(metinList, prices, multipliers, userStats, marketItems);
    }, [metinList, prices, multipliers, userStats, marketItems]);

    const bestMetin = getBestMetin(calculations);
    const topMetins = calculations.slice(0, 5);

    const comparisonData = useMemo(() => {
        return topMetins.map(calc => ({
            name: calc.metinName,
            profit: calc.hourlyProfit
        }));
    }, [topMetins]);

    const efficiencyData = useMemo(() => {
        if (!bestMetin || !userStats || !userStats.damage) return null;
        const currentDamage = userStats.damage;
        const minDamage = 100;
        const maxDamage = Math.max(currentDamage * 2, 10000);
        const step = Math.max(100, Math.floor(maxDamage / 50));
        const simulations = [];
        const targetMetins = topMetins.map(calc => metinList.find(m => m.id === calc.metinId)).filter(Boolean);

        for (let dmg = minDamage; dmg <= maxDamage; dmg += step) {
            const modifiedStats = { ...userStats, damage: dmg };
            const dataPoint = { damage: dmg };
            targetMetins.forEach(metin => {
                const result = calculateMetinProfit(metin, prices, multipliers, modifiedStats, marketItems);
                dataPoint[metin.name] = result.hourlyProfit - hourlyCost;
            });
            simulations.push(dataPoint);
        }
        return simulations;
    }, [bestMetin, prices, multipliers, userStats, hourlyCost, metinList, topMetins]);

    const softcapWarning = useMemo(() => {
        if (!bestMetin || !userStats) return null;
        if (bestMetin.killTime < userStats.findTime * 0.1) {
            return {
                active: true,
                message: "Metin kesme süreniz, bulma sürenize göre çok düşük. Hasar artışı artık verimsiz."
            };
        }
        return { active: false };
    }, [bestMetin, userStats]);

    if (!bestMetin) {
        return <div className="text-zinc-500">Analiz için veri bekleniyor...</div>;
    }

    const netHourlyProfit = bestMetin.hourlyProfit - hourlyCost;

    return (
        <div className="flex flex-col space-y-6 h-full overflow-y-auto pr-2 custom-scrollbar">
            <AnalysisKPIs
                bestMetin={bestMetin}
                netHourlyProfit={netHourlyProfit}
                hourlyCost={hourlyCost}
                setHourlyCost={setHourlyCost}
            />
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <AnalysisChart
                    chartType={chartType}
                    setChartType={setChartType}
                    comparisonData={comparisonData}
                    efficiencyData={efficiencyData}
                    userStats={userStats}
                    topMetins={topMetins}
                />
            </div>
            <AnalysisTable
                calculations={calculations}
                softcapWarning={softcapWarning}
            />
        </div>
    );
}

// ============================================================================
// MAIN WIDGET VIEW
// ============================================================================
export default function AnalysisWidget() {
    const { userStats, metinList, prices, multipliers, marketItems, bosses } = useSharedWidgetData();

    // Store bağlantısı - ayarları persist etmek için
    const activeWorkspaceId = useWidgetStore((state) => state.activeWorkspaceId);
    const workspace = useWidgetStore((state) =>
        state.workspaces.find(ws => ws.id === state.activeWorkspaceId)
    );
    const updateWidgetData = useWidgetStore((state) => state.updateWidgetData);

    // Store'dan ayarları oku (varsayılan değerlerle)
    const settings = workspace?.data?.analysisSettings || {};
    const dailyPlayHours = settings.dailyPlayHours ?? 4;
    const activeTab = settings.activeTab ?? "metin";
    const hiddenMetinIds = settings.hiddenMetinIds ?? [];
    const showFilter = settings.showFilter ?? false;

    // Ayarları güncelleme fonksiyonu
    const updateSettings = (newSettings) => {
        const currentSettings = workspace?.data?.analysisSettings || {};
        updateWidgetData(activeWorkspaceId, {
            analysisSettings: { ...currentSettings, ...newSettings }
        });
    };

    // Setter fonksiyonları
    const setDailyPlayHours = (value) => updateSettings({ dailyPlayHours: value });
    const setActiveTab = (value) => updateSettings({ activeTab: value });
    const setShowFilter = (value) => updateSettings({ showFilter: value });
    const setHiddenMetinIds = (value) => updateSettings({ hiddenMetinIds: value });

    const filteredMetinList = useMemo(() => {
        return metinList.filter(m => !hiddenMetinIds.includes(m.id));
    }, [metinList, hiddenMetinIds]);

    const toggleMetinVisibility = (metinId) => {
        if (hiddenMetinIds.includes(metinId)) {
            setHiddenMetinIds(hiddenMetinIds.filter(id => id !== metinId));
        } else {
            setHiddenMetinIds([...hiddenMetinIds, metinId]);
        }
    };

    return (
        <div className="w-full h-full flex flex-col p-8 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-900/20 rounded-xl border border-blue-800/50">
                        <Calculator className="w-8 h-8 text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-zinc-100">Getiri Analizi</h1>
                        <p className="text-zinc-500 text-sm">Metin ve Boss karlılık simülasyonu</p>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-zinc-900 px-4 py-2 rounded-lg border border-zinc-800">
                        <span className="text-zinc-500 text-sm">Günlük Süre:</span>
                        <SmartInput
                            min={1}
                            max={24}
                            value={dailyPlayHours}
                            onChange={(val) => setDailyPlayHours(val)}
                            className="w-12 bg-transparent text-white font-bold text-center outline-none border-b border-zinc-700 focus:border-blue-500"
                        />
                    </div>

                    <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800">
                        <button
                            onClick={() => setActiveTab("metin")}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'metin' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-white'}`}
                        >
                            Metin
                        </button>
                        <button
                            onClick={() => setActiveTab("boss")}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'boss' ? 'bg-fuchsia-600 text-white' : 'text-zinc-400 hover:text-white'}`}
                        >
                            Boss
                        </button>
                    </div>

                    {activeTab === 'metin' && (
                        <div className="relative">
                            <button
                                onClick={() => setShowFilter(!showFilter)}
                                className={`p-3 rounded-lg border transition-colors ${showFilter ? 'bg-zinc-800 text-white border-zinc-600' : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'}`}
                            >
                                <Filter size={20} />
                            </button>
                            {/* Filter Dropdown */}
                            {showFilter && (
                                <div className="absolute right-0 top-full mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-4 z-50 max-h-96 overflow-y-auto custom-scrollbar">
                                    <h4 className="text-white font-semibold mb-2">Metin Filtresi</h4>
                                    {metinList.map(metin => (
                                        <label key={metin.id} className="flex items-center gap-2 p-2 hover:bg-zinc-800 rounded cursor-pointer">
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${!hiddenMetinIds.includes(metin.id) ? 'bg-blue-600 border-blue-600' : 'border-zinc-600'}`}>
                                                {!hiddenMetinIds.includes(metin.id) && <CheckSquare size={12} className="text-white" />}
                                            </div>
                                            <span className="text-zinc-300 text-sm">{metin.name}</span>
                                            <input type="checkbox" className="hidden" checked={!hiddenMetinIds.includes(metin.id)} onChange={() => toggleMetinVisibility(metin.id)} />
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden">
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
    );
}
