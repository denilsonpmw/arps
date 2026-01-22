import { useEffect, useState, useMemo } from 'react';
import { atasService } from '../services/api';
import { Ata } from '../types';
import { formatCurrency, formatDate, isSaldoCritico } from '../utils/format';
import { Plus, Edit, Trash2, Upload, Trash, Search, X } from 'lucide-react';
import { FormAta } from '../components/FormAta';
import { ImportModal } from '../components/ImportModal';
import { useAuth } from '../contexts/AuthContext';

export default function Atas() {
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [atas, setAtas] = useState<Ata[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingAta, setEditingAta] = useState<Ata | undefined>();
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Filtros
  const [filtros, setFiltros] = useState({
    busca: '',
    dataInicio: '',
    dataFim: ''
  });
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  useEffect(() => {
    loadAtas();
  }, []);

  const loadAtas = async () => {
    try {
      setLoading(true);
      const data = await atasService.getAll();
      setAtas(data);
    } catch (err) {
      setError('Erro ao carregar atas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: Partial<Ata>) => {
    try {
      setIsFormLoading(true);
      if (editingAta) {
        await atasService.update(editingAta.id, data);
      } else {
        await atasService.create(data as Ata);
      }
      await loadAtas();
      setEditingAta(undefined);
      setIsFormOpen(false);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao salvar ata';
      setError(errorMsg);
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Confirma exclusão desta ata?')) {
      try {
        await atasService.delete(id);
        loadAtas();
      } catch (err: any) {
        const errorMessage = err.response?.data?.error?.message || err.message || 'Erro ao deletar ata';
        alert(errorMessage);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    
    if (confirm(`Confirma exclusão de ${selectedIds.size} ata(s)?`)) {
      try {
        const result = await atasService.bulkDelete(Array.from(selectedIds));
        
        if (result.erros.length > 0) {
          const errosMensagens = result.erros.map(e => `- ID ${e.id.substring(0, 8)}: ${e.erro}`).join('\n');
          alert(`${result.deletados} ata(s) deletada(s). ${result.erros.length} erro(s):\n\n${errosMensagens}`);
        } else {
          alert(`${result.deletados} ata(s) deletada(s) com sucesso!`);
        }
        
        setSelectedIds(new Set());
        loadAtas();
      } catch (err: any) {
        const errorMessage = err.response?.data?.error?.message || err.message || 'Erro ao deletar atas';
        alert(errorMessage);
      }
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === atas.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(atas.map(a => a.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const openForm = (ata?: Ata) => {
    setEditingAta(ata);
    setIsFormOpen(true);
  };

  // Filtrar atas
  const atasFiltradas = useMemo(() => {
    return atas.filter(ata => {
      // Filtro de busca por texto
      if (filtros.busca) {
        const busca = filtros.busca.toLowerCase();
        const matches = 
          ata.nup.toLowerCase().includes(busca) ||
          ata.modalidade.toLowerCase().includes(busca) ||
          (ata.arpNumero && ata.arpNumero.toLowerCase().includes(busca)) ||
          ata.orgaoGerenciador.toLowerCase().includes(busca) ||
          ata.objeto.toLowerCase().includes(busca);
        
        if (!matches) return false;
      }

      // Filtro de data de vigência
      if (filtros.dataInicio && ata.vigenciaFinal) {
        const vigencia = new Date(ata.vigenciaFinal);
        const inicio = new Date(filtros.dataInicio);
        if (vigencia < inicio) return false;
      }

      if (filtros.dataFim && ata.vigenciaFinal) {
        const vigencia = new Date(ata.vigenciaFinal);
        const fim = new Date(filtros.dataFim);
        if (vigencia > fim) return false;
      }

      return true;
    });
  }, [atas, filtros]);

  const limparFiltros = () => {
    setFiltros({ busca: '', dataInicio: '', dataFim: '' });
  };

  if (loading) {
    return <div className="text-center py-12">Carregando...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Atas de Registro de Preços</h2>
        <div className="flex gap-2">
          {isAdmin() && selectedIds.size > 0 && (
            <button 
              className="btn btn-danger flex items-center gap-2" 
              onClick={handleBulkDelete}
            >
              <Trash size={20} />
              Excluir ({selectedIds.size})
            </button>
          )}
          <button 
            className="btn btn-secondary flex items-center gap-2" 
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
          >
            <Search size={20} />
            Filtros
          </button>
          <button 
            className="btn btn-secondary flex items-center gap-2" 
            onClick={() => setIsImportOpen(true)}
          >
            <Upload size={20} />
            Importar
          </button>
          <button 
            className="btn btn-primary flex items-center gap-2" 
            onClick={() => openForm()}
          >
            <Plus size={20} />
            Nova Ata
          </button>
        </div>
      </div>

      {/* Painel de Filtros */}
      {mostrarFiltros && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Filtros de Busca</h3>
            <button
              onClick={() => setMostrarFiltros(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Buscar por NUP, Modalidade, ARP, Órgão ou Objeto
              </label>
              <input
                type="text"
                className="input"
                placeholder="Digite para buscar..."
                value={filtros.busca}
                onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Vigência Início
              </label>
              <input
                type="date"
                className="input"
                value={filtros.dataInicio}
                onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Vigência Fim
              </label>
              <input
                type="date"
                className="input"
                value={filtros.dataFim}
                onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={limparFiltros}
              className="btn btn-secondary btn-sm"
            >
              Limpar Filtros
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
              {atasFiltradas.length} de {atas.length} ata(s) encontrada(s)
            </span>
          </div>
        </div>
      )}

      <FormAta
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingAta}
        isLoading={isFormLoading}
      />

      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onSuccess={loadAtas}
      />

      {atasFiltradas.length === 0 ? (
        <div className="card text-center py-8 text-gray-500 dark:text-gray-400">
          {atas.length === 0 ? 'Nenhuma ata cadastrada' : 'Nenhuma ata encontrada com os filtros aplicados'}
        </div>
      ) : (
        <div className="w-full">
          <table className="table table-compact w-full text-xs">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                {isAdmin() && (
                  <th className="text-center px-0.5 w-8">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === atasFiltradas.length && atasFiltradas.length > 0}
                      onChange={toggleSelectAll}
                      className="cursor-pointer"
                    />
                  </th>
                )}
                <th className="text-left px-0.5 w-20">NUP</th>
                <th className="text-left px-0.5 w-16">MOD</th>
                <th className="text-left px-0.5 w-14">ARP</th>
                <th className="text-left px-0.5 w-20">Órgão</th>
                <th className="text-left px-0.5">Objeto</th>
                <th className="text-left px-0.5 w-18">Vigência</th>
                <th className="text-right px-0.5 w-20">Total</th>
                <th className="text-right px-0.5 w-20">Limite</th>
                <th className="text-right px-0.5 w-20">Aderido</th>
                <th className="text-right px-0.5 w-20">Saldo</th>
                <th className="text-center px-0.5 w-14">Ações</th>
              </tr>
            </thead>
            <tbody>
              {atasFiltradas.map((ata) => (
                <tr key={ata.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  {isAdmin() && (
                    <td className="text-center px-0.5">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(ata.id)}
                        onChange={() => toggleSelect(ata.id)}
                        className="cursor-pointer"
                      />
                    </td>
                  )}
                  <td className="font-mono px-0.5 truncate" title={ata.nup}>{ata.nup}</td>
                  <td className="font-mono px-0.5 truncate" title={ata.modalidade}>{ata.modalidade}</td>
                  <td className="font-mono px-0.5 truncate" title={ata.arpNumero}>{ata.arpNumero}</td>
                  <td className="font-mono px-0.5 truncate" title={ata.orgaoGerenciador}>{ata.orgaoGerenciador}</td>
                  <td className="px-0.5 truncate max-w-xs" title={ata.objeto}>{ata.objeto}</td>
                  <td className="font-mono px-0.5">{formatDate(ata.vigenciaFinal)}</td>
                  <td className="text-right font-mono px-0.5">{formatCurrency(ata.valorTotal)}</td>
                  <td className="text-right font-mono px-0.5">{formatCurrency(ata.valorAdesao)}</td>
                  <td className="text-right font-mono px-0.5">{formatCurrency(ata.totalAderido)}</td>
                  <td className="text-right font-mono px-0.5">
                    <span
                      className={
                        isSaldoCritico(ata.saldoDisponivel, ata.valorAdesao)
                          ? 'text-red-600 font-bold'
                          : ''
                      }
                    >
                      {formatCurrency(ata.saldoDisponivel)}
                    </span>
                  </td>
                  <td className="text-center px-0.5">
                    <div className="flex gap-0.5 justify-center">
                      <button 
                        className="btn btn-secondary btn-xs p-0.5" 
                        title="Editar"
                        onClick={() => openForm(ata)}
                      >
                        <Edit size={14} />
                      </button>
                      {isAdmin() && (
                        <button
                          className="btn btn-danger btn-xs p-0.5"
                          onClick={() => handleDelete(ata.id)}
                          title="Deletar"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
