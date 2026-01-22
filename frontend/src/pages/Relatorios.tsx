import { useState } from 'react';
import { Search, FileText, DollarSign, Building } from 'lucide-react';
import { relatoriosService } from '../services/api';
import { formatCurrency, formatDate } from '../utils/format';
import type { Ata, Adesao } from '../types';

interface AtaComAdesoes extends Ata {
  adesoes: Adesao[];
}

export default function Relatorios() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busca, setBusca] = useState({ nup: '', arpNumero: '', modalidade: '' });
  const [resultado, setResultado] = useState<AtaComAdesoes | null>(null);

  const handleBuscar = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!busca.nup && !busca.arpNumero && !busca.modalidade) {
      setError('Preencha pelo menos um campo de busca');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await relatoriosService.buscarAta(busca);
      setResultado(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar relatório');
      setResultado(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLimpar = () => {
    setBusca({ nup: '', arpNumero: '', modalidade: '' });
    setResultado(null);
    setError(null);
  };

  const percentualUtilizado = resultado 
    ? ((resultado.totalAderido || 0) / Number(resultado.valorAdesao)) * 100 
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 no-print">
        <FileText size={32} className="text-primary" />
        <h2 className="text-2xl font-bold">Relatórios de Adesões</h2>
      </div>

      {/* Formulário de Busca */}
      <div className="card no-print">
        <h3 className="text-lg font-semibold mb-4">Buscar Ata de Registro de Preços</h3>
        <form onSubmit={handleBuscar} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                NUP
              </label>
              <input
                type="text"
                className="input"
                placeholder="Ex: 00365-00008082/2024-42"
                value={busca.nup}
                onChange={(e) => setBusca({ ...busca, nup: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número da Ata
              </label>
              <input
                type="text"
                className="input"
                placeholder="Ex: 01/2024"
                value={busca.arpNumero}
                onChange={(e) => setBusca({ ...busca, arpNumero: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Modalidade
              </label>
              <input
                type="text"
                className="input"
                placeholder="Ex: PE 053/2025"
                value={busca.modalidade}
                onChange={(e) => setBusca({ ...busca, modalidade: e.target.value })}
              />
            </div>
          </div>

          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button type="submit" className="btn btn-primary flex items-center gap-2" disabled={loading}>
              <Search size={18} />
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
            <button type="button" onClick={handleLimpar} className="btn btn-secondary">
              Limpar
            </button>
          </div>
        </form>
      </div>

      {/* Resultado */}
      {resultado && (
        <div className="space-y-6">
          {/* Título para impressão */}
          <div className="hidden print:block text-center mb-6">
            <h1 className="text-2xl font-bold">Relatório de Adesões</h1>
            <p className="text-gray-600 mt-2">Ata de Registro de Preços</p>
          </div>

          {/* Informações da Ata */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText size={20} />
              Informações da Ata
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">NUP</p>
                <p className="font-semibold">{resultado.nup}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Número da Ata</p>
                <p className="font-semibold">{resultado.arpNumero || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Modalidade</p>
                <p className="font-semibold">{resultado.modalidade}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Órgão Gerenciador</p>
                <p className="font-semibold">{resultado.orgaoGerenciador}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">Objeto</p>
                <p className="font-semibold">{resultado.objeto}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Vigência Final</p>
                <p className="font-semibold">{formatDate(resultado.vigenciaFinal)}</p>
              </div>
            </div>
          </div>

          {/* Resumo Financeiro */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card bg-blue-50">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign size={24} className="text-blue-600" />
                <p className="text-sm text-gray-700">Valor Total</p>
              </div>
              <p className="text-2xl font-bold text-blue-700">
                {formatCurrency(resultado.valorTotal)}
              </p>
            </div>

            <div className="card bg-green-50">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign size={24} className="text-green-600" />
                <p className="text-sm text-gray-700">Limite Global</p>
              </div>
              <p className="text-2xl font-bold text-green-700">
                {formatCurrency(resultado.valorAdesao)}
              </p>
            </div>

            <div className="card bg-orange-50">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign size={24} className="text-orange-600" />
                <p className="text-sm text-gray-700">Total Aderido</p>
              </div>
              <p className="text-2xl font-bold text-orange-700">
                {formatCurrency(resultado.totalAderido || 0)}
              </p>
            </div>

            <div className={`card ${percentualUtilizado > 80 ? 'bg-red-50' : 'bg-purple-50'}`}>
              <div className="flex items-center gap-3 mb-2">
                <DollarSign size={24} className={percentualUtilizado > 80 ? 'text-red-600' : 'text-purple-600'} />
                <p className="text-sm text-gray-700">Saldo</p>
              </div>
              <p className={`text-2xl font-bold ${percentualUtilizado > 80 ? 'text-red-700' : 'text-purple-700'}`}>
                {formatCurrency(resultado.saldoDisponivel)}
              </p>
              <p className="text-sm mt-1 text-gray-600">
                {percentualUtilizado.toFixed(1)}% utilizado
              </p>
            </div>
          </div>

          {/* Lista de Adesões */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Building size={20} />
              Adesões Realizadas ({resultado.adesoes.length})
            </h3>

            {resultado.adesoes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhuma adesão registrada para esta ata
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Nº Identificador</th>
                      <th>Órgão Aderente</th>
                      <th>Valor Aderido</th>
                      <th>Data Cadastro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultado.adesoes.map((adesao) => (
                      <tr key={adesao.id}>
                        <td className="font-mono">{adesao.numeroIdentificador}</td>
                        <td>{adesao.orgaoAderente}</td>
                        <td className="font-semibold text-green-700">
                          {formatCurrency(adesao.valorAderido)}
                        </td>
                        <td>{formatDate(adesao.data)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-100">
                      <td colSpan={2} className="font-bold text-right">Total:</td>
                      <td className="font-bold text-green-700">
                        {formatCurrency(resultado.totalAderido || 0)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* Botão Imprimir */}
          <div className="flex justify-end no-print">
            <button 
              onClick={() => window.print()} 
              className="btn btn-secondary flex items-center gap-2"
            >
              <FileText size={18} />
              Imprimir Relatório
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
