import axios, { AxiosInstance } from 'axios';
import { Ata, Adesao, DashboardData, CreateAtaInput, CreateAdesaoInput } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor para adicionar token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('@arps:token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    // Se erro 401, redirecionar para login
    if (error.response?.status === 401) {
      localStorage.removeItem('@arps:token');
      localStorage.removeItem('@arps:user');
      window.location.href = '/';
    }
    
    return Promise.reject(error);
  }
);

// Atas
export const atasService = {
  getAll: async (page?: number, limit?: number, filters?: any) => {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    if (filters?.orgaoGerenciador) params.append('orgaoGerenciador', filters.orgaoGerenciador);
    if (filters?.ativa !== undefined) params.append('ativa', filters.ativa.toString());

    const response = await api.get<{ success: boolean; data: Ata[] }>('/atas', { params });
    return response.data.data;
  },

  getById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: Ata }>(`/atas/${id}`);
    return response.data.data;
  },

  create: async (data: CreateAtaInput) => {
    const response = await api.post<{ success: boolean; data: Ata }>('/atas', data);
    return response.data.data;
  },

  update: async (id: string, data: Partial<CreateAtaInput>) => {
    const response = await api.patch<{ success: boolean; data: Ata }>(`/atas/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<{ success: boolean; message: string }>(`/atas/${id}`);
    return response.data;
  },

  bulkDelete: async (ids: string[]) => {
    const response = await api.delete<{ 
      success: boolean; 
      data: { total: number; deletados: number; erros: Array<{ id: string; erro: string }> } 
    }>('/atas/bulk', { data: { ids } });
    return response.data.data;
  },
};

// Adesões
export const adesaoService = {
  getAll: async (page?: number, limit?: number, filters?: any) => {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    if (filters?.ataId) params.append('ataId', filters.ataId);
    if (filters?.orgaoAderente) params.append('orgaoAderente', filters.orgaoAderente);

    const response = await api.get<{ success: boolean; data: Adesao[] }>('/adesoes', { params });
    return response.data.data;
  },

  getByAta: async (ataId: string, page?: number, limit?: number) => {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());

    const response = await api.get<{ success: boolean; data: Adesao[] }>(`/adesoes/ata/${ataId}`, {
      params,
    });
    return response.data.data;
  },

  getById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: Adesao }>(`/adesoes/${id}`);
    return response.data.data;
  },

  create: async (data: CreateAdesaoInput) => {
    const response = await api.post<{ success: boolean; data: Adesao }>('/adesoes', data);
    return response.data.data;
  },

  update: async (id: string, data: Partial<CreateAdesaoInput>) => {
    const response = await api.patch<{ success: boolean; data: Adesao }>(`/adesoes/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<{ success: boolean; message: string }>(`/adesoes/${id}`);
    return response.data;
  },
};

// Dashboard
export const dashboardService = {
  getOverview: async () => {
    const response = await api.get<{ success: boolean; data: DashboardData }>('/dashboard');
    return response.data.data;
  },

  getAtasComSaldoCritico: async () => {
    const response = await api.get<{ success: boolean; data: Ata[] }>('/dashboard/saldo-critico');
    return response.data.data;
  },

  getAtasVencendo: async () => {
    const response = await api.get<{ success: boolean; data: Ata[] }>('/dashboard/vencendo');
    return response.data.data;
  },

  getResumosPorOrgao: async () => {
    const response = await api.get<{ success: boolean; data: any[] }>('/dashboard/resumos-orgao');
    return response.data.data;
  },
};

// Relatórios
export const relatoriosService = {
  buscarAta: async (params: { nup?: string; arpNumero?: string; modalidade?: string }) => {
    const searchParams = new URLSearchParams();
    if (params.nup) searchParams.append('nup', params.nup);
    if (params.arpNumero) searchParams.append('arpNumero', params.arpNumero);
    if (params.modalidade) searchParams.append('modalidade', params.modalidade);

    const response = await api.get<{ success: boolean; data: Ata & { adesoes: any[] } }>(
      `/atas/relatorio/buscar?${searchParams.toString()}`
    );
    return response.data.data;
  },
};

// Export default da instância axios para uso direto
export default api;
