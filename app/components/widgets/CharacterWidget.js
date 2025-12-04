"use client";

import { motion } from "framer-motion";
import { X, EyeOff, Sword, Zap, Clock } from "lucide-react";
import useWidgetStore from "../../store/useWidgetStore";

// Helper: Format compact with safety check
const formatCompact = (number) => {
    if (number === undefined || number === null || isNaN(number)) return "0";
    if (number >= 1000000) {
        return `${(number / 1000000).toFixed(1)}M`;
    } else if (number >= 1000) {
        return `${(number / 1000).toFixed(1)}k`;
    }
    return number.toString();
};

// ============================================================================
// SUMMARY VIEW
// ============================================================================
function CharacterSummaryView({ stats }) {
    return (
        <div className="flex flex-col items-center justify-center h-full w-full overflow-hidden px-4">
            <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/10">
                    <Sword className="w-8 h-8 text-violet-400" />
                </div>
            </div>
            <span className="text-3xl font-bold text-white whitespace-nowrap font-mono">
                {formatCompact(stats.damage)} Hasar
            </span>
            <div className="flex items-center gap-4 mt-2 text-sm text-white/60">
                <span className="flex items-center gap-1">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    <span className="font-mono">{stats.hitsPerSecond || 0}</span> v/sn
                </span>
                <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span className="font-mono">{stats.findTime || 0}</span>s
                </span>
            </div>
        </div>
    );
}

// ============================================================================
// DETAIL VIEW
// ============================================================================
function CharacterDetailView({ widgetId, stats }) {
    const updateWidgetData = useWidgetStore((state) => state.updateWidgetData);

    const handleChange = (field, value) => {
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && numValue >= 0) {
            updateWidgetData(widgetId, { [field]: numValue });
        }
    };

    return (
        <div className="space-y-6 h-full flex flex-col">
            {/* Info Banner */}
            <div className="bg-black/20 backdrop-blur-xl p-4 rounded-xl border border-white/5">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-violet-500/10 backdrop-blur-sm rounded-lg border border-violet-500/20">
                        <Sword className="w-5 h-5 text-violet-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white mb-1">Karakter İstatistikleri</h3>
                        <p className="text-sm text-white/70">
                            Metin kesme hızınızı ve karlılığınızı hesaplamak için gerekli bilgiler.
                            Değerler anlık olarak kaydedilir.
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Inputs */}
            <div className="flex-1 space-y-4">
                {/* Damage */}
                <div className="bg-black/20 backdrop-blur-xl p-5 rounded-2xl border border-white/5 shadow-sm hover:border-violet-500/20 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-violet-500/10 backdrop-blur-sm rounded-lg border border-violet-500/20">
                            <Sword className="w-5 h-5 text-violet-400" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-semibold text-white">
                                Ortalama Hasar (Vuruş Başına)
                            </label>
                            <p className="text-xs text-white/60 mt-0.5">
                                Bir vuruşta verdiğiniz ortalama hasarı girin
                            </p>
                        </div>
                    </div>
                    <input
                        type="number"
                        value={stats.damage || 0}
                        onChange={(e) => handleChange('damage', e.target.value)}
                        className="w-full px-4 py-3 text-lg font-mono font-semibold text-white bg-black/60 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/50 transition-all placeholder:text-white/20"
                        placeholder="3000"
                        min="0"
                        step="100"
                    />
                </div>

                {/* Hits Per Second */}
                <div className="bg-black/20 backdrop-blur-xl p-5 rounded-2xl border border-white/5 shadow-sm hover:border-cyan-500/20 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-cyan-500/10 backdrop-blur-sm rounded-lg border border-cyan-500/20">
                            <Zap className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-semibold text-white">
                                Saniye Başına Vuruş (Saldırı Hızı)
                            </label>
                            <p className="text-xs text-white/60 mt-0.5">
                                Bir saniyede kaç kez vurduğunuzu girin
                            </p>
                        </div>
                    </div>
                    <input
                        type="number"
                        value={stats.hitsPerSecond || 0}
                        onChange={(e) => handleChange('hitsPerSecond', e.target.value)}
                        className="w-full px-4 py-3 text-lg font-mono font-semibold text-white bg-black/60 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all placeholder:text-white/20"
                        placeholder="2.5"
                        min="0"
                        step="0.1"
                    />
                </div>

                {/* Find Time */}
                <div className="bg-black/20 backdrop-blur-xl p-5 rounded-2xl border border-white/5 shadow-sm hover:border-blue-500/20 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-500/10 backdrop-blur-sm rounded-lg border border-blue-500/20">
                            <Clock className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-semibold text-white">
                                Metin Bulma Süresi (Saniye)
                            </label>
                            <p className="text-xs text-white/60 mt-0.5">
                                Bir metinden diğerine geçiş süresi
                            </p>
                        </div>
                    </div>
                    <input
                        type="number"
                        value={stats.findTime || 0}
                        onChange={(e) => handleChange('findTime', e.target.value)}
                        className="w-full px-4 py-3 text-lg font-mono font-semibold text-white bg-black/60 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all placeholder:text-white/20"
                        placeholder="10"
                        min="0"
                        step="1"
                    />
                </div>
            </div>

            {/* Stats Summary */}
            <div className="bg-black/20 backdrop-blur-sm p-4 rounded-xl border border-white/5">
                <h4 className="text-sm font-semibold text-white/80 mb-2">Hesaplanan Değerler</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-black/40 backdrop-blur-sm p-3 rounded-lg border border-white/5">
                        <p className="text-white/60 text-xs">DPS (Saniye Başına)</p>
                        <p className="text-lg font-bold text-violet-400 font-mono">
                            {formatCompact((stats.damage || 0) * (stats.hitsPerSecond || 0))}
                        </p>
                    </div>
                    <div className="bg-black/40 backdrop-blur-sm p-3 rounded-lg border border-white/5">
                        <p className="text-white/60 text-xs">Toplam Döngü Süresi</p>
                        <p className="text-lg font-bold text-blue-400 font-mono">
                            ~{stats.findTime || 0}+ sn
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// MAIN WIDGET
// ============================================================================
export default function CharacterWidget({ id, data, isSelected, onClick, onHide }) {
    // Use widget data or defaults (FALLBACK)
    const stats = data || { damage: 3000, hitsPerSecond: 2.5, findTime: 10 };

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
                <div className="w-full h-full p-6 relative">
                    <Sword className="absolute -bottom-4 -right-4 w-32 h-32 text-white/5 opacity-50 rotate-12 pointer-events-none" />
                    <CharacterSummaryView stats={stats} />
                </div>
            )}

            {/* Detail View */}
            {isSelected && (
                <div className="flex flex-col h-full bg-black/20">
                    <div className="flex items-center justify-between p-8 border-b border-white/10 bg-black/40 backdrop-blur-xl">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-violet-500/10 backdrop-blur-sm rounded-2xl border border-violet-500/20">
                                <Sword className="w-8 h-8 text-violet-400" />
                            </div>
                            <div>
                                <motion.h2 layoutId={`title-${id}`} className="text-2xl font-bold text-white">
                                    Karakterim
                                </motion.h2>
                                <p className="text-white/60">Savaş istatistiklerinizi yönetin</p>
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
                    <div className="flex-1 p-8 overflow-y-auto">
                        <CharacterDetailView widgetId={id} stats={stats} />
                    </div>
                </div>
            )}
        </motion.div>
    );
}
