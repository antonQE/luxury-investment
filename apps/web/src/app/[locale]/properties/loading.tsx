import { PropertyGridSkeleton } from '@/components/ui/PageLoader';

export default function ListingsLoading() {
  return (
    <main className="w-full loader-delayed">
      <div className="page-hero">
        <div className="mx-auto max-w-6xl px-6 pt-16 pb-16 md:pt-24 md:pb-20">
          <div className="h-3 w-32 bg-stone/10" />
          <div className="mt-5 h-12 w-64 bg-stone/10" />
          <div className="mt-5 h-4 w-28 bg-stone/10" />
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-6 pb-24">
        <div className="relative z-10 -mt-12 h-40 border border-line bg-paper md:-mt-14" />
        <div className="mt-16">
          <PropertyGridSkeleton />
        </div>
      </div>
    </main>
  );
}
