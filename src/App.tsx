import { useState } from 'react';
import type { ReactElement } from 'react';
import { Toaster } from 'react-hot-toast';
import { AppShell } from '@/components/layout/AppShell';
import { AuthPage } from '@/components/auth/AuthPage';
import { LinkBoard } from '@/components/links/LinkBoard';
import { NotepadEditor } from '@/components/notepad/NotepadEditor';
import { PromptPanel } from '@/components/prompts/PromptPanel';
import { ExtraBoard } from '@/components/snippets/ExtraBoard';
import { YouTubeBoard } from '@/components/youtube/YouTubeBoard';
import { useAuth } from '@/context/AuthContext';
import type { Section } from '@/types';

const sections: Record<Section, ReactElement> = {
  prompts: <PromptPanel />,
  links: <LinkBoard />,
  youtube: <YouTubeBoard />,
  notepad: <NotepadEditor />,
  snippets: <ExtraBoard />,
};

function App() {
  const { loading, user } = useAuth();
  const [activeSection, setActiveSection] = useState<Section>('prompts');

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center text-vault-muted">
        Loading Vault...
      </div>
    );
  }

  return (
    <>
      {user ? (
        <AppShell activeSection={activeSection} onSectionChange={setActiveSection}>
          {sections[activeSection]}
        </AppShell>
      ) : (
        <AuthPage />
      )}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1a1e2a',
            border: '1px solid #252836',
            color: '#e2e4ed',
          },
        }}
      />
    </>
  );
}

export default App;
