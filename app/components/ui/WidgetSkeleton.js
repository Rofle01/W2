import React from 'react';

export default function WidgetSkeleton() {
    return (
        <div className="relative h-64 rounded-3xl overflow-hidden bg-white/5 backdrop-blur-sm border border-white/5 animate-pulse">
            {/* Header Skeleton */}
            <div className="absolute top-0 left-0 right-0 h-16 bg-white/5 border-b border-white/5" />

            {/* Content Skeleton */}
            <div className="absolute inset-x-6 top-24 bottom-6 space-y-4">
                <div className="h-4 bg-white/10 rounded-full w-3/4" />
                <div className="h-4 bg-white/10 rounded-full w-1/2" />
                <div className="h-4 bg-white/10 rounded-full w-2/3" />
            </div>

            {/* Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" />
        </div>
    );
}
