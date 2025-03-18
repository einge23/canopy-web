import React from "react";
import { cn } from "~/lib/utils";

interface AnimatedLoaderProps {
    className?: string;
}

export function AnimatedLoader({ className }: AnimatedLoaderProps) {
    return (
        <div className={cn("flex items-center justify-center", className)}>
            <div className="relative h-16 w-16">
                <div className="absolute inset-0 rounded-full border-4 border-t-teal border-r-transparent border-b-teal/60 border-l-transparent animate-spin" />

                <div className="absolute inset-3 rounded-full bg-teal/20 animate-pulse" />

                <div className="absolute inset-6 rounded-full bg-teal/70" />
            </div>
        </div>
    );
}
