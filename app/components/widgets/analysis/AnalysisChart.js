"use client";

import { BarChart3, ChevronDown } from "lucide-react";
import {
    BarChart, Bar, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, Cell, ReferenceLine
} from "recharts";
import { formatCurrency, formatCompactCurrency } from "../../../lib/calculator";

// Chart Colors
const CHART_COLORS = ['#06b6d4', '#8b5cf6', '#d946ef', '#f43f5e', '#eab308'];

export default function AnalysisChart({ chartType, setChartType, comparisonData, efficiencyData, userStats, topMetins }) {
    return (
        <div className="bg-black/40 backdrop-blur-xl p-6 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-colors shadow-sm min-h-[350px] flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-white/70" />
                    Analiz Grafiği
                </h3>

                {/* Chart Type Selector */}
                <div className="relative">
                    <select
                        value={chartType}
                        onChange={(e) => setChartType(e.target.value)}
                        className="appearance-none bg-black/50 border border-white/10 text-white px-4 py-2 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 cursor-pointer font-medium"
                    >
                        <option value="comparison">Metin Karşılaştırması</option>
                        <option value="efficiency">Hasar Verimliliği (Top 5)</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
                </div>
            </div>

            <div className="flex-1 w-full h-full min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    {chartType === "comparison" ? (
                        <BarChart data={comparisonData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 12, fill: '#ffffff80' }}
                                axisLine={false}
                                tickLine={false}
                                interval={0}
                                height={50}
                                angle={-15}
                                textAnchor="end"
                            />
                            <YAxis
                                tick={{ fontSize: 12, fill: '#ffffff80' }}
                                tickFormatter={(value) => formatCompactCurrency(value)}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                cursor={{ fill: '#ffffff05' }}
                                formatter={(value) => [`${formatCurrency(value)} Yang`, 'Saatlik Kazanç']}
                                contentStyle={{
                                    backgroundColor: '#000000',
                                    border: '1px solid rgba(6, 182, 212, 0.3)',
                                    borderRadius: '8px',
                                    color: '#fff'
                                }}
                            />
                            <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
                                {comparisonData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.isBest ? "#06b6d4" : "#4b5563"}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    ) : (
                        <LineChart data={efficiencyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" />
                            <XAxis
                                dataKey="damage"
                                tick={{ fontSize: 12, fill: '#ffffff80' }}
                                tickFormatter={(value) => formatCompactCurrency(value)}
                                label={{ value: 'Hasar', position: 'insideBottom', offset: -5, fill: '#ffffff60', fontSize: 12 }}
                            />
                            <YAxis
                                tick={{ fontSize: 12, fill: '#ffffff80' }}
                                tickFormatter={(value) => formatCompactCurrency(value)}
                            />
                            <Tooltip
                                formatter={(value, name) => [`${formatCurrency(value)} Yang`, name]}
                                labelFormatter={(label) => `Hasar: ${formatCurrency(label)}`}
                                contentStyle={{
                                    backgroundColor: '#000000',
                                    border: '1px solid rgba(6, 182, 212, 0.3)',
                                    borderRadius: '8px',
                                    color: '#fff'
                                }}
                                itemSorter={(item) => -item.value} // Sort by profit descending
                            />
                            <Legend wrapperStyle={{ paddingTop: '10px' }} />
                            <ReferenceLine
                                x={userStats.damage}
                                stroke="#ffffff"
                                strokeDasharray="3 3"
                                label={{ value: 'Siz', position: 'top', fill: '#ffffff', fontSize: 12 }}
                            />
                            {topMetins.map((metin, index) => (
                                <Line
                                    key={metin.metinId}
                                    type="monotone"
                                    dataKey={metin.metinName}
                                    stroke={CHART_COLORS[index % CHART_COLORS.length]}
                                    strokeWidth={index === 0 ? 3 : 2}
                                    dot={false}
                                    activeDot={{ r: 6 }}
                                />
                            ))}
                        </LineChart>
                    )}
                </ResponsiveContainer>
            </div>
        </div>
    );
}
