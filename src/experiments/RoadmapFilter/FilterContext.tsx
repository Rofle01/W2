import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface FilterState {
    minLevel: number;
    maxLevel: number;
    excludedMaps: string[];
    selectedElement: string | null;
}

interface FilterContextType extends FilterState {
    setMinLevel: (level: number) => void;
    setMaxLevel: (level: number) => void;
    setExcludedMaps: (maps: string[]) => void;
    setSelectedElement: (element: string | null) => void;
    resetFilters: () => void;
}

const defaultState: FilterState = {
    minLevel: 1,
    maxLevel: 120,
    excludedMaps: [],
    selectedElement: null,
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider = ({ children }: { children: ReactNode }) => {
    const [state, setState] = useState<FilterState>(defaultState);

    const setMinLevel = useCallback((minLevel: number) => {
        setState(prev => ({ ...prev, minLevel }));
    }, []);

    const setMaxLevel = useCallback((maxLevel: number) => {
        setState(prev => ({ ...prev, maxLevel }));
    }, []);

    const setExcludedMaps = useCallback((excludedMaps: string[]) => {
        setState(prev => ({ ...prev, excludedMaps }));
    }, []);

    const setSelectedElement = useCallback((selectedElement: string | null) => {
        setState(prev => ({ ...prev, selectedElement }));
    }, []);

    const resetFilters = useCallback(() => {
        setState(defaultState);
    }, []);

    const value = {
        ...state,
        setMinLevel,
        setMaxLevel,
        setExcludedMaps,
        setSelectedElement,
        resetFilters,
    };

    return (
        <FilterContext.Provider value={value}>
            {children}
        </FilterContext.Provider>
    );
};

export const useFilterContext = () => {
    const context = useContext(FilterContext);
    if (context === undefined) {
        throw new Error('useFilterContext must be used within a FilterProvider');
    }
    return context;
};
