import api from './api';

export interface CreateStockTransferRequest {
  skuid: number;
  fromBinId: number;
  toBinId: number;
  quantity: number;
}

export interface StockTransferResponse {
  transferId: number;
  transferCode: string;
  skuid: number;
  skucode: string;
  productName: string;
  fromBinId: number;
  fromBinCode: string;
  toBinId: number;
  toBinCode: string;
  quantity: number;
  status: string;
  createdAt: string;
  completedAt: string;
  createdByName: string;
}

export interface SkuOption {
  skuid: number;
  skucode: string;
  productName: string;
}

export interface BinOption {
  binId: number;
  binCode: string;
  zoneName: string;
  skuid?: number;
  quantity?: number;
}

export interface StockTransferOptions {
  skus: SkuOption[];
  fromBins: BinOption[];
  allBins: BinOption[];
}

export const getTransferOptions = async (): Promise<StockTransferOptions> => {
  const response = await api.get<StockTransferOptions>('/stocktransfers/options');
  return response.data;
};

export interface StockTransferPagedResult {
  totalCount: number;
  items: StockTransferResponse[];
}

export const getTransferHistory = async (page: number = 1, pageSize: number = 10): Promise<StockTransferPagedResult> => {
  const response = await api.get<StockTransferPagedResult>(`/stocktransfers?page=${page}&pageSize=${pageSize}`);
  return response.data;
};

export const createTransfer = async (request: CreateStockTransferRequest): Promise<StockTransferResponse> => {
  const response = await api.post<StockTransferResponse>('/stocktransfers', request);
  return response.data;
};
