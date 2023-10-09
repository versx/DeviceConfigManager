import React, { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Container,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';

import { DeviceGrid } from '../components';
import { ActiveMenuItemColor } from '../consts';
import { ConfigService, DeviceService } from '../services';
import { Config, Device } from '../types';

export const DevicesPage = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [configs, setConfigs] = useState<Config[]>([]);
  const { enqueueSnackbar } = useSnackbar();

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
  }, [enqueueSnackbar]);

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
        onClick={() => window.location.href = '/devices/Test2SE'}
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
    </Container>
  );
};