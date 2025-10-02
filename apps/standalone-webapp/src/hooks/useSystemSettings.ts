/**
 * System Settings Hook
 * Provides access to system-wide settings with reactive updates
 */

import { useState } from 'react';
import SystemSettingsService from '../services/system-settings.service';
import { SystemSettings } from '../types/system-settings';

export const useSystemSettings = () => {
  const [settings, setSettings] = useState<SystemSettings>(SystemSettingsService.getInstance().getSettings());

  const updateSettings = (updates: Partial<SystemSettings>) => {
    const updatedSettings = SystemSettingsService.getInstance().updateSettings(updates);
    setSettings(updatedSettings);
  };

  const getWrapRate = () => {
    return SystemSettingsService.getInstance().getWrapRate();
  };

  const setWrapRate = (rate: number) => {
    SystemSettingsService.getInstance().setWrapRate(rate);
    setSettings(SystemSettingsService.getInstance().getSettings());
  };

  const calculateWrapAmount = (annualSalary: number) => {
    return SystemSettingsService.getInstance().calculateWrapAmount(annualSalary);
  };

  return {
    settings,
    updateSettings,
    getWrapRate,
    setWrapRate,
    calculateWrapAmount,
  };
};
