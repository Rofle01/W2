"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Coins, Package, X, EyeOff } from "lucide-react";
import useWidgetStore from "../../store/useWidgetStore";
import { exportToFile, parseImportFile } from "../../lib/excelUtils";
import { syncLocalMarketItems } from "../../lib/marketUtils";
import { formatCurrency, formatCompactCurrency } from "../../lib/calculator";

// Sub-components
import MarketStatCard from "./market/MarketStatCard";
import MarketFilters from "./market/MarketFilters";
import MarketTable from "./market/MarketTable";
import MarketModals from "./market/MarketModals";

// Helper for classes
const clsx = (...classes) => classes.filter(Boolean).join(" ");

// ============================================================================
// SUMMARY COMPONENT (Collapsed View)
// ============================================================================
function MarketSummaryView({ totalValue, itemCount, currency }) {
    return (
        <div className="w-full h-full p-6 relative flex flex-col justify-between">
            {/* Background Decor */}
            <Coins className="absolute -bottom-4 -right-4 w-32 h-32 text-amber-500/5 opacity-50 rotate-12 pointer-events-none" />

            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20">
                    <Coins className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-white/90">Piyasa Paneli</h3>
                    <p className="text-xs text-white/50">Market ve Ticaret Yönetimi</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2 mb-1">
                        <Coins className="w-4 h-4 text-amber-400" />
                        <span className="text-xs text-white/40">Toplam Değer</span>
                    </div>
                    <div className="text-lg font-bold text-white">
                        {formatCompactCurrency(totalValue)}
                    </div>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2 mb-1">
                        <Package className="w-4 h-4 text-blue-400" />
                        <span className="text-xs text-white/40">Eşya Sayısı</span>
                    </div>
                    <div className="text-lg font-bold text-white">
                        {itemCount}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// MAIN WIDGET
// ============================================================================
export default function MarketWidget({ id, isSelected, onClick, onHide }) {
    // Global Store Data
    const masterRegistry = useWidgetStore((state) => state.masterRegistry);
    const activeServerId = useWidgetStore((state) => state.activeServerId);
    const serverProfiles = useWidgetStore((state) => state.serverProfiles);

    // Actions
    const updatePrice = useWidgetStore((state) => state.updatePrice);
    const registerItem = useWidgetStore((state) => state.registerItem);
    const setActiveServer = useWidgetStore((state) => state.setActiveServer);
    const addServerProfile = useWidgetStore((state) => state.addServerProfile);
    const resetMarketData = useWidgetStore((state) => state.resetMarketData);
    const nukeStore = useWidgetStore((state) => state.nukeStore);

    // Derived State
    const activeProfile = useMemo(() =>
        serverProfiles.find(p => p.id === activeServerId),
        [serverProfiles, activeServerId]
    );
    const prices = activeProfile?.prices || {};

    // Local State
    const [selectedCategory, setSelectedCategory] = useState("Tümü");
    const [searchQuery, setSearchQuery] = useState("");
    const [showAddForm, setShowAddForm] = useState(false);
    const [showDataModal, setShowDataModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [dataModalTab, setDataModalTab] = useState("export");
    const [successMessage, setSuccessMessage] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [profileName, setProfileName] = useState("");
    const [newItem, setNewItem] = useState({
        name: "",
        category: "genel",
        icon: "Circle"
    });

    // Merge registry with local prices to create display items
    const displayItems = useMemo(() => {
        return masterRegistry.map(item => ({
            ...item,
            price: prices[item.id] || 0
        }));
    }, [masterRegistry, prices]);

    // Get unique categories
    const categories = useMemo(() => {
        const cats = ["Tümü", ...new Set(masterRegistry.map(item => item.category))];
        return cats;
    }, [masterRegistry]);

    // Filter items
    const filteredItems = useMemo(() => {
        return displayItems.filter(item => {
            const matchesCategory = selectedCategory === "Tümü" || item.category === selectedCategory;
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [displayItems, selectedCategory, searchQuery]);

    // Calculate total value (All displayed items)
    const totalValue = useMemo(() => {
        return filteredItems.reduce((sum, item) => sum + item.price, 0);
    }, [filteredItems]);

    // ========================================================================
    // HANDLERS
    // ========================================================================

    const handlePriceChange = (itemId, newPrice) => {
        const price = parseFloat(newPrice);
        if (!isNaN(price) && price >= 0) {
            updatePrice(itemId, price);
        }
    };

    const handleAddItem = (e) => {
        e.preventDefault();
        if (newItem.name) {
            registerItem({
                name: newItem.name,
                category: newItem.category,
                icon: newItem.icon
            });

            setNewItem({ name: "", category: "genel", icon: "Circle" });
            setShowAddForm(false);
            setSuccessMessage("✅ Yeni eşya kataloğa eklendi!");
            setTimeout(() => setSuccessMessage(""), 3000);
        }
    };

    const handleSwitchServer = (serverId) => {
        setActiveServer(serverId);
        const server = serverProfiles.find(p => p.id === serverId);
        setSuccessMessage(`✅ Sunucu değiştirildi: ${server?.name}`);
        setTimeout(() => setSuccessMessage(""), 3000);
    };

    const handleAddServer = () => {
        if (profileName.trim()) {
            addServerProfile(profileName);
            setProfileName("");
            setShowProfileModal(false);
            setSuccessMessage(`✅ Yeni sunucu eklendi: ${profileName}`);
            setTimeout(() => setSuccessMessage(""), 3000);
        }
    };

    const handleExport = async (format) => {
        const result = await exportToFile(displayItems, `piyasa-${activeProfile?.name}-${Date.now()}`, format);
        if (result.success) {
            setSuccessMessage(`✅ ${format.toUpperCase()} dosyası indirildi!`);
            setTimeout(() => setSuccessMessage(""), 3000);
        }
    };

    const handleImport = async (file) => {
        try {
            const result = await parseImportFile(file);
            if (!result.success) {
                alert(result.message);
                return;
            }

            const importedData = result.data;
            const { newRegistryItems, idMap } = syncLocalMarketItems(importedData, masterRegistry);

            if (newRegistryItems.length > 0) {
                newRegistryItems.forEach(item => registerItem(item));
            }

            let updatedCount = 0;
            importedData.forEach(item => {
                const itemId = idMap[item.name] || item.id;
                if (itemId) {
                    const price = parseFloat(item.price) || 0;
                    updatePrice(itemId, price);
                    updatedCount++;
                }
            });

            setSuccessMessage(
                `✅ ${updatedCount} fiyat güncellendi${newRegistryItems.length > 0 ? `, ${newRegistryItems.length} yeni eşya eklendi` : ''}.`
            );
            setTimeout(() => setSuccessMessage(""), 4000);
            setShowDataModal(false);
        } catch (error) {
            console.error("Import hatası:", error);
            alert("Dosya yüklenirken bir hata oluştu. Lütfen dosya formatını kontrol edin.");
        }
    };

    const handleResetData = (scope) => {
        resetMarketData(scope);
        setShowResetModal(false);
        setSuccessMessage(scope === 'full' ? "⚠️ Tüm veriler sıfırlandı!" : "⚠️ Fiyatlar sıfırlandı!");
        setTimeout(() => setSuccessMessage(""), 3000);
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) handleImport(file);
    };

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
        if (file) handleImport(file);
    };

    // ========================================================================
    // RENDER
    // ========================================================================

    return (
        <motion.div
            layoutId={`card-${id}`}
            layout
            onClick={!isSelected ? onClick : undefined}
            className={clsx(
                "group rounded-3xl shadow-2xl cursor-pointer overflow-hidden backdrop-blur-xl border border-white/10",
                isSelected
                    ? "fixed inset-0 m-auto w-[90%] h-[90%] max-w-6xl z-[100] bg-black/80 flex flex-col"
                    : "relative h-64 hover:-translate-y-1 hover:border-amber-400/50 transition-all duration-300 bg-black/20 hover:bg-black/40"
            )}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
            {/* Collapsed View (Summary) */}
            {!isSelected && (
                <>
                    {/* Hide Button */}
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            onHide && onHide();
                        }}
                        className="absolute top-4 right-4 z-20 p-2 bg-white/10 backdrop-blur-sm shadow-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-white/60 hover:text-amber-400 hover:bg-amber-500/20 border border-white/20"
                    >
                        <EyeOff className="w-4 h-4" />
                    </motion.button>

                    <MarketSummaryView
                        totalValue={totalValue}
                        itemCount={filteredItems.length}
                        currency={activeProfile?.currency}
                    />
                </>
            )}

            {/* Expanded View (Full Detail) */}
            {isSelected && (
                <div className="flex flex-col h-full bg-black/20">
                    {/* Close Button Header */}
                    <div className="flex items-center justify-end p-4 pb-0">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onClick(); // Toggles off selection in parent
                            }}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors backdrop-blur-sm border border-white/10 hover:border-white/20"
                        >
                            <X className="w-6 h-6 text-white/80" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-hidden flex flex-col p-6 pt-2 space-y-6">
                        {/* Success Message */}
                        <AnimatePresence>
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
                        </AnimatePresence>

                        {/* Top Stats & Actions */}
                        <MarketStatCard
                            totalValue={totalValue}
                            activeProfile={activeProfile}
                            filteredCount={filteredItems.length}
                            totalCount={displayItems.length}
                            activeServerId={activeServerId}
                            serverProfiles={serverProfiles}
                            onSwitchServer={handleSwitchServer}
                            onShowProfileModal={() => setShowProfileModal(true)}
                            onShowResetModal={() => setShowResetModal(true)}
                            onShowDataModal={() => setShowDataModal(true)}
                        />

                        {/* Search & Filters */}
                        <MarketFilters
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            selectedCategory={selectedCategory}
                            setSelectedCategory={setSelectedCategory}
                            categories={categories}
                            showAddForm={showAddForm}
                            setShowAddForm={setShowAddForm}
                            newItem={newItem}
                            setNewItem={setNewItem}
                            onAddItem={handleAddItem}
                        />

                        {/* Data Table */}
                        <MarketTable
                            filteredItems={filteredItems}
                            searchQuery={searchQuery}
                            onPriceChange={handlePriceChange}
                            onShowAddForm={() => setShowAddForm(true)}
                            activeProfile={activeProfile}
                        />

                        {/* Footer Info */}
                        <div className="bg-white/5 backdrop-blur-sm p-3 rounded-lg border border-white/10 flex items-center justify-between text-sm shrink-0">
                            <span className="text-white/70">
                                Toplam <strong className="text-white">{filteredItems.length}</strong> eşya gösteriliyor
                            </span>
                            <span className="text-white/70">
                                Değer: <strong className="text-cyan-400">{formatCurrency(totalValue)}</strong> {activeProfile?.currency}
                            </span>
                        </div>
                    </div>

                    {/* Modals Layer */}
                    <MarketModals
                        showProfileModal={showProfileModal}
                        setShowProfileModal={setShowProfileModal}
                        profileName={profileName}
                        setProfileName={setProfileName}
                        onAddServer={handleAddServer}

                        showResetModal={showResetModal}
                        setShowResetModal={setShowResetModal}
                        onResetData={handleResetData}
                        onNukeStore={nukeStore}

                        showDataModal={showDataModal}
                        setShowDataModal={setShowDataModal}
                        dataModalTab={dataModalTab}
                        setDataModalTab={setDataModalTab}
                        onExport={handleExport}
                        onFileChange={handleFileChange}

                        isDragging={isDragging}
                        handleDragOver={handleDragOver}
                        handleDragLeave={handleDragLeave}
                        handleDrop={handleDrop}
                    />
                </div>
            )}
        </motion.div>
    );
}
