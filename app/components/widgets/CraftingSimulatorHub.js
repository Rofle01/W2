"use client";

import { useState } from "react";
import { Sparkles, FlaskConical, Hammer, Lock, Gem } from "lucide-react";
import SashCraftingPanel from "./simulators/SashCraftingPanel";
import AlchemyPanel from "./simulators/AlchemyPanel";
import BlacksmithPanel from "./simulators/BlacksmithPanel";

// ============================================================================
// SIMULATOR TABS
// ============================================================================

const SIMULATOR_TABS = [
    {
        id: "sash",
        label: "Kuşak Sistemi",
        icon: Sparkles,
        active: true,
        description: "Kuşak birleştirme maliyet simülasyonu"
    },
    {
        id: "alchemy",
        label: "Ejderha Simyası",
        icon: Gem,
        active: true,
        description: "Dragon Soul Alchemy simülasyonu"
    },
    {
        id: "blacksmith",
        label: "Demirci",
        icon: Hammer,
        active: true,
        description: "Yükseltme stratejisi simülasyonu"
    }
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CraftingSimulatorHub() {
    const [activeSimulator, setActiveSimulator] = useState("sash");

    return (
        <div className="flex h-full">
            {/* Sidebar - Tab Menu */}
            <aside className="w-56 bg-zinc-900/50 border-r border-zinc-800 flex flex-col shrink-0">
                {/* Header */}
                <div className="p-4 border-b border-zinc-800/50">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-violet-500/10 rounded-lg border border-violet-500/20">
                            <FlaskConical className="w-5 h-5 text-violet-400" />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-white">
                                Simülatörler
                            </h2>
                            <p className="text-xs text-zinc-500">Monte Carlo</p>
                        </div>
                    </div>
                </div>

                {/* Tab List */}
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                    {SIMULATOR_TABS.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeSimulator === tab.id;
                        const isDisabled = !tab.active;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => !isDisabled && setActiveSimulator(tab.id)}
                                disabled={isDisabled}
                                className={`
                                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200
                                    ${isActive
                                        ? "bg-violet-500/20 border border-violet-500/30 text-white"
                                        : isDisabled
                                            ? "text-zinc-600 cursor-not-allowed"
                                            : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 border border-transparent"
                                    }
                                `}
                            >
                                <div className={`
                                    p-1.5 rounded-md
                                    ${isActive
                                        ? "bg-violet-500/20"
                                        : isDisabled
                                            ? "bg-zinc-800/50"
                                            : "bg-zinc-800"
                                    }
                                `}>
                                    {isDisabled ? (
                                        <Lock className="w-4 h-4 text-zinc-600" />
                                    ) : (
                                        <Icon className={`w-4 h-4 ${isActive ? "text-violet-400" : "text-zinc-500"}`} />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium truncate ${isDisabled ? "text-zinc-600" : ""}`}>
                                        {tab.label}
                                    </p>
                                    <p className={`text-xs truncate ${isActive ? "text-violet-400/70" : "text-zinc-600"}`}>
                                        {tab.description}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </nav>

                {/* Footer Info */}
                <div className="p-3 border-t border-zinc-800/50">
                    <div className="bg-zinc-800/30 rounded-lg p-3 border border-zinc-700/50">
                        <p className="text-xs text-zinc-500 leading-relaxed">
                            💡 Monte Carlo simülasyonu, binlerce deneme yaparak
                            ortalama maliyeti hesaplar.
                        </p>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-hidden bg-zinc-950">
                {activeSimulator === "sash" && <SashCraftingPanel />}
                {activeSimulator === "alchemy" && <AlchemyPanel />}
                {activeSimulator === "blacksmith" && <BlacksmithPanel />}

                {/* Placeholder for disabled simulators */}
                {!['sash', 'alchemy', 'blacksmith'].includes(activeSimulator) && (
                    <div className="h-full flex items-center justify-center">
                        <div className="text-center">
                            <Lock className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-zinc-400 mb-2">
                                Yakında
                            </h3>
                            <p className="text-sm text-zinc-600">
                                Bu simülatör henüz hazır değil.
                            </p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
