"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import SmartInput from "@/app/components/ui/SmartInput";

const formatNumber = (num) => {
    return new Intl.NumberFormat('tr-TR').format(num);
};

export default function MetinAccordionItem({
    metin,
    isOpen,
    onToggle,
    onUpdateHP,
    onAddDrop,
    onRemoveDrop,
    onUpdateDrop,
    marketItems,
    craftingItems
}) {
    const [selectedItemId, setSelectedItemId] = useState("");
    const [selectedSourceType, setSelectedSourceType] = useState("market");
    const [error, setError] = useState(null);

    // Combine market and crafting items for dropdown
    // Combine market and crafting items for dropdown
    const safeMarketItems = marketItems || [];
    const safeCraftingItems = craftingItems || [];

    const allAvailableItems = [
        ...safeMarketItems.map(item => ({
            id: item.originalId || item.id,
            name: item.name,
            sourceType: 'market',
            displayName: item.name
        })),
        ...safeCraftingItems.map(item => ({
            id: item.id,
            name: item.name,
            sourceType: 'crafting',
            displayName: `📦 ${item.name}` // Add box icon for crafting items
        }))
    ];

    const getItemByIdAndType = (itemId, sourceType) => {
        if (sourceType === 'market') {
            return (marketItems || []).find((item) => (item.originalId || item.id) === itemId);
        } else {
            return (craftingItems || []).find((item) => item.id === itemId);
        }
    };

    const handleHpChange = (newHp) => {
        if (newHp > 0) {
            onUpdateHP(metin.id, newHp);
        }
    };

    const handleDropChange = (dropId, field, value) => {
        onUpdateDrop(metin.id, dropId, field, value);
    };

    const handleAddDrop = () => {
        if (selectedItemId) {
            const exists = metin.drops.some((d) => d.itemId === selectedItemId);
            if (exists) {
                setError("Bu eşya zaten bu metinde ekli!");
                return;
            }
            onAddDrop(metin.id, selectedItemId, selectedSourceType);
        }
    };

    const handleRemoveDrop = (dropId) => {
        if (confirm("Bu drop'u silmek istediğinizden emin misiniz?")) {
            onRemoveDrop(metin.id, dropId);
        }
    };

    return (
        <div className={`backdrop-blur-xl rounded-xl border overflow-hidden transition-all ${isOpen
            ? "bg-violet-900/20 border-violet-500/20 shadow-[0_0_20px_rgba(139,92,246,0.1)]"
            : "bg-black/20 border-white/5 hover:bg-white/5"
            }`}>
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ChevronDown className="w-5 h-5 text-white/60" />
                    </motion.div>
                    <h3 className="text-lg font-semibold text-white">{metin.name}</h3>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-white/60">
                        HP: <span className="text-cyan-300 font-bold font-mono">{formatNumber(metin.hp)}</span>
                    </span>
                    <span className="text-sm text-white/60">
                        {metin.drops.length} Drop
                    </span>
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-black/30 border-t border-white/5"
                    >
                        <div className="p-4 space-y-4">
                            {/* HP Input */}
                            <div>
                                <label className="block text-sm font-semibold text-white/80 mb-2">
                                    Metin HP
                                </label>
                                <SmartInput
                                    value={metin.hp}
                                    onChange={(val) => handleHpChange(val)}
                                    className="w-full px-3 py-2 font-mono font-semibold text-white bg-black/60 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/50 placeholder:text-white/40 transition-all"
                                    min={1}
                                    step={1000}
                                />
                            </div>

                            {/* Drops List */}
                            <div>
                                <h4 className="text-sm font-semibold text-white/80 mb-2">
                                    Drop Listesi
                                </h4>
                                <div className="space-y-2">
                                    {metin.drops.map((drop) => {
                                        const item = getItemByIdAndType(drop.itemId, drop.sourceType || 'market');
                                        return (
                                            <div
                                                key={drop.id}
                                                className="bg-black/40 backdrop-blur-sm p-3 rounded-lg border border-white/5 hover:border-white/10 transition-colors"
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-white font-medium">
                                                        {drop.sourceType === 'crafting' && '📦 '}
                                                        {item?.name || drop.itemId}
                                                    </span>
                                                    <button
                                                        onClick={() => handleRemoveDrop(drop.id)}
                                                        className="p-1 hover:bg-red-500/20 rounded transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-400" />
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="block text-xs text-white/60 mb-1">
                                                            Adet
                                                        </label>
                                                        <SmartInput
                                                            value={drop.count}
                                                            onChange={(val) => handleDropChange(drop.id, "count", val)}
                                                            className="w-full px-2 py-1 text-sm font-mono font-medium text-white bg-black/60 border border-white/10 rounded focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500/50"
                                                            min={1}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-white/60 mb-1">
                                                            Şans (%)
                                                        </label>
                                                        <SmartInput
                                                            value={drop.chance}
                                                            onChange={(val) => handleDropChange(drop.id, "chance", val)}
                                                            className="w-full px-2 py-1 text-sm font-mono font-medium text-white bg-black/60 border border-white/10 rounded focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500/50"
                                                            min={0}
                                                            max={100}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Add Drop */}
                            <div className="pt-2 border-t border-white/10">
                                <h4 className="text-sm font-semibold text-white/80 mb-2">
                                    Yeni Drop Ekle
                                </h4>
                                <div className="flex gap-2">
                                    <select
                                        value={selectedItemId}
                                        onChange={(e) => {
                                            const selected = allAvailableItems.find(item => item.id === e.target.value);
                                            setSelectedItemId(e.target.value);
                                            setSelectedSourceType(selected?.sourceType || 'market');
                                        }}
                                        className="flex-1 px-3 py-2 font-medium text-white bg-black/60 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/50"
                                    >
                                        <option value="" className="bg-zinc-900">Seçiniz...</option>
                                        {allAvailableItems.map((item) => (
                                            <option
                                                key={`${item.sourceType}-${item.id}`}
                                                value={item.id}
                                                className="bg-zinc-900"
                                            >
                                                {item.displayName}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={handleAddDrop}
                                        className="px-4 py-2 bg-cyan-600/20 backdrop-blur-sm text-cyan-400 rounded-lg hover:bg-cyan-600/40 transition-colors font-medium border border-cyan-500/30 flex items-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Ekle
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error Popup */}
            {error && (
                <div
                    className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    onClick={() => setError(null)}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-red-900/90 border border-red-500/50 text-white p-6 rounded-xl shadow-2xl"
                        onClick={() => setError(null)}
                    >
                        {error}
                    </motion.div>
                </div>
            )}
        </div>
    );
}
