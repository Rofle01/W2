"use client";

import { useMemo } from "react";
import { Award, TrendingUp, PlusCircle } from "lucide-react";
import { BarChart, Bar, ResponsiveContainer } from "recharts";
import { formatCompactCurrency } from "../../../lib/calculator";

export default function AnalysisSummaryView({ bestMetin }) {
    // Prepare mini chart data (top 5)
    const miniChartData = useMemo(() => {
        if (!bestMetin) return [];
        // Since we only have bestMetin, create a simple single-bar chart
        return [{
            name: bestMetin.metinName.substring(0, 6),
            profit: bestMetin.hourlyProfit,
        }];
    }, [bestMetin]);

    // BOŞ DURUM YÖNETİMİ
    if (!bestMetin) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-white/40 text-center px-6">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10 border-dashed">
                    <PlusCircle className="w-8 h-8 opacity-50" />
                </div>
                <h3 className="text-lg font-semibold text-white/80 mb-2">Veri Bekleniyor</h3>
                <p className="text-sm">
                    Analiz yapmak için önce <strong>Metin Ayarları</strong>'ndan bir metin ekleyin.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center h-full w-full overflow-hidden px-4 relative">
            {/* Mini Background Chart */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={miniChartData}>
                        <Bar dataKey="profit" fill="#06b6d4" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Best Metin Badge */}
            <div className="flex items-center gap-2 mb-3 relative z-10">
                <Award className="w-6 h-6 text-cyan-400" />
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wide drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
                    En Karlı Metin
                </span>
            </div>

            {/* Metin Name */}
            <h3 className="text-2xl font-bold text-white mb-4 text-center relative z-10 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                {bestMetin.metinName}
            </h3>

            {/* Split Stats */}
            <div className="grid grid-cols-2 gap-6 w-full max-w-xs relative z-10">
                <div className="flex flex-col items-center border-r border-white/10 pr-4">
                    <span className="text-xs text-white/60 mb-1">Metin Başı</span>
                    <span className="text-xl font-bold text-white font-mono">
                        {formatCompactCurrency(bestMetin.dropValuePerMetin)}
                    </span>
                    <span className="text-xs text-white/50">Yang</span>
                </div>
                <div className="flex flex-col items-center pl-4">
                    <span className="text-xs text-white/60 mb-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-violet-400" />
                        Saatte
                    </span>
                    <span className="text-xl font-bold text-white font-mono">
                        {bestMetin.metinsPerHour.toFixed(1)}
                    </span>
                    <span className="text-xs text-white/50">Adet</span>
                </div>
            </div>
        </div>
    );
}
