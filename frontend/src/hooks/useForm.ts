import { useState, useCallback } from 'react';
import { z } from 'zod';

interface FormErrors {
  [key: string]: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useForm<T extends Record<string, any>>(
  initialValues: T,
  onSubmit: (values: T) => Promise<void>,
  schema?: z.ZodSchema
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setValues((prev) => ({ ...prev, [name]: value }));
      // Limpar erro do campo ao editar
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    },
    [errors]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setErrors({});

      try {
        if (schema) {
          await schema.parseAsync(values);
        }
        setIsLoading(true);
        await onSubmit(values);
      } catch (error: unknown) {
        if (error instanceof z.ZodError) {
          // Erro do Zod
          const newErrors: FormErrors = {};
          error.issues.forEach((issue: z.ZodIssue) => {
            const path = issue.path.join('.');
            newErrors[path] = issue.message;
          });
          setErrors(newErrors);
        } else if (error instanceof Error) {
          setErrors({ submit: error.message || 'Erro ao salvar' });
        } else {
          setErrors({ submit: 'Erro ao salvar' });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [values, schema, onSubmit]
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  return {
    values,
    setValues,
    errors,
    isLoading,
    handleChange,
    handleSubmit,
    reset,
  };
}
