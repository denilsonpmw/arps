import { useEffect, useState } from 'react';
import { adesaoService } from '../services/api';
import { Adesao } from '../types';
import { formatCurrency, formatDate } from '../utils/format';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { FormAdesao } from '../components/FormAdesao';
import { useAuth } from '../contexts/AuthContext';

export default function Adesoes() {
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adesoes, setAdesoes] = useState<Adesao[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAdesao, setEditingAdesao] = useState<Adesao | undefined>();
  const [isFormLoading, setIsFormLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await adesaoService.getAll();
      setAdesoes(data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar dados');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: Partial<Adesao>) => {
    try {
      setIsFormLoading(true);
      
      if (editingAdesao) {
        await adesaoService.update(editingAdesao.id, data);
      } else {
        await adesaoService.create(data as any);
      }
      await loadData();
      setEditingAdesao(undefined);
      setIsFormOpen(false);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao salvar adesão';
      setError(errorMsg);
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Confirma exclusão desta adesão?')) {
      try {
        await adesaoService.delete(id);
        loadData();
      } catch (err) {
        alert('Erro ao deletar adesão');
      }
    }
  };

  const openForm = (adesao?: Adesao) => {
    setEditingAdesao(adesao);
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
        <h2 className="text-2xl font-bold">Adesões</h2>
        <button className="btn btn-primary flex items-center gap-2" onClick={() => openForm()}>
          <Plus size={20} />
          Nova Adesão
        </button>
      </div>

      <FormAdesao
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        ata={editingAdesao?.ata}
        initialData={editingAdesao}
        isLoading={isFormLoading}
      />

      {adesoes.length === 0 ? (
        <div className="card text-center py-8 text-gray-500">Nenhuma adesão cadastrada</div>
      ) : (
        <div className="w-full">
          <table className="table table-compact w-full text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left px-0.5 w-20">NUP</th>
                <th className="text-left px-0.5 w-16">MOD</th>
                <th className="text-left px-0.5">Objeto</th>
                <th className="text-left px-0.5 w-20">ID Adesão</th>
                <th className="text-left px-0.5 w-28">Órgão Aderente</th>
                <th className="text-left px-0.5 w-18">Data</th>
                <th className="text-right px-0.5 w-20">Valor</th>
                <th className="text-center px-0.5 w-14">Ações</th>
              </tr>
            </thead>
            <tbody>
              {adesoes.map((adesao) => (
                <tr key={adesao.id} className="border-b hover:bg-gray-50">
                  <td className="font-mono px-0.5 truncate" title={adesao.ata.nup}>{adesao.ata.nup}</td>
                  <td className="font-mono px-0.5 truncate" title={adesao.ata.modalidade}>{adesao.ata.modalidade}</td>
                  <td className="px-0.5">{adesao.ata.objeto}</td>
                  <td className="font-mono px-0.5 truncate" title={adesao.numeroIdentificador}>{adesao.numeroIdentificador}</td>
                  <td className="font-mono px-0.5 truncate" title={adesao.orgaoAderente}>{adesao.orgaoAderente}</td>
                  <td className="font-mono px-0.5">{formatDate(adesao.data)}</td>
                  <td className="text-right font-mono px-0.5">{formatCurrency(adesao.valorAderido)}</td>
                  <td className="text-center px-0.5">
                    <div className="flex gap-0.5 justify-center">
                      <button 
                        className="btn btn-secondary btn-xs p-0.5" 
                        title="Editar"
                        onClick={() => openForm(adesao)}
                      >
                        <Edit size={14} />
                      </button>
                      {isAdmin() && (
                        <button
                          className="btn btn-danger btn-xs p-0.5"
                          onClick={() => handleDelete(adesao.id)}
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
