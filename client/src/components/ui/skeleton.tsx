import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

function ProjectCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("glass-card rounded-2xl overflow-hidden", className)}>
      {/* Image skeleton */}
      <div className="relative aspect-[4/3]">
        <Skeleton className="absolute inset-0 rounded-none" />
        {/* Badge skeleton */}
        <div className="absolute top-4 left-4">
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="p-5 space-y-4">
        {/* Title */}
        <Skeleton className="h-6 w-3/4" />

        {/* Location */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-1/2" />
        </div>

        {/* Stats row */}
        <div className="flex justify-between pt-2">
          <div className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5 w-24" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>

        {/* Button skeleton */}
        <Skeleton className="h-10 w-full rounded-lg mt-4" />
      </div>
    </div>
  )
}

export { Skeleton, ProjectCardSkeleton }
