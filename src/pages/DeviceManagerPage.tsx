import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Button,
  Container,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';

import { DefaultWebServerPort } from '../consts';
import { DeviceService } from '../services';
import { Device } from '../types';

export const DeviceManagerPage = () => {
  const { uuid } = useParams();
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>('');
  const [response, setResponse] = useState<any>('');
  const [error, setError] = useState<string | null>('');
  const [screenshot, setScreenshot] = useState<string>('');

  const sendRequest = async (actionType: string) => {
    try {
      const url = `http://${selectedDevice}:${DefaultWebServerPort}/${actionType}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          //'Content-Type': 'application/json',
          'Content-Type': 'text/plain; charset=x-user-defined',
        },
      });
      console.log('sendRequest response:', response);

      if (actionType === 'screen') {
        const data = await response.text();
        if (data.length < 1) {
          setScreenshot('data:image/png;base64,');
          return;
        }
        let binary = '';
        for (let i = 0; i < data.length; i++) {
          binary += String.fromCharCode(data.charCodeAt(i) & 255)
        }
        const screenshotData = 'data:image/png;base64,' + btoa(binary);
        console.log('screenshotData:', screenshotData);
        setScreenshot(screenshotData);
      } else if (actionType === 'restart') {
        const data = await response.text();
        console.log('restart response:', data);
        setResponse(data);
      } else {
        const data = await response.json();
        setResponse(data);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleReload = () => {
    DeviceService.getDevices().then((response: any) => {
      if (response?.status !== 'ok') {
        return;
      }

      setDevices(response.devices);
    });
  };

  useEffect(() => handleReload(), []);

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

      <Select value={selectedDevice} onChange={(e) => setSelectedDevice(e.target.value as string)}>
        {devices.map((device: Device, index: number) => (
          <MenuItem key={index} value={device.ipAddr!}>{device.uuid}</MenuItem>
        ))}
      </Select>
  
      <Button onClick={() => sendRequest('screen')}>Screenshot</Button>
      <Button onClick={() => sendRequest('account')}>Account</Button>
      <Button onClick={() => sendRequest('restart')}>Restart Game</Button>
      <Button onClick={() => sendRequest('reboot')}>Reboot Device</Button>
      <Button onClick={() => sendRequest('logs')}>View Logs</Button>

      <br />
      {response && <Typography variant="body1">{JSON.stringify(response)}</Typography>}
      {<img src={screenshot} alt="" width="250" height="550" />}
      {error && <Typography color="error">{error}</Typography>}

    </Container>
  );
};