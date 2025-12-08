"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutGrid, Eye } from "lucide-react";
import * as LucideIcons from "lucide-react";
import useWidgetStore, { useWidgetDefinition } from "../store/useWidgetStore";

export default function WidgetDock() {
    const [isOpen, setIsOpen] = useState(false);

    // Store'dan workspace verilerini çek
    const activeWorkspaceId = useWidgetStore((state) => state.activeWorkspaceId);
    const workspaces = useWidgetStore((state) => state.workspaces);
    const toggleWidgetVisibility = useWidgetStore((state) => state.toggleWidgetVisibility);

    // Aktif workspace'i bul
    const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId);

    // Gizli widget'ları filtrele
    const hiddenWidgets = activeWorkspace?.widgets?.filter((w) => !w.isVisible) || [];

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Popover Menu */}
            <AnimatePresence>
                {isOpen && hiddenWidgets.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="absolute bottom-20 right-0 w-64 bg-black/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
                    >
                        <div className="p-4 border-b border-white/10 bg-white/5">
                            <h3 className="text-sm font-semibold text-white">Gizli Widget'lar</h3>
                            <p className="text-xs text-white/50 mt-1">
                                Geri getirmek için tıklayın
                            </p>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                            {hiddenWidgets.map((widget) => {
                                // Registry'den widget bilgisini al
                                const definition = useWidgetDefinition(widget.type);
                                const Icon = definition ? LucideIcons[definition.icon] : LucideIcons.HelpCircle;
                                const title = definition?.title || "Bilinmeyen Widget";

                                return (
                                    <motion.button
                                        key={widget.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        onClick={() => {
                                            toggleWidgetVisibility(widget.id);
                                        }}
                                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-b-0"
                                    >
                                        <div className="p-2 bg-white/10 rounded-lg">
                                            <Icon className="w-4 h-4 text-white/70" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-white">{title}</p>
                                        </div>
                                        <Eye className="w-4 h-4 text-white/40" />
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Dock Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="relative w-14 h-14 bg-zinc-800 hover:bg-zinc-900 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
                aria-label="Widget Dock"
            >
                <LayoutGrid className="w-6 h-6" />

                {/* Badge */}
                {hiddenWidgets.length > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center"
                    >
                        {hiddenWidgets.length}
                    </motion.span>
                )}
            </motion.button>

            {/* Backdrop for closing */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 -z-10"
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
