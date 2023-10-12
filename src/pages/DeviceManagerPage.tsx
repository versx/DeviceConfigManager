import { Buffer } from 'buffer';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Button,
  ButtonGroup,
  Container,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';

import { SettingKeys } from '../consts';
import { useServerSettings } from '../hooks';
import { DeviceService } from '../services';
import { Device } from '../types';

// @ts-ignore
window.Buffer = Buffer;

export const DeviceManagerPage = () => {
  const { uuid } = useParams();
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>('none');
  const [response, setResponse] = useState<any>('');
  const [error, setError] = useState<string | null>('');
  const [screenshot, setScreenshot] = useState<string>();
  const { settings } = useServerSettings();
  const remoteAgentUrls = settings[SettingKeys.AgentUrls]?.split(',') ?? [];

  const handleReload = useCallback(() => {
    DeviceService.getDevices().then((response: any) => {
      if (response?.status !== 'ok') {
        return;
      }

      setDevices(response.devices);
      const selected = response.devices.find((device: Device) => device.uuid === uuid);
      setSelectedDevice(selected?.ipAddr ? selected.ipAddr : 'none');
    });
  }, [uuid]);

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
        Manage Device {uuid}
      </Typography>

      <Select
        value={selectedDevice || 'none'}
        variant="outlined"
        onChange={(e) => setSelectedDevice(e.target.value as string)}
      >
        <MenuItem key="none" value="none" selected disabled>Select a device</MenuItem>
        {devices.map((device: Device, index: number) => (
          <MenuItem key={index} value={device.ipAddr!}>{device.uuid}</MenuItem>
        ))}
      </Select>
      <br />
  
      <ButtonGroup
        variant="contained"
        aria-label="outlined primary button group"
        style={{ marginTop: 8, marginBottom: 8 }}
      >
        <Button
          variant="contained"
          onClick={async () => {
            const response = await DeviceService.sendDeviceRequest(selectedDevice!, 8080, 'screen');
            if (response?.error) {
              setError(response.message);
            } else {
              setError('');
              setScreenshot(response.data);
            }
          }}
        >
          Screenshot
        </Button>
        <Button
          variant="contained"
          onClick={async () => {
            const response = await DeviceService.sendDeviceRequest(selectedDevice!, 8080, 'account');
            if (response?.error) {
              setError(response.message);
            } else {
              setError('');
              setResponse(response.data);
            }
          }}
        >
          Account
        </Button>
        <Button
          variant="contained"
          onClick={async () => {
            const response = await DeviceService.sendDeviceRequest(selectedDevice!, 8080, 'restart');
            if (response?.error) {
              setError(response.message);
            } else {
              setError('');
              setResponse(response.data);
            }
          }}
        >
          Restart Game
        </Button>
        <Button
          variant="contained"
          onClick={async () => await DeviceService.sendAgentRequest({ type: 'reboot', device: uuid }, remoteAgentUrls)}
        >
          Reboot Device
        </Button>
      </ButtonGroup>

      <br />
      {response && <Typography variant="body1">{JSON.stringify(response)}</Typography>}
      {<img src={screenshot} alt="" width="250" height="550" />}
      {error && <Typography color="error">{error}</Typography>}

    </Container>
  );
};