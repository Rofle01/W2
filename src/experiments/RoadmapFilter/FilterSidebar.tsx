import React from 'react';
import { useFilterContext } from './FilterContext';

const COMMON_MAPS = [
    "Seungryong Valley",
    "Yongbi Desert",
    "Sohan Mountain",
    "Fireland",
    "Ghost Forest",
    "Red Wood",
    "Land of Giants",
    "Grotto of Exile"
];

export const FilterSidebar: React.FC = () => {
    const {
        minLevel,
        maxLevel,
        excludedMaps,
        setMinLevel,
        setMaxLevel,
        setExcludedMaps,
        resetFilters
    } = useFilterContext();

    const handleMapToggle = (mapName: string) => {
        if (excludedMaps.includes(mapName)) {
            setExcludedMaps(excludedMaps.filter(m => m !== mapName));
        } else {
            setExcludedMaps([...excludedMaps, mapName]);
        }
    };

    return (
        <div className="w-full md:w-80 bg-zinc-900 border-2 border-yellow-600/50 rounded-lg p-6 shadow-[0_0_15px_rgba(202,138,4,0.2)] text-yellow-100 font-serif">
            <h2 className="text-2xl font-bold text-yellow-500 mb-6 border-b border-yellow-600/30 pb-2 text-center uppercase tracking-widest">
                Filter Panel
            </h2>

            {/* Level Range Section */}
            <div className="mb-8">
                <h3 className="text-lg font-semibold text-yellow-200/80 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-yellow-500 rotate-45"></span>
                    Level Range
                </h3>
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <label className="block text-xs text-yellow-500/70 mb-1 uppercase">Min</label>
                        <input
                            type="number"
                            min={1}
                            max={120}
                            value={minLevel}
                            onChange={(e) => setMinLevel(Number(e.target.value))}
                            className="w-full bg-black/40 border border-yellow-700/50 rounded px-3 py-2 text-yellow-100 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/50 transition-all text-center font-mono"
                        />
                    </div>
                    <span className="text-yellow-600 font-bold mt-5">-</span>
                    <div className="flex-1">
                        <label className="block text-xs text-yellow-500/70 mb-1 uppercase">Max</label>
                        <input
                            type="number"
                            min={1}
                            max={120}
                            value={maxLevel}
                            onChange={(e) => setMaxLevel(Number(e.target.value))}
                            className="w-full bg-black/40 border border-yellow-700/50 rounded px-3 py-2 text-yellow-100 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/50 transition-all text-center font-mono"
                        />
                    </div>
                </div>
            </div>

            {/* Map Filter Section */}
            <div className="mb-8">
                <h3 className="text-lg font-semibold text-yellow-200/80 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-yellow-500 rotate-45"></span>
                    Map Visibility
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {COMMON_MAPS.map((map) => {
                        const isExcluded = excludedMaps.includes(map);
                        return (
                            <label
                                key={map}
                                className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-all border ${!isExcluded
                                        ? 'bg-yellow-900/20 border-yellow-600/30 hover:bg-yellow-900/30'
                                        : 'bg-black/20 border-white/5 opacity-60 hover:opacity-80'
                                    }`}
                            >
                                <div className={`w-4 h-4 border rounded flex items-center justify-center transition-colors ${!isExcluded ? 'border-yellow-500 bg-yellow-500/20' : 'border-zinc-600'
                                    }`}>
                                    {!isExcluded && <div className="w-2 h-2 bg-yellow-400 rounded-sm" />}
                                </div>
                                <input
                                    type="checkbox"
                                    checked={!isExcluded}
                                    onChange={() => handleMapToggle(map)}
                                    className="hidden"
                                />
                                <span className={!isExcluded ? 'text-yellow-100' : 'text-zinc-500 line-through'}>
                                    {map}
                                </span>
                            </label>
                        );
                    })}
                </div>
            </div>

            {/* Actions */}
            <button
                onClick={resetFilters}
                className="w-full py-3 px-4 bg-red-900/30 hover:bg-red-900/50 border border-red-700/50 text-red-200 rounded transition-all uppercase tracking-wider text-sm font-bold hover:shadow-[0_0_10px_rgba(220,38,38,0.2)]"
            >
                Reset Filters
            </button>
        </div>
    );
};
