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
                        className="fixed inset-0 m-auto w-full max-w-2xl h-fit max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden z-50 flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-white">
                            <div>
                                <h2 className="text-xl font-bold text-zinc-800">Widget Ekle</h2>
                                <p className="text-zinc-500 text-sm mt-1">
                                    Panelinize eklemek için bir araç seçin
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-zinc-500" />
                            </button>
                        </div>

                        {/* Grid */}
                        <div className="p-6 overflow-y-auto bg-zinc-50/50">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {Object.entries(WIDGET_REGISTRY).map(([type, def]) => {
                                    const Icon = LucideIcons[def.icon] || LucideIcons.HelpCircle;

                                    return (
                                        <motion.button
                                            key={type}
                                            onClick={() => handleAdd(type)}
                                            whileHover={{ scale: 1.02, y: -2 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="flex items-start gap-4 p-4 bg-white rounded-xl border border-zinc-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-left group"
                                        >
                                            <div className="p-3 bg-zinc-100 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                                <Icon className="w-6 h-6 text-zinc-600 group-hover:text-blue-600" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-zinc-800 group-hover:text-blue-700 transition-colors">
                                                    {def.title}
                                                </h3>
                                                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                                                    {def.description || "Bu widget'ı panelinize ekleyin."}
                                                </p>
                                            </div>
                                            <div className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Plus className="w-4 h-4 text-blue-500" />
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
