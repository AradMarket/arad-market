export default function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-6 py-4 border-b border-slate-800/50">
      <div className="skeleton w-8 h-8 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-4 w-24 rounded" />
        <div className="skeleton h-3 w-16 rounded" />
      </div>
      <div className="skeleton h-4 w-28 rounded" />
      <div className="skeleton h-4 w-20 rounded" />
      <div className="skeleton h-4 w-24 rounded hidden md:block" />
      <div className="skeleton h-4 w-24 rounded hidden lg:block" />
      <div className="skeleton h-6 w-16 rounded-full" />
    </div>
  );
}
