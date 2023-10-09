import React, { useState } from 'react';
import {
  Fab,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  GridOn as GridOnIcon,
  TableRows as TableRowsIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';

import { DeviceCard, DeviceTable } from '..';
import { ActiveMenuItemColor, StorageKeys } from '../../consts';
import { CreateDeviceDialog, ViewDeviceLogsDialog } from '../../dialogs';
import { get, set } from '../../modules';
import { DeviceService } from '../../services';
import { Config, Device } from '../../types';

interface DeviceGridProps {
  configs: Config[];
  devices: Device[];
  onReload: () => void;
};

interface PhoneModelState {
  open: boolean;
  editModel: Device | undefined;
};

export const DeviceGrid = (props: DeviceGridProps) => {
  const { configs, devices, onReload } = props;
  const deviceDisplayMode = get(StorageKeys.DeviceDisplay, 'grid');
  const [view, setView] = useState<'grid' | 'table'>(deviceDisplayMode);
  const [alignment, setAlignment] = React.useState<string | null>(deviceDisplayMode === 'grid' ? 'left' : 'right');
  const [state, setState] = useState<PhoneModelState>({
    open: false,
    editModel: undefined,
  });
  const [openLogsDialog, setOpenLogsDialog] = useState(false);
  const [device, setDevice] = useState<string | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  const handleAlignment = (event: any, newAlignment: string | null) => setAlignment(newAlignment);

  const handleDeviceDisplayChange = (mode: 'grid' | 'table') => {
    set(StorageKeys.DeviceDisplay, mode);
    setView(mode);
  };

  const handleOpen = () => setState({open: true, editModel: undefined});
  const handleClose = () => setState({open: false, editModel: undefined});

  const handleSubmit = async (isNew: boolean, device: Device) => {
    const response = isNew
      ? await DeviceService.createDevice(device)
      : await DeviceService.updateDevice(device.uuid, device);
    if (response?.status !== 'ok') {
      enqueueSnackbar(`Failed to ${isNew ? 'create' : 'update'} device with error: ${response?.error}`, { variant: 'error' });
      return;
    }

    enqueueSnackbar(`Device ${!isNew ? 'updated' : 'created'} successfully!`, { variant: 'success' });
    setState({open: false, editModel: undefined});
    onReload();
  };

  const handleAssign = async (uuid: string, config: string | null) => {
    const response = await DeviceService.assignConfig(uuid, config);
    if (response?.status !== 'ok') {
      enqueueSnackbar(`Failed to assign config with error: ${response?.error}`, { variant: 'error' });
      return;
    }

    enqueueSnackbar(`Config assigned successfully!`, { variant: 'success' });
    onReload();
  };

  const handleEdit = async (device: Device) => setState({open: true, editModel: device});

  const handleDelete = async (uuid: string) => {
    const result = window.confirm(`Are you sure you want to delete device ${uuid}?`);
    if (!result) {
      return;
    }

    const response = await DeviceService.deleteDevice(uuid);
    if (response?.status !== 'ok') {
      enqueueSnackbar(`Failed to delete device with error: ${response?.error}`, { variant: 'error' });
      return;
    }

    enqueueSnackbar(`Device deleted successfully!`, { variant: 'success' });
    onReload();
  };

  const handleViewLogs = (uuid: string) => {
    setDevice(uuid);
    setOpenLogsDialog(true);
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'end' }}>
        <ToggleButtonGroup
          exclusive
          aria-label="device display type"
          value={alignment}
          size="small"
          onChange={handleAlignment}
          style={{
            marginBottom: 8,
          }}
        >
          <ToggleButton
            aria-label="Grid"
            value="left"
            onClick={() => handleDeviceDisplayChange('grid')}
            style={{backgroundColor: alignment === 'left' ? ActiveMenuItemColor : 'inherit'}}
          >
            <GridOnIcon />
          </ToggleButton>
          <ToggleButton
            aria-label="Table"
            value="right"
            onClick={() => handleDeviceDisplayChange('table')}
            style={{backgroundColor: alignment === 'right' ? ActiveMenuItemColor : 'inherit'}}
          >
            <TableRowsIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </div>

      <Tooltip title="Create new device" arrow>
        <Fab
          color="primary"
          aria-label="add"
          onClick={handleOpen}
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

      {view === 'grid' ? (
        <Grid container spacing={3}>
          {devices.map((device: Device) => (
            <Grid item xs={12} sm={6} md={4} key={device.uuid}>
              <DeviceCard
                device={device}
                configs={configs}
                onAssign={handleAssign}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onViewLogs={handleViewLogs}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <DeviceTable
          devices={devices}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onViewLogs={handleViewLogs}
          onReload={onReload}
        />
      )}

      <CreateDeviceDialog
        open={state.open}
        configs={configs}
        device={state.editModel}
        onClose={handleClose}
        onSave={handleSubmit}
      />

      <ViewDeviceLogsDialog
        open={openLogsDialog}
        uuid={device!}
        onClose={() => setOpenLogsDialog(false)}
      />
    </>
  );
};