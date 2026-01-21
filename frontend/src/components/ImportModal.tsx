import { useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import { importService, ImportPreview, ImportResult } from '../services/importService';
import { Modal } from './Modal';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ImportModal({ isOpen, onClose, onSuccess }: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [resultado, setResultado] = useState<ImportResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'upload' | 'preview' | 'resultado'>('upload');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.json')) {
        setError('Por favor, selecione um arquivo JSON válido');
        return;
      }
      setFile(selectedFile);
      setError(null);
      setPreview(null);
      setResultado(null);
      setStep('upload');
    }
  };

  const handlePreview = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const previewData = await importService.preview(data);
      setPreview(previewData);
      setStep('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar arquivo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const result = await importService.executar(data);
      setResultado(result);
      setStep('resultado');

      if (result.importados > 0) {
        setTimeout(() => {
          onSuccess();
          handleClose();
        }, 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao importar dados');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreview(null);
    setResultado(null);
    setError(null);
    setStep('upload');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Importar Processos de RP"
      size="lg"
    >
      <div className="space-y-4">
        {/* Upload Step */}
        {step === 'upload' && (
          <>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">
                Selecione um arquivo JSON com os processos de RP
              </p>
              <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="btn btn-secondary cursor-pointer inline-block"
              >
                Escolher Arquivo
              </label>
            </div>

            {file && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <div className="flex-1">
                  <p className="font-medium text-blue-900">{file.name}</p>
                  <p className="text-sm text-blue-700">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {error && (
              <div className="alert alert-danger flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={handleClose}
                className="btn btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button
                onClick={handlePreview}
                disabled={!file || isLoading}
                className="btn btn-primary flex-1"
              >
                {isLoading ? 'Analisando...' : 'Analisar Arquivo'}
              </button>
            </div>
          </>
        )}

        {/* Preview Step */}
        {step === 'preview' && preview && (
          <>
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Análise do Arquivo</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 mb-1">Total de Processos</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {preview.totalProcessos}
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-600 mb-1">Prontos para Importar</p>
                  <p className="text-2xl font-bold text-green-900">
                    {preview.processosValidos}
                  </p>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-yellow-600 mb-1">Já Existentes</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {preview.nupsDuplicados}
                  </p>
                </div>

                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-red-600 mb-1">Inválidos</p>
                  <p className="text-2xl font-bold text-red-900">
                    {preview.processosInvalidos}
                  </p>
                </div>
              </div>

              {preview.processosValidos === 0 && (
                <div className="alert alert-warning">
                  Nenhum processo válido para importar. Todos os processos já existem ou são inválidos.
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={() => setStep('upload')}
                className="btn btn-secondary flex-1"
                disabled={isLoading}
              >
                Voltar
              </button>
              <button
                onClick={handleImport}
                disabled={preview.processosValidos === 0 || isLoading}
                className="btn btn-primary flex-1"
              >
                {isLoading ? 'Importando...' : `Importar ${preview.processosValidos} Atas`}
              </button>
            </div>
          </>
        )}

        {/* Resultado Step */}
        {step === 'resultado' && resultado && (
          <>
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <h3 className="font-semibold text-lg">Importação Concluída</h3>
                  <p className="text-gray-600">
                    {resultado.importados} de {resultado.total} atas importadas com sucesso
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-green-50 p-3 rounded text-center">
                  <p className="text-2xl font-bold text-green-900">{resultado.importados}</p>
                  <p className="text-xs text-green-600">Importados</p>
                </div>
                <div className="bg-gray-50 p-3 rounded text-center">
                  <p className="text-2xl font-bold text-gray-900">{resultado.ignorados}</p>
                  <p className="text-xs text-gray-600">Ignorados</p>
                </div>
                <div className="bg-red-50 p-3 rounded text-center">
                  <p className="text-2xl font-bold text-red-900">{resultado.erros.length}</p>
                  <p className="text-xs text-red-600">Erros</p>
                </div>
              </div>

              {resultado.erros.length > 0 && (
                <div className="mt-4">
                  <p className="font-semibold text-sm text-red-900 mb-2">Erros:</p>
                  <div className="max-h-40 overflow-y-auto bg-red-50 rounded p-3">
                    {resultado.erros.map((erro, idx) => (
                      <div key={idx} className="text-xs text-red-800 mb-1">
                        <strong>{erro.nup}:</strong> {erro.erro}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {resultado.atasImportadas.length > 0 && (
                <div className="mt-4">
                  <p className="font-semibold text-sm text-green-900 mb-2">
                    Atas Importadas ({resultado.atasImportadas.length}):
                  </p>
                  <div className="max-h-40 overflow-y-auto bg-green-50 rounded p-3">
                    {resultado.atasImportadas.map((ata, idx) => (
                      <div key={idx} className="text-xs text-green-800 mb-1">
                        <strong>{ata.arpNumero}</strong> - {ata.nup}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={handleClose}
                className="btn btn-primary flex-1"
              >
                Fechar
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
