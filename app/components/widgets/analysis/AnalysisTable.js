"use client";

import { AlertCircle, Target } from "lucide-react";
import { formatTime, formatCompactCurrency } from "../../../lib/calculator";

export default function AnalysisTable({ calculations, softcapWarning }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Softcap Status */}
            <div className="lg:col-span-1">
                {softcapWarning?.active ? (
                    <div className="bg-red-500/10 backdrop-blur-xl p-6 rounded-2xl border border-red-500/30 h-full">
                        <div className="flex items-center gap-3 mb-3">
                            <AlertCircle className="w-6 h-6 text-red-400" />
                            <h4 className="font-bold text-white">Softcap Uyarısı</h4>
                        </div>
                        <p className="text-sm text-white/80 leading-relaxed">
                            {softcapWarning.message}
                        </p>
                        <div className="mt-4 p-3 bg-black/20 rounded-lg border border-red-500/20">
                            <p className="text-xs text-red-300">
                                Öneri: Hasar artırmak yerine metin bulma sürenizi (hareket hızı) iyileştirmeye odaklanın.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-cyan-500/10 backdrop-blur-xl p-6 rounded-2xl border border-cyan-500/30 h-full flex flex-col justify-center items-center text-center">
                        <div className="p-3 bg-cyan-500/20 rounded-full mb-3">
                            <Target className="w-6 h-6 text-cyan-400" />
                        </div>
                        <h4 className="font-bold text-white mb-1">Verimlilik İyi</h4>
                        <p className="text-sm text-white/70">
                            Mevcut hasarınızla henüz softcap sınırına ulaşmadınız. Hasar artışı kârınızı artırmaya devam edecektir.
                        </p>
                    </div>
                )}
            </div>

            {/* Detailed Table */}
            <div className="lg:col-span-2 bg-black/40 backdrop-blur-xl p-6 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-colors shadow-sm overflow-hidden flex flex-col">
                <h3 className="text-lg font-semibold text-white mb-4">Detaylı Sıralama</h3>
                <div className="overflow-auto max-h-[300px] -mr-2 pr-2">
                    <table className="w-full">
                        <thead className="bg-black/60 sticky top-0 backdrop-blur-md z-10">
                            <tr>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-white/60">Sıra</th>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-white/60">Metin</th>
                                <th className="px-3 py-2 text-right text-xs font-semibold text-white/60">Kesim Süresi</th>
                                <th className="px-3 py-2 text-right text-xs font-semibold text-white/60">Adet/Saat</th>
                                <th className="px-3 py-2 text-right text-xs font-semibold text-white/60">Kazanç</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {calculations.map((calc, index) => (
                                <tr
                                    key={calc.metinId}
                                    className={`hover:bg-cyan-500/5 transition-colors ${index === 0 ? "bg-cyan-500/10" : ""}`}
                                >
                                    <td className="px-3 py-3 text-sm text-white/50">#{index + 1}</td>
                                    <td className="px-3 py-3">
                                        <span className={`text-sm font-medium ${index === 0 ? "text-cyan-400" : "text-white"}`}>
                                            {calc.metinName}
                                        </span>
                                    </td>
                                    <td className="px-3 py-3 text-sm text-white/70 text-right font-mono">
                                        {formatTime(calc.killTime)}
                                    </td>
                                    <td className="px-3 py-3 text-sm text-violet-300 text-right font-mono">
                                        {calc.metinsPerHour.toFixed(1)}
                                    </td>
                                    <td className="px-3 py-3 text-right">
                                        <span className={`text-sm font-bold font-mono ${index === 0 ? "text-cyan-400" : "text-white/90"}`}>
                                            {formatCompactCurrency(calc.hourlyProfit)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
