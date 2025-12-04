"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

// Slice'ları içe aktar
import { createUISlice } from "./slices/createUISlice";
import { createMarketSlice } from "./slices/createMarketSlice";
import { createCraftingSlice } from "./slices/createCraftingSlice";

// Sabitleri içe aktar (Eğer app/store/constants.js oluşturmadıysan, WIDGET_REGISTRY'yi app/data/constants.js yolundan alabilirsin)
// Not: Eğer constants dosyan yoksa bu satırı kontrol et.
import { WIDGET_REGISTRY } from "../store/constants";

// ============================================================================
// STORE OLUŞTURMA (Slice Pattern)
// ============================================================================
const useWidgetStore = create(
  persist(
    immer((...a) => ({
      ...createUISlice(...a),
      ...createMarketSlice(...a),
      ...createCraftingSlice(...a),
    })),
    {
      name: "financial-dashboard-storage", // LocalStorage Key
      version: 5, // ÖNEMLİ: Versiyon 5'e geçtik, serverProfiles yapısı düzeltildi.

      // Migration: Versiyon değişirse state'i temizle
      migrate: (persistedState, version) => {
        if (version < 4) {
          return persistedState; // Eski veriyi koru, yeni alanlar otomatik eklenecek
        }
        return persistedState;
      },
    }
  )
);

// ============================================================================
// HELPER HOOKS (Geriye Dönük Uyumluluk - Componentler Kırılmasın Diye)
// ============================================================================

/**
 * Verilen widget tipine göre Registry'den tanım döndürür
 */
export const useWidgetDefinition = (type) => {
  return WIDGET_REGISTRY[type] || null;
};

/**
 * Aktif workspace'i döndürür
 */
export const useActiveWorkspace = () => {
  return useWidgetStore((state) => {
    const activeId = state.activeWorkspaceId;
    return state.workspaces.find((ws) => ws.id === activeId);
  });
};

/**
 * Aktif workspace'teki görünür widget'ları döndürür
 */
export const useVisibleWidgets = () => {
  return useWidgetStore((state) => {
    const activeWorkspace = state.workspaces.find(
      (ws) => ws.id === state.activeWorkspaceId
    );
    return activeWorkspace?.widgets.filter((w) => w.isVisible) || [];
  });
};

/**
 * Aktif workspace'teki gizli widget'ları döndürür
 */
export const useHiddenWidgets = () => {
  return useWidgetStore((state) => {
    const activeWorkspace = state.workspaces.find(
      (ws) => ws.id === state.activeWorkspaceId
    );
    return activeWorkspace?.widgets.filter((w) => !w.isVisible) || [];
  });
};

/**
 * Tüm workspace'leri döndürür
 */
export const useWorkspaces = () => {
  return useWidgetStore((state) => state.workspaces);
};

/**
 * Aktif workspace ID'sini döndürür
 */
export const useActiveWorkspaceId = () => {
  return useWidgetStore((state) => state.activeWorkspaceId);
};

// ============================================================================
// EXPORTS
// ============================================================================
export { WIDGET_REGISTRY };
export default useWidgetStore;
