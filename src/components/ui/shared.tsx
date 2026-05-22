import React from 'react';
import { Loader2 } from 'lucide-react';

export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeMap = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
  return (
    <div className="flex items-center justify-center p-8">
      <Loader2 className={`${sizeMap[size]} text-vault-accent animate-spin`} />
    </div>
  );
};

export const EmptyState: React.FC<{
  icon: React.ElementType;
  title: string;
  description: string;
  action?: React.ReactNode;
}> = ({ icon: Icon, title, description, action }) => (
  <div className="empty-state gap-3">
    <div className="w-16 h-16 rounded-2xl bg-vault-surface border border-vault-border flex items-center justify-center mb-2">
      <Icon className="w-7 h-7 text-vault-muted" />
    </div>
    <h3 className="text-vault-text font-medium">{title}</h3>
    <p className="text-sm text-center max-w-xs">{description}</p>
    {action && <div className="mt-2">{action}</div>}
  </div>
);

export const ConfirmDialog: React.FC<{
  isOpen: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}> = ({ isOpen, title, description, onConfirm, onCancel, loading }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="p-5">
          <h3 className="text-base font-semibold text-vault-text mb-1">{title}</h3>
          <p className="text-sm text-vault-muted mb-5">{description}</p>
          <div className="flex justify-end gap-3">
            <button onClick={onCancel} className="vault-btn-ghost">Cancel</button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-vault-danger text-white text-sm font-medium
                         hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
