import { z } from 'zod';

export const CreateAtaSchema = z.object({
  nup: z.string().min(1, 'NUP é obrigatório'),
  modalidade: z.string().min(1, 'Modalidade é obrigatória'),
  arpNumero: z.string().regex(/^\d{3}\/\d{4}$/, 'ARP deve estar no formato 001/2025').optional().or(z.literal('')),
  orgaoGerenciador: z.string().min(1, 'Órgão demandante é obrigatório'),
  objeto: z.string().min(1, 'Objeto é obrigatório'),
  vigenciaFinal: z.string().transform((val) => {
    if (!val) return undefined;
    // Ajusta para meio-dia UTC para evitar problemas de timezone
    return new Date(val + 'T12:00:00.000Z');
  }).optional(),
  valorTotal: z.coerce.number().positive('Valor total deve ser positivo'),
});

export const UpdateAtaSchema = CreateAtaSchema.partial();

export type CreateAtaInput = z.infer<typeof CreateAtaSchema>;
export type UpdateAtaInput = z.infer<typeof UpdateAtaSchema>;

// Schema para listar/filtrar atas
export const ListAtasSchema = z.object({
  orgaoGerenciador: z.string().optional(),
  ativa: z.boolean().optional(),
  page: z.coerce.number().positive().optional(),
  limit: z.coerce.number().positive().optional(),
});

export type ListAtasInput = z.infer<typeof ListAtasSchema>;
