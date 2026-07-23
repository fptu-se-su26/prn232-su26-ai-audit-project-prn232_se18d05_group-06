import api from '../../lib/api';
import { KpiDashboard, KpiOverview, KpiWarehouse, KpiDispatcher, KpiFinance } from '../../types/kpi';

export const kpiApi = {
  getDashboard: async (): Promise<KpiDashboard> => {
    const response = await api.get<KpiDashboard>('/kpi/dashboard');
    return response.data;
  },

  getOverview: async (): Promise<KpiOverview> => {
    const response = await api.get<KpiOverview>('/kpi/overview');
    return response.data;
  },

  getWarehouse: async (): Promise<KpiWarehouse> => {
    const response = await api.get<KpiWarehouse>('/kpi/warehouse');
    return response.data;
  },

  getDispatcher: async (): Promise<KpiDispatcher> => {
    const response = await api.get<KpiDispatcher>('/kpi/dispatcher');
    return response.data;
  },

  getFinance: async (): Promise<KpiFinance> => {
    const response = await api.get<KpiFinance>('/kpi/finance');
    return response.data;
  },

  exportReport: async (format: 'excel' | 'pdf' = 'excel', fromDate?: string, toDate?: string) => {
    const params: Record<string, string> = { format };
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;

    const response = await api.get('/kpi/export', {
      params,
      responseType: 'blob',
    });

    const disposition = response.headers['content-disposition'] ?? '';
    const fileName = format === 'excel'
      ? `KPI_Report_${new Date().toISOString().split('T')[0]}.xlsx`
      : `KPI_Report_${new Date().toISOString().split('T')[0]}.txt`;

    const url = URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  },
};
