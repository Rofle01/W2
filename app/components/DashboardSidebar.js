"use client";

import useWidgetStore from "../store/useWidgetStore";
import {
    LayoutDashboard,
    Store,
    Calculator,
    Swords,
    Settings,
    TrendingUp,
    Hammer,
    Database,
    FlaskConical
} from "lucide-react";

const SIDEBAR_ITEMS = [
    { id: "overview", label: "Genel Durum", icon: LayoutDashboard },
    { id: "market", label: "Piyasa", icon: Store },
    { id: "analysis", label: "Metin Analizi", icon: Calculator },
    { id: "boss", label: "Boss Rotasyonu", icon: Swords },
    { id: "supply", label: "Arz / Talep", icon: TrendingUp },
    { id: "crafting", label: "Üretim & Dönüşüm", icon: Hammer },
    { id: "simulator", label: "Simülatör", icon: FlaskConical },
    { id: "metin-settings", label: "Metin Ayarları", icon: Database },
    { id: "settings", label: "Ayarlar", icon: Settings },
];

export default function DashboardSidebar() {
    const activeTab = useWidgetStore((state) => state.activeTab);
    const setActiveTab = useWidgetStore((state) => state.setActiveTab);

    return (
        <aside className="w-64 bg-zinc-950/80 border-r border-zinc-800 flex flex-col h-full shrink-0">
            {/* Brand Header */}
            <div className="h-16 flex items-center px-6 border-b border-zinc-800/50">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center font-bold text-white text-sm">
                        W2
                    </div>
                    <span className="font-semibold text-zinc-100 tracking-tight">Economy Manager</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
                {SIDEBAR_ITEMS.map((item) => {
                    const isActive = activeTab === item.id;
                    const Icon = item.icon;

                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                        ${isActive
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
                                }
                    `}
                        >
                            <Icon size={18} className={isActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"} />
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            {/* Footer / User Profile Stub */}
            <div className="p-4 border-t border-zinc-800/50">
                <div className="flex items-center gap-3 p-2 rounded-lg bg-zinc-900/50 border border-zinc-800">
                    <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs text-zinc-300">
                        OP
                    </div>
                    <div className="flex-col flex">
                        <span className="text-xs font-semibold text-zinc-300">Admin</span>
                        <span className="text-[10px] text-zinc-500">Pro License</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
