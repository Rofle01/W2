"use client";

import { MotionConfig } from "framer-motion";

export default function LayoutWrapper({ children }) {
    return (
        <MotionConfig>
            {children}
        </MotionConfig>
    );
}
