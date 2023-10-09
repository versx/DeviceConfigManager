import React, { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Container,
  Grid,
  Paper,
  Table,
  TableBody,
  TableContainer,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  DevicesOther as DevicesOtherIcon,
  EventNote as EventNoteIcon,
  Replay as ReplayIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';

import {
  DashboardItem,
  HeadCell,
  OfflineDeviceTableHeadCells,
  Order,
  SortableTableHead,
  StyledTableCell,
  StyledTableRow,
} from '../components';
import { ActiveMenuItemColor, DeviceOnlineIcon, DeviceOfflineIcon } from '../consts';
import { formatDate, isDeviceOnline } from '../modules';
import { ConfigService, DeviceService, ScheduleService } from '../services';
import { getUserToken } from '../stores';
import { Config, Device, DeviceStat, Schedule } from '../types';

export const DashboardPage = () => {
  const [configs, setConfigs] = useState<Config[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof Device>('uuid');
  const { enqueueSnackbar } = useSnackbar();
  const currentUser = getUserToken();

  const devicesOnline = devices.filter((device: Device) => isDeviceOnline(device.lastSeen));
  const devicesOffline = devices.filter((device: Device) => !isDeviceOnline(device.lastSeen));

  const getDeviceRestartCount = (devices: Device[]) => {
    let restarts = 0;
    for (const device of devices) {
      if ((device.deviceStats ?? []).length === 0) {
        continue;
      }
      const deviceStats = device.deviceStats?.filter((stat: DeviceStat) => formatDate(new Date(stat.date)) === formatDate(new Date())) ?? [];
      for (const stat of deviceStats) {
        restarts += stat.restarts;
      }
    }
    return restarts;
  };

  const restarts = getDeviceRestartCount(devices);

  const handleRequestSort = (property: keyof Device) => (event: any) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleRestartGame = async (device: Device) => {
    if (!device.ipAddr) {
      enqueueSnackbar(`Failed to restart device ${device.uuid} because it has no IP address set.`, { variant: 'error' });
      return;
    }
    const response = await DeviceService.sendRequest(device.ipAddr, device.webserverPort, 'restart');
    if (response?.error) {
      enqueueSnackbar(`Failed to restart device ${device.uuid} with error: ${response?.message}`, { variant: 'error' });
      return;
    }

    enqueueSnackbar(`Successfully restarted device ${device.uuid}!`, { variant: 'success' });
  };

  const handleReload = useCallback(() => {
    ScheduleService.getSchedules().then((response: any) => {
      if (response?.status !== 'ok') {
        enqueueSnackbar(`Failed to get schedules with error: ${response?.error}`, { variant: 'error' });
        return;
      }
      setSchedules(response.schedules);
    });

    ConfigService.getConfigs().then((response: any) => {
      if (response?.status !== 'ok') {
        enqueueSnackbar(`Failed to get configs with error: ${response?.error}`, { variant: 'error' });
        return;
      }
      setConfigs(response.configs);
    });

    DeviceService.getDevices().then((response: any) => {
      if (response?.status !== 'ok') {
        enqueueSnackbar(`Failed to get devices with error: ${response?.error}`, { variant: 'error' });
        return;
      }
      setDevices(response.devices);
    });
  }, [enqueueSnackbar]);

  useEffect(() => handleReload(), [handleReload]);

  return (
    <Container>
      <Typography variant="h4" gutterBottom style={{textAlign: 'center'}}>
        Dashboard
      </Typography>

      <Container component={Paper} elevation={3} style={{borderRadius: 8, marginTop: 32, padding: 16}}>
        <Typography variant="h5" gutterBottom style={{textAlign: 'center'}}>
          Overview
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <DashboardItem
              title="Total Configs"
              value={configs.length.toLocaleString()}
              icon={SettingsIcon}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <DashboardItem
              title="Total Devices"
              value={devices.length.toLocaleString()}
              icon={DevicesOtherIcon}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <DashboardItem
              title="Total Schedules"
              value={schedules.length.toLocaleString()}
              icon={EventNoteIcon}
            />
          </Grid>
        </Grid>
      </Container>

      <Container component={Paper} elevation={3} style={{borderRadius: 8, marginTop: 32, padding: 16}}>
        <Typography variant="h5" gutterBottom style={{textAlign: 'center'}}>
          Devices
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <DashboardItem
              title="Online"
              value={devicesOnline.length.toLocaleString()}
              //icon={PhoneIphoneIcon}
              img={DeviceOnlineIcon}
              iconStyle={{width: 35, height: 35}}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <DashboardItem
              title="Offline"
              value={devicesOffline.length.toLocaleString()}
              img={DeviceOfflineIcon}
              iconStyle={{width: 35, height: 35}}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <DashboardItem
              title="Restarts Today"
              value={restarts.toLocaleString()}
              icon={ReplayIcon}
            />
          </Grid>
        </Grid>
      </Container>

      <Container component={Paper} elevation={3} style={{borderRadius: 8, marginTop: 32, padding: 16}}>
        <Typography variant="h5" gutterBottom style={{textAlign: 'center'}}>
          Devices Offline
        </Typography>
        <TableContainer component={Paper} elevation={1} style={{border: '1px solid grey'}}>
          <Table stickyHeader>
            <SortableTableHead
              disableCheckbox
              headCells={OfflineDeviceTableHeadCells}
              numSelected={0}
              order={order}
              orderBy={orderBy}
              //onSelectAllClick={handleSelectAllClick}
              onSelectAllClick={(event, checked) => console.log('onSelectAllClick')}
              onRequestSort={handleRequestSort}
              rowCount={devices.length}
              isAdmin={currentUser?.isRoot}
            />

            <TableBody>
              {devicesOffline.map((device: Device, index: number) => (
                <StyledTableRow
                  hover
                  key={index}
                >
                  {OfflineDeviceTableHeadCells.map((headCell: HeadCell<Device>, colIndex: number) => (headCell.isAdmin || !headCell.isAdmin) && (
                    <StyledTableCell
                      key={colIndex}
                      component={colIndex === 0 ? 'th' : undefined}
                      scope={colIndex === 0 ? 'row' : undefined}
                      align={headCell.align ?? 'left'}
                      padding={headCell.disablePadding ? 'none' : 'normal'}
                      sx={{
                        display: colIndex > 0 && headCell.hidden ? 'none' : 'table-cell',
                        ...headCell.style,
                      }}
                    >
                      {headCell.format
                        ? headCell.format(device, device[headCell.id])
                        : String(device[headCell.id])
                      }
                    </StyledTableCell>
                  ))}
                  <StyledTableCell align="right">
                    <Tooltip
                      title="Restart Device"
                      placement="left-start"
                      arrow
                    >
                      <Button
                        variant="contained"
                        size="small"
                        style={{backgroundColor: ActiveMenuItemColor, color: '#fff'}}
                        onClick={() => handleRestartGame(device)}
                      >
                        Restart
                      </Button>
                    </Tooltip>
                  </StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </Container>
  );
};