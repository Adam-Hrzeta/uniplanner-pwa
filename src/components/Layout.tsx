import Navbar from './Navbar';
import type { ReactNode } from 'react';
import { useReminderScheduler } from '../hooks/useReminderScheduler';

export default function Layout({ children }: { children: ReactNode }) {
  const reminderError = useReminderScheduler();
  return (
    <div className="layout">
      <Navbar />
      <main className="container">
        {reminderError && <p className="notice error" role="alert">{reminderError}</p>}
        {children}
      </main>
    </div>
  );
}