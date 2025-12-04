"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useMotionTemplate, animate } from "framer-motion";
import { LayoutTemplate } from "lucide-react";
import FinancialWidget from "./components/FinancialWidget";
import MarketWidget from "./components/widgets/MarketWidget";
import CharacterWidget from "./components/widgets/CharacterWidget";
import AnalysisWidget from "./components/widgets/AnalysisWidget";
import MetinSettingsWidget from "./components/widgets/MetinSettingsWidget";
import DamageProgressionWidget from "./components/widgets/DamageProgressionWidget";
import MarketSupplyWidget from "./components/widgets/MarketSupplyWidget";
import CraftingWidget from "./components/widgets/CraftingWidget";
import WorkspaceDock from "./components/WorkspaceDock";
import useWidgetStore from "./store/useWidgetStore";
import { WIDGET_TYPES } from "./store/constants";

// Widget component mapping
const WIDGET_COMPONENTS = {
  [WIDGET_TYPES.MARKET]: MarketWidget,
  [WIDGET_TYPES.CHARACTER]: CharacterWidget,
  [WIDGET_TYPES.ANALYSIS]: AnalysisWidget,
  [WIDGET_TYPES.METIN_SETTINGS]: MetinSettingsWidget,
  [WIDGET_TYPES.DAMAGE_PROGRESSION]: DamageProgressionWidget,
  [WIDGET_TYPES.MARKET_SUPPLY]: MarketSupplyWidget,
  [WIDGET_TYPES.CRAFTING]: CraftingWidget,
  // All other widgets use FinancialWidget
};

export default function Home() {
  const [selectedId, setSelectedId] = useState(null);

  // Store'dan workspace verilerini çek
  const activeWorkspaceId = useWidgetStore((state) => state.activeWorkspaceId);
  const workspaces = useWidgetStore((state) => state.workspaces);
  const toggleWidgetVisibility = useWidgetStore((state) => state.toggleWidgetVisibility);

  // Aktif workspace'i bul
  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId);

  // Görünür widget'ları filtrele (optional chaining ile güvenli erişim)
  const visibleWidgets = activeWorkspace?.widgets?.filter((w) => w.isVisible) || [];

  // FIX: Workspace değiştiğinde açık olan widget'ı kapat (Blur sorununu çözer)
  useEffect(() => {
    setSelectedId(null);
  }, [activeWorkspaceId]);

  // Mouse Motion Values for Spotlight Effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  // Get the appropriate widget component
  const getWidgetComponent = (type) => {
    return WIDGET_COMPONENTS[type] || FinancialWidget;
  };

  return (
    <main className="min-h-screen p-6 md:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex flex-col items-center justify-center relative z-10">
          <motion.div
            className="relative"
            // 1. Idle Floating Animation
            animate={{ y: [-4, 4, -4] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            // 2. Interactive Hover
            whileHover={{ scale: 1.05, filter: "brightness(1.2)" }}
          >
            {/* Video Container with Aggressive Masking */}
            <div
              className="relative h-24 w-48 flex items-center justify-center overflow-hidden"
              style={{
                // 1. CSS Mask: Start fading from 20% center, fully invisible by 70%
                maskImage: "radial-gradient(ellipse at center, rgba(0,0,0,1) 20%, rgba(0,0,0,0) 70%)",
                WebkitMaskImage: "radial-gradient(ellipse at center, rgba(0,0,0,1) 20%, rgba(0,0,0,0) 70%)",
              }}
            >
              <video
                src="/w2-logo.mp4"
                autoPlay
                loop
                muted
                playsInline
                // 'object-cover' and 'scale-150' ensures the edges of the video are pushed way out of the visible mask area
                className="h-full w-full object-cover scale-125 mix-blend-screen pointer-events-none"
              />

              {/* 2. Safety Vignette Overlay (Extra layer to kill edges) */}
              <div className="absolute inset-0 bg-radial-gradient-to-t from-black via-transparent to-transparent opacity-50" />
            </div>
          </motion.div>

          {/* Accessible Title (Hidden visually but kept for structure) */}
          <h1 className="sr-only">W2 Economy Manager</h1>

          {activeWorkspace && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-white/60 -mt-2 relative z-10"
            >
              Aktif Çalışma Alanı: <span className="font-semibold text-cyan-400">{activeWorkspace.name}</span>
            </motion.p>
          )}
        </header>

        {visibleWidgets.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center h-[50vh] text-white/40 border-2 border-dashed border-white/20 rounded-3xl bg-white/5 backdrop-blur-sm">
            <div className="p-4 bg-white/10 rounded-full mb-4">
              <LayoutTemplate className="w-8 h-8 text-white/60" />
            </div>
            <h3 className="text-lg font-semibold text-white/80 mb-1">Bu Çalışma Alanı Boş</h3>
            <p className="text-sm text-white/50">
              Widget eklemek için aşağıdaki menüden Grid ikonuna tıklayın.
            </p>
          </div>
        ) : (
          /* Widget Grid */
          <div key={activeWorkspaceId} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-32">
            <AnimatePresence mode="popLayout">
              {visibleWidgets.map((widget) => {
                const WidgetComponent = getWidgetComponent(widget.type);
                return (
                  <WidgetComponent
                    key={widget.id}
                    id={widget.id}
                    type={widget.type}
                    data={widget.data}
                    isSelected={selectedId === widget.id}
                    onClick={() => setSelectedId(selectedId === widget.id ? null : widget.id)}
                    onHide={() => toggleWidgetVisibility(widget.id)}
                  />
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Backdrop Overlay for Expanded Widget */}
        <AnimatePresence>
          {selectedId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedId(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[90]"
              transition={{ duration: 0.2 }}
            />
          )}
        </AnimatePresence>

        {/* Workspace Dock - Unified workspace and widget management */}
        <WorkspaceDock />
      </div>
    </main>
  );
}
