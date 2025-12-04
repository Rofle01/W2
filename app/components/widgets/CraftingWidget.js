"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { X, EyeOff, Wrench, Plus, Trash2, Package, Sparkles, PieChart } from "lucide-react";
import useWidgetStore from "../../store/useWidgetStore";
import { resolveItemPrice } from "../../lib/calculator";
import { useSharedWidgetData } from "../../hooks/useSharedWidgetData";

// Helper: Format currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

// Helper: Circular Dependency Check (DFS)
const hasCircularDependency = (candidateId, targetId, allItems, visited = new Set()) => {
    if (candidateId === targetId) return true;
    if (visited.has(candidateId)) return false;

    visited.add(candidateId);
    const candidateItem = allItems.find(i => i.id === candidateId);
    if (!candidateItem || !candidateItem.contents) return false;

    return candidateItem.contents.some(content => {
        if (content.sourceType === 'crafting') {
            return hasCircularDependency(content.itemId, targetId, allItems, visited);
        }
        return false;
    });
};

// ============================================================================
// SUMMARY VIEW COMPONENT
// ============================================================================
function CraftingSummaryView() {
    const craftingItems = useWidgetStore((state) => state.craftingItems);
    const stats = useMemo(() => {
        const totalRecipes = craftingItems.filter(item => item.type === 'recipe').length;
        const totalContainers = craftingItems.filter(item => item.type === 'container').length;
        const totalFragments = craftingItems.filter(item => item.type === 'fragment').length;
        return { totalRecipes, totalContainers, totalFragments, total: craftingItems.length };
    }, [craftingItems]);

    return (
        <div className="flex flex-col items-center justify-center h-full w-full overflow-hidden">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-fuchsia-500/20 backdrop-blur-sm rounded-lg border border-fuchsia-500/30">
                    <Wrench className="w-8 h-8 text-fuchsia-400" />
                </div>
            </div>
            <span className="text-3xl font-bold text-white whitespace-nowrap">
                {stats.total} Öğe
            </span>
            <div className="flex gap-3 mt-2 text-sm">
                <span className="text-cyan-300 font-mono">
                    {stats.totalRecipes} Reçete
                </span>
                <span className="text-white/30">•</span>
                <span className="text-violet-300 font-mono">
                    {stats.totalContainers} Sandık
                </span>
                <span className="text-white/30">•</span>
                <span className="text-amber-300 font-mono">
                    {stats.totalFragments} Parça
                </span>
            </div>
        </div>
    );
}

// ============================================================================
// DETAIL VIEW COMPONENT
// ============================================================================
function CraftingDetailView({ metinList, marketItems }) {
    const craftingItems = useWidgetStore((state) => state.craftingItems);
    const addCraftingItem = useWidgetStore((state) => state.addCraftingItem);
    const removeCraftingItem = useWidgetStore((state) => state.removeCraftingItem);
    const updateCraftingItem = useWidgetStore((state) => state.updateCraftingItem);
    const addContentToItem = useWidgetStore((state) => state.addContentToItem);
    const removeContentFromItem = useWidgetStore((state) => state.removeContentFromItem);

    const [selectedItemId, setSelectedItemId] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newItemType, setNewItemType] = useState('recipe');

    // New content form state
    const [newContent, setNewContent] = useState({
        sourceType: 'market',
        itemId: '',
        count: 1,
        chance: 100
    });

    const selectedItem = useMemo(() => {
        return craftingItems.find(item => item.id === selectedItemId);
    }, [craftingItems, selectedItemId]);

    // Calculate price for selected item (Preview)
    // Note: This uses the calculator lib for display, but the "Push" logic happens in the main widget
    const calculatedPrice = useMemo(() => {
        if (!selectedItem) return 0;
        return resolveItemPrice(
            selectedItem.id,
            'crafting',
            marketItems,
            craftingItems,
            metinList,
            0
        );
    }, [selectedItem, marketItems, craftingItems, metinList]);

    // Handle add new crafting item
    const handleAddItem = () => {
        const name = newItemType === 'recipe' ? 'Yeni Reçete' :
            newItemType === 'container' ? 'Yeni Sandık' : 'Yeni Parça';
        addCraftingItem(name, newItemType);
        setShowAddModal(false);
    };

    // Handle delete item
    const handleDeleteItem = (id) => {
        if (confirm("Bu öğeyi silmek istediğinizden emin misiniz?")) {
            removeCraftingItem(id);
            if (selectedItemId === id) {
                setSelectedItemId(null);
            }
        }
    };

    // Handle add content to selected item
    const handleAddContent = (e) => {
        e.preventDefault();
        if (!selectedItem || !newContent.itemId) return;

        addContentToItem(selectedItem.id, {
            itemId: newContent.itemId,
            sourceType: newContent.sourceType,
            count: parseInt(newContent.count) || 1,
            chance: parseFloat(newContent.chance) || 100
        });

        // Reset form
        setNewContent({
            sourceType: 'market',
            itemId: '',
            count: 1,
            chance: 100
        });
    };

    // Handle Target Change (Explicit Target Reference)
    const handleTargetChange = (e) => {
        const value = e.target.value;
        if (!value) {
            updateCraftingItem(selectedItem.id, { targetId: null, targetType: null });
            return;
        }

        // Check if it's a Metin
        const isMetin = metinList.some(m => m.id === value);
        if (isMetin) {
            updateCraftingItem(selectedItem.id, { targetId: value, targetType: 'metin' });
        } else {
            // Assume it's a crafting item
            updateCraftingItem(selectedItem.id, { targetId: value, targetType: 'crafting' });
        }
    };

    // Preview Metin Data (Strict Type Check)
    const targetMetinPreview = useMemo(() => {
        if (selectedItem?.type === 'fragment' && selectedItem?.targetType === 'metin' && selectedItem?.targetId) {
            const metin = metinList.find(m => m.id === selectedItem.targetId);
            if (!metin) return null;

            const totalDropValue = metin.drops.reduce((acc, drop) => {
                const item = marketItems.find(i => i.id === drop.itemId || i.originalId === drop.itemId);
                const price = item ? item.price : 0;
                const avgCount = (drop.minCount + drop.maxCount) / 2; // Assuming min/max or just count
                // Fallback if min/max not present
                const count = drop.count || avgCount || 1;
                return acc + (price * count * (drop.chance / 100));
            }, 0);

            return {
                ...metin,
                totalDropValue
            };
        }
        return null;
    }, [selectedItem, metinList, marketItems]);

    // Get available items for dropdown (based on sourceType)
    const availableItems = useMemo(() => {
        if (newContent.sourceType === 'market') {
            return marketItems;
        } else {
            return craftingItems.filter(item => {
                const isSelf = item.id === selectedItemId;
                if (isSelf) return false;
                const createsCycle = hasCircularDependency(item.id, selectedItemId, craftingItems);
                return !createsCycle;
            });
        }
    }, [newContent.sourceType, marketItems, craftingItems, selectedItemId]);

    // Get item name by ID and type
    const getItemName = (itemId, sourceType) => {
        if (sourceType === 'market') {
            const item = marketItems.find(i => i.id === itemId || i.originalId === itemId);
            return item ? item.name : 'Bilinmeyen';
        } else {
            const item = craftingItems.find(i => i.id === itemId);
            return item ? item.name : 'Bilinmeyen';
        }
    };

    return (
        <div className="grid grid-cols-2 gap-6 h-full">
            {/* LEFT COLUMN - Item List */}
            <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">Sanal Eşyalar</h3>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-3 py-2 bg-fuchsia-600/20 backdrop-blur-sm text-fuchsia-400 rounded-lg hover:bg-fuchsia-600/40 transition-colors font-medium border border-fuchsia-500/30"
                    >
                        <Plus className="w-4 h-4" />
                        Yeni Ekle
                    </button>
                </div>

                {/* Item List */}
                <div className="flex-1 overflow-auto space-y-2 pr-2">
                    {craftingItems.length === 0 ? (
                        <div className="text-center text-white/50 py-8">
                            Henüz öğe eklenmedi
                        </div>
                    ) : (
                        craftingItems.map((item) => (
                            <motion.div
                                key={item.id}
                                whileHover={{ scale: 1.02 }}
                                onClick={() => setSelectedItemId(item.id)}
                                className={`p-4 rounded-lg cursor-pointer transition-all border ${selectedItemId === item.id
                                    ? 'bg-fuchsia-600/20 border-fuchsia-500/50 shadow-lg shadow-fuchsia-500/20'
                                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {item.type === 'recipe' ? (
                                            <Sparkles className="w-5 h-5 text-cyan-400" />
                                        ) : item.type === 'container' ? (
                                            <Package className="w-5 h-5 text-violet-400" />
                                        ) : (
                                            <PieChart className="w-5 h-5 text-amber-400" />
                                        )}
                                        <div>
                                            <p className="text-sm font-medium text-white">{item.name}</p>
                                            <p className="text-xs text-white/50">
                                                {item.type === 'recipe' ? 'Reçete' : item.type === 'container' ? 'Sandık' : 'Parça'} • {item.contents?.length || 0} içerik
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteItem(item.id);
                                        }}
                                        className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {/* RIGHT COLUMN - Detail & Editor */}
            <div className="flex flex-col space-y-4 border-l border-white/10 pl-6">
                {!selectedItem ? (
                    <div className="flex items-center justify-center h-full text-white/50">
                        Bir öğe seçin
                    </div>
                ) : (
                    <>
                        {/* Item Name Editor */}
                        <div className="bg-white/5 backdrop-blur-xl p-4 rounded-xl border border-white/10">
                            <label className="block text-sm text-white/70 mb-2">Öğe Adı</label>
                            <input
                                type="text"
                                value={selectedItem.name}
                                onChange={(e) => updateCraftingItem(selectedItem.id, { name: e.target.value })}
                                className="w-full px-3 py-2 font-medium text-white bg-black/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 focus:border-fuchsia-500/50 placeholder:text-white/20"
                            />
                        </div>

                        {/* Calculated Price Display */}
                        <div className="bg-gradient-to-br from-fuchsia-600/20 to-cyan-600/20 backdrop-blur-xl p-4 rounded-xl border border-fuchsia-500/30">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-white/70">Hesaplanan Değer</span>
                                <span className="text-2xl font-bold text-fuchsia-400">
                                    {formatCurrency(calculatedPrice)} Yang
                                </span>
                            </div>
                            <p className="text-xs text-white/50 mt-1">Otomatik olarak Market'e eklendi ve kilitlendi 🔒</p>
                        </div>

                        {/* Fragment-specific UI */}
                        {selectedItem.type === 'fragment' ? (
                            <>
                                {/* Target Item Selector */}
                                <div className="bg-white/5 backdrop-blur-xl p-4 rounded-xl border border-white/10">
                                    <label className="block text-sm text-white/70 mb-2">Hangi Eşyanın Parçası?</label>
                                    <select
                                        value={selectedItem.targetId || ''}
                                        onChange={handleTargetChange}
                                        className="w-full px-3 py-2 font-medium text-white bg-black/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50"
                                    >
                                        <option value="" className="bg-zinc-900">Hedef Eşya Seçiniz...</option>

                                        <optgroup label="Sanal Eşyalar" className="bg-zinc-900 text-white/50">
                                            {craftingItems
                                                .filter(item => item.id !== selectedItem.id)
                                                .map((item) => (
                                                    <option key={item.id} value={item.id} className="bg-zinc-900 text-white">
                                                        {item.name}
                                                    </option>
                                                ))}
                                        </optgroup>

                                        {metinList && metinList.length > 0 && (
                                            <optgroup label="Metinler" className="bg-zinc-900 text-white/50">
                                                {metinList.map((metin) => (
                                                    <option key={metin.id} value={metin.id} className="bg-zinc-900 text-white">
                                                        {metin.name}
                                                    </option>
                                                ))}
                                            </optgroup>
                                        )}
                                    </select>

                                    {/* Metin Preview Card */}
                                    {targetMetinPreview && (
                                        <div className="mt-4 bg-black/30 border border-white/10 rounded-lg p-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-amber-400 font-bold text-sm">{targetMetinPreview.name}</span>
                                                <span className="text-white/80 text-xs font-mono">
                                                    ~{formatCurrency(targetMetinPreview.totalDropValue)} Yang
                                                </span>
                                            </div>
                                            <div className="max-h-32 overflow-y-auto pr-1 space-y-1 custom-scrollbar">
                                                {targetMetinPreview.drops.map((drop, idx) => {
                                                    const item = marketItems.find(i => i.id === drop.itemId || i.originalId === drop.itemId);
                                                    return (
                                                        <div key={idx} className="flex justify-between text-xs text-white/60">
                                                            <span>{item ? item.name : '???'}</span>
                                                            <span>{drop.minCount || drop.count}-{drop.maxCount || drop.count} (%{drop.chance})</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Amount Input */}
                                <div className="bg-white/5 backdrop-blur-xl p-4 rounded-xl border border-white/10">
                                    <label className="block text-sm text-white/70 mb-2">Kaç Parça Birleşiyor?</label>
                                    <input
                                        type="number"
                                        value={selectedItem.amount || 1}
                                        onChange={(e) => updateCraftingItem(selectedItem.id, { amount: parseInt(e.target.value) || 1 })}
                                        className="w-full px-3 py-2 font-semibold text-white bg-black/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50"
                                        min="1"
                                    />
                                    <p className="text-xs text-white/50 mt-2">
                                        Bu kadar parça birleşerek hedef eşyayı oluşturur
                                    </p>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
                                {/* Contents List */}
                                <div className="flex-1 overflow-auto">
                                    <h4 className="text-sm font-semibold text-white mb-3">İçerik Listesi</h4>
                                    <div className="space-y-2">
                                        {selectedItem.contents?.length === 0 ? (
                                            <div className="text-center text-white/50 py-4 text-sm">
                                                İçerik eklenmedi
                                            </div>
                                        ) : (
                                            selectedItem.contents?.map((content) => (
                                                <div
                                                    key={content.id}
                                                    className="bg-white/5 p-3 rounded-lg border border-white/10 flex items-center justify-between"
                                                >
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-white">
                                                            {getItemName(content.itemId, content.sourceType)}
                                                        </p>
                                                        <div className="flex gap-3 mt-1 text-xs text-white/60">
                                                            <span className={content.sourceType === 'market' ? 'text-cyan-400' : 'text-violet-400'}>
                                                                {content.sourceType === 'market' ? 'Market' : 'Crafting'}
                                                            </span>
                                                            <span>Adet: {content.count}</span>
                                                            {selectedItem.type === 'container' && (
                                                                <span>Şans: %{content.chance}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => removeContentFromItem(selectedItem.id, content.id)}
                                                        className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Add Content Form */}
                                <form onSubmit={handleAddContent} className="bg-white/5 backdrop-blur-xl p-4 rounded-xl border border-white/10 space-y-3">
                                    <h4 className="text-sm font-semibold text-white">Yeni İçerik Ekle</h4>

                                    {/* Source Type Dropdown */}
                                    <div>
                                        <label className="block text-xs text-white/70 mb-1">Kaynak Tipi</label>
                                        <select
                                            value={newContent.sourceType}
                                            onChange={(e) => setNewContent({ ...newContent, sourceType: e.target.value, itemId: '' })}
                                            className="w-full px-3 py-2 font-medium text-white bg-black/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 focus:border-fuchsia-500/50"
                                        >
                                            <option value="market" className="bg-zinc-900">Market Eşyası</option>
                                            <option value="crafting" className="bg-zinc-900">Crafting Eşyası</option>
                                        </select>
                                    </div>

                                    {/* Item Selection Dropdown */}
                                    <div>
                                        <label className="block text-xs text-white/70 mb-1">Eşya Seçimi</label>
                                        <select
                                            value={newContent.itemId}
                                            onChange={(e) => setNewContent({ ...newContent, itemId: e.target.value })}
                                            className="w-full px-3 py-2 font-medium text-white bg-black/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 focus:border-fuchsia-500/50"
                                            required
                                        >
                                            <option value="" className="bg-zinc-900">Seçiniz...</option>
                                            {availableItems.map((item) => (
                                                <option key={item.id} value={item.id} className="bg-zinc-900">
                                                    {item.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Count and Chance Inputs */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs text-white/70 mb-1">Adet</label>
                                            <input
                                                type="number"
                                                value={newContent.count}
                                                onChange={(e) => setNewContent({ ...newContent, count: e.target.value })}
                                                className="w-full px-3 py-2 font-semibold text-white bg-black/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 focus:border-fuchsia-500/50"
                                                min="1"
                                                required
                                            />
                                        </div>
                                        {selectedItem.type === 'container' && (
                                            <div>
                                                <label className="block text-xs text-white/70 mb-1">Şans (%)</label>
                                                <input
                                                    type="number"
                                                    value={newContent.chance}
                                                    onChange={(e) => setNewContent({ ...newContent, chance: e.target.value })}
                                                    className="w-full px-3 py-2 font-semibold text-white bg-black/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 focus:border-fuchsia-500/50"
                                                    min="0"
                                                    max="100"
                                                    step="0.01"
                                                    required
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-cyan-600/20 backdrop-blur-sm text-cyan-400 rounded-lg hover:bg-cyan-600/40 transition-colors font-medium border border-cyan-500/30"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Ekle
                                    </button>
                                </form>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Add Item Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowAddModal(false)}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl"
                    >
                        <h3 className="text-xl font-bold text-white mb-4">Yeni Öğe Ekle</h3>

                        <div className="space-y-3">
                            <label className="block text-sm text-white/70 mb-2">Öğe Tipi Seçin</label>

                            <button
                                onClick={() => setNewItemType('recipe')}
                                className={`w-full p-4 rounded-lg border transition-all ${newItemType === 'recipe'
                                    ? 'bg-cyan-600/20 border-cyan-500/50 text-cyan-400'
                                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Sparkles className="w-6 h-6" />
                                    <div className="text-left">
                                        <p className="font-semibold">Reçete (Recipe)</p>
                                        <p className="text-xs opacity-70">X + Y = Z (Dönüşüm)</p>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => setNewItemType('container')}
                                className={`w-full p-4 rounded-lg border transition-all ${newItemType === 'container'
                                    ? 'bg-violet-600/20 border-violet-500/50 text-violet-400'
                                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Package className="w-6 h-6" />
                                    <div className="text-left">
                                        <p className="font-semibold">Sandık (Container)</p>
                                        <p className="text-xs opacity-70">%X şansla Y çıkar (Boss/Sandık)</p>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => setNewItemType('fragment')}
                                className={`w-full p-4 rounded-lg border transition-all ${newItemType === 'fragment'
                                    ? 'bg-amber-600/20 border-amber-500/50 text-amber-400'
                                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <PieChart className="w-6 h-6" />
                                    <div className="text-left">
                                        <p className="font-semibold">Parça / Hisse (Fragment)</p>
                                        <p className="text-xs opacity-70">Bütünün bir parçası (Tersine değerleme)</p>
                                    </div>
                                </div>
                            </button>
                        </div>

                        <div className="flex gap-2 mt-6">
                            <button
                                onClick={handleAddItem}
                                className="flex-1 px-4 py-2 bg-fuchsia-600/20 text-fuchsia-400 rounded-lg hover:bg-fuchsia-600/40 transition-colors font-medium border border-fuchsia-500/30"
                            >
                                Oluştur
                            </button>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="px-4 py-2 bg-white/5 text-white/80 rounded-lg hover:bg-white/10 transition-colors font-medium border border-white/10"
                            >
                                İptal
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

// ============================================================================
// MAIN WIDGET
// ============================================================================
export default function CraftingWidget({ id, data, isSelected, onClick, onHide }) {
    // Diğer widgetlardan gelen verileri çekiyoruz
    const { metinList, marketItems } = useSharedWidgetData();

    // Store Data & Actions
    const craftingItems = useWidgetStore((state) => state.craftingItems);
    const syncCraftedItems = useWidgetStore((state) => state.syncCraftedItems);

    // ✅ THE BRIDGE: OTOMATİK SENKRONİZASYON
    // Crafting listesi veya market fiyatları değiştiğinde,
    // üretim itemlarının maliyetlerini hesapla ve Markete gönder.
    useEffect(() => {
        if (!craftingItems.length) return;

        const updates = craftingItems.map(item => {
            // Basit Maliyet Hesabı (Single-level calculation for stability)
            // Note: Circular dependencies are mostly handled by the fact that if A needs B,
            // and B is also a crafted item, B's price will be in 'marketItems' if it was synced previously.
            // React's update cycle will eventually settle the prices.

            let calculatedCost = 0;

            if (item.type === 'recipe' && item.contents) {
                // Reçete: İçeriklerin toplamı
                calculatedCost = item.contents.reduce((total, content) => {
                    // İçerik markette var mı?
                    const ingredient = marketItems.find(i => i.id === content.itemId || i.originalId === content.itemId);
                    const price = ingredient ? ingredient.price : 0;
                    return total + (price * content.count);
                }, 0);
            }
            else if (item.type === 'fragment' && item.targetId) {
                // Parça: Hedef item / Adet
                if (item.targetType === 'metin') {
                    // Metin değeri hesapla
                    const metin = metinList.find(m => m.id === item.targetId);
                    if (metin) {
                        const totalDropValue = metin.drops.reduce((acc, drop) => {
                            const dropItem = marketItems.find(i => i.id === drop.itemId || i.originalId === drop.itemId);
                            const price = dropItem ? dropItem.price : 0;
                            // Use avg count if min/max exists, else count
                            const count = drop.minCount ? (drop.minCount + drop.maxCount) / 2 : drop.count;
                            return acc + (price * count * (drop.chance / 100));
                        }, 0);
                        calculatedCost = totalDropValue / (item.amount || 1);
                    }
                } else {
                    // Normal item hedefli
                    const target = marketItems.find(i => i.id === item.targetId || i.originalId === item.targetId);
                    const targetPrice = target ? target.price : 0;
                    const amount = item.amount || 1;
                    calculatedCost = targetPrice / amount;
                }
            }
            else if (item.type === 'container' && item.contents) {
                // Sandık: Beklenen Değer (Expected Value)
                calculatedCost = item.contents.reduce((total, content) => {
                    const dropItem = marketItems.find(i => i.id === content.itemId || i.originalId === content.itemId);
                    const price = dropItem ? dropItem.price : 0;
                    const chance = (content.chance || 0) / 100;
                    return total + (price * content.count * chance);
                }, 0);
            }

            return {
                id: item.id,
                name: item.name,
                price: calculatedCost
            };
        });

        // Hepsini Markete İt
        // Debounce could be added here if performance becomes an issue, but for now direct sync is more responsive.
        syncCraftedItems(updates);

    }, [craftingItems, marketItems, syncCraftedItems, metinList]);

    return (
        <motion.div
            layoutId={`card-${id}`}
            layout
            onClick={!isSelected ? onClick : undefined}
            className={`group rounded-3xl shadow-2xl cursor-pointer overflow-hidden backdrop-blur-xl border border-white/10 ${isSelected
                ? "fixed inset-0 m-auto w-[90%] h-[90%] max-w-6xl z-[100] bg-black/80"
                : "relative h-64 hover:-translate-y-1 hover:border-fuchsia-500/50 hover:shadow-[0_0_30px_rgba(217,70,239,0.1)] transition-all duration-300 bg-black/20 hover:bg-black/40"
                }`}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
            {/* Gizle Butonu */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                    e.stopPropagation();
                    onHide && onHide();
                }}
                className="absolute top-4 right-4 z-20 p-2 bg-white/10 backdrop-blur-sm shadow-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-white/60 hover:text-fuchsia-400 hover:bg-fuchsia-500/20 border border-white/20"
            >
                <EyeOff className="w-4 h-4" />
            </motion.button>

            {/* Özet Görünümü (Küçük Kart) */}
            {!isSelected && (
                <div className="w-full h-full p-6 relative">
                    <Wrench className="absolute -bottom-4 -right-4 w-32 h-32 text-white/5 opacity-50 rotate-12 pointer-events-none" />
                    <CraftingSummaryView />
                </div>
            )}

            {/* Detay Görünümü (Tam Ekran) */}
            {isSelected && (
                <div className="flex flex-col h-full bg-black/20">
                    <div className="flex items-center justify-between p-8 border-b border-white/10 bg-black/40 backdrop-blur-xl">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-fuchsia-500/10 backdrop-blur-sm rounded-2xl border border-fuchsia-500/20">
                                <Wrench className="w-8 h-8 text-fuchsia-400" />
                            </div>
                            <div>
                                <motion.h2 layoutId={`title-${id}`} className="text-2xl font-bold text-white">
                                    Üretim & Boss
                                </motion.h2>
                                <p className="text-white/60">Dönüşüm reçeteleri ve sandık içerikleri</p>
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
                        <CraftingDetailView
                            metinList={metinList}
                            marketItems={marketItems}
                        />
                    </div>
                </div>
            )}
        </motion.div>
    );
}
