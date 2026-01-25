import { z } from 'zod';

export const createAtaSchema = z.object({
  nup: z.string().min(1, 'NUP é obrigatório').max(50),
  modalidade: z.string().min(1, 'Modalidade é obrigatória').max(50),
  arpNumero: z.string().max(20).optional().or(z.literal('')),
  orgaoGerenciador: z.string().min(1, 'Órgão demandante é obrigatório').max(10),
  objeto: z.string().min(1, 'Objeto é obrigatório').max(500),
  vigenciaFinal: z.string().refine(
    (date) => !date || new Date(date) > new Date(),
    'Vigência final deve ser uma data futura'
  ).optional().or(z.literal('')),
  valorTotal: z.coerce.number().min(0.01, 'Valor total deve ser maior que 0'),
});

export const updateAtaSchema = createAtaSchema.partial();

export const createAdesaoSchema = z.object({
  ataId: z.string().min(1, 'Ata é obrigatória'),
  numeroIdentificador: z.string().min(1, 'Número identificador é obrigatório'),
  orgaoAderente: z.string().min(1, 'Órgão aderente é obrigatório').max(30),
  valorAderido: z.coerce.number().min(0.01, 'Valor aderido deve ser maior que 0'),
});

export const updateAdesaoSchema = createAdesaoSchema.partial();
