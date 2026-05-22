import React, { useState } from 'react';
import {
  Vault, Sparkles, Link2, SquarePlay, NotebookPen, Code2,
  LogOut, Menu, X, ChevronRight, User
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { Section } from '@/types';

const NAV_ITEMS: { id: Section; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'prompts',  label: 'Prompts',       icon: Sparkles,     color: 'text-violet-400' },
  { id: 'links',    label: 'Bookmarks',     icon: Link2,        color: 'text-blue-400'   },
  { id: 'youtube',  label: 'YouTube',       icon: SquarePlay,   color: 'text-red-400'    },
  { id: 'notepad',  label: 'Notepad',       icon: NotebookPen,  color: 'text-emerald-400'},
  { id: 'snippets', label: 'Code Snippets', icon: Code2,        color: 'text-amber-400'  },
];

interface AppShellProps {
  activeSection: Section;
  onSectionChange: (s: Section) => void;
  children: React.ReactNode;
}

const SidebarContent: React.FC<{
  activeSection: Section;
  onSectionChange: (s: Section) => void;
  onClose: () => void;
}> = ({ activeSection, onSectionChange, onClose }) => {
  const { user, signOut } = useAuth();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-5 border-b border-vault-border">
        <div className="w-9 h-9 rounded-xl bg-vault-accent/20 border border-vault-accent/30 flex items-center justify-center shadow-glow-sm flex-shrink-0">
          <Vault className="w-5 h-5 text-vault-accent" />
        </div>
        <div>
          <span className="text-lg font-bold text-gradient">Vault</span>
          <p className="text-[10px] text-vault-muted leading-none mt-0.5">Knowledge Hub</p>
        </div>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-semibold text-vault-muted uppercase tracking-widest px-3 mb-3">
          Sections
        </p>
        {NAV_ITEMS.map(({ id, label, icon: Icon, color }) => {
          const isActive = activeSection === id;
          return (
            <button
              key={id}
              onClick={() => { onSectionChange(id); onClose(); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-vault-accent/15 text-vault-accent border border-vault-accent/25 shadow-glow-sm'
                  : 'text-vault-muted hover:text-vault-text hover:bg-vault-surface'
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-vault-accent' : color} group-hover:scale-110 transition-transform`} />
              <span className="flex-1 text-left">{label}</span>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-vault-accent" />}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-vault-border p-3">
        <div className="flex items-center gap-2 px-2 py-2 rounded-xl bg-vault-surface">
          <div className="w-8 h-8 rounded-full bg-vault-accent/20 border border-vault-accent/30 flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-vault-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-vault-text truncate">
              {user?.email?.split('@')[0]}
            </p>
            <p className="text-[10px] text-vault-muted truncate">{user?.email}</p>
          </div>
          <button
            onClick={signOut}
            title="Sign out"
            className="text-vault-muted hover:text-vault-danger transition-colors p-1 rounded-lg hover:bg-vault-danger/10"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const AppShell: React.FC<AppShellProps> = ({ activeSection, onSectionChange, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-60 flex-col bg-vault-surface border-r border-vault-border flex-shrink-0">
        <SidebarContent activeSection={activeSection} onSectionChange={onSectionChange} onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        </div>
      )}

      {/* Mobile Sidebar Drawer */}
      <aside className={`fixed left-0 top-0 h-full w-64 z-50 bg-vault-surface border-r border-vault-border
                         transform transition-transform duration-300 md:hidden
                         ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="absolute top-3 right-3">
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg text-vault-muted hover:text-vault-text hover:bg-vault-border/50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <SidebarContent activeSection={activeSection} onSectionChange={onSectionChange} onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-vault-surface border-b border-vault-border flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg text-vault-muted hover:text-vault-text hover:bg-vault-border/50"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Vault className="w-5 h-5 text-vault-accent" />
            <span className="font-bold text-gradient">Vault</span>
          </div>
          <div className="ml-auto">
            <span className="text-xs text-vault-muted">
              {NAV_ITEMS.find(n => n.id === activeSection)?.label}
            </span>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
