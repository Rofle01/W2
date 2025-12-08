"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import { LayoutTemplate, Cpu, ArrowRight } from "lucide-react";
import WorkspaceDock from "./components/WorkspaceDock";
import useWidgetStore from "./store/useWidgetStore";
import { getWidgetComponent } from "./components/WidgetRegistry";

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

  return (
    <main className="min-h-screen p-6 md:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto">
        {/* V2 PRO WORKSTATION GEÇİŞ BUTONU */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, type: "spring" }}
          className="absolute top-6 left-6 z-50 hidden md:block"
        >
          <Link href="/v2">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(6,182,212,0.4)" }}
              whileTap={{ scale: 0.95 }}
              className="group flex items-center gap-3 px-5 py-2.5 bg-black/40 backdrop-blur-xl border border-cyan-500/30 rounded-full text-cyan-400 font-bold text-xs tracking-wider hover:bg-cyan-500/10 transition-all shadow-lg shadow-cyan-900/20"
            >
              <div className="p-1.5 bg-cyan-500/20 rounded-full group-hover:bg-cyan-500/30 transition-colors border border-cyan-500/20">
                <Cpu className="w-4 h-4" />
              </div>
              <span>PRO WORKSTATION</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform opacity-60 group-hover:opacity-100" />
            </motion.button>
          </Link>
        </motion.div>

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
            <div className="relative h-24 w-48 flex items-center justify-center overflow-hidden">
              <img
                src="/w2-logo-new.png"
                alt="W2 Logo"
                className="h-full w-full object-contain"
                style={{
                  maskImage: "radial-gradient(circle, black 50%, transparent 100%)",
                  WebkitMaskImage: "radial-gradient(circle, black 50%, transparent 100%)",
                }}
              />
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
