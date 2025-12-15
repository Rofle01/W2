"use client";

import useWidgetStore from "../store/useWidgetStore";
import { motion } from "framer-motion";
import { Sword, Zap, Clock } from "lucide-react";

// Import existing widgets to act as specific views
import MarketWidget from "./widgets/MarketWidget";
import AnalysisWidget from "./widgets/AnalysisWidget";
import CraftingWidget from "./widgets/CraftingWidget";
import MarketSupplyWidget from "./widgets/MarketSupplyWidget";
import BossSettingsWidget from "./widgets/BossSettingsWidget";
import MetinSettingsWidget from "./widgets/MetinSettingsWidget";
import CraftingSimulatorHub from "./widgets/CraftingSimulatorHub";
import SmartInput from "./ui/SmartInput";

// Helper: Format compact with safety check
const formatCompact = (number) => {
    if (number === undefined || number === null || isNaN(number)) return "0";
    if (number >= 1000000) return `${(number / 1000000).toFixed(1)}M`;
    if (number >= 1000) return `${(number / 1000).toFixed(1)}k`;
    return number.toString();
};

// Components for Views
const OverviewView = () => (
    <div className="p-8">
        <h1 className="text-2xl font-bold text-zinc-100 mb-6">Genel Durum</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
                <h3 className="text-zinc-500 text-sm font-medium mb-2">Toplam Pazar Hacmi</h3>
                <p className="text-3xl font-bold text-white">450 Won</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
                <h3 className="text-zinc-500 text-sm font-medium mb-2">Günlük Ciro</h3>
                <p className="text-3xl font-bold text-green-400">+12 Won</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
                <h3 className="text-zinc-500 text-sm font-medium mb-2">Aktif Analizler</h3>
                <p className="text-3xl font-bold text-blue-400">4</p>
            </div>
        </div>
    </div>
);

// Character Stats Editor (Inline for Settings)
function CharacterStatsEditor() {
    const updateComponentData = useWidgetStore((state) => state.updateComponentData);
    const activeWorkspaceId = useWidgetStore((state) => state.activeWorkspaceId);
    const workspace = useWidgetStore((state) =>
        state.workspaces.find(ws => ws.id === state.activeWorkspaceId)
    );

    const stats = workspace?.data?.characterStats || { damage: 3000, hitsPerSecond: 2.5, findTime: 10 };

    const handleChange = (field, value) => {
        updateComponentData(activeWorkspaceId, 'characterStats', { ...stats, [field]: value });
    };

    return (
        <div className="space-y-4">
            {/* Damage */}
            <div className="bg-zinc-900/50 p-5 rounded-xl border border-zinc-800 hover:border-violet-500/30 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-violet-500/10 rounded-lg border border-violet-500/20">
                        <Sword className="w-5 h-5 text-violet-400" />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-semibold text-white">
                            Ortalama Hasar (Vuruş Başına)
                        </label>
                        <p className="text-xs text-zinc-500 mt-0.5">
                            Bir vuruşta verdiğiniz ortalama hasarı girin
                        </p>
                    </div>
                </div>
                <SmartInput
                    value={stats.damage || 0}
                    onChange={(val) => handleChange('damage', val)}
                    className="w-full px-4 py-3 text-lg font-mono font-semibold text-white bg-zinc-950 border border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/50 transition-all"
                    placeholder="3000"
                    min={0}
                    step={100}
                />
            </div>

            {/* Hits Per Second */}
            <div className="bg-zinc-900/50 p-5 rounded-xl border border-zinc-800 hover:border-cyan-500/30 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                        <Zap className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-semibold text-white">
                            Saniye Başına Vuruş (Saldırı Hızı)
                        </label>
                        <p className="text-xs text-zinc-500 mt-0.5">
                            Bir saniyede kaç kez vurduğunuzu girin
                        </p>
                    </div>
                </div>
                <SmartInput
                    value={stats.hitsPerSecond || 0}
                    onChange={(val) => handleChange('hitsPerSecond', val)}
                    className="w-full px-4 py-3 text-lg font-mono font-semibold text-white bg-zinc-950 border border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 transition-all"
                    placeholder="2.5"
                    min={0}
                    step={0.1}
                />
            </div>

            {/* Find Time */}
            <div className="bg-zinc-900/50 p-5 rounded-xl border border-zinc-800 hover:border-blue-500/30 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <Clock className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-semibold text-white">
                            Metin Bulma Süresi (Saniye)
                        </label>
                        <p className="text-xs text-zinc-500 mt-0.5">
                            Bir metinden diğerine geçiş süresi
                        </p>
                    </div>
                </div>
                <SmartInput
                    value={stats.findTime || 0}
                    onChange={(val) => handleChange('findTime', val)}
                    className="w-full px-4 py-3 text-lg font-mono font-semibold text-white bg-zinc-950 border border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all"
                    placeholder="10"
                    min={0}
                    step={1}
                />
            </div>

            {/* Stats Summary */}
            <div className="bg-zinc-900/30 p-4 rounded-xl border border-zinc-800">
                <h4 className="text-sm font-semibold text-zinc-400 mb-3">Hesaplanan Değerler</h4>
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                        <p className="text-zinc-500 text-xs">DPS (Saniye Başına)</p>
                        <p className="text-xl font-bold text-violet-400 font-mono">
                            {formatCompact((stats.damage || 0) * (stats.hitsPerSecond || 0))}
                        </p>
                    </div>
                    <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                        <p className="text-zinc-500 text-xs">Toplam Döngü Süresi</p>
                        <p className="text-xl font-bold text-blue-400 font-mono">
                            ~{stats.findTime || 0}+ sn
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

const SettingsView = () => (
    <div className="p-8 max-w-4xl">
        <h1 className="text-2xl font-bold text-zinc-100 mb-6">Sistem Ayarları</h1>
        <div className="space-y-8">
            <section>
                <div className="flex items-center gap-3 mb-4 border-b border-zinc-800 pb-2">
                    <div className="p-2 bg-violet-500/10 rounded-lg border border-violet-500/20">
                        <Sword className="w-5 h-5 text-violet-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Karakter Yapılandırması</h3>
                </div>
                <CharacterStatsEditor />
            </section>
        </div>
    </div>
);

export default function DashboardContent() {
    const activeTab = useWidgetStore((state) => state.activeTab);

    const renderContent = () => {
        switch (activeTab) {
            case "overview": return <OverviewView />;
            case "market": return <MarketWidget />; // Needs clean up
            case "analysis": return <AnalysisWidget />;
            case "boss": return <BossSettingsWidget />;
            case "supply": return <MarketSupplyWidget />;
            case "crafting": return <CraftingWidget />;
            case "simulator": return <CraftingSimulatorHub />;
            case "metin-settings": return (
                <div className="h-full overflow-y-auto p-6">
                    <MetinSettingsWidget />
                </div>
            );
            case "settings": return <SettingsView />;
            default: return <OverviewView />;
        }
    };

    return (
        <main className="flex-1 h-full overflow-y-auto bg-zinc-950 relative custom-scrollbar">
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="h-full"
            >
                {renderContent()}
            </motion.div>
        </main>
    );
}
