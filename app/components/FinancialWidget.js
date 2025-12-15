"use client";

import { motion } from "framer-motion";
import { X, EyeOff } from "lucide-react";
import * as LucideIcons from "lucide-react";
import useWidgetStore, { useWidgetDefinition } from "../store/useWidgetStore";

// Helper: Compact Number Formatting (1.5M, 20K vb.)
const formatCompactNumber = (number) => {
    if (!number) return "0";
    return new Intl.NumberFormat('tr-TR', {
        notation: "compact",
        maximumFractionDigits: 1
    }).format(number);
};

// ============================================================================
// Widget Content Map (Görünüm Mantığı)
// ============================================================================
const WIDGET_CONTENTS = {
    "money-input": {
        Summary: ({ data }) => (
            <div className="flex flex-col items-center justify-center h-full w-full overflow-hidden">
                <span className="text-3xl font-bold text-white whitespace-nowrap">
                    {data.amount ? `${formatCompactNumber(data.amount)} TL` : "Değer Girin"}
                </span>
                <span className="text-xs text-white/60 mt-1">Toplam Bakiye</span>
            </div>
        ),
        Detail: ({ data, onChange }) => (
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-white mb-2">Tutar Girin</label>
                    <div className="relative">
                        <input
                            type="number"
                            value={data.amount || ""}
                            onChange={(e) => onChange({ amount: e.target.value })}
                            className="w-full px-4 py-3 text-lg bg-black/20 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-black/30 backdrop-blur-sm transition-all"
                            placeholder="0"
                            autoFocus
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 font-medium">TL</span>
                    </div>
                    <p className="text-sm text-white/60 mt-2">
                        Bu tutar genel bakiyenize eklenecektir. Geçmiş harcamalarınızı grafikte görebilirsiniz.
                    </p>
                </div>
            </div>
        )
    },
    "note-taker": {
        Summary: ({ data }) => (
            <div className="flex flex-col items-center justify-center h-full text-center px-4 w-full overflow-hidden">
                <p className="text-lg font-medium text-white break-words line-clamp-4 w-full">
                    {data.notes || "Henüz not eklenmedi..."}
                </p>
            </div>
        ),
        Detail: ({ data, onChange }) => (
            <div className="space-y-4 h-full">
                <label className="block text-sm font-medium text-white mb-2">Notlarınız</label>
                <textarea
                    value={data.notes || ""}
                    onChange={(e) => onChange({ notes: e.target.value })}
                    className="w-full h-64 px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-black/30 backdrop-blur-sm resize-none transition-all"
                    placeholder="Buraya notlarınızı yazın..."
                    autoFocus
                />
            </div>
        )
    },
    // Diğer widgetlar için varsayılan şablon
    "default": {
        Summary: ({ data, title }) => (
            <div className="flex flex-col items-center justify-center h-full w-full px-4 text-center">
                <span className="text-xl font-semibold text-white break-words w-full">{title}</span>
                <span className="text-sm text-white/60 mt-1">Detaylar için tıklayın</span>
            </div>
        ),
        Detail: ({ data, onChange }) => (
            <div className="space-y-4">
                <p className="text-white/60">Bu widget için özel bir görünüm henüz tanımlanmadı.</p>
                <div className="p-4 bg-black/20 rounded-lg border border-white/10 backdrop-blur-sm">
                    <pre className="text-xs text-white/80 overflow-auto">
                        {JSON.stringify(data, null, 2)}
                    </pre>
                </div>
            </div>
        )
    }
};

export default function FinancialWidget({
    id,
    type,
    isSelected,
    onClick,
    data,
    onHide
}) {
    // Store'dan update fonksiyonunu çek
    const updateWidgetData = useWidgetStore((state) => state.updateWidgetData);

    // Registry'den widget tanımını al
    const definition = useWidgetDefinition(type);

    // Eğer definition yoksa render etme
    if (!definition) return null;

    const { title, icon: iconName } = definition;
    const Icon = LucideIcons[iconName] || LucideIcons.HelpCircle;

    // Widget içeriğini seç (Summary/Detail)
    const Content = WIDGET_CONTENTS[type] || WIDGET_CONTENTS["default"];

    // Veri güncelleme wrapper'ı
    const handleChange = (newData) => {
        updateWidgetData(id, newData);
    };

    return (
        <motion.div
            layoutId={`card-${id}`}
            layout
            onClick={!isSelected ? onClick : undefined}
            className={`group rounded-3xl shadow-2xl cursor-pointer overflow-hidden backdrop-blur-xl border border-white/10 ${isSelected
                ? "fixed inset-0 m-auto w-[90%] h-[90%] max-w-6xl z-[100] bg-black/90"
                : "relative h-64 hover:-translate-y-1 glass-panel hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.1)] transition-all duration-300"
                }`}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
            {/* SUMMARY VIEW */}
            {!isSelected && (
                <>
                    {/* Gizle Butonu (Hover'da görünür) */}
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            onHide && onHide();
                        }}
                        className="absolute top-4 right-4 z-20 p-2 bg-white/10 backdrop-blur-sm shadow-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-white/60 hover:text-red-400 hover:bg-red-500/20 border border-white/20"
                    >
                        <EyeOff className="w-4 h-4" />
                    </motion.button>

                    {/* İçerik */}
                    <div className="w-full h-full p-6 relative">
                        {/* Arkaplan İkonu (Dekoratif) */}
                        <Icon className="absolute -bottom-4 -right-4 w-32 h-32 text-white/5 opacity-50 rotate-12 pointer-events-none" />

                        {/* Summary Component */}
                        <Content.Summary data={data} title={title} />
                    </div>
                </>
            )}

            {/* DETAIL VIEW */}
            {isSelected && (
                <div className="flex flex-col h-full bg-transparent">
                    {/* Header */}
                    <div className="flex items-center justify-between p-8 border-b border-white/10 bg-transparent backdrop-blur-xl">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                                <Icon className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <motion.h2 layoutId={`title-${id}`} className="text-2xl font-bold text-white">
                                    {title}
                                </motion.h2>
                                <p className="text-white/60">Detaylı görünüm ve düzenleme modu</p>
                            </div>
                        </div>

                        {/* Kapat Butonu */}
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

                    {/* Content Grid */}
                    <div className="flex-1 p-8 overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                            {/* Sol Kolon: Inputlar (Detail View) */}
                            <div className="bg-transparent backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-xl">
                                <Content.Detail data={data} onChange={handleChange} />
                            </div>

                            {/* Sağ Kolon: Grafik / Dashboard Placeholder */}
                            <div className="border-2 border-dashed border-white/10 rounded-2xl bg-transparent backdrop-blur-sm flex flex-col items-center justify-center text-white/50 p-6">
                                <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 border border-white/20">
                                    <LucideIcons.BarChart3 className="w-8 h-8 text-white/70" />
                                </div>
                                <h4 className="font-medium text-white/80 mb-1">Analiz Grafiği</h4>
                                <p className="text-sm text-center max-w-xs text-white/60">
                                    {type === "money-input" ? "Gelir/Gider dağılım grafiği burada görüntülenecek." :
                                        type === "note-taker" ? "Kelime bulutu ve not analizi burada yer alacak." :
                                            "Bu widget için görselleştirme modülü hazırlanıyor."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
