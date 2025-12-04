"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { X, EyeOff, Package, User, Users, ChevronDown, Clock } from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import {
    calculateItemYields,
    generatePlayerDistribution,
    calculateAllMetins,
    getBestMetin,
    formatCompactCurrency,
    formatCurrency
} from "../../lib/calculator";
import { useSharedWidgetData } from "../../hooks/useSharedWidgetData";

// ============================================================================
// HELPER: FIND SIBLING WIDGETS (CONTEXT-AWARE)
// ============================================================================
// ============================================================================
// HELPER: FIND SIBLING WIDGETS (CONTEXT-AWARE)
// ============================================================================
// useSiblingWidgetData replaced by useSharedWidgetData hook

// ============================================================================
// TAB 1: PERSONAL ACCUMULATION
// ============================================================================
function PersonalAccumulationTab({ userStats, metinList, marketItems }) {
    const [selectedMetinId, setSelectedMetinId] = useState(metinList[0]?.id || "");
    const [duration, setDuration] = useState(1);

    // Auto-select first metin if none selected
    useEffect(() => {
        if (!selectedMetinId && metinList?.length > 0) {
            setSelectedMetinId(metinList[0].id);
        }
    }, [metinList, selectedMetinId]);

    const selectedMetin = useMemo(() =>
        metinList.find(m => m.id === selectedMetinId),
        [metinList, selectedMetinId]);

    const results = useMemo(() => {
        if (!selectedMetin || !userStats) return null;
        const safeDuration = duration || 1;
        return calculateItemYields(selectedMetin, userStats, safeDuration);
    }, [selectedMetin, userStats, duration]);

    const getItemName = (originalId) => {
        const item = marketItems.find(i => i.originalId === originalId);
        return item ? item.name : originalId;
    };

    return (
        <div className="space-y-6 h-full flex flex-col">
            {/* Input Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                    <label className="block text-xs text-white/60 mb-2 font-medium">Hangi Metin?</label>
                    <div className="relative">
                        <select
                            value={selectedMetinId}
                            onChange={(e) => setSelectedMetinId(e.target.value)}
                            className="w-full appearance-none bg-black/60 border border-white/10 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/50 font-medium transition-all"
                        >
                            {metinList.map(m => (
                                <option key={m.id} value={m.id} className="bg-zinc-900">{m.name}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
                    </div>
                </div>

                <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                    <label className="block text-xs text-white/60 mb-2 font-medium">Süre (Saat)</label>
                    <div className="relative">
                        <input
                            type="number"
                            value={duration}
                            onChange={(e) => {
                                const val = e.target.value;
                                setDuration(val === "" ? "" : Number(val));
                            }}
                            className="w-full bg-black/60 border border-white/10 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/50 font-mono font-medium transition-all"
                            min="1"
                        />
                        <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Results Section */}
            {results ? (
                <div className="flex-1 bg-black/20 backdrop-blur-sm rounded-2xl border border-white/5 overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-white/5 bg-black/40 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-violet-500/10 rounded-lg border border-violet-500/20">
                                <Package className="w-5 h-5 text-violet-400" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white">Tahmini Getiri</h4>
                                <p className="text-xs text-white/50">
                                    {duration} saatte <span className="text-violet-400 font-bold font-mono">{Math.floor(results.metinsCount)}</span> adet {selectedMetin?.name}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2">
                        <div className="space-y-1">
                            {results.yields.map((yieldData, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-lg transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-white/70 border border-white/10">
                                            {getItemName(yieldData.itemId).charAt(0)}
                                        </div>
                                        <span className="text-white/90 font-medium">{getItemName(yieldData.itemId)}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-white font-mono">
                                            {formatCompactCurrency(yieldData.count)}
                                        </div>
                                        <div className="text-xs text-white/40 font-mono">
                                            %{yieldData.chance} şans
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-white/40 border-2 border-dashed border-white/10 rounded-2xl bg-black/20 p-8">
                    <Package className="w-16 h-16 mb-4 opacity-50" />
                    <p className="text-lg font-medium text-white/60">Bir Metin Seçin</p>
                    <p className="text-sm">Simülasyon sonuçlarını görmek için yukarıdan seçim yapın.</p>
                </div>
            )}
        </div>
    );
}

// ============================================================================
// TAB 2: MARKET ACCUMULATION
// ============================================================================
function MarketAccumulationTab({ userStats, metinList, craftingItems, marketItems, prices, multipliers }) {
    // Simulation Settings
    const [playerCount, setPlayerCount] = useState(1000);
    const [distributionType, setDistributionType] = useState("normal");
    const [timeStrategy, setTimeStrategy] = useState("constant");
    const [minDamage, setMinDamage] = useState(1000);
    const [maxDamage, setMaxDamage] = useState(30000);
    const [simulationHours, setSimulationHours] = useState(24);

    // Hybrid slider helper functions
    const sliderToPlayerCount = (val) => {
        if (val <= 100) return val;
        return 100 + (val - 100) * 100;
    };

    const playerCountToSlider = (count) => {
        if (count <= 100) return count;
        return 100 + Math.floor((count - 100) / 100);
    };

    // Run Simulation
    const simulationResults = useMemo(() => {
        const segments = generatePlayerDistribution(minDamage, maxDamage, playerCount, distributionType, timeStrategy);
        const totalSupply = {};
        const metinCounts = {};

        segments.forEach(segment => {
            const tempStats = { ...userStats, damage: segment.avgDamage };
            const calculations = calculateAllMetins(metinList, prices, multipliers, tempStats);
            const bestMetinCalc = getBestMetin(calculations);

            if (bestMetinCalc) {
                const bestMetin = metinList.find(m => m.id === bestMetinCalc.metinId);
                if (bestMetin) {
                    const effectiveHours = segment.totalHours * (simulationHours / 24);
                    const yields = calculateItemYields(bestMetin, tempStats, effectiveHours);

                    metinCounts[bestMetin.name] = (metinCounts[bestMetin.name] || 0) + yields.metinsCount;

                    yields.yields.forEach(y => {
                        totalSupply[y.itemId] = (totalSupply[y.itemId] || 0) + y.count;
                    });
                }
            }
        });

        const supplyList = Object.entries(totalSupply)
            .map(([itemId, count]) => {
                const item = marketItems.find(i => i.originalId === itemId);
                return {
                    itemId,
                    name: item ? item.name : itemId,
                    count,
                    value: count * (item?.price || 0)
                };
            })
            .sort((a, b) => b.value - a.value);

        return { segments, supplyList, metinCounts };
    }, [minDamage, maxDamage, playerCount, distributionType, timeStrategy, simulationHours, userStats, metinList, prices, multipliers, marketItems]);

    return (
        <div className="h-full flex flex-col space-y-4 overflow-hidden">
            {/* Settings Panel */}
            <div className="bg-black/20 p-4 rounded-xl border border-white/5 grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                    <label className="block text-xs text-white/60 mb-1">Oyuncu Sayısı</label>
                    <input
                        type="range" min="0" max="149" step="1"
                        value={playerCountToSlider(playerCount)}
                        onChange={(e) => setPlayerCount(sliderToPlayerCount(Number(e.target.value)))}
                        className="w-full accent-cyan-500"
                    />
                    <div className="text-right text-xs text-white font-mono">{playerCount}</div>
                </div>
                <div>
                    <label className="block text-xs text-white/60 mb-1">Ortalama Oyuncu Süresi (Saat)</label>
                    <input
                        type="range" min="1" max="24" step="1"
                        value={simulationHours}
                        onChange={(e) => setSimulationHours(Number(e.target.value))}
                        className="w-full accent-cyan-500"
                    />
                    <div className="text-right text-xs text-white font-mono">{simulationHours}h</div>
                </div>
                <div>
                    <label className="block text-xs text-white/60 mb-1">Dağılım</label>
                    <select
                        value={distributionType}
                        onChange={(e) => setDistributionType(e.target.value)}
                        className="w-full bg-black/60 border border-white/10 text-white text-xs px-2 py-1 rounded focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                    >
                        <option value="normal">Normal (Çan Eğrisi)</option>
                        <option value="uniform">Eşit Dağılım</option>
                        <option value="left-skewed">Düşük Hasar Yoğun</option>
                        <option value="right-skewed">Yüksek Hasar Yoğun</option>
                    </select>
                </div>
                <div className="relative group/tooltip">
                    <label className="block text-xs text-white/60 mb-1">Oynama Süresi Stratejisi</label>
                    <select
                        value={timeStrategy}
                        onChange={(e) => setTimeStrategy(e.target.value)}
                        className="w-full bg-black/60 border border-white/10 text-white text-xs px-2 py-1 rounded focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                    >
                        <option value="constant">Herkes Eşit Süre</option>
                        <option value="linear">Güçlüler Daha Fazla (Lineer)</option>
                        <option value="linear-inverse">Zayıflar Daha Fazla (Lineer Ters)</option>
                        <option value="exponential">Elitler Çok Daha Fazla (Üstel)</option>
                        <option value="exponential-inverse">Yeniler Çok Daha Fazla (Üstel Ters)</option>
                    </select>
                    <div className="mt-1 text-[10px] text-cyan-400/80 leading-tight">
                        {timeStrategy === "constant" && "Herkes ortalama süre kadar oynar."}
                        {timeStrategy === "linear" && "Düşük hasarlılar ortalamanın yarısı, yüksek hasarlılar 1.5 katı kadar oynar."}
                        {timeStrategy === "linear-inverse" && "Düşük hasarlılar ortalamanın 1.5 katı, yüksek hasarlılar yarısı kadar oynar."}
                        {timeStrategy === "exponential" && "Hasar arttıkça oynama süresi karesel olarak artar (Elit odaklı)."}
                        {timeStrategy === "exponential-inverse" && "Hasar azaldıkça oynama süresi karesel olarak artar (Başlangıç odaklı)."}
                    </div>
                </div>
                <div>
                    <label className="block text-xs text-white/60 mb-1">Hasar Aralığı</label>
                    <div className="flex gap-2">
                        <input
                            type="number" value={minDamage}
                            onChange={(e) => setMinDamage(Number(e.target.value))}
                            className="w-full bg-black/60 border border-white/10 text-white text-xs px-1 py-1 rounded text-center font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                        />
                        <span className="text-white/40">-</span>
                        <input
                            type="number" value={maxDamage}
                            onChange={(e) => setMaxDamage(Number(e.target.value))}
                            className="w-full bg-black/60 border border-white/10 text-white text-xs px-1 py-1 rounded text-center font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                        />
                    </div>
                </div>
            </div>

            {/* Charts & Tables Split */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-hidden">
                {/* Left: Player Distribution Chart */}
                <div className="bg-black/20 rounded-xl border border-white/5 p-4 flex flex-col">
                    <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-400" />
                        Oyuncu Dağılımı
                    </h4>
                    <div className="flex-1 min-h-[150px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={simulationResults.segments}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                <XAxis dataKey="avgDamage" hide />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#000000', border: '1px solid #333', borderRadius: '8px' }}
                                    formatter={(value, name) => [value, name === 'playerCount' ? 'Oyuncu' : name]}
                                    labelFormatter={(label) => `Ort. Hasar: ${formatCompactCurrency(label)}`}
                                />
                                <Bar dataKey="playerCount" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right: Supply Table */}
                <div className="bg-black/20 rounded-xl border border-white/5 p-4 flex flex-col overflow-hidden">
                    <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                        <Package className="w-4 h-4 text-cyan-400" />
                        Sunucuya Giren Malzeme ({simulationHours} Saat)
                    </h4>
                    <div className="flex-1 overflow-y-auto pr-2">
                        <table className="w-full">
                            <thead className="sticky top-0 bg-black/80 z-10 backdrop-blur-sm">
                                <tr>
                                    <th className="text-left text-xs text-white/50 pb-2">Eşya</th>
                                    <th className="text-right text-xs text-white/50 pb-2">Adet</th>
                                    <th className="text-right text-xs text-white/50 pb-2">Değer</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {simulationResults.supplyList.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-cyan-500/10 transition-colors">
                                        <td className="py-2 text-sm text-white font-medium">{item.name}</td>
                                        <td className="py-2 text-sm text-white/70 text-right font-mono">{formatCompactCurrency(item.count)}</td>
                                        <td className="py-2 text-sm text-cyan-400 text-right font-mono">{formatCompactCurrency(item.value)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// MAIN WIDGET
// ============================================================================
export default function MarketSupplyWidget({ id, data, isSelected, onClick, onHide }) {
    const { userStats, metinList, marketItems, craftingItems, prices, multipliers } = useSharedWidgetData();
    const [activeTab, setActiveTab] = useState("personal");

    return (
        <motion.div
            layoutId={`card-${id}`}
            layout
            onClick={!isSelected ? onClick : undefined}
            className={`group rounded-3xl shadow-2xl cursor-pointer overflow-hidden backdrop-blur-xl border border-white/10 ${isSelected
                ? "fixed inset-0 m-auto w-[90%] h-[90%] max-w-6xl z-[100] bg-black/80"
                : "relative h-64 hover:-translate-y-1 hover:border-violet-400/50 transition-all duration-300 bg-black/20 hover:bg-black/40"
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
                className="absolute top-4 right-4 z-20 p-2 bg-white/10 backdrop-blur-sm shadow-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-white/60 hover:text-violet-400 hover:bg-violet-500/20 border border-white/20"
            >
                <EyeOff className="w-4 h-4" />
            </motion.button>

            {/* Summary View */}
            {!isSelected && (
                <div className="w-full h-full p-6 relative flex flex-col items-center justify-center">
                    <Package className="absolute -bottom-4 -right-4 w-32 h-32 text-white/5 opacity-50 rotate-12 pointer-events-none" />
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/10">
                            <Package className="w-8 h-8 text-violet-400" />
                        </div>
                    </div>
                    <span className="text-2xl font-bold text-white whitespace-nowrap">
                        Arz Simülasyonu
                    </span>
                    <span className="text-sm text-white/60 mt-2 text-center">
                        Kişisel ve Piyasa Birikimi
                    </span>
                </div>
            )}

            {/* Detail View */}
            {isSelected && (
                <div className="flex flex-col h-full bg-black/20">
                    {/* Header */}
                    <div className="flex items-center justify-between p-8 border-b border-white/10 bg-black/40 backdrop-blur-xl">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-violet-500/10 backdrop-blur-sm rounded-2xl border border-violet-500/20">
                                <Package className="w-8 h-8 text-violet-400" />
                            </div>
                            <div>
                                <motion.h2 layoutId={`title-${id}`} className="text-2xl font-bold text-white">
                                    Arz Simülasyonu
                                </motion.h2>
                                <p className="text-white/60">Eşya birikimi ve piyasa arz analizi</p>
                            </div>
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

                    {/* Tabs */}
                    <div className="flex border-b border-white/10 px-8 bg-black/40">
                        <button
                            onClick={() => setActiveTab("personal")}
                            className={`px-6 py-4 text-sm font-medium transition-colors relative ${activeTab === "personal" ? "text-white" : "text-white/50 hover:text-white/80"
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Kişisel Birikim
                            </div>
                            {activeTab === "personal" && (
                                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500" />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab("market")}
                            className={`px-6 py-4 text-sm font-medium transition-colors relative ${activeTab === "market" ? "text-white" : "text-white/50 hover:text-white/80"
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                Piyasa Arzı
                            </div>
                            {activeTab === "market" && (
                                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500" />
                            )}
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-8 overflow-hidden bg-black/20">
                        {activeTab === "personal" ? (
                            <PersonalAccumulationTab
                                userStats={userStats}
                                metinList={metinList}
                                marketItems={marketItems}
                            />
                        ) : (
                            <MarketAccumulationTab
                                userStats={userStats}
                                metinList={metinList}
                                craftingItems={craftingItems}
                                marketItems={marketItems}
                                prices={prices}
                                multipliers={multipliers}
                            />
                        )}
                    </div>
                </div>
            )}
        </motion.div>
    );
}
