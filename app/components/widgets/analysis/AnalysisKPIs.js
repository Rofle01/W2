"use client";

import { Award, TrendingUp } from "lucide-react";
import { formatCompactCurrency } from "../../../lib/calculator";
import SmartInput from "@/app/components/ui/SmartInput";

export default function AnalysisKPIs({ bestMetin, netHourlyProfit, hourlyCost, setHourlyCost }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Best Metin Card */}
            <div className="bg-black/40 backdrop-blur-xl p-6 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-colors shadow-sm flex items-center justify-between relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 opacity-10">
                    <Award className="w-32 h-32 text-cyan-400" />
                </div>
                <div>
                    <p className="text-sm text-white/70 mb-1 flex items-center gap-2">
                        <Award className="w-4 h-4 text-cyan-400" />
                        En Karlı Seçim
                    </p>
                    <h3 className="text-3xl font-bold text-white">
                        {bestMetin.metinName}
                    </h3>
                </div>
                <div className="text-right z-10">
                    <p className="text-sm text-white/60">Metin Başı</p>
                    <p className="text-xl font-bold text-cyan-400">
                        {formatCompactCurrency(bestMetin.dropValuePerMetin)}
                    </p>
                </div>
            </div>

            {/* Profit Card */}
            <div className="bg-black/40 backdrop-blur-xl p-6 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-colors shadow-sm flex items-center justify-between relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 opacity-10">
                    <TrendingUp className="w-32 h-32 text-violet-400" />
                </div>
                <div>
                    <p className="text-sm text-white/70 mb-1 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-violet-400" />
                        Tahmini Net Kazanç
                    </p>
                    <h3 className="text-3xl font-bold text-white">
                        {formatCompactCurrency(netHourlyProfit)}
                    </h3>
                    <p className="text-xs text-white/50">Yang / Saat</p>
                </div>
                <div className="z-10 bg-black/20 p-2 rounded-lg border border-white/10">
                    <label className="block text-xs text-white/60 mb-1">Saatlik Masraf</label>
                    <SmartInput
                        min={0}
                        value={hourlyCost}
                        onChange={(val) => setHourlyCost(val)}
                        className="w-24 bg-transparent text-right text-white font-bold focus:outline-none border-b border-white/20 focus:border-violet-400 transition-colors"
                        placeholder="0"
                    />
                </div>
            </div>
        </div>
    );
}
