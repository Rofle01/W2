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
// MAIN WIDGET VIEW (SaaS Dashboard Styled)
// ============================================================================
export default function MarketWidget() {
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
    // RENDER: FLAT DASHBOARD LAYOUT
    // ========================================================================

    return (
        <div className="w-full h-full flex flex-col p-8 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-zinc-100">Piyasa Yönetimi</h1>
                {/* Global Actions */}
                <div className="flex gap-2">
                    {/* Removed Close/Minimize buttons */}
                </div>
            </div>

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

            {/* Data Table - Flexible Height */}
            <div className="flex-1 overflow-hidden min-h-[400px]">
                <MarketTable
                    filteredItems={filteredItems}
                    searchQuery={searchQuery}
                    onPriceChange={handlePriceChange}
                    onShowAddForm={() => setShowAddForm(true)}
                    activeProfile={activeProfile}
                />
            </div>

            {/* Footer */}
            <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center justify-between text-sm shrink-0">
                <span className="text-zinc-500">
                    Toplam <strong className="text-zinc-300">{filteredItems.length}</strong> kalem listeleniyor
                </span>
                <span className="text-zinc-500">
                    Portföy Değeri: <strong className="text-blue-400">{formatCurrency(totalValue)}</strong> {activeProfile?.currency}
                </span>
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
    );
}
