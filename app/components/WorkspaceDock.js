"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Archive, Eye, Check, X, Trash2, AlertTriangle } from "lucide-react";
import * as LucideIcons from "lucide-react";
import useWidgetStore, { useWidgetDefinition } from "../store/useWidgetStore";
import WidgetCatalog from "./WidgetCatalog";

export default function WorkspaceDock() {
    const [isArchiveOpen, setIsArchiveOpen] = useState(false);
    const [isCatalogOpen, setIsCatalogOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newWorkspaceName, setNewWorkspaceName] = useState("");

    // Confirmation Modal State
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: null
    });

    const inputRef = useRef(null);

    // Store'dan workspace verilerini çek
    const activeWorkspaceId = useWidgetStore((state) => state.activeWorkspaceId);
    const workspaces = useWidgetStore((state) => state.workspaces);
    const switchWorkspace = useWidgetStore((state) => state.switchWorkspace);
    const addWorkspace = useWidgetStore((state) => state.addWorkspace);
    const removeWorkspace = useWidgetStore((state) => state.removeWorkspace);
    const toggleWidgetVisibility = useWidgetStore((state) => state.toggleWidgetVisibility);
    const removeWidget = useWidgetStore((state) => state.removeWidget);

    // Aktif workspace'i bul
    const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId);

    // Gizli widget'ları filtrele
    const hiddenWidgets = activeWorkspace?.widgets?.filter((w) => !w.isVisible) || [];

    // Input focus yönetimi
    useEffect(() => {
        if (isCreating && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isCreating]);

    // Helper: Onay İste
    const requestConfirmation = (title, message, action) => {
        setConfirmModal({
            isOpen: true,
            title,
            message,
            onConfirm: () => {
                action();
                setConfirmModal((prev) => ({ ...prev, isOpen: false }));
            }
        });
    };

    // Yeni workspace ekle
    const handleCreateConfirm = () => {
        if (newWorkspaceName.trim()) {
            addWorkspace(newWorkspaceName.trim());
            setNewWorkspaceName("");
            setIsCreating(false);
        }
    };

    const handleCreateCancel = () => {
        setNewWorkspaceName("");
        setIsCreating(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleCreateConfirm();
        } else if (e.key === "Escape") {
            handleCreateCancel();
        }
    };

    // Workspace silme (Sağ tık)
    const handleWorkspaceContextMenu = (e, workspaceId) => {
        e.preventDefault();
        requestConfirmation(
            "Çalışma Alanını Sil",
            "Bu işlem geri alınamaz. Devam etmek istiyor musun?",
            () => removeWorkspace(workspaceId)
        );
    };

    // Widget kalıcı silme
    const handlePermanentDeleteWidget = (e, widgetId) => {
        e.stopPropagation();
        requestConfirmation(
            "Widget'ı Kalıcı Sil",
            "Bu widget ve içindeki veriler yok edilecek.",
            () => removeWidget(widgetId)
        );
    };

    return (
        <>
            {/* Widget Catalog Modal */}
            <WidgetCatalog isOpen={isCatalogOpen} onClose={() => setIsCatalogOpen(false)} />

            {/* Ana Dock */}
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
            >
                {/* İsimlendirme Balonu (Dock'un üstünde) */}
                <AnimatePresence>
                    {isCreating && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.9, x: "-50%" }}
                            animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
                            exit={{ opacity: 0, y: 10, scale: 0.9, x: "-50%" }}
                            className="absolute -top-16 left-1/2 bg-white rounded-xl shadow-xl border border-zinc-200 p-2 flex gap-2 items-center whitespace-nowrap"
                        >
                            <input
                                ref={inputRef}
                                type="text"
                                value={newWorkspaceName}
                                onChange={(e) => setNewWorkspaceName(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Çalışma alanı adı..."
                                className="w-40 px-3 py-1.5 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                                onClick={handleCreateConfirm}
                                className="p-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                <Check className="w-4 h-4" />
                            </button>
                            <button
                                onClick={handleCreateCancel}
                                className="p-1.5 bg-zinc-100 text-zinc-500 rounded-lg hover:bg-zinc-200 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            {/* Ok işareti (Triangle) */}
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b border-r border-zinc-200 rotate-45" />
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="bg-black/80 backdrop-blur-xl border border-white/10 shadow-[0_0_50px_rgba(6,182,212,0.15)] rounded-full px-4 py-3 flex items-center gap-2">
                    {/* Workspace Sekmeleri */}
                    <div className="flex items-center gap-2">
                        {workspaces.map((workspace) => {
                            const isActive = workspace.id === activeWorkspaceId;

                            return (
                                <motion.button
                                    key={workspace.id}
                                    onClick={() => switchWorkspace(workspace.id)}
                                    onContextMenu={(e) => handleWorkspaceContextMenu(e, workspace.id)}
                                    className={`relative px-4 py-2 rounded-full text-sm font-medium transition-colors ${isActive
                                        ? "text-cyan-400"
                                        : "text-white/40 hover:text-white/70"
                                        }`}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-gradient-to-r from-cyan-900/50 to-blue-900/50 border border-cyan-500/30 rounded-full shadow-lg"
                                            transition={{
                                                type: "spring",
                                                stiffness: 500,
                                                damping: 30,
                                            }}
                                        />
                                    )}
                                    <span className="relative z-10">{workspace.name}</span>
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* Ayırıcı */}
                    <div className="w-px h-6 bg-white/10" />

                    {/* Yeni Workspace Ekle Butonu */}
                    <motion.button
                        onClick={() => setIsCreating(true)}
                        className={`p-2 rounded-full transition-colors ${isCreating ? "bg-cyan-500/20 text-cyan-400" : "hover:bg-white/10 text-white/60 hover:text-white"
                            }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label="Yeni çalışma alanı ekle"
                    >
                        <Plus className="w-5 h-5" />
                    </motion.button>

                    {/* Ayırıcı */}
                    <div className="w-px h-6 bg-white/10" />

                    {/* Widget Ekle Butonu */}
                    <motion.button
                        onClick={() => setIsCatalogOpen(true)}
                        className="p-2 rounded-full hover:bg-white/10 transition-colors group"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label="Widget ekle"
                    >
                        <LucideIcons.LayoutGrid className="w-5 h-5 text-white/60 group-hover:text-cyan-400 transition-colors" />
                    </motion.button>

                    {/* Gizli Widgetlar (Arşiv) Butonu */}
                    <motion.button
                        onClick={() => setIsArchiveOpen(!isArchiveOpen)}
                        className="relative p-2 rounded-full hover:bg-white/10 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label="Gizli widget'lar"
                    >
                        <Archive className="w-5 h-5 text-white/60" />

                        {/* Badge - Gizli widget sayısı */}
                        {hiddenWidgets.length > 0 && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                            >
                                {hiddenWidgets.length}
                            </motion.span>
                        )}
                    </motion.button>
                </div>
            </motion.div>

            {/* Gizli Widgetlar Popover */}
            <AnimatePresence>
                {isArchiveOpen && hiddenWidgets.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed bottom-28 right-8 w-72 bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden z-50"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-zinc-200 bg-zinc-50">
                            <h3 className="text-sm font-semibold text-zinc-800">Gizli Widget'lar</h3>
                            <p className="text-xs text-zinc-500 mt-1">
                                Geri getirmek için tıklayın
                            </p>
                        </div>

                        {/* Widget Listesi */}
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
                                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-zinc-50 transition-colors text-left border-b border-zinc-100 last:border-b-0 group"
                                    >
                                        <div className="p-2 bg-zinc-100 rounded-lg">
                                            <Icon className="w-4 h-4 text-zinc-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-zinc-800">{title}</p>
                                        </div>

                                        {/* Geri Getir Butonu */}
                                        <div className="p-1.5 hover:bg-blue-50 rounded-md transition-colors text-zinc-400 hover:text-blue-500">
                                            <Eye className="w-4 h-4" />
                                        </div>

                                        {/* Kalıcı Sil Butonu */}
                                        <div
                                            onClick={(e) => handlePermanentDeleteWidget(e, widget.id)}
                                            className="p-1.5 hover:bg-red-50 rounded-md transition-colors text-zinc-400 hover:text-red-500"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Backdrop - Popover kapatmak için */}
            <AnimatePresence>
                {isArchiveOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsArchiveOpen(false)}
                        className="fixed inset-0 z-40"
                    />
                )}
            </AnimatePresence>

            {/* Custom Confirmation Modal */}
            <AnimatePresence>
                {confirmModal.isOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                        />

                        {/* Modal Content */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-black/90 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/10 backdrop-blur-xl p-6 w-80 relative z-10"
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className="w-12 h-12 bg-red-500/20 border border-red-500/30 rounded-full flex items-center justify-center mb-4">
                                    <AlertTriangle className="w-6 h-6 text-red-500" />
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">
                                    {confirmModal.title}
                                </h3>
                                <p className="text-sm text-white/70 mb-6">
                                    {confirmModal.message}
                                </p>
                                <div className="flex gap-3 w-full">
                                    <button
                                        onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                                        className="flex-1 px-4 py-2 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/5 rounded-xl transition-colors font-medium"
                                    >
                                        İptal
                                    </button>
                                    <button
                                        onClick={confirmModal.onConfirm}
                                        className="flex-1 px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white border border-red-500/50 shadow-lg shadow-red-900/20 rounded-xl transition-colors font-medium"
                                    >
                                        Sil
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
