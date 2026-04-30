'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronRight,
  AlertTriangle,
  ShieldAlert,
  FileText,
  DollarSign,
  BarChart2,
  Users,
  TrendingUp,
  Briefcase,
  PieChart,
  ShieldCheck,
  Globe,
} from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useReports } from '@/hooks/useReports';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopBar } from '@/components/dashboard/TopBar';
import { OverviewCard } from '@/components/overview/OverviewCard';
import { PDFViewerModal } from '@/components/overview/PDFViewerModal';

interface SelectedDocument {
  title: string;
}

const OVERVIEW_CARDS = [
  {
    title: 'Investment Memo',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing.',
    icon: FileText,
  },
  {
    title: 'Financial Records',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing.',
    icon: DollarSign,
  },
  {
    title: 'Operational Reports',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing.',
    icon: BarChart2,
  },
  {
    title: 'HR Dashboard',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing.',
    icon: Users,
  },
  {
    title: 'Sales Analytics',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing.',
    icon: TrendingUp,
  },
  {
    title: 'Project Status',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing.',
    icon: Briefcase,
  },
  {
    title: 'Budget Overview',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing.',
    icon: PieChart,
  },
  {
    title: 'Compliance Reports',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing.',
    icon: ShieldCheck,
  },
  {
    title: 'Market Analysis',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing.',
    icon: Globe,
  },
];

export default function OverviewPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const handleLogout = () => signOut({ callbackUrl: '/login' });
  const { reports, isLoading } = useReports();
  const rolId = session?.user?.rol_id ?? null;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<SelectedDocument | null>(null);

  const handleCardClick = (title: string) => {
    setSelectedDocument({ title });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDocument(null);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      {/* Sidebar: clic en reporte → navega a /dashboard */}
      <Sidebar
        reports={reports}
        isLoading={isLoading}
        selectedReport={null}
        onReportSelect={(report) => router.push(`/dashboard?reportId=${report.id}`)}
        onLogout={handleLogout}
        rolId={rolId}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Área principal */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar activeTitle="Overview" rolId={rolId} onLogout={handleLogout} onMenuToggle={() => setSidebarOpen((v) => !v)} />

        <main className="flex-1 overflow-y-auto p-6">
          {/* Breadcrumb de página */}
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
            <span>Portal Construex</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-800 font-medium">Overview</span>
          </div>

          {/* Contenedor de Bienvenida */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 mb-6">
            <h1 className="text-3xl font-bold text-slate-800 mb-3">
              Welcome to the Construex Portal
            </h1>
            <p className="text-slate-500 text-base leading-relaxed mb-6">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua.
            </p>

            {/* Alerta Amarilla — Strictly Confidential */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-3">
              <p className="font-semibold text-amber-800 flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                Strictly Confidential
              </p>
              <p className="text-amber-700 text-sm">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </p>
            </div>

            {/* Alerta Roja — Important Notice */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="font-semibold text-red-800 flex items-center gap-2 mb-1">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                Important Notice
              </p>
              <p className="text-red-700 text-sm">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </p>
            </div>
          </div>

          {/* Grid de Tarjetas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {OVERVIEW_CARDS.map((card) => (
              <OverviewCard
                key={card.title}
                title={card.title}
                description={card.description}
                icon={card.icon}
                onClick={() => handleCardClick(card.title)}
              />
            ))}
          </div>
        </main>
      </div>

      {/* Modal PDF — montado condicionalmente */}
      {isModalOpen && selectedDocument && (
        <PDFViewerModal
          title={selectedDocument.title}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
