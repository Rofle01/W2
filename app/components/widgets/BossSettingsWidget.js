"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, EyeOff, Settings, Sparkles, Plus, Trash2, Edit2, Shield, Clock, Calendar, CheckCircle, ChevronDown, ChevronRight, Search } from "lucide-react";
import useWidgetStore from "../../store/useWidgetStore";
// Basit sınıf birleştirici (utils.js olmadığı için buraya ekledik)
const cn = (...classes) => classes.filter(Boolean).join(" ");
// If utils doesn't exist, I'll just use template leterals.

// Helper for classes
const clsx = (...classes) => classes.filter(Boolean).join(" ");

// ============================================================================
// SUB-COMPONENTS (Inline for simplicity)
// ============================================================================

// 1. Drop Editor
function DropEditor({ drops, onUpdate }) {
    const marketItems = useWidgetStore((state) => state.masterRegistry) || [];
    const [isAdding, setIsAdding] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Default new drop
    const [newDrop, setNewDrop] = useState({ itemId: "", chance: 10, count: 1 });

    const filteredMarketItems = marketItems.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 10);

    const handleAdd = () => {
        if (!newDrop.itemId) return;
        onUpdate([...drops, { ...newDrop, sourceType: 'market' }]); // Always default to market for lookup
        setNewDrop({ itemId: "", chance: 10, count: 1 });
        setIsAdding(false);
    };

    const handleRemove = (index) => {
        const newDrops = [...drops];
        newDrops.splice(index, 1);
        onUpdate(newDrops);
    };

    return (
        <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white/80 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-fuchsia-400" />
                Drop Listesi
            </h4>

            {/* List */}
            <div className="space-y-2">
                {drops.map((drop, idx) => {
                    const item = marketItems.find(i => i.id === drop.itemId);
                    return (
                        <div key={idx} className="flex items-center gap-3 bg-white/5 p-2 rounded-lg border border-white/5">
                            <div className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center border border-white/10">
                                {item ? (
                                    // Normally we render dynamic icon but fallback for now
                                    <div className="w-4 h-4 rounded-full bg-fuchsia-500/50" />
                                ) : (
                                    <span className="text-xs">?</span>
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="text-sm text-white">{item?.name || "Bilinmeyen Eşya"}</div>
                                <div className="text-xs text-white/50">{drop.count} adet, %{drop.chance} şans</div>
                            </div>
                            <button
                                onClick={() => handleRemove(idx)}
                                className="p-1 hover:bg-red-500/20 text-white/40 hover:text-red-400 rounded-md transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    );
                })}

                {drops.length === 0 && !isAdding && (
                    <div className="text-sm text-white/30 text-center py-2 italic">Henüz drop eklenmemiş.</div>
                )}
            </div>

            {/* Add Form */}
            {isAdding ? (
                <div className="bg-fuchsia-500/10 border border-fuchsia-500/20 p-3 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-2">
                    {/* Item Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-white/40" />
                        <input
                            type="text"
                            placeholder="Eşya Ara..."
                            className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 p-2 text-sm text-white focus:outline-none focus:border-fuchsia-500/50"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <div className="absolute top-full left-0 w-full bg-zinc-900 border border-white/10 rounded-lg mt-1 max-h-40 overflow-y-auto z-50">
                                {filteredMarketItems.map(item => (
                                    <button
                                        key={item.id}
                                        className="w-full text-left p-2 hover:bg-white/10 text-sm text-white/80 flex items-center gap-2"
                                        onClick={() => {
                                            setNewDrop({ ...newDrop, itemId: item.id });
                                            setSearchQuery(item.name);
                                        }}
                                    >
                                        <span className="w-2 h-2 rounded-full bg-fuchsia-400/50" />
                                        {item.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <div className="flex-1">
                            <label className="text-xs text-white/40 block mb-1">Adet</label>
                            <input
                                type="number"
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white"
                                value={newDrop.count}
                                onChange={e => setNewDrop({ ...newDrop, count: Number(e.target.value) })}
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-xs text-white/40 block mb-1">Şans (%)</label>
                            <input
                                type="number"
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white"
                                max={100}
                                value={newDrop.chance}
                                onChange={e => setNewDrop({ ...newDrop, chance: Number(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            onClick={() => setIsAdding(false)}
                            className="px-3 py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                            İptal
                        </button>
                        <button
                            onClick={handleAdd}
                            disabled={!newDrop.itemId}
                            className="px-3 py-1.5 text-xs bg-fuchsia-500 hover:bg-fuchsia-600 text-white rounded-lg disabled:opacity-50"
                        >
                            Ekle
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setIsAdding(true)}
                    className="w-full border border-dashed border-white/20 hover:border-fuchsia-500/50 hover:bg-fuchsia-500/5 text-white/50 hover:text-fuchsia-400 rounded-xl p-2 text-sm transition-all flex items-center justify-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Yeni Drop Ekle
                </button>
            )}
        </div>
    );
}

// 2. Boss Item Row (Editable)
function BossItem({ boss, isActive, onToggle, onUpdate, onRemove }) {
    return (
        <div className={clsx(
            "rounded-xl border transition-all duration-300 overflow-hidden",
            isActive
                ? "bg-fuchsia-500/10 border-fuchsia-500/50 shadow-[0_0_20px_rgba(232,121,249,0.1)]"
                : "bg-black/20 border-white/5 hover:border-white/10"
        )}>
            {/* Header / Summary */}
            <div
                onClick={onToggle}
                className="p-4 flex items-center gap-4 cursor-pointer"
            >
                <div className={clsx(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                    isActive ? "bg-fuchsia-500 text-white" : "bg-white/5 text-white/40"
                )}>
                    <Shield className="w-5 h-5" />
                </div>

                <div className="flex-1">
                    <h3 className="text-white font-medium">{boss.name}</h3>
                    <div className="flex items-center gap-3 text-xs text-white/40 mt-1">
                        <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {boss.constraints.cooldown}dk Soğuma
                        </span>
                        {boss.constraints.dailyLimit > 0 && (
                            <span className="flex items-center gap-1 text-fuchsia-300/80">
                                <Calendar className="w-3 h-3" />
                                Günlük {boss.constraints.dailyLimit} Limit
                            </span>
                        )}
                        <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {boss.fixedRunTime || 5}dk Tur
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); onRemove(boss.id); }}
                        className="p-2 hover:bg-red-500/20 text-white/20 hover:text-red-400 rounded-full transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                    <ChevronDown className={clsx("w-5 h-5 text-white/40 transition-transform", isActive && "rotate-180")} />
                </div>
            </div>

            {/* Expanded Editor */}
            <AnimatePresence>
                {isActive && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-white/5 bg-black/20"
                    >
                        <div className="p-4 space-y-6">
                            {/* Basic Info Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-white/40 block mb-1">Boss / Zindan Adı</label>
                                    <input
                                        type="text"
                                        value={boss.name}
                                        onChange={(e) => onUpdate(boss.id, { name: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-fuchsia-500/50 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-white/40 block mb-1">HP (Can)</label>
                                    <input
                                        type="number"
                                        value={boss.hp}
                                        onChange={(e) => onUpdate(boss.id, { hp: Number(e.target.value) })}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-fuchsia-500/50 focus:outline-none"
                                    />
                                </div>
                            </div>

                        </div>

                        {/* Constraints Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-white/40 block mb-1">Soğuma Süresi (Dk)</label>
                                    <input
                                        type="number"
                                        value={boss.constraints.cooldown}
                                        onChange={(e) => onUpdate(boss.id, { constraints: { cooldown: Number(e.target.value) } })}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-fuchsia-500/50 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-white/40 block mb-1">Zindan/Tur Süresi (Dk)</label>
                                    <input
                                        type="number"
                                        value={boss.fixedRunTime || 5}
                                        onChange={(e) => onUpdate(boss.id, { fixedRunTime: Number(e.target.value) })}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-fuchsia-500/50 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-white/40 block mb-1">Soğuma Tipi</label>
                                    <div className="flex bg-black/40 border border-white/10 rounded-lg p-1">
                                        <button
                                            onClick={() => onUpdate(boss.id, { constraints: { cooldownType: 'entry' } })}
                                            className={cn(
                                                "flex-1 text-xs py-1.5 rounded transition-colors",
                                                (boss.constraints.cooldownType || 'entry') === 'entry' ? "bg-fuchsia-500 text-white" : "text-white/40 hover:text-white"
                                            )}
                                        >
                                            Giriş
                                        </button>
                                        <button
                                            onClick={() => onUpdate(boss.id, { constraints: { cooldownType: 'exit' } })}
                                            className={cn(
                                                "flex-1 text-xs py-1.5 rounded transition-colors",
                                                boss.constraints.cooldownType === 'exit' ? "bg-fuchsia-500 text-white" : "text-white/40 hover:text-white"
                                            )}
                                        >
                                            Çıkış
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-white/40 block mb-1">Günlük Limit (0=Yok)</label>
                                    <input
                                        type="number"
                                        value={boss.constraints.dailyLimit}
                                        onChange={(e) => onUpdate(boss.id, { constraints: { dailyLimit: Number(e.target.value) } })}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-fuchsia-500/50 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-white/40 block mb-1">Min. Seviye</label>
                                    <input
                                        type="number"
                                        value={boss.constraints.minLevel}
                                        onChange={(e) => onUpdate(boss.id, { constraints: { minLevel: Number(e.target.value) } })}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-fuchsia-500/50 focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* Drops */}
                            <div className="pt-2 border-t border-white/5">
                                <DropEditor
                                    drops={boss.drops}
                                    onUpdate={(newDrops) => onUpdate(boss.id, { drops: newDrops })}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ============================================================================
// MAIN WIDGET
// ============================================================================
export default function BossSettingsWidget({ id, data, isSelected, onClick, onHide }) {
    const bosses = useWidgetStore((state) => state.bosses) || [];
    const addBoss = useWidgetStore((state) => state.addBoss);
    const updateBoss = useWidgetStore((state) => state.updateBoss);
    const removeBoss = useWidgetStore((state) => state.removeBoss);

    const [activeId, setActiveId] = useState(null);

    return (
        <motion.div
            layoutId={`card-${id}`}
            layout
            onClick={!isSelected ? onClick : undefined}
            className={clsx(
                "group rounded-3xl shadow-2xl cursor-pointer overflow-hidden backdrop-blur-xl border border-white/10",
                isSelected
                    ? "fixed inset-0 m-auto w-[90%] h-[90%] max-w-4xl z-[100] bg-black/80"
                    : "relative h-64 hover:-translate-y-1 hover:border-fuchsia-400/50 transition-all duration-300 bg-black/20 hover:bg-black/40"
            )}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
            {/* Summary View (Collapsed) */}
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
                        className="absolute top-4 right-4 z-20 p-2 bg-white/10 backdrop-blur-sm shadow-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-white/60 hover:text-fuchsia-400 hover:bg-fuchsia-500/20 border border-white/20"
                    >
                        <EyeOff className="w-4 h-4" />
                    </motion.button>

                    <div className="w-full h-full p-6 relative">
                        <Shield className="absolute -bottom-4 -right-4 w-32 h-32 text-fuchsia-500/5 opacity-50 rotate-12 pointer-events-none" />

                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 bg-fuchsia-500/10 rounded-xl border border-fuchsia-500/20">
                                <Shield className="w-5 h-5 text-fuchsia-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-white/90">Boss Ayarları</h3>
                        </div>

                        <div className="space-y-2">
                            {bosses.slice(0, 3).map(boss => (
                                <div key={boss.id} className="flex items-center justify-between text-sm text-white/60">
                                    <span>{boss.name}</span>
                                    <span className="text-xs px-2 py-0.5 rounded bg-white/5 border border-white/5">{boss.constraints.cooldown}dk</span>
                                </div>
                            ))}
                            {bosses.length === 0 && (
                                <div className="text-white/30 text-sm italic">Kayıtlı boss yok</div>
                            )}
                            {bosses.length > 3 && (
                                <div className="text-xs text-white/40 pt-1">+{bosses.length - 3} diğer...</div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Detail View (Expanded) */}
            {isSelected && (
                <div className="flex flex-col h-full bg-black/20">
                    {/* Header */}
                    <div className="flex items-center justify-between p-8 border-b border-white/10 bg-black/40 backdrop-blur-xl">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-fuchsia-500/10 backdrop-blur-sm rounded-2xl border border-fuchsia-500/20">
                                <Shield className="w-8 h-8 text-fuchsia-400" />
                            </div>
                            <div>
                                <motion.h2 layoutId={`title-${id}`} className="text-2xl font-bold text-white">
                                    Boss & Zindan Ayarları
                                </motion.h2>
                                <p className="text-white/60">Farming rotasyonunuza eklemek için boss ve zindanları tanımlayın</p>
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
                        <div className="space-y-4 max-w-2xl mx-auto">
                            {/* Add Button */}
                            <button
                                onClick={() => addBoss({ name: "Yeni Boss", hp: 1000000, constraints: { cooldown: 60, dailyLimit: 0 }, drops: [] })}
                                className="w-full py-4 rounded-2xl border border-dashed border-white/20 hover:border-fuchsia-500/50 bg-white/5 hover:bg-fuchsia-500/5 text-white/60 hover:text-fuchsia-400 font-medium transition-all flex items-center justify-center gap-2 group/btn"
                            >
                                <Plus className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                                Yeni Boss / Zindan Ekle
                            </button>

                            {/* List */}
                            <div className="space-y-3">
                                {bosses.map(boss => (
                                    <BossItem
                                        key={boss.id}
                                        boss={boss}
                                        isActive={activeId === boss.id}
                                        onToggle={() => setActiveId(activeId === boss.id ? null : boss.id)}
                                        onUpdate={updateBoss}
                                        onRemove={removeBoss}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
