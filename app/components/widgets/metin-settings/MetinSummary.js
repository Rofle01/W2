"use client";

import { Settings } from "lucide-react";

export default function MetinSummary({ metins }) {
    return (
        <div className="flex flex-col items-center justify-center h-full w-full overflow-hidden px-4">
            <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/10">
                    <Settings className="w-8 h-8 text-cyan-400" />
                </div>
            </div>
            <span className="text-3xl font-bold text-white whitespace-nowrap">
                Metin Ayarları
            </span>
            <span className="text-sm text-white/60 mt-2 font-mono">
                {metins.length} Metin Tanımlı
            </span>
        </div>
    );
}
