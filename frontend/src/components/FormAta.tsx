import { useEffect } from 'react';
import { useForm } from '../hooks/useForm';
import { FormField } from './FormField';
import { Modal } from './Modal';
import { createAtaSchema, updateAtaSchema } from '../schemas/validation';
import type { Ata } from '../types';

interface FormAtaProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Ata>) => Promise<void>;
  initialData?: Ata;
  isLoading?: boolean;
}

interface FormAtaValues {
  nup: string;
  modalidade: string;
  arpNumero: string;
  orgaoGerenciador: string;
  objeto: string;
  vigenciaFinal: string;
  valorTotal: string;
}

export function FormAta({ isOpen, onClose, onSubmit, initialData, isLoading = false }: FormAtaProps) {
  const schema = initialData ? updateAtaSchema : createAtaSchema;

  const initialValues: FormAtaValues = initialData ? {
    nup: String(initialData.nup),
    modalidade: String(initialData.modalidade),
    arpNumero: String(initialData.arpNumero || ''),
    orgaoGerenciador: String(initialData.orgaoGerenciador),
    objeto: String(initialData.objeto),
    vigenciaFinal: initialData.vigenciaFinal ? String(initialData.vigenciaFinal).split('T')[0] : '',
    valorTotal: String(initialData.valorTotal),
  } : {
    nup: '',
    modalidade: '',
    arpNumero: '',
    orgaoGerenciador: '',
    objeto: '',
    vigenciaFinal: '',
    valorTotal: '',
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
      await onSubmit(data as unknown as Partial<Ata>);
      reset();
      onClose();
    },
    schema
  );

  useEffect(() => {
    if (isOpen && initialData) {
      // Atualiza os valores quando o modal abre com dados
      setValues({
        nup: String(initialData.nup),
        modalidade: String(initialData.modalidade),
        arpNumero: String(initialData.arpNumero || ''),
        orgaoGerenciador: String(initialData.orgaoGerenciador),
        objeto: String(initialData.objeto),
        vigenciaFinal: initialData.vigenciaFinal ? String(initialData.vigenciaFinal).split('T')[0] : '',
        valorTotal: String(initialData.valorTotal),
      });
    } else if (!isOpen) {
      reset();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialData]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Editar Ata de Registro de Preços' : 'Nova Ata de Registro de Preços'}
      size="lg"
    >
      <form onSubmit={handleFormSubmit} className="space-y-4">
        {errors.submit && (
          <div className="alert alert-danger">
            {errors.submit}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="NUP"
            name="nup"
            placeholder="Número Único de Processo"
            value={String(values.nup)}
            onChange={handleChange}
            error={errors.nup}
            required
            disabled={!!initialData}
          />

          <FormField
            label="MOD/Nº"
            name="modalidade"
            placeholder="Ex: CC 001/2025"
            value={String(values.modalidade)}
            onChange={handleChange}
            error={errors.modalidade}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="ARP Nº"
            name="arpNumero"
            placeholder="Ex: 001/2025 (opcional)"
            value={String(values.arpNumero)}
            onChange={handleChange}
            error={errors.arpNumero}
          />

          <FormField
            label="Órgão Gerenciador"
            name="orgaoGerenciador"
            placeholder="Ex: MCTIC"
            value={String(values.orgaoGerenciador)}
            onChange={handleChange}
            error={errors.orgaoGerenciador}
            required
          />
        </div>

        <FormField
          label="Objeto"
          name="objeto"
          placeholder="Descrição do objeto licitado"
          value={String(values.objeto)}
          onChange={handleChange}
          error={errors.objeto}
          required
          as="textarea"
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Vigência Final"
            name="vigenciaFinal"
            type="date"
            value={String(values.vigenciaFinal)}
            onChange={handleChange}
            error={errors.vigenciaFinal}
          />

          <FormField
            label="Valor Total (R$)"
            name="valorTotal"
            type="number"
            placeholder="0,00"
            value={String(values.valorTotal)}
            onChange={handleChange}
            error={errors.valorTotal}
            required
            step="0.01"
            min="0"
          />
        </div>

        <div className="flex gap-3 pt-4 border-t dark:border-gray-700">
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
            disabled={isLoading}
          >
            {isLoading ? 'Salvando...' : initialData ? 'Atualizar' : 'Criar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
