"use client";

import { useState } from "react";
import { Plus, Trash2, Shield, Search, Sparkles } from "lucide-react";
import useWidgetStore from "../../store/useWidgetStore";
import SmartInput from "../ui/SmartInput";

// Helper for classes
const cn = (...classes) => classes.filter(Boolean).join(" ");

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

// 1. Drop Editor (Table Style)
function DropEditor({ drops, onUpdate }) {
    const marketItems = useWidgetStore((state) => state.masterRegistry) || [];
    const [searchQuery, setSearchQuery] = useState("");
    const [showSearch, setShowSearch] = useState(false);

    // Default new drop
    const [newDrop, setNewDrop] = useState({ itemId: "", chance: 10, count: 1 });

    const filteredMarketItems = marketItems.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 10);

    const handleAdd = () => {
        if (!newDrop.itemId) return;
        onUpdate([...drops, { ...newDrop, sourceType: 'market' }]);
        setNewDrop({ itemId: "", chance: 10, count: 1 });
        setSearchQuery("");
        setShowSearch(false);
    };

    const handleRemove = (index) => {
        const newDrops = [...drops];
        newDrops.splice(index, 1);
        onUpdate(newDrops);
    };

    // Updating a specific drop row inline
    const handleRowUpdate = (index, field, value) => {
        const newDrops = [...drops];
        newDrops[index] = { ...newDrops[index], [field]: value };
        onUpdate(newDrops);
    };

    return (
        <div className="space-y-4">
            <h4 className="text-zinc-400 text-sm font-semibold flex items-center gap-2">
                <Sparkles size={16} />
                Drop Listesi
            </h4>

            {/* Drop Table */}
            <div className="w-full border border-zinc-800 rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400">
                        <tr>
                            <th className="p-3 font-medium">Eşya Adı</th>
                            <th className="p-3 font-medium w-32">Miktar</th>
                            <th className="p-3 font-medium w-32">Şans (%)</th>
                            <th className="p-3 w-12"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800 bg-zinc-950/50">
                        {drops.map((drop, idx) => {
                            const item = marketItems.find(i => i.id === drop.itemId);
                            return (
                                <tr key={idx} className="group hover:bg-zinc-900/50">
                                    <td className="p-3 text-zinc-300">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs">
                                                {/* Icon placeholder if available */}
                                                <div className="w-3 h-3 rounded-full bg-blue-500/50" />
                                            </div>
                                            {item?.name || "Bilinmeyen Eşya"}
                                        </div>
                                    </td>
                                    <td className="p-2">
                                        <SmartInput
                                            value={drop.count}
                                            onChange={(val) => handleRowUpdate(idx, 'count', val)}
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-zinc-300 focus:border-blue-500 outline-none"
                                            min={1}
                                        />
                                    </td>
                                    <td className="p-2">
                                        <SmartInput
                                            value={drop.chance}
                                            onChange={(val) => handleRowUpdate(idx, 'chance', val)}
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-zinc-300 focus:border-blue-500 outline-none"
                                            min={0}
                                            max={100}
                                        />
                                    </td>
                                    <td className="p-2 text-right">
                                        <button onClick={() => handleRemove(idx)} className="text-zinc-600 hover:text-red-400 p-1">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {drops.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-4 text-center text-zinc-600 italic">Henüz drop eklenmemiş.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Quick Add Row */}
            <div className="bg-zinc-900/50 border border-zinc-800 p-3 rounded-lg flex items-center gap-3">
                <div className="relative flex-1">
                    {!showSearch ? (
                        <button onClick={() => setShowSearch(true)} className="w-full text-left text-zinc-500 hover:text-zinc-300 text-sm flex items-center gap-2">
                            <Plus size={16} /> Eşya seç...
                        </button>
                    ) : (
                        <div>
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 w-4 h-4 text-zinc-500" />
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Eşya Ara..."
                                    className="w-full bg-zinc-950 border border-blue-500/50 rounded pl-8 p-2 text-sm text-white outline-none"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    onBlur={() => setTimeout(() => !newDrop.itemId && setShowSearch(false), 200)}
                                />
                            </div>
                            {/* Autocomplete Dropdown */}
                            {searchQuery && (
                                <div className="absolute top-full left-0 w-full bg-zinc-900 border border-zinc-700 rounded-lg mt-1 max-h-40 overflow-y-auto z-50 shadow-xl">
                                    {filteredMarketItems.map(item => (
                                        <button
                                            key={item.id}
                                            className="w-full text-left p-2 hover:bg-zinc-800 text-sm text-zinc-300 flex items-center gap-2"
                                            onMouseDown={() => {
                                                setNewDrop({ ...newDrop, itemId: item.id });
                                                setSearchQuery(item.name); // keep name visible or reset? keeping name visible is better UX usually but here we just select internal ID
                                                setShowSearch(false);
                                            }}
                                        >
                                            {item.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Only show inputs if item selected or searching to add directly?? Actually easier to just always show inputs enabled but button disabled */}
                <div className="w-24">
                    <SmartInput
                        placeholder="Adet"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-2 text-sm text-white focus:border-blue-500 outline-none"
                        value={newDrop.count}
                        onChange={(val) => setNewDrop({ ...newDrop, count: val })}
                        min={1}
                    />
                </div>
                <div className="w-24">
                    <SmartInput
                        placeholder="Şans %"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-2 text-sm text-white focus:border-blue-500 outline-none"
                        value={newDrop.chance}
                        onChange={(val) => setNewDrop({ ...newDrop, chance: val })}
                        min={0}
                        max={100}
                    />
                </div>
                <button
                    onClick={handleAdd}
                    disabled={!newDrop.itemId}
                    className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Plus size={18} />
                </button>
            </div>
        </div>
    );
}

// ============================================================================
// MAIN VIEW COMPONENT
// ============================================================================
export default function BossSettingsWidget() {
    const bosses = useWidgetStore((state) => state.bosses) || [];
    const addBoss = useWidgetStore((state) => state.addBoss);
    const updateBoss = useWidgetStore((state) => state.updateBoss);
    const removeBoss = useWidgetStore((state) => state.removeBoss);

    const [selectedBossId, setSelectedBossId] = useState(bosses[0]?.id || null);

    const activeBoss = bosses.find(b => b.id === selectedBossId);

    const handleCreateNew = () => {
        const newId = crypto.randomUUID(); // Need UUID but store might handle it or we pass it? addBoss usually generates it or we pass data. 
        // Looking at previous code `addBoss({ name... })`. So likely store generates ID or pushes object.
        addBoss({
            name: "Yeni Boss",
            hp: 1000000,
            constraints: { cooldown: 60, dailyLimit: 0, minLevel: 75, cooldownType: 'entry' },
            drops: []
        });
        // Select logic might be tricky without ID return, typically we'd wait for store update or select last item effect.
        // For simplicity, we just add it, user clicks it.
    };

    return (
        <div className="w-full h-full flex bg-zinc-950 text-zinc-100 overflow-hidden font-sans">

            {/* LEFT PANEL: LIST (30%) */}
            <div className="w-[300px] flex-shrink-0 border-r border-zinc-800 flex flex-col bg-zinc-950/50">
                <div className="p-4 border-b border-zinc-800">
                    <button
                        onClick={handleCreateNew}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 transition-all"
                    >
                        <Plus size={18} /> Yeni Boss Ekle
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    {bosses.map(boss => (
                        <div
                            key={boss.id}
                            onClick={() => setSelectedBossId(boss.id)}
                            className={cn(
                                "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors group relative",
                                selectedBossId === boss.id
                                    ? "bg-blue-600/10 border border-blue-600/50"
                                    : "hover:bg-zinc-900 border border-transparent"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                                    selectedBossId === boss.id ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-500"
                                )}>
                                    {boss.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className={cn("font-medium text-sm", selectedBossId === boss.id ? "text-white" : "text-zinc-400")}>
                                        {boss.name}
                                    </div>
                                    <div className="text-[10px] text-zinc-600">{boss.constraints?.cooldown || 0}dk CD</div>
                                </div>
                            </div>

                            {/* Delete Button (visible on hover) */}
                            <button
                                onClick={(e) => { e.stopPropagation(); removeBoss(boss.id); if (selectedBossId === boss.id) setSelectedBossId(null); }}
                                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 text-zinc-500 hover:text-red-400 rounded transition-all"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* RIGHT PANEL: DETAILS (70%) */}
            <div className="flex-1 flex flex-col h-full bg-zinc-950">
                {activeBoss ? (
                    <div className="flex-1 overflow-y-auto p-8">
                        {/* Header Inputs */}
                        <div className="flex items-end gap-6 mb-8 border-b border-zinc-800 pb-6">
                            <div className="w-20 h-20 rounded-2xl bg-zinc-900 border-2 border-zinc-800 flex items-center justify-center shadow-inner">
                                <Shield size={32} className="text-zinc-600" />
                            </div>
                            <div className="flex-1 space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-1">Boss Adı</label>
                                    <input
                                        type="text"
                                        value={activeBoss.name}
                                        onChange={(e) => updateBoss(activeBoss.id, { name: e.target.value })}
                                        className="w-full bg-transparent text-3xl font-bold text-white outline-none placeholder-zinc-700 border-b border-transparent focus:border-blue-500 transition-colors"
                                        placeholder="Boss Adı Girin"
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="text-xs text-zinc-500 block mb-1">HP (Can Puanı)</label>
                                        <SmartInput
                                            value={activeBoss.hp}
                                            onChange={(val) => updateBoss(activeBoss.id, { hp: val })}
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:border-blue-500 outline-none"
                                            min={0}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs text-zinc-500 block mb-1">Min. Seviye</label>
                                        <SmartInput
                                            value={activeBoss.constraints?.minLevel || 0}
                                            onChange={(val) => updateBoss(activeBoss.id, { constraints: { ...activeBoss.constraints, minLevel: val } })}
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:border-blue-500 outline-none"
                                            min={0}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Constraints Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            <div>
                                <label className="text-xs font-semibold text-zinc-500 uppercase block mb-2">Soğuma (Cooldown)</label>
                                <div className="flex items-center gap-2">
                                    <SmartInput
                                        value={activeBoss.constraints?.cooldown || 0}
                                        onChange={(val) => updateBoss(activeBoss.id, { constraints: { ...activeBoss.constraints, cooldown: val } })}
                                        className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                                        min={0}
                                    />
                                    <span className="text-zinc-600 text-sm">dk</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-zinc-500 uppercase block mb-2">Zindan Süresi</label>
                                <div className="flex items-center gap-2">
                                    <SmartInput
                                        value={activeBoss.fixedRunTime || 5}
                                        onChange={(val) => updateBoss(activeBoss.id, { fixedRunTime: val })}
                                        className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                                        min={0}
                                    />
                                    <span className="text-zinc-600 text-sm">dk</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-zinc-500 uppercase block mb-2">Günlük Giriş Sınırı</label>
                                <div className="flex items-center gap-2">
                                    <SmartInput
                                        value={activeBoss.constraints?.dailyLimit || 0}
                                        onChange={(val) => updateBoss(activeBoss.id, { constraints: { ...activeBoss.constraints, dailyLimit: val } })}
                                        className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                                        min={0}
                                    />
                                    <span className="text-zinc-600 text-sm">kez</span>
                                </div>
                            </div>
                        </div>

                        {/* Cooldown Type Toggle */}
                        <div className="mb-8">
                            <label className="text-xs font-semibold text-zinc-500 uppercase block mb-2">Soğuma Tipi</label>
                            <div className="inline-flex bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                                <button
                                    onClick={() => updateBoss(activeBoss.id, { constraints: { ...activeBoss.constraints, cooldownType: 'entry' } })}
                                    className={cn(
                                        "px-4 py-1.5 text-xs font-medium rounded transition-colors",
                                        (activeBoss.constraints?.cooldownType || 'entry') === 'entry' ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-zinc-300"
                                    )}
                                >
                                    Giriş Anında Başlar
                                </button>
                                <button
                                    onClick={() => updateBoss(activeBoss.id, { constraints: { ...activeBoss.constraints, cooldownType: 'exit' } })}
                                    className={cn(
                                        "px-4 py-1.5 text-xs font-medium rounded transition-colors",
                                        activeBoss.constraints?.cooldownType === 'exit' ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-zinc-300"
                                    )}
                                >
                                    Çıkış Anında Başlar
                                </button>
                            </div>
                        </div>

                        {/* Drop Editor Section */}
                        <div className="pt-6 border-t border-zinc-800">
                            <DropEditor
                                drops={activeBoss.drops || []}
                                onUpdate={(newDrops) => updateBoss(activeBoss.id, { drops: newDrops })}
                            />
                        </div>

                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center flex-col text-zinc-600">
                        <Shield size={48} className="mb-4 text-zinc-800" />
                        <p className="text-lg">Düzenlemek için soldan bir boss seçin</p>
                        <p className="text-sm">veya yeni bir tane ekleyin.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
