"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Download, Upload, FileSpreadsheet, FileJson } from "lucide-react";
import useWidgetStore from "../../../store/useWidgetStore";
import { syncLocalMarketItems } from "../../../lib/marketUtils";
import { parseMetinImport } from "../../../lib/excelUtils";

export default function ImportExportModal({ isOpen, onClose, onImport, onExport }) {
    const [dataModalTab, setDataModalTab] = useState("export");
    const [isDragging, setIsDragging] = useState(false);

    // Enhanced file input handler with global registry and market sync
    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            // 1. Get store data
            const itemRegistry = useWidgetStore.getState().masterRegistry;
            const registerItems = useWidgetStore.getState().registerItems;

            // 2. Parse the file
            const result = await parseMetinImport(file);

            if (!result.success) {
                alert(result.message);
                return;
            }

            const { metinList, detectedItems } = result;

            // 3. Sync with global registry
            const { newRegistryItems, idMap } = syncLocalMarketItems(detectedItems, itemRegistry);

            // 4. Register new items to global catalog (CRITICAL STEP)
            if (newRegistryItems.length > 0) {
                registerItems(newRegistryItems);
                console.log(`✅ ${newRegistryItems.length} yeni eşya kataloğa eklendi.`);
            }

            // 5. Update Market Prices (Batch Operation)
            // Eski "widget bulma" mantığını çöpe atıyoruz. Doğrudan Store'a yazıyoruz.
            const batchUpdatePrices = useWidgetStore.getState().batchUpdatePrices;

            if (newRegistryItems.length > 0) {
                const newPrices = {};
                newRegistryItems.forEach(item => {
                    // Yeni eklenen itemlara varsayılan 0 fiyat ver
                    newPrices[item.id] = 0;
                });

                // Tek seferde store'u güncelle (Performans + Doğruluk)
                if (batchUpdatePrices) {
                    batchUpdatePrices(newPrices);
                    console.log(`✅ ${newRegistryItems.length} yeni eşya fiyat listesine eklendi.`);
                }
            }

            // 6. Update metin list with real IDs
            const updatedMetinList = metinList.map(metin => ({
                ...metin,
                drops: metin.drops.map(drop => ({
                    ...drop,
                    itemId: idMap[drop.itemId] || drop.itemId
                }))
            }));

            // 7. Call parent's onImport with updated data
            // Pass the file object to maintain compatibility with parent handler
            // The parent will handle the actual widget data update
            onImport(file);

            // Close modal
            onClose();

        } catch (error) {
            console.error('Import error:', error);
            alert('İçe aktarma sırasında hata oluştu: ' + error.message);
        }
    };

    // Drag and drop handlers
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            // Create a fake event object to reuse handleFileChange
            handleFileChange({ target: { files: [file] } });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">Metin Preset Yönetimi</h3>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-white/70" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => setDataModalTab("export")}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${dataModalTab === "export"
                            ? "bg-violet-600/20 text-violet-400 border border-violet-500/30"
                            : "bg-white/5 text-white/70 hover:bg-white/10 border border-white/10"
                            }`}
                    >
                        <Download className="w-4 h-4 inline mr-2" />
                        Kaydet
                    </button>
                    <button
                        onClick={() => setDataModalTab("import")}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${dataModalTab === "import"
                            ? "bg-violet-600/20 text-violet-400 border border-violet-500/30"
                            : "bg-white/5 text-white/70 hover:bg-white/10 border border-white/10"
                            }`}
                    >
                        <Upload className="w-4 h-4 inline mr-2" />
                        Yükle
                    </button>
                </div>

                {/* Export Tab */}
                {dataModalTab === "export" && (
                    <div className="space-y-3">
                        <p className="text-sm text-white/70 mb-3">
                            Metin ayarlarınızı Excel veya JSON formatında kaydedin.
                        </p>
                        <button
                            onClick={() => onExport("excel")}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-green-600/20 backdrop-blur-sm text-green-400 rounded-lg hover:bg-green-600/40 transition-colors font-medium border border-green-500/30"
                        >
                            <FileSpreadsheet className="w-5 h-5" />
                            Excel (.xlsx) İndir
                        </button>
                        <button
                            onClick={() => onExport("json")}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-purple-600/20 backdrop-blur-sm text-purple-400 rounded-lg hover:bg-purple-600/40 transition-colors font-medium border border-purple-500/30"
                        >
                            <FileJson className="w-5 h-5" />
                            JSON İndir
                        </button>
                    </div>
                )}

                {/* Import Tab */}
                {dataModalTab === "import" && (
                    <div className="space-y-3">
                        <p className="text-sm text-white/70 mb-3">
                            Excel (.xlsx) veya JSON dosyası yükleyin. Yeni eşyalar otomatik olarak kataloğa ve markete eklenecek.
                        </p>
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${isDragging
                                ? "border-violet-500 bg-violet-500/10"
                                : "border-white/10 bg-white/5 hover:bg-white/10"
                                }`}
                        >
                            <Upload className="w-12 h-12 text-white/50 mx-auto mb-3" />
                            <p className="text-white/70 mb-2">Dosyayı buraya sürükleyin</p>
                            <p className="text-white/50 text-sm mb-4">veya</p>
                            <label className="inline-block px-4 py-2 bg-violet-600/20 backdrop-blur-sm text-violet-400 rounded-lg hover:bg-violet-600/40 transition-colors cursor-pointer font-medium border border-violet-500/30">
                                Dosya Seç
                                <input
                                    type="file"
                                    accept=".xlsx,.xls,.json,.csv"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>
                            <p className="text-white/40 text-xs mt-3">
                                Desteklenen formatlar: .xlsx, .xls, .json, .csv
                            </p>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
