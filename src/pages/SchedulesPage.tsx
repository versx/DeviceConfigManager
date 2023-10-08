import { useCallback, useEffect, useState } from 'react';
import {
  Container,
  Fab,
  Tooltip,
  Typography,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useSnackbar } from 'notistack';

import { ScheduleList } from '../components';
import { CreateScheduleDialog } from '../dialogs';
import { ConfigService, DeviceService, ScheduleService } from '../services';
import { Config, Device, Schedule } from '../types';

export const SchedulesPage = () => {
  const [open, setOpen] = useState(false);
  const [editModel, setEditModel] = useState<Schedule | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [configs, setConfigs] = useState<Config[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const { enqueueSnackbar } = useSnackbar();

  const handleReload = useCallback(() => {
    ScheduleService.getSchedules().then((response: any) => {
      if (response?.status !== 'ok') {
        enqueueSnackbar(`Error occurred getting schedules with error ${response.error}`, { variant: 'error' });
        return;
      }

      setSchedules(response.schedules);
    });

    ConfigService.getConfigs().then((response: any) => {
      if (response?.status !== 'ok') {
        enqueueSnackbar(`Error occurred getting configs with error ${response.error}`, { variant: 'error' });
        return;
      }

      setConfigs(response.configs);
    });

    DeviceService.getDevices().then((response: any) => {
      if (response?.status !== 'ok') {
        enqueueSnackbar(`Error occurred getting devices with error ${response.error}`, { variant: 'error' });
        return;
      }

      setDevices(response.devices);
    });
  }, [enqueueSnackbar]);

  const handleSubmit = async (isNew: boolean, schedule: Schedule) => {
    const response = isNew
      ? await ScheduleService.createSchedule(schedule)
      : await ScheduleService.updateSchedule(schedule.name, schedule);
    if (response?.status !== 'ok') {
      enqueueSnackbar(`Failed to ${isNew ? 'create' : 'update'} schedule with error: ${response?.error}`, { variant: 'error' });
      return;
    }

    enqueueSnackbar(`Schedule ${isNew ? 'created' : 'updated'} successfully!`, { variant: 'success' });
    setOpen(false);
    setEditModel(null);
    handleReload();
  };

  const handleEnable = async (schedule: Schedule, enabled: boolean) => {
    const response = await ScheduleService.updateSchedule(schedule.name, {...schedule, enabled});
    if (response?.status !== 'ok') {
      enqueueSnackbar(`Failed to ${enabled ? 'enable' : 'disable'} schedule with error: ${response?.error}`, { variant: 'error' });
      return;
    }

    enqueueSnackbar(`Schedule ${enabled ? 'enabled' : 'disabled'} successfully!`, { variant: 'success' });
    handleReload();
  };

  const handleEdit = (schedule: Schedule) => {
    setOpen(true);
    setEditModel(schedule);
  };

  const handleDelete = (name: string) => {
    const result = window.confirm(`Are you sure you want to delete schedule ${name}?`);
    if (!result) {
      return;
    }

    ScheduleService.deleteSchedule(name).then((response: any) => {
      if (response?.status !== 'ok') {
        enqueueSnackbar(`Error occurred deleting schedule ${name} with error ${response.error}`, { variant: 'error' });
        return;
      }

      handleReload();
    });
  };

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
        Schedules
      </Typography>
      
      <Tooltip title="Create new device schedule" arrow>
        <Fab
          color="primary"
          aria-label="add"
          onClick={() => setOpen(true)}
          style={{
            margin: '0px',
            top: 'auto',
            right: '32px',
            bottom: '32px',
            left: 'auto',
            position: 'fixed',
          }}
        >
          <AddIcon />
        </Fab>
      </Tooltip>

      <ScheduleList 
        schedules={schedules}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onEnable={handleEnable}
      />

      <CreateScheduleDialog
        open={open}
        configs={configs}
        devices={devices}
        schedule={editModel}
        onClose={() => setOpen(false)}
        onSave={handleSubmit}
      />
    </Container>
  );
};