"use client";

import { useMemo } from "react";
import {
    Calculator,
    TrendingUp,
    History,
    RotateCcw,
    Trash2,
    Sparkles,
    Target,
    BarChart3
} from "lucide-react";
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart
} from "recharts";
import { formatCurrency, formatDate } from "./constants";

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function ResultCard({ title, value, subtitle, icon: Icon, color = "violet" }) {
    const colorClasses = {
        violet: "from-violet-500/20 to-violet-500/5 border-violet-500/30 text-violet-400",
        green: "from-green-500/20 to-green-500/5 border-green-500/30 text-green-400",
        red: "from-red-500/20 to-red-500/5 border-red-500/30 text-red-400",
        blue: "from-blue-500/20 to-blue-500/5 border-blue-500/30 text-blue-400"
    };

    return (
        <div className={`
            bg-gradient-to-br ${colorClasses[color]} 
            rounded-xl border p-4
        `}>
            <div className="flex items-center gap-2 mb-2">
                {Icon && <Icon className="w-4 h-4" />}
                <span className="text-xs font-medium text-zinc-400">{title}</span>
            </div>
            <p className="text-2xl font-bold text-white font-mono">{value}</p>
            {subtitle && (
                <p className="text-xs text-zinc-500 mt-1">{subtitle}</p>
            )}
        </div>
    );
}

function HistoryItem({ item, onRestore, onDelete }) {
    return (
        <div className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-colors group">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-semibold text-white">
                        {formatCurrency(item.result.avgCost || item.result.avgGrade)}
                    </span>
                    <span className="text-xs text-zinc-500">{item.config.mode === 'budget' ? '% Emiş' : 'Yang'}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-zinc-500">{formatDate(item.date)}</span>
                    <span className="text-xs text-zinc-600">•</span>
                    <span className="text-xs text-zinc-500">%{item.config.targetGrade}</span>
                </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => onRestore(item)}
                    className="p-1.5 rounded-md bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 transition-colors"
                    title="Geri Yükle"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                    onClick={() => onDelete(item.id)}
                    className="p-1.5 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                    title="Sil"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}

// ============================================================================
// MAIN RESULTS PANEL
// ============================================================================

export default function SashResults({
    result,
    history,
    showHistory,
    onRestore,
    onDeleteHistory,
    onClearHistory
}) {
    // Calculate chart data from history
    const chartData = useMemo(() => {
        return history.map((item, index) => ({
            name: `#${index + 1}`,
            cost: item.result.avgCost,
            min: item.result.minCost,
            max: item.result.maxCost
        })).slice(-20); // Last 20 records
    }, [history]);

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-semibold text-zinc-400 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Sonuçlar
            </h3>

            {/* Result Cards */}
            {result ? (
                <>
                    {/* TARGET MODE RESULTS */}
                    {result.mode !== 'budget' && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <ResultCard
                                title="Ortalama Maliyet"
                                value={formatCurrency(result.avgCost)}
                                subtitle="Yang"
                                icon={TrendingUp}
                                color="violet"
                            />
                            <ResultCard
                                title="Minimum"
                                value={formatCurrency(result.minCost)}
                                subtitle="En iyi senaryo"
                                icon={TrendingUp}
                                color="green"
                            />
                            <ResultCard
                                title="Maksimum"
                                value={formatCurrency(result.maxCost)}
                                subtitle="En kötü senaryo"
                                icon={TrendingUp}
                                color="red"
                            />
                            <ResultCard
                                title="Ort. Kumaş"
                                value={result.totalClothUsed?.toLocaleString() || "0"}
                                subtitle="Adet kullanım"
                                icon={Sparkles}
                                color="blue"
                            />
                        </div>
                    )}

                    {/* BUDGET MODE RESULTS */}
                    {result.mode === 'budget' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                <ResultCard
                                    title="Ortalama Emiş"
                                    value={`%${result.avgGrade}`}
                                    subtitle="Beklenen sonuç"
                                    icon={Target}
                                    color="violet"
                                />
                                <ResultCard
                                    title="Maksimum Emiş"
                                    value={`%${result.maxGrade}`}
                                    subtitle="En iyi senaryo"
                                    icon={TrendingUp}
                                    color="green"
                                />
                                <ResultCard
                                    title="Minimum Emiş"
                                    value={`%${result.minGrade}`}
                                    subtitle="En kötü senaryo"
                                    icon={TrendingUp}
                                    color="red"
                                />
                            </div>

                            {/* Grade Distribution */}
                            {result.gradeDistribution && Object.keys(result.gradeDistribution).length > 0 && (
                                <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                                    <h4 className="text-sm font-semibold text-zinc-400 mb-3">Emiş Dağılımı</h4>
                                    <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                                        {Object.entries(result.gradeDistribution)
                                            .sort((a, b) => parseInt(b[0]) - parseInt(a[0]))
                                            .filter(([, data]) => parseFloat(data.percentage) > 0)
                                            .map(([grade, data]) => (
                                                <div key={grade} className="text-center p-2 bg-zinc-800/50 rounded-lg">
                                                    <div className="text-lg font-bold text-white">%{grade}</div>
                                                    <div className="text-xs text-zinc-500">{data.percentage}%</div>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </>
            ) : (
                /* Empty State */
                <div className="bg-zinc-900/30 rounded-xl border border-zinc-800 p-8 text-center">
                    <Calculator className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                    <p className="text-zinc-500">
                        Simülasyonu başlatmak için parametreleri ayarlayın ve
                        <br />
                        <span className="text-violet-400">"Simülasyonu Başlat"</span> butonuna tıklayın.
                    </p>
                </div>
            )}

            {/* Chart + History Section */}
            {showHistory && history.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
                    {/* Chart */}
                    <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4">
                        <h4 className="text-sm font-semibold text-zinc-400 mb-4">
                            Maliyet Trendi
                        </h4>
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fill: '#71717a', fontSize: 10 }}
                                        axisLine={{ stroke: '#3f3f46' }}
                                    />
                                    <YAxis
                                        tick={{ fill: '#71717a', fontSize: 10 }}
                                        axisLine={{ stroke: '#3f3f46' }}
                                        tickFormatter={formatCurrency}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#18181b',
                                            border: '1px solid #3f3f46',
                                            borderRadius: '8px',
                                            fontSize: '12px'
                                        }}
                                        formatter={(value) => [formatCurrency(value) + " Yang", "Maliyet"]}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="cost"
                                        stroke="#8b5cf6"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorCost)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* History List */}
                    <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4 flex flex-col">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-zinc-400">
                                Geçmiş ({history.length})
                            </h4>
                            {history.length > 0 && (
                                <button
                                    onClick={onClearHistory}
                                    className="text-xs text-red-400 hover:text-red-300 transition-colors"
                                >
                                    Tümünü Sil
                                </button>
                            )}
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-2 max-h-48 custom-scrollbar">
                            {history.slice(0, 10).map(item => (
                                <HistoryItem
                                    key={item.id}
                                    item={item}
                                    onRestore={onRestore}
                                    onDelete={onDeleteHistory}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Empty History State */}
            {showHistory && history.length === 0 && (
                <div className="bg-zinc-900/30 rounded-xl border border-zinc-800 p-6 text-center mt-4">
                    <History className="w-10 h-10 text-zinc-700 mx-auto mb-2" />
                    <p className="text-sm text-zinc-500">
                        Henüz simülasyon geçmişi yok.
                    </p>
                </div>
            )}
        </div>
    );
}

// Export sub-components for external use if needed
export { ResultCard, HistoryItem };
