//src/shared/ui/separator.tsx
"use client"

import * as React from "react"
import { cn } from "@/src/core/lib/utils"

interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
    orientation?: "horizontal" | "vertical"
    decorative?: boolean
}

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
    (
        { className, orientation = "horizontal", decorative = true, ...props },
        ref
    ) => (
        <div
            ref={ref}
            role={decorative ? "none" : "separator"}
            aria-orientation={decorative ? undefined : orientation}
            className={cn(
                "shrink-0 bg-border", // Nếu không hiện màu, hãy đổi thành "bg-gray-200" hoặc "bg-neutral-200"
                orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
                className
            )}
            {...props}
        />
    )
)
Separator.displayName = "Separator"

export { Separator }