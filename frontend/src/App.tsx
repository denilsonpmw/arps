import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Atas from './pages/Atas';
import Adesoes from './pages/Adesoes';
import Relatorios from './pages/Relatorios';

type PageType = 'dashboard' | 'atas' | 'adesoes' | 'relatorios' | 'ata-detail';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const [selectedAtaId, setSelectedAtaId] = useState<string | null>(null);

  const handlePageChange = (page: PageType, ataId?: string) => {
    setCurrentPage(page);
    if (ataId) {
      setSelectedAtaId(ataId);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={handlePageChange} />;
      case 'atas':
        return <Atas onNavigate={handlePageChange} />;
      case 'adesoes':
        return <Adesoes onNavigate={handlePageChange} />;
      case 'relatorios':
        return <Relatorios />;
      default:
        return <Dashboard onNavigate={handlePageChange} />;
    }
  };

  return (
    <Layout onPageChange={handlePageChange} currentPage={currentPage}>
      {renderPage()}
    </Layout>
  );
}
