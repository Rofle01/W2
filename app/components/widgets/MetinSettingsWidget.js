"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, CheckCircle } from "lucide-react";
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
// MAIN WIDGET (Full-Page Dashboard View)
// ============================================================================
export default function MetinSettingsWidget() {
    // Get data from store
    const marketItems = useWidgetStore((state) => state.masterRegistry) || [];
    const craftingItems = useWidgetStore((state) => state.craftingItems) || [];

    // Get metins from store or use defaults
    const storedMetins = useWidgetStore((state) => {
        const workspace = state.workspaces.find(ws => ws.id === state.activeWorkspaceId);
        return workspace?.data?.metinSettings?.metins;
    });
    const metins = storedMetins?.length > 0 ? storedMetins : MASTER_REGISTRY.metinTemplates;

    // We use activeWorkspaceId as the widgetId for data updates
    const activeWorkspaceId = useWidgetStore((state) => state.activeWorkspaceId);

    return (
        <div className="h-full flex flex-col">
            {/* Page Header */}
            <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20">
                    <Settings className="w-8 h-8 text-cyan-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">Metin Ayarları</h1>
                    <p className="text-zinc-400">HP ve drop ayarlarını düzenleyin</p>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
                <MetinSettingsDetailView
                    widgetId={activeWorkspaceId}
                    metins={metins}
                    marketItems={marketItems}
                    craftingItems={craftingItems}
                />
            </div>
        </div>
    );
}

