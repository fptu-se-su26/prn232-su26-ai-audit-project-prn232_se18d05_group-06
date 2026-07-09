export interface TierConfigDto {
    tierId: number;
    tierName: string;
    tierCode: string;
    minOrders: number;
    minRevenue: number;
    discountPercent: number;
    isActive: boolean;
}

export interface CustomerTierSummaryDto {
    tierCode: string;
    tierName: string;
    customerCount: number;
    discountPercent: number;
}

export interface CustomerTierDto {
    customerId: number;
    customerCode: string;
    companyName: string;
    tier: string | null;
    tierUpdatedAt: string | null;
    totalOrders12M: number | null;
    totalRevenue12M: number;
}
