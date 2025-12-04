import { useMemo } from 'react';
import { useFilterContext } from './FilterContext';

export interface RoadmapItem {
    id: string | number;
    name: string;
    level: number;
    map: string;
    element?: string;
    [key: string]: any;
}

export const useFilteredRoadmap = (rawData: RoadmapItem[]) => {
    const { minLevel, maxLevel, excludedMaps, selectedElement } = useFilterContext();

    const filteredData = useMemo(() => {
        console.log(`Filtering ${rawData.length} items...`);
        console.log('Filter Criteria:', { minLevel, maxLevel, excludedMaps, selectedElement });

        const result = rawData.filter((item) => {
            // 1. Level Check
            if (item.level < minLevel || item.level > maxLevel) {
                return false;
            }

            // 2. Map Check (Excluded)
            if (excludedMaps.includes(item.map)) {
                return false;
            }

            // 3. Element Check (Optional)
            if (selectedElement && item.element !== selectedElement) {
                return false;
            }

            return true;
        });

        console.log(`Filtered down to ${result.length} items.`);
        return result;
    }, [rawData, minLevel, maxLevel, excludedMaps, selectedElement]);

    return filteredData;
};
