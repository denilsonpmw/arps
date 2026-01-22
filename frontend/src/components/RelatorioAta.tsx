import { useEffect, useState } from 'react';
import { FileText, DollarSign, Building, X } from 'lucide-react';
import { relatoriosService } from '../services/api';
import { formatCurrency, formatDate } from '../utils/format';
import type { Ata, Adesao } from '../types';

interface AtaComAdesoes extends Ata {
  adesoes: Adesao[];
}

interface RelatorioAtaProps {
  ataId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function RelatorioAta({ ataId, isOpen, onClose }: RelatorioAtaProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<AtaComAdesoes | null>(null);

  useEffect(() => {
    if (isOpen && ataId) {
      loadRelatorio();
    }
  }, [isOpen, ataId]);

  const loadRelatorio = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await relatoriosService.buscarAtaPorId(ataId);
      setResultado(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar relatório');
      setResultado(null);
    } finally {
      setLoading(false);
    }
  };

  const handleImprimir = () => {
    window.print();
  };

  if (!isOpen) return null;

  const percentualUtilizado = resultado 
    ? ((resultado.totalAderido || 0) / Number(resultado.valorAdesao)) * 100 
    : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center no-print">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header - não imprime */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 flex items-center justify-between no-print z-10">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Relatório de Adesões</h2>
          <div className="flex gap-2">
            <button
              onClick={handleImprimir}
              className="btn btn-secondary flex items-center gap-2 text-sm"
            >
              <FileText size={16} />
              Imprimir
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              title="Fechar"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading && (
            <div className="text-center py-12 text-gray-600 dark:text-gray-400">Carregando...</div>
          )}

          {error && (
            <div className="alert alert-danger">{error}</div>
          )}

          {resultado && (
            <div className="space-y-6 print:text-black">
              {/* Título para impressão */}
              <div className="hidden print:block text-center mb-6">
                <h1 className="text-2xl font-bold">Relatório de Adesões</h1>
                <p className="text-gray-600 mt-2">Ata de Registro de Preços</p>
              </div>

              {/* Informações da Ata */}
              <div className="card print:shadow-none">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 print:text-black">
                  <FileText size={20} className="no-print" />
                  Informações da Ata
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 print:text-gray-600">NUP</p>
                    <p className="font-semibold print:text-black">{resultado.nup}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 print:text-gray-600">Número da Ata</p>
                    <p className="font-semibold print:text-black">{resultado.arpNumero || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 print:text-gray-600">Modalidade</p>
                    <p className="font-semibold print:text-black">{resultado.modalidade}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 print:text-gray-600">Órgão Gerenciador</p>
                    <p className="font-semibold print:text-black">{resultado.orgaoGerenciador}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400 print:text-gray-600">Objeto</p>
                    <p className="font-semibold print:text-black">{resultado.objeto}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 print:text-gray-600">Vigência Final</p>
                    <p className="font-semibold print:text-black">{formatDate(resultado.vigenciaFinal)}</p>
                  </div>
                </div>
              </div>

              {/* Resumo Financeiro */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card bg-blue-50 dark:bg-blue-900/20 print:bg-white print:border">
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign size={24} className="text-blue-600 dark:text-blue-400 no-print" />
                    <p className="text-sm text-gray-700 dark:text-gray-300 print:text-gray-700">Valor Total</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-400 print:text-black">
                    {formatCurrency(resultado.valorTotal)}
                  </p>
                </div>

                <div className="card bg-green-50 dark:bg-green-900/20 print:bg-white print:border">
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign size={24} className="text-green-600 dark:text-green-400 no-print" />
                    <p className="text-sm text-gray-700 dark:text-gray-300 print:text-gray-700">Limite Global</p>
                  </div>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-400 print:text-black">
                    {formatCurrency(resultado.valorAdesao)}
                  </p>
                </div>

                <div className="card bg-orange-50 dark:bg-orange-900/20 print:bg-white print:border">
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign size={24} className="text-orange-600 dark:text-orange-400 no-print" />
                    <p className="text-sm text-gray-700 dark:text-gray-300 print:text-gray-700">Total Aderido</p>
                  </div>
                  <p className="text-2xl font-bold text-orange-700 dark:text-orange-400 print:text-black">
                    {formatCurrency(resultado.totalAderido || 0)}
                  </p>
                </div>

                <div className={`card ${percentualUtilizado > 80 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-purple-50 dark:bg-purple-900/20'} print:bg-white print:border`}>
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign size={24} className={`${percentualUtilizado > 80 ? 'text-red-600 dark:text-red-400' : 'text-purple-600 dark:text-purple-400'} no-print`} />
                    <p className="text-sm text-gray-700 dark:text-gray-300 print:text-gray-700">Saldo</p>
                  </div>
                  <p className={`text-2xl font-bold ${percentualUtilizado > 80 ? 'text-red-700 dark:text-red-400' : 'text-purple-700 dark:text-purple-400'} print:text-black`}>
                    {formatCurrency(resultado.saldoDisponivel)}
                  </p>
                  <p className="text-sm mt-1 text-gray-600 dark:text-gray-400 print:text-gray-600">
                    {percentualUtilizado.toFixed(1)}% utilizado
                  </p>
                </div>
              </div>

              {/* Lista de Adesões */}
              <div className="card print:shadow-none">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 print:text-black">
                  <Building size={20} className="no-print" />
                  Adesões Realizadas ({resultado.adesoes.length})
                </h3>

                {resultado.adesoes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400 print:text-gray-500">
                    Nenhuma adesão registrada para esta ata
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="table print:border">
                      <thead>
                        <tr className="print:border-b">
                          <th className="print:text-black print:bg-gray-100">Nº Identificador</th>
                          <th className="print:text-black print:bg-gray-100">Órgão Aderente</th>
                          <th className="print:text-black print:bg-gray-100">Valor Aderido</th>
                          <th className="print:text-black print:bg-gray-100">Data Cadastro</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resultado.adesoes.map((adesao) => (
                          <tr key={adesao.id} className="print:border-b">
                            <td className="font-mono print:text-black">{adesao.numeroIdentificador}</td>
                            <td className="print:text-black">{adesao.orgaoAderente}</td>
                            <td className="font-semibold text-green-700 dark:text-green-400 print:text-black">
                              {formatCurrency(adesao.valorAderido)}
                            </td>
                            <td className="print:text-black">{formatDate(adesao.data)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-100 dark:bg-gray-700 print:bg-gray-100 print:border-t-2">
                          <td colSpan={2} className="font-bold text-right print:text-black">Total:</td>
                          <td className="font-bold text-green-700 dark:text-green-400 print:text-black">
                            {formatCurrency(resultado.totalAderido || 0)}
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
