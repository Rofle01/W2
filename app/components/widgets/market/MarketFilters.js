import React from "react";
import { Search, Filter, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MarketFilters({
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    categories,
    showAddForm,
    setShowAddForm,
    newItem,
    setNewItem,
    onAddItem
}) {
    const iconOptions = [
        "Circle", "Star", "Diamond", "Gem", "Crown", "Shield", "Sword",
        "Zap", "Heart", "Sparkles", "Award", "Package", "Gift"
    ];

    return (
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

            {/* Add Form */}
            <AnimatePresence>
                {showAddForm && (
                    <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        onSubmit={onAddItem}
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
        </div>
    );
}
