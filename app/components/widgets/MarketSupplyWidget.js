"use client";

import { useState, useMemo, useEffect } from "react";
import { Package, Users, ChevronDown, Clock, Plus, Trash2, PieChart, Activity, AlertCircle } from "lucide-react";
import { formatCompactCurrency, formatCurrency } from "../../lib/calculator";
import { useSharedWidgetData } from "../../hooks/useSharedWidgetData";
import SmartInput from "../ui/SmartInput";

// ============================================================================
// SUB-COMPONENT: TARGET STRATEGY (Metin Seçimi ve Ağırlıklar)
// ============================================================================
function TargetStrategyPanel({ metinList, targets, setTargets }) {
    const [selectedMetinId, setSelectedMetinId] = useState("");

    // Listeye yeni metin ekle
    const handleAddMetin = () => {
        if (!selectedMetinId) return;

        // Zaten listede var mı?
        if (targets.some(t => t.id === selectedMetinId)) return;

        const metin = metinList.find(m => m.id === selectedMetinId);
        if (metin) {
            // Yeni metini ekle, varsayılan ağırlık ver, sonra normalize edeceğiz
            const newTargets = [...targets, { ...metin, weight: 0 }];
            distributeWeightsEvenly(newTargets);
        }
        setSelectedMetinId("");
    };

    // Listeden metin çıkar
    const handleRemoveMetin = (id) => {
        const newTargets = targets.filter(t => t.id !== id);
        distributeWeightsEvenly(newTargets);
    };

    // Ağırlığı güncelle
    const handleWeightChange = (id, newWeight) => {
        const updated = targets.map(t => t.id === id ? { ...t, weight: newWeight } : t);
        setTargets(updated);
    };

    // Helper: Eşit dağıt (Hızlı başlangıç için)
    const distributeWeightsEvenly = (list) => {
        const count = list.length;
        if (count === 0) {
            setTargets([]);
            return;
        }
        const avg = Math.floor(100 / count);
        const remainder = 100 - (avg * count);

        const distributed = list.map((t, i) => ({
            ...t,
            weight: i === 0 ? avg + remainder : avg // Kalanı ilkine ekle
        }));
        setTargets(distributed);
    };

    const totalWeight = targets.reduce((sum, t) => sum + (t.weight || 0), 0);
    const isWeightValid = totalWeight === 100;

    return (
        <div className="space-y-4 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
            <h3 className="text-zinc-300 font-semibold flex items-center gap-2">
                <PieChart size={18} className="text-violet-400" />
                Hedef Rotasyonu
            </h3>

            {/* Metin Ekleme */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <select
                        value={selectedMetinId}
                        onChange={(e) => setSelectedMetinId(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 px-3 py-2 rounded-lg outline-none focus:border-violet-500 appearance-none text-sm"
                    >
                        <option value="">Metin Seç...</option>
                        {metinList.map(m => (
                            <option key={m.id} value={m.id}>{m.name} (HP: {formatCompactCurrency(m.hp)})</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
                </div>
                <button
                    onClick={handleAddMetin}
                    disabled={!selectedMetinId}
                    className="bg-violet-600 hover:bg-violet-500 text-white p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Plus size={18} />
                </button>
            </div>

            {/* Seçili Liste */}
            <div className="space-y-2 max-h-[250px] overflow-y-auto custom-scrollbar pr-1">
                {targets.map(target => (
                    <div key={target.id} className="flex items-center gap-3 bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                        <div className="flex-1 min-w-0">
                            <div className="text-sm text-zinc-200 truncate" title={target.name}>{target.name}</div>
                            <div className="text-xs text-zinc-600">HP: {formatCompactCurrency(target.hp)}</div>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="w-20 relative">
                                <SmartInput
                                    value={target.weight}
                                    onChange={(val) => handleWeightChange(target.id, val)}
                                    className="w-full bg-zinc-900 border border-zinc-700 text-right text-sm px-2 py-1 rounded text-white focus:border-violet-500 outline-none"
                                    min={0}
                                    max={100}
                                />
                                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-500 text-xs">%</span>
                            </div>
                            <button onClick={() => handleRemoveMetin(target.id)} className="text-zinc-600 hover:text-red-400">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}

                {targets.length === 0 && (
                    <div className="text-center text-zinc-600 text-xs py-4 border border-dashed border-zinc-800 rounded-lg">
                        Henüz metin seçilmedi.
                    </div>
                )}
            </div>

            {/* Validation Error */}
            {!isWeightValid && targets.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-red-400 bg-red-900/10 p-2 rounded border border-red-900/30">
                    <AlertCircle size={14} />
                    <span>Toplam ağırlık %100 olmalı (Şu an: %{totalWeight})</span>
                </div>
            )}
        </div>
    );
}

// ============================================================================
// SUB-COMPONENT: COHORT SETTINGS (Oyuncu Ayarları)
// ============================================================================
function CohortSettingsPanel({ config, updateConfig }) {
    return (
        <div className="space-y-4 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
            <h3 className="text-zinc-300 font-semibold flex items-center gap-2">
                <Users size={18} className="text-blue-400" />
                Ekip ve Performans
            </h3>

            <div className="grid grid-cols-2 gap-4">
                {/* Kişi Sayısı */}
                <div className="col-span-2">
                    <label className="text-xs text-zinc-500 font-medium block mb-1">Oyuncu Sayısı</label>
                    <div className="flex items-center gap-3 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                        <input
                            type="range" min="1" max="100"
                            value={config.playerCount}
                            onChange={(e) => updateConfig('playerCount', Number(e.target.value))}
                            className="flex-1 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500 ml-2"
                        />
                        <SmartInput
                            value={config.playerCount}
                            onChange={(val) => updateConfig('playerCount', val)}
                            className="w-16 bg-zinc-900 text-center text-white text-sm font-bold border-l border-zinc-800 py-1 outline-none"
                        />
                    </div>
                </div>

                {/* Hasar Aralığı */}
                <div className="col-span-2">
                    <label className="text-xs text-zinc-500 font-medium block mb-1">Hasar Aralığı (Ortalama Hesaplanır)</label>
                    <div className="flex items-center gap-2">
                        <SmartInput
                            value={config.minDmg}
                            onChange={(val) => updateConfig('minDmg', val)}
                            className="flex-1 bg-zinc-950 border border-zinc-800 px-3 py-2 rounded text-sm text-zinc-300 focus:border-blue-500 outline-none text-center"
                            placeholder="Min"
                        />
                        <span className="text-zinc-600">-</span>
                        <SmartInput
                            value={config.maxDmg}
                            onChange={(val) => updateConfig('maxDmg', val)}
                            className="flex-1 bg-zinc-950 border border-zinc-800 px-3 py-2 rounded text-sm text-zinc-300 focus:border-blue-500 outline-none text-center"
                            placeholder="Max"
                        />
                    </div>
                    <p className="text-[10px] text-zinc-600 mt-1 text-center">
                        Ort. Hasar: <span className="text-blue-400 font-mono">{formatCompactCurrency((config.minDmg + config.maxDmg) / 2)}</span>
                    </p>
                </div>

                {/* Verim & Süre */}
                <div>
                    <label className="text-xs text-zinc-500 font-medium block mb-1">Verimlilik (%)</label>
                    <div className="relative">
                        <SmartInput
                            value={config.efficiency}
                            onChange={(val) => updateConfig('efficiency', val)}
                            className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 rounded text-sm text-zinc-300 focus:border-amber-500 outline-none"
                            max={100}
                        />
                        <Activity className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-amber-500 pointer-events-none" />
                    </div>
                </div>

                <div>
                    <label className="text-xs text-zinc-500 font-medium block mb-1">Süre (Saat)</label>
                    <div className="relative">
                        <SmartInput
                            value={config.duration}
                            onChange={(val) => updateConfig('duration', val)}
                            className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 rounded text-sm text-zinc-300 focus:border-green-500 outline-none"
                        />
                        <Clock className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-green-500 pointer-events-none" />
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// MAIN WIDGET: MARKET SUPPLY SIMULATOR (REVISED)
// ============================================================================
export default function MarketSupplyWidget() {
    const { metinList, marketItems } = useSharedWidgetData();

    // --- STATE CONFIG ---
    const [config, setConfig] = useState({
        playerCount: 10,
        minDmg: 5000,
        maxDmg: 10000,
        efficiency: 90, // %
        duration: 4, // Saat
    });

    // Seçili Metinler ve Ağırlıkları
    const [targets, setTargets] = useState([]);

    // Config Update Helper
    const updateConfig = (key, val) => setConfig(prev => ({ ...prev, [key]: val }));

    // --- THE CALCULATION ENGINE ---
    const simulationResults = useMemo(() => {
        if (targets.length === 0) return { supplyList: [], stats: null };

        // 1. Calculate Effective Group DPS
        const avgDmg = (config.minDmg + config.maxDmg) / 2;
        const totalRawDps = avgDmg * config.playerCount; // Basit DPS (Saniye Başına Vuruş standart 1 kabul edelim şimdilik veya kullanıcıdan alabiliriz)
        // Not: Hasar formülünde 'HitsPerSecond' genellikle oyuncu bazlıdır. Ortalama 2.5 vuruş/sn varsayalım.
        const HITS_PER_SEC = 2.5;
        const groupTotalDps = totalRawDps * HITS_PER_SEC;

        // 2. Apply Efficiency (Time Loss)
        const efficiencyFactor = config.efficiency / 100;
        const totalSeconds = config.duration * 3600;
        const effectiveSeconds = totalSeconds * efficiencyFactor;

        // 3. Total Damage Pool (Bu sürede bu ekip toplam ne kadar vurabilir?)
        const damagePool = groupTotalDps * effectiveSeconds;

        // 4. Distribute Damage to Targets based on Weight
        const supplyMap = {}; // { itemId: count }
        let totalMetinsKilled = 0;

        targets.forEach(target => {
            const weightFactor = (target.weight || 0) / 100;
            const allocatedDamage = damagePool * weightFactor;

            // Kaç tane kesilir?
            const killCount = Math.floor(allocatedDamage / target.hp);
            totalMetinsKilled += killCount;

            // Dropları Hesapla
            if (target.drops) {
                target.drops.forEach(drop => {
                    const dropChance = drop.chance / 100;
                    const totalDrops = killCount * drop.count * dropChance;

                    supplyMap[drop.itemId] = (supplyMap[drop.itemId] || 0) + totalDrops;
                });
            }
        });

        // 5. Convert Supply Map to List
        const supplyList = Object.entries(supplyMap).map(([itemId, count]) => {
            const item = marketItems.find(i => i.id === itemId || i.originalId === itemId);
            const price = item ? item.price : 0;
            return {
                itemId,
                name: item ? item.name : itemId,
                count: Math.floor(count), // Tam sayıya yuvarla
                totalValue: Math.floor(count) * price
            };
        }).sort((a, b) => b.totalValue - a.totalValue);

        const totalRevenue = supplyList.reduce((acc, curr) => acc + curr.totalValue, 0);

        return {
            supplyList,
            stats: {
                totalMetinsKilled,
                totalRevenue,
                groupDps: groupTotalDps,
                effectiveHours: effectiveSeconds / 3600
            }
        };

    }, [config, targets, marketItems]);

    return (
        <div className="w-full h-full flex flex-col p-6 space-y-6 bg-zinc-950 overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-900/20 rounded-xl border border-indigo-800/50">
                        <Package className="w-8 h-8 text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-100">Arz Simülatörü</h1>
                        <p className="text-zinc-500 text-sm">Gelişmiş senaryo ve ekip planlaması</p>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">

                {/* LEFT: CONTROLS (4 Columns) */}
                <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2">
                    <CohortSettingsPanel config={config} updateConfig={updateConfig} />
                    <TargetStrategyPanel metinList={metinList} targets={targets} setTargets={setTargets} />

                    {/* Mini Stats Summary */}
                    {simulationResults.stats && (
                        <div className="bg-indigo-900/10 border border-indigo-900/30 p-4 rounded-xl">
                            <h4 className="text-indigo-300 font-semibold mb-2 text-sm">Simülasyon Özeti</h4>
                            <div className="grid grid-cols-2 gap-y-2 text-xs text-zinc-400">
                                <span>Toplam Kesim:</span>
                                <span className="text-white font-mono text-right">{formatCompactCurrency(simulationResults.stats.totalMetinsKilled)}</span>

                                <span>Efektif Süre:</span>
                                <span className="text-white font-mono text-right">{simulationResults.stats.effectiveHours.toFixed(1)} sa.</span>

                                <span>Toplam Ciro:</span>
                                <span className="text-green-400 font-bold font-mono text-right">{formatCompactCurrency(simulationResults.stats.totalRevenue)}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT: RESULTS TABLE (8 Columns) */}
                <div className="lg:col-span-8 bg-zinc-900/30 rounded-xl border border-zinc-800 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-zinc-800 bg-zinc-900/80 flex justify-between items-center sticky top-0">
                        <h4 className="font-semibold text-zinc-200 flex items-center gap-2">
                            <Package size={18} /> Tahmini Arz Listesi
                        </h4>
                        <span className="text-xs text-zinc-500">
                            {simulationResults.supplyList.length} Kalem
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {simulationResults.supplyList.length > 0 ? (
                            <table className="w-full text-left text-sm">
                                <thead className="bg-zinc-950 text-zinc-500 text-xs uppercase font-medium sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        <th className="p-3 font-semibold">Eşya Adı</th>
                                        <th className="p-3 text-right font-semibold">Miktar</th>
                                        <th className="p-3 text-right font-semibold">Piyasa Değeri</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800/50">
                                    {simulationResults.supplyList.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-zinc-800/30 transition-colors group">
                                            <td className="p-3 text-zinc-300 font-medium">{item.name}</td>
                                            <td className="p-3 text-right text-zinc-400 font-mono group-hover:text-white transition-colors">
                                                {formatCompactCurrency(item.count)}
                                            </td>
                                            <td className="p-3 text-right text-indigo-400 font-mono font-bold">
                                                {formatCompactCurrency(item.totalValue)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-zinc-600 gap-2">
                                <PieChart size={48} className="opacity-20" />
                                <p>Sonuçları görmek için sol taraftan metin ekleyin.</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}