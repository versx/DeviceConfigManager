import React, { useCallback, useEffect, useState } from 'react';
import {
  Container,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';

import { DeviceGrid } from '../components';
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
        style={{textAlign: 'center'}}
      >
        Devices
      </Typography>

      <DeviceGrid
        configs={configs}
        devices={devices}
        onReload={handleReload}
      />
    </Container>
  );
};