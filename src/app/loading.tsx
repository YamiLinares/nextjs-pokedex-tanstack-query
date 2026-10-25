import { CardGridSkeleton } from "@/components/ui/skeletons";

export default function Loading() {
  return (
    <>
      <div className="h-56 bg-navy-900" aria-hidden="true" />
      <div className="mx-auto -mt-14 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 h-24 animate-pulse rounded-3xl bg-surface shadow-card" aria-hidden="true" />
        <CardGridSkeleton count={10} />
      </div>
    </>
  );
}
