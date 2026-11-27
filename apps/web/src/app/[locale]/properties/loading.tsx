import { PropertyGridSkeleton } from '@/components/ui/PageLoader';

export default function ListingsLoading() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12 animate-fade-in">
      <div className="h-9 w-48 bg-line/70" />
      <div className="mt-3 h-4 w-28 bg-line/60" />
      <div className="mt-8 h-28 border border-line/70 bg-paper/50" />
      <div className="mt-10">
        <PropertyGridSkeleton />
      </div>
    </main>
  );
}
