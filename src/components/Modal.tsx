import type { ReactNode } from 'react';

export default function Modal({ open, title, onClose, children }: { open: boolean, title: string, onClose: () => void, children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        {children}
      </div>
    </div>
  );
}