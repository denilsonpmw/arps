import { useEffect, useState } from 'react';
import { dashboardService } from '../services/api';
import { DashboardData } from '../types';
import { formatCurrency, formatDate } from '../utils/format';
import { AlertCircle, TrendingUp, CheckCircle, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const dashboardData = await dashboardService.getOverview();
      setData(dashboardData);
    } catch (err) {
      setError('Erro ao carregar dashboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Carregando...</div>;
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <div className="flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return <div>Sem dados</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        {/* Total de Atas */}
        <div className="card p-3 sm:p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm truncate">Atas Ativas</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{data.totalAtasAtivas}</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 sm:p-3 rounded-lg flex-shrink-0">
              <TrendingUp className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
          </div>
        </div>

        {/* Total de Adesões */}
        <div className="card p-3 sm:p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm truncate">Total Adesões</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{data.totalAdesoes}</p>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 sm:p-3 rounded-lg flex-shrink-0">
              <CheckCircle className="text-purple-600 dark:text-purple-400" size={20} />
            </div>
          </div>
        </div>

        {/* Saldo Crítico */}
        <div className="card p-3 sm:p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm truncate">Saldo Crítico</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{data.atasComSaldoCritico}</p>
            </div>
            <div className="bg-red-100 dark:bg-red-900/30 p-2 sm:p-3 rounded-lg flex-shrink-0">
              <AlertCircle className="text-red-600 dark:text-red-400" size={20} />
            </div>
          </div>
        </div>

        {/* Adesões Vencendo */}
        <div className="card p-3 sm:p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm truncate">Vigência Próxima</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{data.adesoesvencendo}</p>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 sm:p-3 rounded-lg flex-shrink-0">
              <AlertTriangle className="text-yellow-600 dark:text-yellow-400" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.atasComSaldoCritico > 0 && (
          <div className="alert alert-danger text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} />
              <span>
                <strong>{data.atasComSaldoCritico} ata(s)</strong> com saldo crítico
              </span>
            </div>
          </div>
        )}

        {data.adesoesvencendo > 0 && (
          <div className="alert alert-warning text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} />
              <span>
                <strong>{data.adesoesvencendo} ata(s)</strong> com vigência próxima
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Atas com Alertas */}
      {data.atasAlerta.length > 0 && (
        <div className="card p-3 sm:p-4">
          <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle size={18} className="text-yellow-600" />
            Atas que Requerem Atenção ({data.atasAlerta.length})
          </h3>
          <div className="w-full">
            <table className="table table-compact text-xs w-full">
              <thead>
                <tr className="bg-yellow-50">
                  <th className="text-left px-0.5 w-14">ARP Nº</th>
                  <th className="text-left px-0.5 w-20">Órgão</th>
                  <th className="text-left px-0.5">Objeto</th>
                  <th className="text-center px-0.5 w-18">Vigência</th>
                  <th className="text-right px-0.5 w-20">Limite Global</th>
                  <th className="text-center px-0.5 w-12">Qtd. Adesões</th>
                  <th className="text-right px-0.5 w-20">Total Aderido</th>
                  <th className="text-right px-0.5 w-20">Saldo</th>
                  <th className="text-center px-0.5 w-18">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.atasAlerta.map((ata) => (
                  <tr key={ata.id} className="border-b hover:bg-yellow-50">
                    <td className="font-mono px-0.5 font-medium truncate" title={ata.arpNumero}>{ata.arpNumero}</td>
                    <td className="px-0.5 truncate" title={ata.orgaoGerenciador}>{ata.orgaoGerenciador}</td>
                    <td className="px-0.5 truncate max-w-xs" title={ata.objeto}>{ata.objeto}</td>
                    <td className="text-center px-0.5">{formatDate(ata.vigenciaFinal)}</td>
                    <td className="text-right px-0.5 font-mono">{formatCurrency(ata.valorAdesao)}</td>
                    <td className="text-center px-0.5 font-mono">{ata.quantidadeAdesoes}</td>
                    <td className="text-right px-0.5 font-mono">{formatCurrency(ata.totalAderido)}</td>
                    <td className={`text-right px-0.5 font-mono ${ata.saldoCritico ? 'text-red-600 font-bold' : ''}`}>
                      {formatCurrency(ata.saldoDisponivel)}
                    </td>
                    <td className="text-center px-0.5">
                      <div className="flex gap-0.5 justify-center flex-wrap">
                        {ata.saldoCritico && (
                          <span className="badge badge-danger badge-xs">Crítico</span>
                        )}
                        {ata.vigenciaProxima && (
                          <span className="badge badge-warning badge-xs">Vence</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
