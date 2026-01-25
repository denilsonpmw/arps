import { z } from 'zod';

export const CreateAdesaoSchema = z.object({
  ataId: z.string().min(1, 'ID da ata é obrigatório'),
  numeroIdentificador: z.string().min(1, 'Número identificador é obrigatório'),
  orgaoAderente: z.string().min(1, 'Órgão aderente é obrigatório').max(30),
  valorAderido: z.coerce.number().positive('Valor aderido deve ser positivo'),
});

export const UpdateAdesaoSchema = CreateAdesaoSchema.partial();

export type CreateAdesaoInput = z.infer<typeof CreateAdesaoSchema>;
export type UpdateAdesaoInput = z.infer<typeof UpdateAdesaoSchema>;

// Schema para listar/filtrar adesões
export const ListAdesoesSchema = z.object({
  ataId: z.string().optional(),
  orgaoAderente: z.string().optional(),
  page: z.coerce.number().positive().optional(),
  limit: z.coerce.number().positive().optional(),
});

export type ListAdesoesInput = z.infer<typeof ListAdesoesSchema>;
