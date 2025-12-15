import { useMemo } from "react";
import useWidgetStore from "../store/useWidgetStore";
import { MASTER_REGISTRY } from "../data/initialData";
import { mergeMarketData } from "../lib/marketUtils";

/**
 * Merkezi veri paylaşım hook'u
 * Tüm widget'lara ortak veri sağlar
 * 
 * YENİ MİMARİ: Veriler workspace.data objesinden okunur
 */
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

    // 3. Aktif Workspace'i Bul
    const activeWorkspace = workspaces.find((ws) => ws.id === activeWorkspaceId);
    const workspaceData = activeWorkspace?.data || {};

    // 4. Karakter Verilerini Al (Yeni workspace.data yapısından)
    // Birden fazla olası key'i kontrol et (eski ve yeni)
    const characterData =
        workspaceData.characterStats ||      // Yeni key (DashboardContent'ten)
        workspaceData['character-settings'] || // Alternatif key
        workspaceData['character-stats'] ||    // Alternatif key
        null;

    const userStats = characterData || {
        damage: 3000,
        hitsPerSecond: 2.5,
        findTime: 10
    };

    // 5. Metin Listesini Al (Yeni workspace.data yapısından)
    // İmport işlemi metinSettings.metins'e kaydediyor
    const metinData = workspaceData.metinSettings?.metins;
    const metinList = (metinData && metinData.length > 0)
        ? metinData
        : MASTER_REGISTRY.metinTemplates;

    // 6. Market Birleştirme
    const marketItems = useMemo(() => {
        return mergeMarketData(itemRegistry, prices);
    }, [itemRegistry, prices]);

    // 7. Hepsini Paketle
    return {
        userStats,
        metinList,
        marketItems,
        craftingItems,
        prices,
        multipliers,
        bosses,
        // Debug için workspace data'ya erişim
        workspaceData
    };
}

