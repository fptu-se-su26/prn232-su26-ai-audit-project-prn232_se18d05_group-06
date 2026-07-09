import api from '../api';
import { TierConfigDto, CustomerTierSummaryDto, CustomerTierDto } from '../../types/customerTier';

export const getTierConfigs = async (): Promise<TierConfigDto[]> => {
    const response = await api.get<TierConfigDto[]>('/customer-tier/config');
    return response.data;
};

export const updateTierConfig = async (id: number, dto: TierConfigDto): Promise<TierConfigDto> => {
    const response = await api.put<TierConfigDto>(`/customer-tier/config/${id}`, dto);
    return response.data;
};

export const getTierSummary = async (): Promise<CustomerTierSummaryDto[]> => {
    const response = await api.get<CustomerTierSummaryDto[]>('/customer-tier/summary');
    return response.data;
};

export const getCustomersByTier = async (tierCode?: string): Promise<CustomerTierDto[]> => {
    const params = tierCode ? { tierCode } : {};
    const response = await api.get<CustomerTierDto[]>('/customer-tier/customers', { params });
    return response.data;
};

export const getCustomerTier = async (customerId: number): Promise<CustomerTierDto> => {
    const response = await api.get<CustomerTierDto>(`/customer-tier/customer/${customerId}`);
    return response.data;
};

export const recalculateCustomerTier = async (customerId: number): Promise<CustomerTierDto> => {
    const response = await api.post<CustomerTierDto>(`/customer-tier/recalculate/${customerId}`);
    return response.data;
};

export const recalculateAllCustomerTiers = async (): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/customer-tier/recalculate-all');
    return response.data;
};
