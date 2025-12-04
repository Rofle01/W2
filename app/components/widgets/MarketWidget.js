"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, EyeOff, Coins, Plus, Trash2, Search, Filter, Download, Upload, FileSpreadsheet, FileJson, CheckCircle, Save, FolderOpen } from "lucide-react";
import * as LucideIcons from "lucide-react";
import useWidgetStore from "../../store/useWidgetStore";
import { exportToFile, parseImportFile } from "../../lib/excelUtils";
import { syncLocalMarketItems } from "../../lib/marketUtils";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

const formatCompactNumber = (number) => {
    if (!number) return "0";
    return new Intl.NumberFormat('tr-TR', {
        notation: "compact",
        maximumFractionDigits: 1
    }).format(number);
};

// Performance Optimized Input Component
const PriceInput = ({ value, onChange }) => {
    const [localValue, setLocalValue] = useState(value);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleBlur = () => {
        if (localValue !== value) {
            onChange(localValue);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.target.blur();
        }
    };

    return (
        <input
            type="number"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-32 px-2 py-1 text-sm font-semibold text-white bg-black/50 border border-white/10 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 placeholder:text-white/20"
            min="0"
        />
    );
};

// ============================================================================
// SUMMARY VIEW COMPONENT
// ============================================================================
function MarketSummaryView() {
    // Store Data
    const masterRegistry = useWidgetStore((state) => state.masterRegistry);
    const activeServerId = useWidgetStore((state) => state.activeServerId);
    const serverProfiles = useWidgetStore((state) => state.serverProfiles);

    // Get Active Server Prices
    const activeProfile = useMemo(() =>
        serverProfiles.find(p => p.id === activeServerId),
        [serverProfiles, activeServerId]
    );
    const prices = activeProfile?.prices || {};

    const stats = useMemo(() => {
        const totalItems = masterRegistry.length;
        const itemsWithPrice = masterRegistry.filter(item => (prices[item.id] || 0) > 0).length;
        const totalValue = masterRegistry.reduce((sum, item) => sum + (prices[item.id] || 0), 0);
        return { totalItems, itemsWithPrice, totalValue };
    }, [masterRegistry, prices]);

    return (
        <div className="flex flex-col items-center justify-center h-full w-full overflow-hidden">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-violet-500/20 backdrop-blur-sm rounded-lg border border-white/5">
                    <Coins className="w-8 h-8 text-violet-400" />
                </div>
            </div>
            <span className="text-3xl font-bold text-white whitespace-nowrap drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                {stats.itemsWithPrice} Fiyatlı
            </span>
            <span className="text-sm text-violet-300 mt-1 font-mono drop-shadow-[0_0_8px_rgba(167,139,250,0.5)]">
                Toplam: {formatCompactNumber(stats.totalValue)} {activeProfile?.currency || "Won"}
            </span>
            <span className="text-xs text-white/40 mt-2 bg-white/5 px-2 py-1 rounded">
                Sunucu: {activeProfile?.name || "Bilinmiyor"}
            </span>
        </div>
    );
}

// ============================================================================
// DETAIL VIEW COMPONENT
// ============================================================================
// ============================================================================
// DETAIL VIEW COMPONENT
// ============================================================================
function MarketDetailView({ id }) {
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

    // Calculate total value
    const totalValue = useMemo(() => {
        return filteredItems.reduce((sum, item) => sum + item.price, 0);
    }, [filteredItems]);

    // ========================================================================
    // HANDLERS
    // ========================================================================

    // Handle price update
    const handlePriceChange = (itemId, newPrice) => {
        const price = parseFloat(newPrice);
        if (!isNaN(price) && price >= 0) {
            updatePrice(itemId, price);
        }
    };

    // Handle add new item to registry
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

    // Handle load profile (Switch Server)
    const handleSwitchServer = (serverId) => {
        setActiveServer(serverId);
        const server = serverProfiles.find(p => p.id === serverId);
        setSuccessMessage(`✅ Sunucu değiştirildi: ${server?.name}`);
        setTimeout(() => setSuccessMessage(""), 3000);
    };

    // Handle save profile (Add New Server)
    const handleAddServer = () => {
        if (profileName.trim()) {
            addServerProfile(profileName);
            setProfileName("");
            setShowProfileModal(false);
            setSuccessMessage(`✅ Yeni sunucu eklendi: ${profileName}`);
            setTimeout(() => setSuccessMessage(""), 3000);
        }
    };

    // Handle export
    const handleExport = async (format) => {
        const result = await exportToFile(displayItems, `piyasa-${activeProfile?.name}-${Date.now()}`, format);
        if (result.success) {
            setSuccessMessage(`✅ ${format.toUpperCase()} dosyası indirildi!`);
            setTimeout(() => setSuccessMessage(""), 3000);
        }
    };

    // Handle import
    const handleImport = async (file) => {
        try {
            // 1. Parse file
            const result = await parseImportFile(file);
            if (!result.success) {
                alert(result.message);
                return;
            }

            const importedData = result.data;

            // 2. Sync with registry (Add new items if any)
            const { newRegistryItems, idMap } = syncLocalMarketItems(importedData, masterRegistry);

            // 3. Register new items
            if (newRegistryItems.length > 0) {
                newRegistryItems.forEach(item => registerItem(item));
            }

            // 4. Update prices
            let updatedCount = 0;
            importedData.forEach(item => {
                const itemId = idMap[item.name] || item.id; // Try to find ID
                if (itemId) {
                    const price = parseFloat(item.price) || 0;
                    updatePrice(itemId, price);
                    updatedCount++;
                }
            });

            // Success message
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

    // Handle Reset Data
    const handleResetData = (scope) => {
        resetMarketData(scope);
        setShowResetModal(false);
        setSuccessMessage(scope === 'full' ? "⚠️ Tüm veriler sıfırlandı!" : "⚠️ Fiyatlar sıfırlandı!");
        setTimeout(() => setSuccessMessage(""), 3000);
    };

    // File handlers
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

    const iconOptions = [
        "Circle", "Star", "Diamond", "Gem", "Crown", "Shield", "Sword",
        "Zap", "Heart", "Sparkles", "Award", "Package", "Gift"
    ];

    return (
        <div className="space-y-6 h-full flex flex-col">
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

            {/* Header Stats & Profile Management */}
            <div className="bg-white/5 backdrop-blur-xl p-4 rounded-xl border border-white/10">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <p className="text-sm text-white/70">Toplam Piyasa Değeri ({activeProfile?.name})</p>
                        <p className="text-2xl font-bold text-cyan-400">
                            {formatCurrency(totalValue)} {activeProfile?.currency}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowResetModal(true)}
                            className="p-2 bg-red-600/20 backdrop-blur-sm text-red-400 rounded-lg hover:bg-red-600/40 transition-colors border border-red-500/30"
                            title="Verileri Sıfırla"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setShowDataModal(true)}
                            className="p-2 bg-violet-600/20 backdrop-blur-sm text-violet-400 rounded-lg hover:bg-violet-600/40 transition-colors border border-violet-500/30"
                            title="Veri İşlemleri"
                        >
                            <Download className="w-5 h-5" />
                        </button>
                        <div className="text-right">
                            <p className="text-sm text-white/70">Gösterilen</p>
                            <p className="text-2xl font-bold text-white">
                                {filteredItems.length} / {displayItems.length}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Server Selection */}
                <div className="flex items-center gap-2 pt-3 border-t border-white/10">
                    <FolderOpen className="w-4 h-4 text-white/60" />
                    <select
                        value={activeServerId}
                        onChange={(e) => handleSwitchServer(e.target.value)}
                        className="flex-1 px-3 py-2 text-sm font-medium text-white bg-black/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50"
                    >
                        {serverProfiles.map(profile => (
                            <option key={profile.id} value={profile.id} className="bg-zinc-900">
                                {profile.name}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={() => setShowProfileModal(true)}
                        className="px-4 py-2 bg-cyan-600/20 backdrop-blur-sm text-cyan-400 rounded-lg hover:bg-cyan-600/40 transition-colors text-sm font-medium border border-cyan-500/30 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Yeni Sunucu
                    </button>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="space-y-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Eşya ara..."
                        className="w-full pl-10 pr-4 py-2 font-medium text-white bg-black/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 placeholder:text-white/20 backdrop-blur-sm transition-all"
                    />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <Filter className="w-4 h-4 text-white/60" />
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all backdrop-blur-sm ${selectedCategory === cat
                                ? "bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 shadow-md"
                                : "bg-white/5 text-white/70 hover:bg-white/10 border border-white/10"
                                }`}
                        >
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-cyan-600/20 backdrop-blur-sm text-cyan-400 rounded-lg hover:bg-cyan-600/40 transition-colors font-medium border border-cyan-500/30"
                >
                    <Plus className="w-5 h-5" />
                    Yeni Eşya Ekle
                </button>
            </div>

            {/* Add Form */}
            <AnimatePresence>
                {showAddForm && (
                    <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        onSubmit={handleAddItem}
                        className="bg-white/5 backdrop-blur-xl p-4 rounded-xl border border-white/10 space-y-3"
                    >
                        <h3 className="font-semibold text-white mb-2">Yeni Eşya Bilgileri</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <input
                                type="text"
                                value={newItem.name}
                                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                className="px-3 py-2 font-medium text-white bg-black/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 placeholder:text-white/20"
                                placeholder="Eşya adı"
                                required
                            />
                            <input
                                type="text"
                                value={newItem.category}
                                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                                className="px-3 py-2 font-medium text-white bg-black/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 placeholder:text-white/20"
                                placeholder="Kategori"
                            />
                            <select
                                value={newItem.icon}
                                onChange={(e) => setNewItem({ ...newItem, icon: e.target.value })}
                                className="col-span-2 px-3 py-2 font-medium text-white bg-black/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50"
                            >
                                {iconOptions.map((icon) => (
                                    <option key={icon} value={icon} className="bg-zinc-900">{icon}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="flex-1 px-4 py-2 bg-cyan-600/20 text-cyan-400 rounded-lg hover:bg-cyan-600/40 transition-colors text-sm font-medium border border-cyan-500/30"
                            >
                                Ekle
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowAddForm(false)}
                                className="px-4 py-2 bg-white/5 text-white/80 rounded-lg hover:bg-white/10 transition-colors text-sm font-medium border border-white/10"
                            >
                                İptal
                            </button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            {/* Server Add Modal */}
            {showProfileModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowProfileModal(false)}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-white">Yeni Sunucu Ekle</h3>
                            <button
                                onClick={() => setShowProfileModal(false)}
                                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-white/70" />
                            </button>
                        </div>
                        <p className="text-sm text-white/70 mb-4">
                            Yeni bir sunucu profili oluşturun.
                        </p>
                        <input
                            type="text"
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                            placeholder="Sunucu adı..."
                            className="w-full px-3 py-2 font-medium text-white bg-black/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 placeholder:text-white/20 mb-4"
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={handleAddServer}
                                disabled={!profileName.trim()}
                                className="flex-1 px-4 py-2 bg-cyan-600/20 text-cyan-400 rounded-lg hover:bg-cyan-600/40 transition-colors font-medium border border-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Ekle
                            </button>
                            <button
                                onClick={() => setShowProfileModal(false)}
                                className="px-4 py-2 bg-white/5 text-white/80 rounded-lg hover:bg-white/10 transition-colors font-medium border border-white/10"
                            >
                                İptal
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Reset Confirmation Modal */}
            {showResetModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowResetModal(false)}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative bg-black/80 backdrop-blur-xl border border-red-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl shadow-red-900/20"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Trash2 className="w-6 h-6 text-red-500" />
                                Veri Temizliği
                            </h3>
                            <button
                                onClick={() => setShowResetModal(false)}
                                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-white/70" />
                            </button>
                        </div>
                        <p className="text-white/80 mb-6">
                            Yapmak istediğiniz işlemi seçin. <br />
                            <span className="text-red-400 font-bold">Bu işlem geri alınamaz!</span>
                        </p>

                        <div className="space-y-3">
                            <button
                                onClick={() => handleResetData('prices')}
                                className="w-full px-4 py-3 bg-amber-600/20 text-amber-400 rounded-lg hover:bg-amber-600/40 transition-colors font-medium border border-amber-500/30 flex items-center justify-center gap-2"
                            >
                                <Coins className="w-5 h-5" />
                                Sadece Fiyatları Sıfırla
                            </button>

                            <button
                                onClick={() => handleResetData('full')}
                                className="w-full px-4 py-3 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/40 transition-colors font-medium border border-red-500/30 flex items-center justify-center gap-2"
                            >
                                <Trash2 className="w-5 h-5" />
                                Tüm Verileri Sil (Fabrika Ayarları)
                            </button>

                            <button
                                onClick={() => setShowResetModal(false)}
                                className="w-full px-4 py-3 bg-white/5 text-white/80 rounded-lg hover:bg-white/10 transition-colors font-medium border border-white/10"
                            >
                                İptal
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Data Import/Export Modal */}
            {showDataModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowDataModal(false)}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-white">Veri İşlemleri</h3>
                            <button
                                onClick={() => setShowDataModal(false)}
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
                                İndir
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
                                    Piyasa fiyatlarınızı Excel veya JSON formatında indirin.
                                </p>
                                <button
                                    onClick={() => handleExport("excel")}
                                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-green-600/20 backdrop-blur-sm text-green-400 rounded-lg hover:bg-green-600/40 transition-colors font-medium border border-green-500/30"
                                >
                                    <FileSpreadsheet className="w-5 h-5" />
                                    Excel (.xlsx) İndir
                                </button>
                                <button
                                    onClick={() => handleExport("json")}
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
                                    Excel (.xlsx) veya JSON dosyası yükleyin.
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
            )}

            {/* Items Table */}
            <div className="flex-1 overflow-auto rounded-xl border border-white/10 backdrop-blur-sm">
                <table className="w-full">
                    <thead className="bg-black/80 sticky top-0 backdrop-blur-xl">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-cyan-400 uppercase">İkon</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-cyan-400 uppercase">Eşya Adı</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-cyan-400 uppercase">Kategori</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-cyan-400 uppercase">Fiyat ({activeProfile?.currency})</th>
                        </tr>
                    </thead>
                    <tbody className="bg-transparent divide-y divide-white/5">
                        {filteredItems.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-4 py-12 text-center text-white/40">
                                    <div className="flex flex-col items-center justify-center">
                                        <Search className="w-12 h-12 mb-3 opacity-20" />
                                        <p className="font-medium text-lg">Liste Boş</p>
                                        <p className="text-sm mt-1 max-w-xs mx-auto">
                                            "{searchQuery}" aramasına uygun eşya yok veya henüz hiç eşya eklemediniz.
                                        </p>
                                        <button
                                            onClick={() => setShowAddForm(true)}
                                            className="mt-4 text-cyan-400 hover:text-cyan-300 text-sm font-medium flex items-center gap-2 transition-colors"
                                        >
                                            <Plus className="w-4 h-4" />
                                            İlk Eşyayı Ekle
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredItems.map((item) => {
                                const ItemIcon = LucideIcons[item.icon] || LucideIcons.Circle;
                                return (
                                    <tr key={item.id} className="hover:bg-cyan-500/10 transition-colors group">
                                        <td className="px-4 py-3">
                                            <div className="p-2 bg-white/5 rounded-lg w-fit group-hover:bg-cyan-500/20 transition-colors border border-white/10">
                                                <ItemIcon className="w-5 h-5 text-white/70 group-hover:text-cyan-400" />
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-sm font-medium text-white">{item.name}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-1 bg-white/5 text-white/80 rounded text-xs font-medium border border-white/10">
                                                {item.category}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <PriceInput
                                                value={item.price}
                                                onChange={(newPrice) => handlePriceChange(item.id, newPrice)}
                                            />
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="bg-white/5 backdrop-blur-sm p-3 rounded-lg border border-white/10 flex items-center justify-between text-sm">
                <span className="text-white/70">
                    Toplam <strong className="text-white">{filteredItems.length}</strong> eşya gösteriliyor
                </span>
                <span className="text-white/70">
                    Değer: <strong className="text-cyan-400">{formatCurrency(totalValue)}</strong> {activeProfile?.currency}
                </span>
            </div>
        </div>
    );
}

// ============================================================================
// MAIN WIDGET
// ============================================================================
export default function MarketWidget({ id, type, data, isSelected, onClick, onHide }) {
    return (
        <motion.div
            layoutId={`card-${id}`}
            layout
            onClick={!isSelected ? onClick : undefined}
            className={`group rounded-3xl shadow-2xl cursor-pointer overflow-hidden backdrop-blur-xl border border-white/10 ${isSelected
                ? "fixed inset-0 m-auto w-[90%] h-[90%] max-w-6xl z-[100] bg-black/90 border border-white/10"
                : "relative h-64 hover:-translate-y-1 hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.1)] transition-all duration-300 bg-black/40 hover:bg-black/50 border border-white/10"
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
                className="absolute top-4 right-4 z-20 p-2 bg-white/10 backdrop-blur-sm shadow-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-white/60 hover:text-red-400 hover:bg-red-500/20 border border-white/20"
            >
                <EyeOff className="w-4 h-4" />
            </motion.button>

            {/* Summary View */}
            {!isSelected && (
                <div className="w-full h-full p-6 relative">
                    <Coins className="absolute -bottom-4 -right-4 w-32 h-32 text-white/5 opacity-50 rotate-12 pointer-events-none" />
                    <MarketSummaryView />
                </div>
            )}

            {/* Detail View */}
            {isSelected && (
                <div className="flex flex-col h-full bg-black/20">
                    <div className="flex items-center justify-between p-8 border-b border-white/20 bg-white/5 backdrop-blur-xl">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                                <Coins className="w-8 h-8 text-cyan-400" />
                            </div>
                            <div>
                                <motion.h2 layoutId={`title-${id}`} className="text-2xl font-bold text-white">
                                    Piyasa Fiyatları
                                </motion.h2>
                                <p className="text-white/60">Eşya fiyatlarını görüntüle ve yönet</p>
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
                    <div className="flex-1 p-8 overflow-hidden">
                        <MarketDetailView id={id} />
                    </div>
                </div>
            )}
        </motion.div>
    );
}
