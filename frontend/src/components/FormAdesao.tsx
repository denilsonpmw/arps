import { useEffect, useState } from 'react';
import { useForm } from '../hooks/useForm';
import { FormField } from './FormField';
import { Modal } from './Modal';
import { createAdesaoSchema, updateAdesaoSchema } from '../schemas/validation';
import { formatCurrency } from '../utils/format';
import { atasService } from '../services/api';
import type { Adesao, Ata } from '../types';

interface FormAdesaoProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Adesao>) => Promise<void>;
  ata?: Ata;
  initialData?: Adesao;
  isLoading?: boolean;
}

interface FormAdesaoValues {
  ataId: string;
  numeroIdentificador: string;
  orgaoAderente: string;
  valorAderido: string;
}

export function FormAdesao({
  isOpen,
  onClose,
  onSubmit,
  ata: propAta,
  initialData,
  isLoading = false,
}: FormAdesaoProps) {
  const [atas, setAtas] = useState<Ata[]>([]);
  const [selectedAta, setSelectedAta] = useState<Ata | undefined>(propAta);
  const schema = initialData ? updateAdesaoSchema : createAdesaoSchema;

  useEffect(() => {
    if (isOpen) {
      loadAtas();
      setSelectedAta(propAta || (initialData?.ata as Ata));
    }
  }, [isOpen, propAta, initialData]);

  async function loadAtas() {
    try {
      const data = await atasService.getAll();
      setAtas(data);
    } catch (err) {
      console.error('Erro ao carregar atas:', err);
    }
  }

  const initialValues: FormAdesaoValues = initialData ? {
    ataId: String(initialData.ataId),
    numeroIdentificador: String(initialData.numeroIdentificador),
    orgaoAderente: String(initialData.orgaoAderente),
    valorAderido: String(initialData.valorAderido),
  } : {
    ataId: propAta?.id || '',
    numeroIdentificador: '',
    orgaoAderente: '',
    valorAderido: '',
  };

  const {
    values,
    errors,
    handleChange,
    handleSubmit: handleFormSubmit,
    reset,
    setValues,
  } = useForm(
    initialValues,
    async (data) => {
      await onSubmit(data as unknown as Partial<Adesao>);
      reset();
      onClose();
    },
    schema
  );

  useEffect(() => {
    if (isOpen && initialData) {
      // Atualiza os valores quando o modal abre com dados de edição
      setValues({
        ataId: String(initialData.ataId),
        numeroIdentificador: String(initialData.numeroIdentificador),
        orgaoAderente: String(initialData.orgaoAderente),
        valorAderido: String(initialData.valorAderido),
      });
    } else if (isOpen && propAta) {
      // Atualiza ataId quando abre com uma ata específica
      setValues({
        ataId: propAta.id,
        numeroIdentificador: '',
        orgaoAderente: '',
        valorAderido: '',
      });
    } else if (!isOpen) {
      reset();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialData, propAta]);

  // Atualiza selectedAta quando ataId muda
  useEffect(() => {
    if (values.ataId && atas.length > 0) {
      const ata = atas.find(a => a.id === values.ataId);
      setSelectedAta(ata);
    }
  }, [values.ataId, atas]);

  const handleAtaChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const ataId = (e.target as HTMLSelectElement).value;
    const novaAta = atas.find(a => a.id === ataId);
    setSelectedAta(novaAta);
    handleChange(e);
  };

  const maxValorAdesao = selectedAta ? (selectedAta.valorTotal * 0.5) : 0;
  const saldoDisponivel = selectedAta ? (selectedAta.valorAdesao - (selectedAta.totalAderido || 0)) : 0;
  const valorInformado = parseFloat(String(values.valorAderido)) || 0;
  const isValorExcedido = valorInformado > maxValorAdesao;
  const isSaldoInsuficiente = valorInformado > saldoDisponivel;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Editar Adesão' : 'Nova Adesão'}
      size="md"
    >
      <form onSubmit={handleFormSubmit} className="space-y-4">
        {errors.submit && (
          <div className="alert alert-danger">
            {errors.submit}
          </div>
        )}

        {!propAta && (
          <FormField
            label="Ata de Registro de Preços"
            name="ataId"
            as="select"
            value={String(values.ataId)}
            onChange={handleAtaChange}
            error={errors.ataId}
            required
          >
            <option value="">Selecione uma ata</option>
            {atas.map((ata) => (
              <option key={ata.id} value={ata.id}>
                {ata.arpNumero} - {ata.objeto.substring(0, 50)}...
              </option>
            ))}
          </FormField>
        )}

        {selectedAta && (
          <div className="bg-gray-50 p-3 rounded-lg text-sm">
            <p className="font-medium text-gray-700">Ata: {selectedAta.arpNumero}</p>
            <p className="text-gray-600">{selectedAta.objeto}</p>
            <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
              <div>
                <span className="text-gray-600">Valor Total:</span>
                <p className="font-semibold">{formatCurrency(selectedAta.valorTotal)}</p>
              </div>
              <div>
                <span className="text-gray-600">Max por Adesão:</span>
                <p className="font-semibold">{formatCurrency(maxValorAdesao)}</p>
              </div>
              <div>
                <span className="text-gray-600">Saldo:</span>
                <p className={`font-semibold ${saldoDisponivel < selectedAta.valorTotal * 0.2 ? 'text-red-600' : ''}`}>
                  {formatCurrency(saldoDisponivel)}
                </p>
              </div>
            </div>
          </div>
        )}

        <FormField
          label="Número Identificador"
          name="numeroIdentificador"
          placeholder="Ex: 2026001"
          value={String(values.numeroIdentificador)}
          onChange={handleChange}
          error={errors.numeroIdentificador}
          required
        />

        <FormField
          label="Órgão Aderente"
          name="orgaoAderente"
          placeholder="Ex: SUPEL"
          value={String(values.orgaoAderente)}
          onChange={handleChange}
          error={errors.orgaoAderente}
          required
          maxLength={10}
        />

        <FormField
          label="Valor da Adesão (R$)"
          name="valorAderido"
          type="number"
          placeholder="0,00"
          value={String(values.valorAderido)}
          onChange={handleChange}
          error={errors.valorAderido}
          required
          step="0.01"
          min="0"
        />

        {valorInformado > 0 && (
          <div>
            {isValorExcedido && (
              <div className="alert alert-danger text-sm mb-2">
                ⚠️ Valor não pode exceder 50% do valor total ({formatCurrency(maxValorAdesao)})
              </div>
            )}
            {isSaldoInsuficiente && (
              <div className="alert alert-warning text-sm mb-2">
                ⚠️ Saldo insuficiente. Disponível: {formatCurrency(saldoDisponivel)}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary flex-1"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary flex-1"
            disabled={isLoading || isValorExcedido || isSaldoInsuficiente || !selectedAta}
          >
            {isLoading ? 'Salvando...' : initialData ? 'Atualizar' : 'Criar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
