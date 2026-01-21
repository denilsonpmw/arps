import { useEffect, useState } from 'react';
import { atasService } from '../services/api';
import { Ata } from '../types';
import { formatCurrency, formatDate, isSaldoCritico } from '../utils/format';
import { Plus, Edit, Trash2, Upload, Trash } from 'lucide-react';
import { FormAta } from '../components/FormAta';
import { ImportModal } from '../components/ImportModal';

export default function Atas() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [atas, setAtas] = useState<Ata[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingAta, setEditingAta] = useState<Ata | undefined>();
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

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
      } catch (err) {
        alert('Erro ao deletar ata');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    
    if (confirm(`Confirma exclusão de ${selectedIds.size} ata(s)?`)) {
      try {
        const result = await atasService.bulkDelete(Array.from(selectedIds));
        
        if (result.erros.length > 0) {
          alert(`${result.deletados} ata(s) deletada(s). ${result.erros.length} erro(s).`);
        }
        
        setSelectedIds(new Set());
        loadAtas();
      } catch (err) {
        alert('Erro ao deletar atas');
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
          {selectedIds.size > 0 && (
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

      {atas.length === 0 ? (
        <div className="card text-center py-8 text-gray-500">Nenhuma ata cadastrada</div>
      ) : (
        <div className="overflow-x-auto -mx-4 sm:-mx-0">
          <table className="table table-compact w-full text-[11px] sm:text-xs whitespace-nowrap">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-center px-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === atas.length && atas.length > 0}
                    onChange={toggleSelectAll}
                    className="cursor-pointer"
                  />
                </th>
                <th className="text-left px-2">NUP</th>
                <th className="text-left px-2">MOD/Nº</th>
                <th className="text-left px-2">ARP Nº</th>
                <th className="text-left px-2">Órgão</th>
                <th className="text-left px-2">Objeto</th>
                <th className="text-left px-2">Vigência</th>
                <th className="text-right px-2">Valor Total</th>
                <th className="text-right px-2">Limite Adesão</th>
                <th className="text-right px-2">Aderido</th>
                <th className="text-right px-2">Saldo</th>
                <th className="text-center px-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {atas.map((ata) => (
                <tr key={ata.id} className="border-b hover:bg-gray-50">
                  <td className="text-center px-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(ata.id)}
                      onChange={() => toggleSelect(ata.id)}
                      className="cursor-pointer"
                    />
                  </td>
                  <td className="font-mono px-2">{ata.nup}</td>
                  <td className="font-mono px-2">{ata.modalidade}</td>
                  <td className="font-mono px-2">{ata.arpNumero}</td>
                  <td className="font-mono px-2">{ata.orgaoGerenciador}</td>
                  <td className="px-2">{ata.objeto}</td>
                  <td className="font-mono px-2">{formatDate(ata.vigenciaFinal)}</td>
                  <td className="text-right font-mono px-2">{formatCurrency(ata.valorTotal)}</td>
                  <td className="text-right font-mono px-2">{formatCurrency(ata.valorAdesao)}</td>
                  <td className="text-right font-mono px-2">{formatCurrency(ata.totalAderido)}</td>
                  <td className="text-right font-mono px-2">
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
                  <td className="text-center px-2">
                    <div className="flex gap-1 justify-center">
                      <button 
                        className="btn btn-secondary btn-xs" 
                        title="Editar"
                        onClick={() => openForm(ata)}
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        className="btn btn-danger btn-xs"
                        onClick={() => handleDelete(ata.id)}
                        title="Deletar"
                      >
                        <Trash2 size={14} />
                      </button>
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
