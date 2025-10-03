/**
 * System Settings Hook
 * Provides access to system-wide settings with reactive updates
 */

import { useState, useEffect } from 'react';
import SystemSettingsService from '../services/system-settings.service';
import { SystemSettings } from '../types/system-settings';

export const useSystemSettings = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    wrapRate: 87.5,
    minimumProfitRate: 7.53,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Initialize settings from backend
  useEffect(() => {
    const initializeSettings = async () => {
      try {
        setIsLoading(true);
        await SystemSettingsService.getInstance().initialize();
        const currentSettings = SystemSettingsService.getInstance().getSettings();
        setSettings(currentSettings);
        console.log('useSystemSettings: Initialized with settings:', currentSettings);
      } catch (error) {
        console.error('useSystemSettings: Failed to initialize settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeSettings();
  }, []);

  // Listen for changes to system settings
  useEffect(() => {
    const interval = setInterval(() => {
      const currentSettings = SystemSettingsService.getInstance().getSettings();
      setSettings(prevSettings => {
        // Only update if settings actually changed
        if (prevSettings.wrapRate !== currentSettings.wrapRate || 
            prevSettings.minimumProfitRate !== currentSettings.minimumProfitRate) {
          return currentSettings;
        }
        return prevSettings;
      });
    }, 100); // Check every 100ms for changes

    return () => clearInterval(interval);
  }, []);

  const updateSettings = async (updates: Partial<SystemSettings>) => {
    try {
      const updatedSettings = await SystemSettingsService.getInstance().updateSettings(updates);
      setSettings(updatedSettings);
    } catch (error) {
      console.error('useSystemSettings: Failed to update settings:', error);
      throw error;
    }
  };

  const getWrapRate = () => {
    return SystemSettingsService.getInstance().getWrapRate();
  };

  const setWrapRate = async (rate: number) => {
    try {
      await SystemSettingsService.getInstance().setWrapRate(rate);
      setSettings(SystemSettingsService.getInstance().getSettings());
    } catch (error) {
      console.error('useSystemSettings: Failed to set wrap rate:', error);
      throw error;
    }
  };

  const calculateWrapAmount = (annualSalary: number) => {
    return SystemSettingsService.getInstance().calculateWrapAmount(annualSalary);
  };

  const getMinimumProfitRate = () => {
    return SystemSettingsService.getInstance().getMinimumProfitRate();
  };

  const setMinimumProfitRate = async (rate: number) => {
    try {
      await SystemSettingsService.getInstance().setMinimumProfitRate(rate);
      setSettings(SystemSettingsService.getInstance().getSettings());
    } catch (error) {
      console.error('useSystemSettings: Failed to set minimum profit rate:', error);
      throw error;
    }
  };

  const calculateMinimumProfitAmount = (annualSalary: number, wrapAmount: number) => {
    return SystemSettingsService.getInstance().calculateMinimumProfitAmount(annualSalary, wrapAmount);
  };

  return {
    settings,
    isLoading,
    updateSettings,
    getWrapRate,
    setWrapRate,
    calculateWrapAmount,
    getMinimumProfitRate,
    setMinimumProfitRate,
    calculateMinimumProfitAmount,
  };
};
