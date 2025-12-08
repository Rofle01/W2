import React from "react";
import { Trash2, Download, FolderOpen, Plus } from "lucide-react";
import { formatCurrency } from "../../../lib/calculator";

export default function MarketStatCard({
    totalValue,
    activeProfile,
    filteredCount,
    totalCount,
    activeServerId,
    serverProfiles,
    onSwitchServer,
    onShowProfileModal,
    onShowResetModal,
    onShowDataModal
}) {
    return (
        <div className="bg-white/5 backdrop-blur-xl p-4 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <p className="text-sm text-white/70">Toplam Piyasa Değeri ({activeProfile?.name})</p>
                    <p className="text-2xl font-bold text-cyan-400">
                        {formatCurrency(totalValue)} {activeProfile?.currency}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={onShowResetModal}
                        className="p-2 bg-red-600/20 backdrop-blur-sm text-red-400 rounded-lg hover:bg-red-600/40 transition-colors border border-red-500/30"
                        title="Verileri Sıfırla"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                    <button
                        onClick={onShowDataModal}
                        className="p-2 bg-violet-600/20 backdrop-blur-sm text-violet-400 rounded-lg hover:bg-violet-600/40 transition-colors border border-violet-500/30"
                        title="Veri İşlemleri"
                    >
                        <Download className="w-5 h-5" />
                    </button>
                    <div className="text-right">
                        <p className="text-sm text-white/70">Gösterilen</p>
                        <p className="text-2xl font-bold text-white">
                            {filteredCount} / {totalCount}
                        </p>
                    </div>
                </div>
            </div>

            {/* Server Selection */}
            <div className="flex items-center gap-2 pt-3 border-t border-white/10">
                <FolderOpen className="w-4 h-4 text-white/60" />
                <select
                    value={activeServerId}
                    onChange={(e) => onSwitchServer(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm font-medium text-white bg-black/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50"
                >
                    {serverProfiles.map(profile => (
                        <option key={profile.id} value={profile.id} className="bg-zinc-900">
                            {profile.name}
                        </option>
                    ))}
                </select>
                <button
                    onClick={onShowProfileModal}
                    className="px-4 py-2 bg-cyan-600/20 backdrop-blur-sm text-cyan-400 rounded-lg hover:bg-cyan-600/40 transition-colors text-sm font-medium border border-cyan-500/30 flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Yeni Sunucu
                </button>
            </div>
        </div>
    );
}
