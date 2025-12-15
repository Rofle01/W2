"use client";

import { useState, useMemo } from "react";
import { Wrench, Plus, Trash2, Package, Sparkles, PieChart, Search, X, Check } from "lucide-react";
import useWidgetStore from "../../store/useWidgetStore";
import { resolveItemPrice } from "../../lib/math/core";
import { formatCurrency } from "../../lib/math/formatters";
import { useSharedWidgetData } from "../../hooks/useSharedWidgetData";
import { useCraftingSync, hasCircularDependency } from "../../hooks/useCraftingSync";
import SmartInput from "../ui/SmartInput";

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

// 1. Content Editor Table (Inline Edit)
function ContentEditorTable({ item, marketItems, craftingItems, onAdd, onRemove }) {
    const [newRow, setNewRow] = useState({ sourceType: 'market', itemId: '', count: 1, chance: 100 });

    // Filter out circular deps
    const availableItems = useMemo(() => {
        if (newRow.sourceType === 'market') return marketItems;
        return craftingItems.filter(ci => ci.id !== item.id && !hasCircularDependency(ci.id, item.id, craftingItems));
    }, [newRow.sourceType, marketItems, craftingItems, item.id]);

    const handleAdd = () => {
        if (!newRow.itemId) return;
        onAdd(item.id, { ...newRow, count: Number(newRow.count), chance: Number(newRow.chance) });
        setNewRow({ sourceType: 'market', itemId: '', count: 1, chance: 100 });
    };

    const getItemName = (id, type) => {
        if (type === 'market') return marketItems.find(i => i.id === id || i.originalId === id)?.name || id;
        return craftingItems.find(i => i.id === id)?.name || id;
    };

    return (
        <div className="border border-zinc-800 rounded-lg overflow-hidden bg-zinc-900/30">
            <table className="w-full text-sm text-left">
                <thead className="bg-zinc-900 text-zinc-500 font-medium">
                    <tr>
                        <th className="p-3 w-32">Kaynak</th>
                        <th className="p-3">Eşya</th>
                        <th className="p-3 w-24 text-right">Adet</th>
                        {item.type === 'container' && <th className="p-3 w-24 text-right">Şans %</th>}
                        <th className="p-3 w-12"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                    {item.contents?.map((content, idx) => (
                        <tr key={idx} className="group hover:bg-zinc-800/30 transition-colors">
                            <td className="p-3">
                                <span className={`text-xs px-2 py-1 rounded ${content.sourceType === 'market' ? 'bg-cyan-900/30 text-cyan-400' : 'bg-red-900/30 text-red-400'}`}>
                                    {content.sourceType === 'market' ? 'Market' : 'Craft'}
                                </span>
                            </td>
                            <td className="p-3 text-zinc-300 font-medium">{getItemName(content.itemId, content.sourceType)}</td>
                            <td className="p-3 text-right text-zinc-400 font-mono">{content.count}</td>
                            {item.type === 'container' && (
                                <td className="p-3 text-right text-zinc-400 font-mono">%{content.chance}</td>
                            )}
                            <td className="p-3 text-right">
                                <button onClick={() => onRemove(item.id, content.id)} className="text-zinc-600 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 size={14} />
                                </button>
                            </td>
                        </tr>
                    ))}

                    {/* Input Row */}
                    <tr className="bg-zinc-900/50">
                        <td className="p-2">
                            <select
                                value={newRow.sourceType}
                                onChange={e => setNewRow({ ...newRow, sourceType: e.target.value, itemId: "" })}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-xs text-zinc-300 focus:border-blue-500 outline-none"
                            >
                                <option value="market">Market</option>
                                <option value="crafting">Craft</option>
                            </select>
                        </td>
                        <td className="p-2">
                            <select
                                value={newRow.itemId}
                                onChange={e => setNewRow({ ...newRow, itemId: e.target.value })}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-xs text-zinc-300 focus:border-blue-500 outline-none"
                            >
                                <option value="">Seçiniz...</option>
                                {availableItems.map(i => (
                                    <option key={i.id} value={i.id}>{i.name}</option>
                                ))}
                            </select>
                        </td>
                        <td className="p-2">
                            <SmartInput
                                min={1}
                                value={newRow.count}
                                onChange={(val) => setNewRow({ ...newRow, count: val })}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-xs text-center text-zinc-300 focus:border-blue-500 outline-none"
                            />
                        </td>
                        {item.type === 'container' && (
                            <td className="p-2">
                                <SmartInput
                                    min={0}
                                    max={100}
                                    value={newRow.chance}
                                    onChange={(val) => setNewRow({ ...newRow, chance: val })}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-xs text-center text-zinc-300 focus:border-blue-500 outline-none"
                                />
                            </td>
                        )}
                        <td className="p-2 text-right">
                            <button
                                onClick={handleAdd}
                                disabled={!newRow.itemId}
                                className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Plus size={14} />
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

// ============================================================================
// MAIN WIDGET
// ============================================================================
export default function CraftingWidget() {
    const { metinList, marketItems } = useSharedWidgetData();
    useCraftingSync(); // Sync logic

    const craftingItems = useWidgetStore((state) => state.craftingItems);
    const addCraftingItem = useWidgetStore((state) => state.addCraftingItem);
    const removeCraftingItem = useWidgetStore((state) => state.removeCraftingItem);
    const updateCraftingItem = useWidgetStore((state) => state.updateCraftingItem);
    const addContentToItem = useWidgetStore((state) => state.addContentToItem);
    const removeContentFromItem = useWidgetStore((state) => state.removeContentFromItem);

    const [selectedItemId, setSelectedItemId] = useState(craftingItems[0]?.id || null);
    const [searchQuery, setSearchQuery] = useState("");

    const selectedItem = craftingItems.find(i => i.id === selectedItemId);

    const filteredList = craftingItems.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreate = (type) => {
        const name = type === 'recipe' ? 'Yeni Reçete' : type === 'container' ? 'Yeni Sandık' : 'Yeni Parça';
        // Note: Store adds item. Usually we don't get ID back easily without async or predictable ID.
        // Assuming user creates and then clicks it in list, OR we trust it appears at end.
        addCraftingItem(name, type);
    };

    // Calculate value
    const calculatedPrice = useMemo(() => {
        if (!selectedItem) return 0;
        return resolveItemPrice(selectedItem.id, 'crafting', marketItems);
    }, [selectedItem, marketItems]); // Note: This might be slightly expensive but safe enough for one item

    return (
        <div className="w-full h-full flex bg-zinc-950 text-zinc-100 overflow-hidden font-sans">

            {/* LEFT PANEL: LIST (30%) */}
            <div className="w-[300px] flex-shrink-0 border-r border-zinc-800 flex flex-col bg-zinc-950/50">
                {/* Header / Search */}
                <div className="p-4 border-b border-zinc-800 space-y-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Reçete Ara..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 p-2 text-sm text-zinc-200 outline-none focus:border-blue-500"
                        />
                    </div>
                    {/* Quick Add Buttons */}
                    <div className="flex gap-2">
                        <button onClick={() => handleCreate('recipe')} className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 rounded text-xs text-zinc-300 border border-zinc-700 transition-colors" title="Yeni Reçete">
                            <Sparkles size={14} className="mx-auto" />
                        </button>
                        <button onClick={() => handleCreate('container')} className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 rounded text-xs text-zinc-300 border border-zinc-700 transition-colors" title="Yeni Sandık">
                            <Package size={14} className="mx-auto" />
                        </button>
                        <button onClick={() => handleCreate('fragment')} className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 rounded text-xs text-zinc-300 border border-zinc-700 transition-colors" title="Yeni Parça">
                            <PieChart size={14} className="mx-auto" />
                        </button>
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    {filteredList.map(item => (
                        <div
                            key={item.id}
                            onClick={() => setSelectedItemId(item.id)}
                            className={`
                                flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors group relative
                                ${selectedItemId === item.id ? "bg-fuchsia-900/20 border border-fuchsia-500/30" : "hover:bg-zinc-900 border border-transparent"}
                            `}
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                {item.type === 'recipe' && <Sparkles size={16} className="text-cyan-400 shrink-0" />}
                                {item.type === 'container' && <Package size={16} className="text-violet-400 shrink-0" />}
                                {item.type === 'fragment' && <PieChart size={16} className="text-amber-400 shrink-0" />}
                                <span className={`text-sm truncate ${selectedItemId === item.id ? "text-white" : "text-zinc-400"}`}>{item.name}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* RIGHT PANEL: EDITOR (70%) */}
            <div className="flex-1 flex flex-col h-full bg-zinc-950">
                {selectedItem ? (
                    <div className="flex-1 overflow-y-auto p-8">

                        {/* Header: Name and Type */}
                        <div className="flex items-start justify-between mb-8 border-b border-zinc-800 pb-6">
                            <div className="flex-1 mr-8">
                                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-1">
                                    {selectedItem.type === 'recipe' ? 'Reçete Adı' : selectedItem.type === 'container' ? 'Sandık Adı' : 'Parça Adı'}
                                </label>
                                <input
                                    type="text"
                                    value={selectedItem.name}
                                    onChange={(e) => updateCraftingItem(selectedItem.id, { name: e.target.value })}
                                    className="w-full bg-transparent text-3xl font-bold text-white outline-none placeholder-zinc-700 border-b border-transparent focus:border-fuchsia-500 transition-colors"
                                />
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <button
                                    onClick={() => {
                                        if (confirm("Silmek istiyor musunuz?")) {
                                            removeCraftingItem(selectedItem.id);
                                            setSelectedItemId(null);
                                        }
                                    }}
                                    className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                >
                                    <Trash2 size={20} />
                                </button>
                                <div className="text-right">
                                    <div className="text-sm text-zinc-400">Tahmini Değer</div>
                                    <div className="text-xl font-bold text-fuchsia-400 font-mono">{formatCurrency(calculatedPrice)}</div>
                                </div>
                            </div>
                        </div>

                        {/* Content Editor */}
                        <div className="space-y-6">
                            {selectedItem.type === 'fragment' ? (
                                <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-4">
                                    <h3 className="text-zinc-300 font-medium flex items-center gap-2"><PieChart size={18} /> Parça Ayarları</h3>
                                    <div>
                                        <label className="text-xs text-zinc-500 block mb-1">Hangi Eşyanın Parçası?</label>
                                        <select
                                            value={selectedItem.targetId || ""}
                                            onChange={(e) => updateCraftingItem(selectedItem.id, { targetId: e.target.value })}
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-300 focus:border-blue-500 outline-none"
                                        >
                                            <option value="">Seçiniz...</option>
                                            <optgroup label="Sanal Eşyalar">
                                                {craftingItems.filter(i => i.id !== selectedItem.id).map(i => (
                                                    <option key={i.id} value={i.id}>{i.name}</option>
                                                ))}
                                            </optgroup>
                                            <optgroup label="Metinler">
                                                {metinList.map(m => (
                                                    <option key={m.id} value={m.id}>{m.name}</option>
                                                ))}
                                            </optgroup>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-zinc-500 block mb-1">Birleşme Miktarı (Kaç tane lazım?)</label>
                                        <SmartInput
                                            min={1}
                                            value={selectedItem.amount || 1}
                                            onChange={(val) => updateCraftingItem(selectedItem.id, { amount: val })}
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-300 focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-zinc-300 font-medium flex items-center gap-2">
                                            {selectedItem.type === 'recipe' ? 'Gereken Malzemeler' : 'Sandık İçeriği'}
                                        </h3>
                                    </div>
                                    <ContentEditorTable
                                        item={selectedItem}
                                        marketItems={marketItems}
                                        craftingItems={craftingItems}
                                        onAdd={addContentToItem}
                                        onRemove={removeContentFromItem}
                                    />
                                </div>
                            )}
                        </div>

                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-zinc-600">
                        <Wrench size={48} className="mb-4 opacity-20" />
                        <p>Düzenlemek için bir öğe seçin</p>
                    </div>
                )}
            </div>

        </div>
    );
}
