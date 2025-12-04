"use client";

import { Settings, Download } from "lucide-react";

export default function MetinHeader({ onImportExportClick, onClose }) {
    return (
        <div className="bg-black/20 backdrop-blur-xl p-4 rounded-xl border border-white/5">
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-cyan-500/10 backdrop-blur-sm rounded-lg border border-cyan-500/20">
                        <Settings className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white mb-1">Metin Ayarları</h3>
                        <p className="text-sm text-white/70">
                            Her metinin HP değerini ve drop listesini düzenleyin.
                            Değişiklikler anlık olarak kaydedilir.
                        </p>
                    </div>
                </div>
                <button
                    onClick={onImportExportClick}
                    className="p-2 bg-violet-600/20 backdrop-blur-sm text-violet-400 rounded-lg hover:bg-violet-600/40 transition-colors border border-violet-500/30"
                    title="İçe/Dışa Aktar"
                >
                    <Download className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
