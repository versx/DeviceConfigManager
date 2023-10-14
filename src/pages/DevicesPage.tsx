import React, { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Container,
  TextField,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js';

import { BarChart, DeviceGrid, DeviceStats } from '../components';
import { ActiveMenuItemColor } from '../consts';
import { formatDate } from '../modules';
import { ConfigService, DeviceService } from '../services';
import { Config, Device, DeviceStat } from '../types';

export const DevicesPage = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [configs, setConfigs] = useState<Config[]>([]);
  const [deviceStats, setDeviceStats] = useState<DeviceStat[]>([]);
  const [date, setDate] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  ChartJS.register(ArcElement, BarElement, CategoryScale, Legend, LinearScale, Title, Tooltip);

  const handleReloadStats = useCallback((uuid?: string, date?: string) => {
    DeviceService.getDeviceStats(uuid ?? '', date ?? '').then((response: any) => {
      if (response?.status !== 'ok') {
        enqueueSnackbar(`Failed to fetch device stats with error: ${response?.error}`, { variant: 'error' });
        return;
      }
      setDeviceStats(response.stats);
    });
  }, [enqueueSnackbar]);

  const handleReload = useCallback(() => {
    DeviceService.getDevices().then((response: any) => {
      if (response?.status !== 'ok') {
        enqueueSnackbar(`Failed to fetch devices with error: ${response?.error}`, { variant: 'error' });
        return;
      }
      setDevices(response.devices);
    });

    ConfigService.getConfigs().then((response: any) => {
      if (response?.status !== 'ok') {
        enqueueSnackbar(`Failed to fetch configs with error: ${response?.error}`, { variant: 'error' });
        return;
      }
      setConfigs(response.configs);
    });

    handleReloadStats();
  }, [enqueueSnackbar, handleReloadStats]);

  const handleDateChange = (date: string) => {
    setDate(date);
    handleReloadStats('', date);
  };

  useEffect(() => handleReload(), [handleReload]);

  return (
    <Container>
      <Typography
        id="tableTitle"
        variant="h4"
        gutterBottom
        sx={{ flex: '1 1 100%' }}
        style={{ textAlign: 'center' }}
      >
        Devices
      </Typography>

      <Button
        variant="contained"
        onClick={() => window.location.href = '/devices/none'}
        style={{
          backgroundColor: ActiveMenuItemColor,
          color: '#fff',
          position: 'absolute',
        }}
      >
        Device Manager
      </Button>

      <DeviceGrid
        configs={configs}
        devices={devices}
        onReload={handleReload}
      />

      <TextField
        fullWidth
        margin="normal"
        label="Date"
        type="date"
        value={date ? formatDate(new Date(date)) : ''}
        InputLabelProps={{
          shrink: true,
        }}
        onChange={e => handleDateChange(e.target.value)}
        style={{
          marginBottom: 10,
        }}
      />

      <BarChart
        stats={deviceStats}
      />

      <DeviceStats
        stats={deviceStats}
      />
    </Container>
  );
};