/**
 * React Hook for Contract Vehicle Management
 * Provides centralized access to contract vehicle data with real-time updates
 */

import { useState, useEffect } from 'react';
import ContractVehicleService from '../services/contractVehicle.service';
import { ContractVehicle } from '../types/mapping';

export const useContractVehicles = () => {
  const [vehicles, setVehicles] = useState<ContractVehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contractVehicleService = ContractVehicleService.getInstance();

  useEffect(() => {
    // Subscribe to data changes
    const unsubscribe = contractVehicleService.subscribe(() => {
      setVehicles(contractVehicleService.getVehicles());
      setLoading(contractVehicleService.isLoading());
    });

    // Initial data fetch
    const fetchData = async () => {
      try {
        setError(null);
        await contractVehicleService.fetchVehicles();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch contract vehicles');
      }
    };

    fetchData();

    return unsubscribe;
  }, []);

  const createVehicle = async (vehicleData: Omit<ContractVehicle, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);
      return await contractVehicleService.createVehicle(vehicleData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create contract vehicle');
      throw err;
    }
  };

  const updateVehicle = async (id: string, vehicleData: Partial<ContractVehicle>) => {
    try {
      setError(null);
      return await contractVehicleService.updateVehicle(id, vehicleData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update contract vehicle');
      throw err;
    }
  };

  const deleteVehicle = async (id: string) => {
    try {
      setError(null);
      await contractVehicleService.deleteVehicle(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete contract vehicle');
      throw err;
    }
  };

  const refresh = async () => {
    try {
      setError(null);
      await contractVehicleService.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh contract vehicles');
    }
  };

  const getVehicleById = (id: string) => contractVehicleService.getVehicleById(id);
  const getVehicleByName = (name: string) => contractVehicleService.getVehicleByName(name);

  return {
    vehicles,
    loading,
    error,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    refresh,
    getVehicleById,
    getVehicleByName,
  };
};
