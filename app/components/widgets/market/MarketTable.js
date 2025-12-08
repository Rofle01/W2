import React, { useState, useEffect } from "react";
import { Search, Plus } from "lucide-react";
import * as LucideIcons from "lucide-react";

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

export default function MarketTable({
    filteredItems,
    searchQuery,
    onPriceChange,
    onShowAddForm,
    activeProfile
}) {
    return (
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
                                        onClick={onShowAddForm}
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
                                            onChange={(newPrice) => onPriceChange(item.id, newPrice)}
                                        />
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
}
