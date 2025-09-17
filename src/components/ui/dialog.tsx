import * as React from "react"

export function Dialog({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-background rounded-lg shadow-lg p-6 min-w-[320px] max-w-[90vw]">
        {children}
        <button className="absolute top-2 right-2 text-xl" onClick={onClose}>&times;</button>
      </div>
    </div>
  );
}
