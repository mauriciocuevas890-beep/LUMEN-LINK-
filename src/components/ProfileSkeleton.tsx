import React from 'react';

interface ProfileSkeletonProps {
  handle?: string;
}

export function ProfileSkeleton({ handle }: ProfileSkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Cargando perfil..."
      className="min-h-screen-dvh w-full bg-slate-950 text-slate-100 py-8 sm:py-12 md:py-16 px-3.5 xs:px-4 sm:px-6 md:px-8 pb-safe pt-safe flex flex-col justify-between relative overflow-hidden select-none"
    >
      {/* Subtle ambient blur lights in background */}
      <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      {/* Main Container - matches max-w-md sm:max-w-lg md:max-w-xl mx-auto from ProfileView */}
      <div className="relative z-10 max-w-md sm:max-w-lg md:max-w-xl mx-auto w-full">
        {/* Top action bar skeleton */}
        <div className="w-full flex items-center justify-between mb-4 sm:mb-6">
          {/* Brand watermark or badge silhouette */}
          <div className="h-6 w-20 rounded-full bg-slate-900/80 border border-slate-800/80 animate-shimmer" />

          {/* Right action buttons: QR & Share buttons */}
          <div className="flex items-center gap-2">
            <div className="min-h-[44px] min-w-[44px] rounded-full bg-slate-900/80 border border-slate-800/80 animate-shimmer" />
            <div className="min-h-[44px] min-w-[44px] rounded-full bg-slate-900/80 border border-slate-800/80 animate-shimmer" />
          </div>
        </div>

        {/* Center Profile Area */}
        <div className="w-full flex flex-col items-center text-center">
          {/* Card template / Banner silhouette */}
          <div className="w-full h-28 sm:h-36 rounded-3xl bg-slate-900/60 border border-slate-800/70 mb-[-44px] relative overflow-hidden animate-shimmer" />

          {/* Profile Avatar Skeleton */}
          <div className="relative mb-4 z-10">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-slate-900 border-4 border-slate-800/90 shadow-2xl relative overflow-hidden animate-shimmer flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-slate-800/60" />
            </div>
          </div>

          {/* Display Name Skeleton */}
          <div className="h-7 sm:h-8 w-48 sm:w-56 rounded-xl bg-slate-800/80 mb-2 animate-shimmer" />

          {/* Handle / Username Tag */}
          {handle ? (
            <div className="h-5 px-3 rounded-full bg-slate-900/80 border border-slate-800/80 mb-3 flex items-center justify-center">
              <span className="text-xs font-mono text-slate-400 font-semibold truncate max-w-[200px]">
                @{handle.replace(/^@/, '')}
              </span>
            </div>
          ) : (
            <div className="h-4 w-28 sm:w-32 rounded-lg bg-slate-800/60 mb-3 animate-shimmer" />
          )}

          {/* Bio Skeleton Lines */}
          <div className="w-full flex flex-col items-center gap-1.5 mb-6 max-w-sm">
            <div className="h-3.5 w-72 sm:w-80 max-w-[85%] rounded-md bg-slate-800/70 animate-shimmer" />
            <div className="h-3.5 w-52 sm:w-60 max-w-[65%] rounded-md bg-slate-800/50 animate-shimmer" />
          </div>

          {/* Action Bar (Phone / WhatsApp or Save Contact) Skeleton */}
          <div className="w-full mb-6">
            <div className="h-12 sm:h-13 w-full rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800/80 shadow-lg relative overflow-hidden animate-shimmer flex items-center justify-center gap-2">
              <div className="w-4 h-4 rounded-full bg-slate-800/80" />
              <div className="h-4 w-36 rounded-md bg-slate-800/80" />
            </div>
          </div>

          {/* Section Divider Skeleton */}
          <div className="w-full flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-slate-800/60" />
            <div className="h-3 w-16 rounded-full bg-slate-800/60 animate-shimmer" />
            <div className="h-px flex-1 bg-slate-800/60" />
          </div>

          {/* Link Cards Skeletons - Staggered realistic items */}
          <div className="w-full space-y-3">
            {[1, 2, 3, 4].map((index) => (
              <div
                key={index}
                className="w-full p-4 rounded-2xl bg-slate-900/80 border border-slate-800/70 shadow-sm flex items-center justify-between gap-3 relative overflow-hidden animate-shimmer"
              >
                {/* Left icon placeholder */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-800/90 shrink-0 flex items-center justify-center">
                    <div className="w-4 h-4 rounded-md bg-slate-700/60" />
                  </div>
                  {/* Title and subtitle text placeholders */}
                  <div className="space-y-1.5 flex-1 text-left min-w-0">
                    <div
                      className="h-4 rounded-md bg-slate-800/90"
                      style={{
                        width: index === 1 ? '60%' : index === 2 ? '75%' : index === 3 ? '50%' : '68%',
                      }}
                    />
                    <div
                      className="h-2.5 rounded-md bg-slate-800/50"
                      style={{
                        width: index === 1 ? '35%' : index === 2 ? '45%' : index === 3 ? '30%' : '40%',
                      }}
                    />
                  </div>
                </div>

                {/* Right external arrow placeholder */}
                <div className="w-4 h-4 rounded-md bg-slate-800/60 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer skeleton */}
      <div className="mt-8 flex flex-col items-center gap-2">
        <div className="h-3 w-28 rounded-full bg-slate-900 border border-slate-800/60 animate-shimmer" />
      </div>
    </div>
  );
}
