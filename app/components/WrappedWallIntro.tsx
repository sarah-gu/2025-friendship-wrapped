"use client";

import { ReactNode } from "react";

interface WrappedWallIntroProps {
  hostName: string | ReactNode;
  title: string | ReactNode;
  description?: string | ReactNode;
  memoryCount: number;
  children?: ReactNode;
}

export default function WrappedWallIntro({
  hostName,
  title,
  description,
  memoryCount,
  children,
}: WrappedWallIntroProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-white/10 pb-8">
      <div className="space-y-2 flex-1">
        {children || (
          <div className="inline-flex items-center gap-2 text-pink-400 text-sm font-bold uppercase tracking-wider mb-2">
            {typeof hostName === "string" ? `${hostName}'s Circle` : hostName}
          </div>
        )}
        <div className="flex items-center gap-2">
          {typeof title === "string" ? (
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-white tracking-tight">
              {title}
            </h2>
          ) : (
            title
          )}
        </div>
        {description && (
          <div className="flex items-center gap-2 group">
            {typeof description === "string" ? (
              <p className="text-slate-300 text-sm md:text-lg font-medium">
                {description}
              </p>
            ) : (
              description
            )}
          </div>
        )}
      </div>
      <div className="text-right">
        <p className="text-2xl md:text-4xl font-black text-white">
          {memoryCount}
        </p>
        <p className="text-slate-500 font-medium text-sm uppercase tracking-wider">
          Memories Dropped
        </p>
      </div>
    </div>
  );
}

