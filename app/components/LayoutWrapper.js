"use client";

import { MotionConfig } from "framer-motion";
import useWidgetStore from "../store/useWidgetStore";
import InteractiveBackground from "./InteractiveBackground";
import PerformanceToggle from "./PerformanceToggle";

export default function LayoutWrapper({ children }) {
    const isPerformanceMode = useWidgetStore((state) => state.isPerformanceMode);

    return (
        <MotionConfig transition={isPerformanceMode ? { duration: 0 } : undefined}>
            {/* Conditional Background - Only render when performance mode is OFF */}
            {!isPerformanceMode && <InteractiveBackground />}

            {/* Performance Toggle Button */}
            <PerformanceToggle />

            {/* Main Content */}
            {children}
        </MotionConfig>
    );
}
