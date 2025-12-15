"use client";

import {
    Gem,
    Layers,
    Trash2,
    TrendingUp
} from "lucide-react";
import {
    ELEMENTS,
    CLASS_LEVELS,
    CLARITY_LEVELS,
    formatNumber,
    formatCurrency
} from "./constants";

// ============================================================================
// ELEMENT RESULT CARD SUB-COMPONENT
// ============================================================================

function ElementResultCard({ element, summary, config }) {
    const elementInfo = ELEMENTS[element];
    if (!elementInfo) return null;

    const targetClassInfo = CLASS_LEVELS[config.targetClass];
    const targetTotal = summary?.targetClassTotal?.[element] || 0;
    const clarityBreakdown = summary?.targetClassByClarity?.[element] || {};
    const leftovers = summary?.leftoversByClass?.[element] || {};

    // Skip if no stones at all
    if (targetTotal < 0.001 && Object.keys(leftovers).length === 0) return null;

    return (
        <div className={`p-4 rounded-xl border ${elementInfo.borderColor} ${elementInfo.bgColor}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Gem className={`w-5 h-5 ${elementInfo.textColor}`} />
                    <h4 className={`font-semibold ${elementInfo.textColor}`}>
                        {targetClassInfo?.name} {elementInfo.name}
                    </h4>
                </div>
                <span className="text-lg font-bold text-white font-mono">
                    {formatNumber(targetTotal)}
                </span>
            </div>

            {/* Clarity Breakdown (only if upgradeClarity is enabled) */}
            {config.upgradeClarity && Object.keys(clarityBreakdown).length > 0 && (
                <div className="space-y-1 mb-3 pl-2 border-l-2 border-white/10">
                    {Object.entries(clarityBreakdown).map(([clarity, count]) => (
                        <div key={clarity} className="flex justify-between items-center text-xs">
                            <span className="text-zinc-400">{CLARITY_LEVELS[clarity]?.name}</span>
                            <span className="text-white font-mono">{formatNumber(count)}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Leftovers */}
            {Object.keys(leftovers).length > 0 && (
                <div className="pt-2 border-t border-white/10">
                    <div className="flex items-center gap-1 text-xs text-zinc-500 mb-1">
                        <Trash2 className="w-3 h-3" />
                        <span>Artıklar</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(leftovers).map(([classLevel, count]) => (
                            <span key={classLevel} className="text-xs text-zinc-500">
                                {formatNumber(count)} {CLASS_LEVELS[classLevel]?.shortName}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ============================================================================
// MAIN RESULTS PANEL
// ============================================================================

export default function AlchemyResults({ result, mode, inputConfig }) {
    return (
        <div>
            <h3 className="text-sm font-semibold text-zinc-400 flex items-center gap-2 mb-4">
                <Layers className="w-4 h-4" />
                Hazine (Sonuçlar)
            </h3>

            {result ? (
                <div className="space-y-4">
                    {mode === 'target' && result.targetCost ? (
                        // TARGET MODE RESULTS
                        <div className="bg-gradient-to-br from-violet-900/30 to-fuchsia-900/30 p-4 rounded-xl border border-violet-500/30">
                            <div className="flex items-center gap-3 mb-6">
                                <div className={`p-3 rounded-lg ${ELEMENTS[result.targetCost.targetConfig.baseElement]?.bgColor || 'bg-zinc-800'}`}>
                                    <Gem className={`w-8 h-8 ${ELEMENTS[result.targetCost.targetConfig.baseElement]?.textColor || 'text-zinc-400'}`} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">
                                        {CLASS_LEVELS[result.targetCost.targetConfig.targetGrade]?.name} {CLARITY_LEVELS[result.targetCost.targetConfig.targetClarity]?.name} {ELEMENTS[result.targetCost.targetConfig.baseElement]?.name}
                                    </h3>
                                    <p className="text-sm text-zinc-400">Hedeflenen Kimya Taşı</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-700">
                                    <p className="text-xs text-zinc-500 mb-1">Gereken Ortalama Cor</p>
                                    <p className="text-2xl font-bold text-purple-400 font-mono">
                                        {formatNumber(result.targetCost.avgCors)}
                                    </p>
                                    <div className="flex gap-3 mt-2 text-xs text-zinc-500 font-mono">
                                        <span className="text-green-500/70">Min: {formatNumber(result.targetCost.minCors)}</span>
                                        <span className="text-red-500/70">Max: {formatNumber(result.targetCost.maxCors)}</span>
                                    </div>
                                </div>

                                <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-700">
                                    <p className="text-xs text-zinc-500 mb-1">Tahmini Maliyet</p>
                                    <p className="text-2xl font-bold text-yellow-500 font-mono">
                                        {formatCurrency(result.targetCost.avgCors * (result.corPrice || 0))}
                                    </p>
                                    <p className="text-xs text-zinc-600 mt-1">Yang</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // INVENTORY MODE RESULTS
                        <>
                            {/* Summary Card */}
                            <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 p-4 rounded-xl border border-purple-500/30">
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <div>
                                        <p className="text-xs text-purple-300">Simülasyon Özeti</p>
                                        <p className="text-lg font-bold text-white">
                                            {inputConfig?.mode === 'cor' ? (
                                                `${result.corCount?.toLocaleString()} Cor`
                                            ) : (
                                                `${result.corCount?.toLocaleString()}x ${CLASS_LEVELS[inputConfig?.itemClass]?.name} ${CLARITY_LEVELS[inputConfig?.itemClarity]?.name}`
                                            )}
                                            {' '} → {CLASS_LEVELS[result.config?.targetClass]?.name || 'Mitsi'}
                                        </p>
                                    </div>
                                    <div className="flex gap-4 text-right">
                                        <div>
                                            <p className="text-xs text-zinc-400">Deneme</p>
                                            <p className="text-sm font-mono text-purple-300">{result.simCount}x</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-zinc-400">Saflık</p>
                                            <p className="text-sm font-mono text-purple-300">
                                                {result.config?.upgradeClarity ? 'Açık' : 'Kapalı'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-zinc-400">Süre</p>
                                            <p className="text-sm font-mono text-purple-300">{result.duration}ms</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Element Result Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {result.config?.activeElements?.map(element => (
                                    <ElementResultCard
                                        key={element}
                                        element={element}
                                        summary={result.summary}
                                        config={result.config}
                                    />
                                ))}
                            </div>

                            {/* Financial Analysis */}
                            {result.financials && result.financials.totalCost > 0 && (
                                <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                                    <h4 className="text-sm font-semibold text-zinc-400 mb-3 flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-yellow-500" />
                                        Maliyet Analizi
                                    </h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        <div className="bg-zinc-800/50 p-3 rounded-lg">
                                            <p className="text-xs text-zinc-500">Toplam Harcanan</p>
                                            <p className="text-lg font-bold text-yellow-400 font-mono">
                                                {formatCurrency(result.financials.totalCost)}
                                            </p>
                                            <p className="text-xs text-zinc-600">Yang</p>
                                        </div>
                                        <div className="bg-zinc-800/50 p-3 rounded-lg">
                                            <p className="text-xs text-zinc-500">{CLASS_LEVELS[result.config?.targetClass]?.name} Başına</p>
                                            <p className="text-lg font-bold text-purple-400 font-mono">
                                                {formatCurrency(result.financials.costPerTargetStone)}
                                            </p>
                                            <p className="text-xs text-zinc-600">Yang / Adet</p>
                                        </div>
                                        {result.config?.upgradeClarity && result.financials.costPerFlawless > 0 && (
                                            <div className="bg-zinc-800/50 p-3 rounded-lg">
                                                <p className="text-xs text-zinc-500">Kusursuz Başına</p>
                                                <p className="text-lg font-bold text-pink-400 font-mono">
                                                    {formatCurrency(result.financials.costPerFlawless)}
                                                </p>
                                                <p className="text-xs text-zinc-600">Yang / Adet</p>
                                            </div>
                                        )}
                                        <div className="bg-zinc-800/50 p-3 rounded-lg">
                                            <p className="text-xs text-zinc-500">Toplam Hedef Taş</p>
                                            <p className="text-lg font-bold text-white font-mono">
                                                {formatNumber(result.financials.totalTargetStones)}
                                            </p>
                                            <p className="text-xs text-zinc-600">Adet (Ortalama)</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            ) : (
                /* Empty State */
                <div className="flex flex-col items-center justify-center h-64 text-zinc-600 bg-zinc-900/30 rounded-xl border border-zinc-800">
                    <Gem className="w-12 h-12 mb-3 opacity-20" />
                    <p className="text-sm">Simülasyon sonuçları burada görünecek</p>
                    <p className="text-xs text-zinc-700 mt-1">
                        Parametreleri ayarlayın ve "Başlat" butonuna tıklayın
                    </p>
                </div>
            )}
        </div>
    );
}

// Export sub-component for external use if needed
export { ElementResultCard };
