"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, EyeOff, Settings, CheckCircle } from "lucide-react";
import useWidgetStore from "../../store/useWidgetStore";
import { MASTER_REGISTRY } from "../../data/initialData";
import { exportMetinsToExcel, parseMetinImport } from "../../lib/excelUtils";
import { syncLocalMarketItems } from "../../lib/marketUtils";

// Import modular components
import MetinSummary from "./metin-settings/MetinSummary";
import MetinHeader from "./metin-settings/MetinHeader";
import ImportExportModal from "./metin-settings/ImportExportModal";
import MetinList from "./metin-settings/MetinList";

// ============================================================================
// DETAIL VIEW CONTAINER
// ============================================================================
function MetinSettingsDetailView({ widgetId, metins, marketItems, craftingItems }) {
    const updateWidgetData = useWidgetStore((state) => state.updateWidgetData);
    const itemRegistry = useWidgetStore((state) => state.masterRegistry);
    const registerItems = useWidgetStore((state) => state.registerItems);

    const [showDataModal, setShowDataModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    // Export handler
    const handleExport = async (format) => {
        if (format === 'excel') {
            const result = await exportMetinsToExcel(metins, marketItems, `metin-listesi-${Date.now()}`);
            if (result.success) {
                setSuccessMessage('Excel dosyası başarıyla indirildi!');
                setTimeout(() => setSuccessMessage(""), 3000);
            }
        } else if (format === 'json') {
            // JSON export
            const jsonString = JSON.stringify(metins, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `metin-listesi-${Date.now()}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            setSuccessMessage('JSON dosyası başarıyla indirildi!');
            setTimeout(() => setSuccessMessage(""), 3000);
        }
    };

    // Import handler
    const handleImport = async (file) => {
        try {
            // Step 1: Parse file
            const result = await parseMetinImport(file);

            if (!result.success) {
                alert(result.message);
                return;
            }

            const { metinList, detectedItems } = result;

            // Step 2: Sync imported items with registry using marketUtils
            const { newRegistryItems, profilePrices } = syncLocalMarketItems(detectedItems, itemRegistry);

            // Step 3: Create ID mapping (tempId -> realId)
            const idMap = {};
            detectedItems.forEach(item => {
                // Normalize name for matching
                const cleanName = item.originalName.trim().toLowerCase();

                // Find in existing registry
                const existing = itemRegistry.find(r => r.name.trim().toLowerCase() === cleanName);

                // Find in new items
                const newItem = newRegistryItems.find(n => n.name.trim().toLowerCase() === cleanName);

                if (existing) {
                    idMap[item.tempId] = existing.id;
                } else if (newItem) {
                    idMap[item.tempId] = newItem.id;
                }
            });

            // Step 4: Add new items to registry
            if (newRegistryItems.length > 0) {
                registerItems(newRegistryItems);
            }

            // Step 5: Replace temp IDs with real market IDs
            const updatedMetinList = metinList.map(metin => ({
                ...metin,
                drops: metin.drops.map(drop => ({
                    ...drop,
                    itemId: idMap[drop.itemId] || drop.itemId
                }))
            }));

            // Step 6: Save to widget data
            updateWidgetData(widgetId, { metins: updatedMetinList });

            // Step 7: Show success message
            setSuccessMessage(
                `✅ ${metinList.length} metin yüklendi. ${newRegistryItems.length} yeni eşya kataloğa eklendi.`
            );
            setTimeout(() => setSuccessMessage(""), 5000);
            setShowDataModal(false);

        } catch (error) {
            console.error('Import error:', error);
            alert('İçe aktarma sırasında hata oluştu: ' + error.message);
        }
    };

    return (
        <div className="space-y-6 h-full flex flex-col">
            {/* Success Message */}
            {successMessage && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-green-600/90 backdrop-blur-sm text-white px-4 py-3 rounded-lg flex items-center gap-2 border border-green-500/30"
                >
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">{successMessage}</span>
                </motion.div>
            )}

            {/* Header with Import/Export Button */}
            <MetinHeader
                onImportExportClick={() => setShowDataModal(true)}
            />

            {/* Metins List */}
            <MetinList
                metins={metins}
                marketItems={marketItems}
                craftingItems={craftingItems}
                updateWidgetData={updateWidgetData}
                widgetId={widgetId}
            />

            {/* Import/Export Modal */}
            <ImportExportModal
                isOpen={showDataModal}
                onClose={() => setShowDataModal(false)}
                onImport={handleImport}
                onExport={handleExport}
            />
        </div>
    );
}

// ============================================================================
// MAIN WIDGET (Container)
// ============================================================================
export default function MetinSettingsWidget({ id, data, isSelected, onClick, onHide }) {
    // Get data from store
    const marketItems = useWidgetStore((state) => state.masterRegistry) || [];
    const craftingItems = useWidgetStore((state) => state.craftingItems) || [];

    // Use widget data or initialize with default metins
    const metins = data?.metins?.length > 0 ? data.metins : MASTER_REGISTRY.metinTemplates;

    return (
        <motion.div
            layoutId={`card-${id}`}
            layout
            onClick={!isSelected ? onClick : undefined}
            className={`group rounded-3xl shadow-2xl cursor-pointer overflow-hidden backdrop-blur-xl border border-white/10 ${isSelected
                ? "fixed inset-0 m-auto w-[90%] h-[90%] max-w-6xl z-[100] bg-black/80"
                : "relative h-64 hover:-translate-y-1 hover:border-cyan-400/50 transition-all duration-300 bg-black/20 hover:bg-black/40"
                }`}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
            {/* Hide Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                    e.stopPropagation();
                    onHide && onHide();
                }}
                className="absolute top-4 right-4 z-20 p-2 bg-white/10 backdrop-blur-sm shadow-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-white/60 hover:text-cyan-400 hover:bg-cyan-500/20 border border-white/20"
            >
                <EyeOff className="w-4 h-4" />
            </motion.button>

            {/* Summary View */}
            {!isSelected && (
                <div className="w-full h-full p-6 relative">
                    <Settings className="absolute -bottom-4 -right-4 w-32 h-32 text-white/5 opacity-50 rotate-12 pointer-events-none" />
                    <MetinSummary metins={metins} />
                </div>
            )}

            {/* Detail View */}
            {isSelected && (
                <div className="flex flex-col h-full bg-black/20">
                    {/* Header */}
                    <div className="flex items-center justify-between p-8 border-b border-white/10 bg-black/40 backdrop-blur-xl">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-cyan-500/10 backdrop-blur-sm rounded-2xl border border-cyan-500/20">
                                <Settings className="w-8 h-8 text-cyan-400" />
                            </div>
                            <div>
                                <motion.h2 layoutId={`title-${id}`} className="text-2xl font-bold text-white">
                                    Metin Ayarları
                                </motion.h2>
                                <p className="text-white/60">HP ve drop ayarlarını düzenleyin</p>
                            </div>
                        </div>
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

                    {/* Content */}
                    <div className="flex-1 p-8 overflow-y-auto">
                        <MetinSettingsDetailView
                            widgetId={id}
                            metins={metins}
                            marketItems={marketItems}
                            craftingItems={craftingItems}
                        />
                    </div>
                </div>
            )}
        </motion.div>
    );
}
