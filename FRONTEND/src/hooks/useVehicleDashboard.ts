import { useState, useEffect, useCallback } from 'react';
import { useVehicleDashboardStore, FilterMode } from '../store/vehicleDashboardStore';
import { getVehicleStatusSummary, getVehicleStatusList } from '../lib/api/vehicleDashboard';

export const useVehicleDashboard = () => {
  const {
    filterMode,
    selectedDate,
    selectedMonth,
    selectedStatus,
    summary,
    vehicleList,
    setFilterMode,
    setSelectedDate,
    setSelectedMonth,
    setSelectedStatus,
    setSummary,
    setVehicleList
  } = useVehicleDashboardStore();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isPolling, setIsPolling] = useState<boolean>(true);

  const fetchSummary = useCallback(async () => {
    try {
      const data = await getVehicleStatusSummary(filterMode, selectedDate, selectedMonth);
      setSummary(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch summary');
    }
  }, [filterMode, selectedDate, selectedMonth, setSummary]);

  const fetchList = useCallback(async () => {
    try {
      const data = await getVehicleStatusList(filterMode, selectedDate, selectedMonth, selectedStatus || undefined);
      setVehicleList(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch vehicle list');
    }
  }, [filterMode, selectedDate, selectedMonth, selectedStatus, setVehicleList]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    await Promise.all([fetchSummary(), fetchList()]);
    setLastUpdated(new Date());
    setLoading(false);
  }, [fetchSummary, fetchList]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Polling every 60 seconds
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPolling) {
      interval = setInterval(() => {
        fetchData();
      }, 60000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPolling, fetchData]);

  return {
    filterMode,
    summary,
    vehicleList,
    loading,
    error,
    selectedDate,
    selectedMonth,
    selectedStatus,
    lastUpdated,
    isPolling,
    setIsPolling,
    setFilterMode,
    setSelectedDate,
    setSelectedMonth,
    setSelectedStatus,
    refetch: fetchData
  };
};
