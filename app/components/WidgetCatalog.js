"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Plus } from "lucide-react";
import * as LucideIcons from "lucide-react";
import useWidgetStore, { WIDGET_REGISTRY } from "../store/useWidgetStore";

export default function WidgetCatalog({ isOpen, onClose }) {
    const addWidget = useWidgetStore((state) => state.addWidget);

    const handleAdd = (type) => {
        addWidget(type);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed inset-0 m-auto w-full max-w-2xl h-fit max-h-[80vh] bg-black/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-50 flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-white">Widget Ekle</h2>
                                <p className="text-white/60 text-sm mt-1">
                                    Panelinize eklemek için bir araç seçin
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-white/80" />
                            </button>
                        </div>

                        {/* Grid */}
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {Object.entries(WIDGET_REGISTRY).map(([type, def]) => {
                                    const Icon = LucideIcons[def.icon] || LucideIcons.HelpCircle;

                                    return (
                                        <motion.button
                                            key={type}
                                            onClick={() => handleAdd(type)}
                                            whileHover={{ scale: 1.02, y: -2 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/10 shadow-sm hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:border-cyan-500/50 transition-all text-left group"
                                        >
                                            <div className="p-3 bg-white/10 rounded-lg group-hover:bg-cyan-500/20 group-hover:text-cyan-400 transition-colors">
                                                <Icon className="w-6 h-6 text-cyan-400 group-hover:text-cyan-300" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                                                    {def.title}
                                                </h3>
                                                <p className="text-xs text-white/50 mt-1 leading-relaxed group-hover:text-white/70">
                                                    {def.description || "Bu widget'ı panelinize ekleyin."}
                                                </p>
                                            </div>
                                            <div className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Plus className="w-4 h-4 text-cyan-500" />
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
