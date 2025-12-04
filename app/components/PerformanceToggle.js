"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { useState } from "react";
import useWidgetStore from "../store/useWidgetStore";

export default function PerformanceToggle() {
    const isPerformanceMode = useWidgetStore((state) => state.isPerformanceMode);
    const togglePerformanceMode = useWidgetStore((state) => state.togglePerformanceMode);
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <div className="fixed top-6 right-6 z-[120]">
            <motion.button
                onClick={togglePerformanceMode}
                onHoverStart={() => setShowTooltip(true)}
                onHoverEnd={() => setShowTooltip(false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`
                    relative p-4 rounded-full backdrop-blur-xl border shadow-2xl
                    transition-all duration-300 ease-out
                    ${isPerformanceMode
                        ? "bg-yellow-500/20 border-yellow-400/50 shadow-yellow-500/30"
                        : "bg-white/10 border-white/20 shadow-black/20"
                    }
                `}
            >
                {/* Icon */}
                <motion.div
                    animate={{
                        rotate: isPerformanceMode ? [0, -10, 10, -10, 0] : 0,
                        scale: isPerformanceMode ? [1, 1.1, 1] : 1,
                    }}
                    transition={{
                        duration: 0.5,
                        ease: "easeInOut",
                    }}
                >
                    <Zap
                        className={`w-6 h-6 transition-colors duration-300 ${isPerformanceMode
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-white/60"
                            }`}
                    />
                </motion.div>

                {/* Glow Effect (Active State) */}
                {isPerformanceMode && (
                    <motion.div
                        className="absolute inset-0 rounded-full bg-yellow-400/20 blur-xl"
                        animate={{
                            opacity: [0.5, 0.8, 0.5],
                            scale: [1, 1.2, 1],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />
                )}

                {/* Tooltip */}
                {showTooltip && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full right-0 mt-2 px-3 py-2 bg-black/90 backdrop-blur-sm border border-white/20 rounded-lg whitespace-nowrap text-sm text-white shadow-xl"
                    >
                        Performans Modu: {isPerformanceMode ? "Açık" : "Kapalı"}
                        <div className="absolute -top-1 right-4 w-2 h-2 bg-black/90 border-l border-t border-white/20 rotate-45" />
                    </motion.div>
                )}
            </motion.button>
        </div>
    );
}
