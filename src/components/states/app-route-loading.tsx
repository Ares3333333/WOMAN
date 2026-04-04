import { Skeleton } from "@/components/ui/skeleton";

/** Full-width loading skeleton inside the app shell content column. */
export function AppRouteLoading() {
  return (
    <div className="space-y-6 pb-8" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-9 w-56 max-w-full" />
      <Skeleton className="h-4 w-full max-w-md" />
      <div className="space-y-3">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
      </div>
    </div>
  );
}
