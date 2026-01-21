import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Atas from './pages/Atas';
import Adesoes from './pages/Adesoes';
import Relatorios from './pages/Relatorios';
import Usuarios from './pages/Usuarios';

type PageType = 'dashboard' | 'atas' | 'adesoes' | 'relatorios' | 'usuarios' | 'ata-detail';

function AppContent() {
  const { user, loading } = useAuth();
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
      case 'usuarios':
        return <Usuarios />;
      default:
        return <Dashboard onNavigate={handlePageChange} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <Layout onPageChange={handlePageChange} currentPage={currentPage}>
      {renderPage()}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
