"use client";

import {
    BarChart3,
    Hammer,
    CheckCircle2,
    XCircle,
    Coins,
    AlertTriangle
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from "recharts";

// ============================================================================
// CONSTANTS
// ============================================================================

const MATERIALS = {
    blessing_scroll: { name: 'Kutsama Kağıdı', color: 'text-yellow-400' },
    magic_stone: { name: 'Büyülü Metal', color: 'text-blue-400' },
    ritual_stone: { name: 'Ritüel Taşı', color: 'text-purple-400' },
    blacksmith_book: { name: 'Demirci El Kitabı', color: 'text-orange-400' }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const formatCurrency = (value) => {
    if (value === undefined || value === null || isNaN(value)) return "0";
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(2)}B`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return Math.round(value).toLocaleString("tr-TR");
};

// ============================================================================
// SUB-COMPONENT: ResultCard
// ============================================================================

function ResultCard({ title, value, subtitle, icon: Icon, color = "zinc" }) {
    const colorClasses = {
        zinc: "from-zinc-800/50 to-zinc-900/50 border-zinc-700/50",
        green: "from-green-500/20 to-green-500/5 border-green-500/30",
        red: "from-red-500/20 to-red-500/5 border-red-500/30",
        yellow: "from-yellow-500/20 to-yellow-500/5 border-yellow-500/30",
        violet: "from-violet-500/20 to-violet-500/5 border-violet-500/30"
    };

    const iconColors = {
        zinc: "text-zinc-400",
        green: "text-green-400",
        red: "text-red-400",
        yellow: "text-yellow-400",
        violet: "text-violet-400"
    };

    return (
        <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl border p-4`}>
            <div className="flex items-center gap-2 mb-2">
                {Icon && <Icon className={`w-4 h-4 ${iconColors[color]}`} />}
                <span className="text-xs font-medium text-zinc-400">{title}</span>
            </div>
            <p className="text-xl font-bold text-white font-mono">{value}</p>
            {subtitle && <p className="text-xs text-zinc-500 mt-1">{subtitle}</p>}
        </div>
    );
}

// ============================================================================
// MAIN COMPONENT: ResultsPanel
// ============================================================================

export default function ResultsPanel({ result, targetLevel }) {
    return (
        <div className="space-y-4">
            <h3 className="text-sm font-semibold text-zinc-400 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Sonuçlar
            </h3>

            {result ? (
                <div className="space-y-3">
                    {/* Success Rate */}
                    <ResultCard
                        title="Başarı Oranı"
                        value={`%${result.successRate}`}
                        subtitle={`${result.simCount} deneme`}
                        icon={result.successRate >= 50 ? CheckCircle2 : XCircle}
                        color={result.successRate >= 50 ? "green" : "red"}
                    />

                    {/* Average Cost (Total: Material + Yang) */}
                    <ResultCard
                        title="Toplam Maliyet"
                        value={`${formatCurrency(result.avgCost)} Yang`}
                        subtitle={`${result.avgAttempts} deneme`}
                        icon={Coins}
                        color="yellow"
                    />

                    {/* Cost Breakdown */}
                    {(result.avgMaterialCost > 0 || result.avgYangCost > 0) && (
                        <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800">
                            <h4 className="text-xs font-semibold text-zinc-400 mb-2">Maliyet Dağılımı</h4>
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span className="text-blue-400">Materyal</span>
                                    <span className="text-white font-mono">{formatCurrency(result.avgMaterialCost)}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-yellow-400">Yükseltme Ücreti</span>
                                    <span className="text-white font-mono">{formatCurrency(result.avgYangCost)}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Material Usage */}
                    <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800">
                        <h4 className="text-xs font-semibold text-zinc-400 mb-2">Materyal Kullanımı</h4>
                        <div className="space-y-1">
                            {Object.entries(result.avgMaterials || {}).filter(([_, v]) => v > 0).map(([mat, avg]) => (
                                <div key={mat} className="flex justify-between text-xs">
                                    <span className={MATERIALS[mat]?.color || 'text-zinc-400'}>
                                        {MATERIALS[mat]?.name || mat}
                                    </span>
                                    <span className="text-white font-mono">{avg}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Stock Analysis */}
                    {result.stockAnalysis && (
                        <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800">
                            <h4 className="text-xs font-semibold text-zinc-400 mb-2">Envanter Durumu</h4>
                            <div className="space-y-1">
                                {Object.entries(result.stockAnalysis)
                                    .filter(([_, data]) => data.required > 0)
                                    .map(([mat, data]) => (
                                        <div key={mat} className="flex items-center justify-between text-xs">
                                            <span className={data.sufficient ? 'text-green-400' : 'text-red-400'}>
                                                {MATERIALS[mat]?.name || mat}
                                            </span>
                                            <span className="font-mono">
                                                {data.available}/{data.required.toFixed(1)}
                                                {data.deficit > 0 && (
                                                    <span className="text-red-400 ml-1">(-{data.deficit})</span>
                                                )}
                                            </span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}

                    {/* Warnings */}
                    {result.stockOutSummary?.length > 0 && (
                        <div className="bg-yellow-900/20 p-3 rounded-xl border border-yellow-500/30">
                            <h4 className="text-xs font-semibold text-yellow-400 mb-2 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                Uyarılar
                            </h4>
                            <div className="space-y-1 text-xs text-yellow-300/80">
                                {result.stockOutSummary.slice(0, 3).map((warning, i) => (
                                    <p key={i}>
                                        +{warning.level}'de {warning.materialName} %{warning.frequency} simülasyonda bitti
                                    </p>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Level Distribution Chart */}
                    {result.levelDistribution && (
                        <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800">
                            <h4 className="text-xs font-semibold text-zinc-400 mb-2">Bitiş Seviyesi Dağılımı</h4>
                            <div className="h-32">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={result.levelDistribution}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                        <XAxis
                                            dataKey="level"
                                            tick={{ fill: '#888', fontSize: 10 }}
                                            tickFormatter={(v) => `+${v}`}
                                        />
                                        <YAxis
                                            tick={{ fill: '#888', fontSize: 10 }}
                                            tickFormatter={(v) => `${v}%`}
                                        />
                                        <Tooltip
                                            contentStyle={{ background: '#18181b', border: '1px solid #333' }}
                                            labelFormatter={(v) => `+${v}`}
                                            formatter={(v) => [`${v}%`, 'Oran']}
                                        />
                                        <Bar dataKey="percentage">
                                            {result.levelDistribution.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={entry.level >= targetLevel ? '#22c55e' : '#f97316'}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                /* Empty State */
                <div className="flex flex-col items-center justify-center h-48 text-zinc-600 bg-zinc-900/30 rounded-xl border border-zinc-800">
                    <Hammer className="w-10 h-10 mb-2 opacity-20" />
                    <p className="text-sm">Sonuçlar burada görünecek</p>
                </div>
            )}
        </div>
    );
}

// Export helper and sub-components
export { ResultCard, formatCurrency };
