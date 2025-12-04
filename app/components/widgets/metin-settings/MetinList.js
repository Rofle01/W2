"use client";

import { useState } from "react";
import MetinAccordionItem from "./MetinAccordionItem";

export default function MetinList({ metins, marketItems, craftingItems, updateWidgetData, widgetId }) {
    const [openMetinId, setOpenMetinId] = useState(null);

    const handleUpdateHP = (metinId, newHP) => {
        const updated = metins.map((m) =>
            m.id === metinId ? { ...m, hp: newHP } : m
        );
        updateWidgetData(widgetId, { metins: updated });
    };

    const handleAddDrop = (metinId, itemId, sourceType) => {
        const updated = metins.map((m) => {
            if (m.id === metinId) {
                return {
                    ...m,
                    drops: [
                        ...m.drops,
                        {
                            id: crypto.randomUUID(),
                            itemId,
                            sourceType: sourceType || 'market', // Track source type
                            count: 1,
                            chance: 10,
                        },
                    ],
                };
            }
            return m;
        });
        updateWidgetData(widgetId, { metins: updated });
    };

    const handleRemoveDrop = (metinId, dropId) => {
        const updated = metins.map((m) => {
            if (m.id === metinId) {
                return {
                    ...m,
                    drops: m.drops.filter((d) => d.id !== dropId),
                };
            }
            return m;
        });
        updateWidgetData(widgetId, { metins: updated });
    };

    const handleUpdateDrop = (metinId, dropId, field, value) => {
        const updated = metins.map((m) => {
            if (m.id === metinId) {
                return {
                    ...m,
                    drops: m.drops.map((d) =>
                        d.id === dropId ? { ...d, [field]: value } : d
                    ),
                };
            }
            return m;
        });
        updateWidgetData(widgetId, { metins: updated });
    };

    return (
        <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {metins.map((metin) => (
                <MetinAccordionItem
                    key={metin.id}
                    metin={metin}
                    isOpen={openMetinId === metin.id}
                    onToggle={() =>
                        setOpenMetinId(openMetinId === metin.id ? null : metin.id)
                    }
                    onUpdateHP={handleUpdateHP}
                    onAddDrop={handleAddDrop}
                    onRemoveDrop={handleRemoveDrop}
                    onUpdateDrop={handleUpdateDrop}
                    marketItems={marketItems}
                    craftingItems={craftingItems}
                />
            ))}
        </div>
    );
}
