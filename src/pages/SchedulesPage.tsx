import { useEffect, useState } from 'react';
import {
  Container,
  Fab,
  Tooltip,
  Typography,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

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

  const handleReload = () => {
    ScheduleService.getSchedules().then((response: any) => {
      if (response?.status !== 'ok') {
        // TODO Error
        return;
      }

      //setSchedules(response.schedules);
      setSchedules([{
        name: 'Test',
        config: 'Main',
        startTime: new Date(),
        endTime: new Date(),
        uuids: ["TestSE", "Test2SE"],
        timezoneOffset: -7,
        nextConfig: 'Test',
        enabled: true,
      },{
        name: 'Test2',
        config: 'Test',
        startTime: new Date(),
        endTime: new Date(),
        uuids: ["Test2SE"],
        timezoneOffset: -7,
        nextConfig: 'Main',
        enabled: false,
      }]);
    });

    ConfigService.getConfigs().then((response: any) => {
      if (response?.status !== 'ok') {
        // TODO Error
        return;
      }

      setConfigs(response.configs);
    });

    DeviceService.getDevices().then((response: any) => {
      if (response?.status !== 'ok') {
        // TODO Error
        return;
      }

      setDevices(response.devices);
    });
  };

  const handleSubmit = (isNew: boolean, schedule: Schedule) => {
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
        // TODO Error
        return;
      }

      handleReload();
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