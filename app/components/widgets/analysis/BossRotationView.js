"use client";

import { useMemo } from "react";
import { formatCurrency, formatTime, calculateAllBosses, formatCompactCurrency } from "../../../lib/calculator";
import { Clock, TrendingUp, AlertTriangle, CheckCircle, Shield, Briefcase } from "lucide-react";

// Helper for classes
const clsx = (...classes) => classes.filter(Boolean).join(" ");

export default function BossRotationView({ userStats, bosses, prices, marketItems, dailyPlayHours }) {

    // 1. Calculate Metrics
    // FIX: Destructure result to get both array and total duration
    const { results: calculations, totalDurationMinutes } = useMemo(() => {
        return calculateAllBosses(bosses, userStats, dailyPlayHours, marketItems);
    }, [bosses, userStats, dailyPlayHours, marketItems]);

    // 2. Summary Metrics
    // FIX: Use totalDurationMinutes from simulation for accurate total time (includes cooling/idle)
    const totalTimeRequired = totalDurationMinutes / 60;
    const totalPotentialProfit = calculations.reduce((acc, curr) => acc + curr.dailyProfit, 0);
    const isOverCapacity = totalTimeRequired > dailyPlayHours;

    // Formatting Logic (X Sa. Y Dk.)
    const totalHours = Math.floor(totalDurationMinutes / 60);
    const totalMinutes = Math.floor(totalDurationMinutes % 60);
    const formattedDuration = `${totalHours} Sa. ${totalMinutes} Dk.`;

    if (bosses.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-white/50 space-y-4">
                <Shield className="w-16 h-16 opacity-20" />
                <p>Henüz Boss / Zindan eklenmemiş.</p>
                <p className="text-xs">"Boss Ayarları" widget'ından ekleme yapabilirsiniz.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header / Summary Card */}
            <div className={clsx(
                "p-4 rounded-2xl border flex items-center justify-between",
                isOverCapacity
                    ? "bg-red-500/10 border-red-500/20"
                    : "bg-green-500/10 border-green-500/20"
            )}>
                <div className="flex items-center gap-4">
                    <div className={clsx(
                        "p-3 rounded-xl",
                        isOverCapacity ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"
                    )}>
                        {isOverCapacity ? <AlertTriangle className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">
                            {isOverCapacity ? "Zaman Yetersiz!" : "Rotasyon Uygun"}
                        </h3>
                        <p className="text-sm text-white/60">
                            {isOverCapacity
                                ? `Tüm zindanları bitirmek ${formattedDuration} sürüyor. (${(totalTimeRequired - dailyPlayHours).toFixed(1)} sa. eksik)`
                                : `Top. Süre: ${formattedDuration} / ${dailyPlayHours} Saat`}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xs text-white/50">Tahmini Günlük Kazanç</div>
                    <div className="text-2xl font-bold text-cyan-400 text-shadow-neon">
                        {formatCompactCurrency(totalPotentialProfit)}
                    </div>
                </div>
            </div>

            {/* Boss Table */}
            <div className="bg-black/20 rounded-2xl border border-white/5 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-xs text-white/40 uppercase font-medium">
                        <tr>
                            <th className="p-4">Boss Adı</th>
                            <th className="p-4 text-center">Tur Süresi</th>
                            <th className="p-4 text-center">Limit</th>
                            <th className="p-4 text-center">Gerçek Kesim</th>
                            <th className="p-4 text-right">Günlük Kazanç</th>
                            <th className="p-4 text-center">Gereken Süre</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {calculations.map((calc, idx) => (
                            <tr key={calc.bossId} className="hover:bg-white/5 transition-colors">
                                <td className="p-4">
                                    <div className="font-medium text-white/90">{calc.bossName}</div>
                                    <div className="text-xs text-white/40 mt-0.5">
                                        Drop Değeri: {formatCompactCurrency(calc.profitPerCycle)}
                                    </div>
                                </td>
                                <td className="p-4 text-center text-sm text-white/70">
                                    {calc.cycleTimeMinutes.toFixed(0)} dk
                                </td>
                                <td className="p-4 text-center">
                                    {calc.dailyLimit > 0 ? (
                                        <span className="px-2 py-0.5 rounded bg-white/10 text-xs">{calc.dailyLimit}</span>
                                    ) : (
                                        <span className="text-xl text-white/20">∞</span>
                                    )}
                                </td>
                                <td className="p-4 text-center text-cyan-300 font-medium">
                                    {calc.realDailyKills}
                                </td>
                                <td className="p-4 text-right font-bold text-green-400">
                                    {formatCompactCurrency(calc.dailyProfit)}
                                </td>
                                <td className="p-4 text-center text-sm text-white/60">
                                    {calc.timeRequiredHours.toFixed(1)} sa.
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="text-xs text-white/30 text-center italic">
                * Tur süresine Metin Bulma / Zindan Giriş-Çıkış süreleri dahil edilmiştir.
            </div>
        </div>
    );
}
