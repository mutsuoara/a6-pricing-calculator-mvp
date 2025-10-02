/**
 * Centralized Contract Vehicle Service
 * Provides CRUD operations and real-time data management for contract vehicles
 * This service ensures all components use the same data source
 */

import { ContractVehicle } from '../types/mapping';

class ContractVehicleService {
  private static instance: ContractVehicleService;
  private vehicles: ContractVehicle[] = [];
  private listeners: Set<() => void> = new Set();
  private loading = false;

  private constructor() {}

  static getInstance(): ContractVehicleService {
    if (!ContractVehicleService.instance) {
      ContractVehicleService.instance = new ContractVehicleService();
    }
    return ContractVehicleService.instance;
  }

  /**
   * Subscribe to data changes
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of data changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }

  /**
   * Get all contract vehicles
   */
  getVehicles(): ContractVehicle[] {
    return [...this.vehicles];
  }

  /**
   * Get loading state
   */
  isLoading(): boolean {
    return this.loading;
  }

  /**
   * Fetch vehicles from API
   */
  async fetchVehicles(): Promise<void> {
    if (this.loading) return;
    
    this.loading = true;
    this.notifyListeners();

    try {
      const response = await fetch('http://localhost:3001/api/lcat-management/contract-vehicles');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      this.vehicles = data || [];
    } catch (error) {
      console.error('Error fetching contract vehicles:', error);
      // Fallback to empty array on error
      this.vehicles = [];
    } finally {
      this.loading = false;
      this.notifyListeners();
    }
  }

  /**
   * Create a new contract vehicle
   */
  async createVehicle(vehicleData: Omit<ContractVehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<ContractVehicle> {
    try {
      const response = await fetch('http://localhost:3001/api/lcat-management/contract-vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...vehicleData,
          tenantId: '00000000-0000-0000-0000-000000000000',
          createdBy: 'user',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const createdVehicle = await response.json();
      this.vehicles.push(createdVehicle);
      this.notifyListeners();
      return createdVehicle;
    } catch (error) {
      console.error('Error creating contract vehicle:', error);
      throw error;
    }
  }

  /**
   * Update an existing contract vehicle
   */
  async updateVehicle(id: string, vehicleData: Partial<ContractVehicle>): Promise<ContractVehicle> {
    try {
      const response = await fetch(`http://localhost:3001/api/lcat-management/contract-vehicles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vehicleData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedVehicle = await response.json();
      const index = this.vehicles.findIndex(v => v.id === id);
      if (index !== -1) {
        this.vehicles[index] = updatedVehicle;
        this.notifyListeners();
      }
      return updatedVehicle;
    } catch (error) {
      console.error('Error updating contract vehicle:', error);
      throw error;
    }
  }

  /**
   * Delete a contract vehicle
   */
  async deleteVehicle(id: string): Promise<void> {
    try {
      const response = await fetch(`http://localhost:3001/api/lcat-management/contract-vehicles/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      this.vehicles = this.vehicles.filter(v => v.id !== id);
      this.notifyListeners();
    } catch (error) {
      console.error('Error deleting contract vehicle:', error);
      throw error;
    }
  }

  /**
   * Get a specific contract vehicle by ID
   */
  getVehicleById(id: string): ContractVehicle | undefined {
    return this.vehicles.find(v => v.id === id);
  }

  /**
   * Get a specific contract vehicle by name
   */
  getVehicleByName(name: string): ContractVehicle | undefined {
    return this.vehicles.find(v => v.name === name);
  }

  /**
   * Refresh data from API
   */
  async refresh(): Promise<void> {
    await this.fetchVehicles();
  }
}

export default ContractVehicleService;
