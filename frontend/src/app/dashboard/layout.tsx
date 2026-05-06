import type { Metadata } from 'next';
import { SessionGuard } from '@/components/auth/SessionGuard';

export const metadata: Metadata = {
  title: 'Dashboard — Data Room',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionGuard>{children}</SessionGuard>;
}
