import { useMemo } from "react";
import useWidgetStore from "../store/useWidgetStore";
import { MASTER_REGISTRY } from "../data/initialData";
import { mergeMarketData } from "../lib/marketUtils";

export function useSharedWidgetData() {
    // 1. Global Store Verileri
    const activeWorkspaceId = useWidgetStore((state) => state.activeWorkspaceId);
    const workspaces = useWidgetStore((state) => state.workspaces);
    const activeServerId = useWidgetStore((state) => state.activeServerId);
    const serverProfiles = useWidgetStore((state) => state.serverProfiles);
    const itemRegistry = useWidgetStore((state) => state.masterRegistry);
    const craftingItems = useWidgetStore((state) => state.craftingItems) || [];
    const bosses = useWidgetStore((state) => state.bosses) || [];

    // 2. Aktif Sunucu Fiyatlarını Bul
    const activeProfile = serverProfiles.find(p => p.id === activeServerId);
    const prices = activeProfile?.prices || {};
    const multipliers = activeProfile?.multipliers || { drop: 1.0 };

    // 3. Diğer Store Verileri (Kardeş Widgetlar)
    const activeWorkspace = workspaces.find((ws) => ws.id === activeWorkspaceId);
    const widgets = activeWorkspace?.widgets || [];

    const characterWidget = widgets.find((w) => w.type === "character-stats");
    const metinWidget = widgets.find((w) => w.type === "metin-settings");
    const bossWidget = widgets.find((w) => w.type === "boss-settings");

    const userStats = characterWidget?.data || { damage: 3000, hitsPerSecond: 2.5, findTime: 10 };
    const metinList = metinWidget?.data?.metins || MASTER_REGISTRY.metinTemplates;


    // 4. Market Birleştirme
    const marketItems = useMemo(() => {
        return mergeMarketData(itemRegistry, prices);
    }, [itemRegistry, prices]);

    // 5. Hepsini Paketle
    return { userStats, metinList, marketItems, craftingItems, prices, multipliers, bosses };
}
