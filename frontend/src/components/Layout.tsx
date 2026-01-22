import { useState } from 'react';
import { Menu, Home, FileText, CheckSquare, BarChart3, X, LogOut, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type PageType = 'dashboard' | 'atas' | 'adesoes' | 'relatorios' | 'usuarios';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
}

export default function Layout({ children, currentPage, onPageChange }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout, user, isAdmin } = useAuth();

  const navItems = [
    { id: 'dashboard' as PageType, label: 'Dashboard', icon: Home },
    { id: 'atas' as PageType, label: 'Atas', icon: FileText },
    { id: 'adesoes' as PageType, label: 'Adesões', icon: CheckSquare },
    { id: 'relatorios' as PageType, label: 'Relatórios', icon: BarChart3 },
    ...(isAdmin() ? [{ id: 'usuarios' as PageType, label: 'Usuários', icon: Users }] : []),
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-16 sm:w-20'
        } bg-blue-900 text-white transition-all duration-300 fixed h-screen overflow-y-auto z-40`}
      >
        <div className="p-2 sm:p-4 border-b border-blue-800 flex items-center justify-between">
          {sidebarOpen && <h1 className="text-sm sm:text-lg font-bold hidden sm:block">ARPS</h1>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 sm:p-2 hover:bg-blue-800 rounded"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <nav className="mt-4 sm:mt-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onPageChange(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-3 transition-colors text-xs sm:text-base ${
                currentPage === item.id ? 'bg-blue-800' : 'hover:bg-blue-800'
              }`}
              title={item.label}
            >
              <item.icon size={18} />
              {sidebarOpen && <span className="truncate">{item.label}</span>}
            </button>
          ))}
          
          {/* Logout */}
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-3 transition-colors text-xs sm:text-base hover:bg-red-700 mt-auto border-t border-blue-800"
            title="Sair"
          >
            <LogOut size={18} />
            {sidebarOpen && <span className="truncate">Sair</span>}
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`${sidebarOpen ? 'ml-64' : 'ml-16 sm:ml-20'} flex-1 transition-all duration-300`}>
        <header className="bg-white shadow">
          <div className="px-3 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900">ARPS-SUPEL</h2>
              <p className="text-xs sm:text-sm text-gray-600 truncate">Sistema de Controle de Adesões</p>
            </div>
            {user && (
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-600">{user.email}</p>
              </div>
            )}
          </div>
        </header>

        <div className="p-2 sm:p-6">{children}</div>
      </main>
    </div>
  );
}
