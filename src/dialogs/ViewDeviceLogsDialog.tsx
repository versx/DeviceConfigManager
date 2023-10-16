import React, { useCallback, useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';

import { LogViewer } from '../components';
import { getUnixTime } from '../modules';
import { LogService } from '../services';
import { Log, LogArchive } from '../types';

interface ViewDeviceLogsDialogProps {
  open: boolean;
  uuid: string;
  onClose: () => void;
};

export const ViewDeviceLogsDialog = (props: ViewDeviceLogsDialogProps) => {
  const { open, uuid, onClose } = props;
  const [logs, setLogs] = useState<Log[] | null>(null);
  const [archives, setArchives] = useState<LogArchive[]>([]);
  const [error, setError] = useState<string>('');

  const handleReload = useCallback(() => {
    if (!uuid) {
      return;
    }

    LogService.getLogs(uuid).then((response: any) => {
      if (response?.status !== 'ok') {
        setError(response?.error);
        enqueueSnackbar(`Failed to get logs for device '${uuid}' with error: ${response?.error}`, { variant: 'error' });
        return;
      }

      const deviceLogs = response.logs.sort((a: Log, b: Log) => getUnixTime(new Date(b.date)) - getUnixTime(new Date(a.date)));
      setLogs(deviceLogs);
      setArchives(response.archives);
    });
  }, [uuid]);

  useEffect(() => handleReload(), [handleReload]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
    >
      <DialogTitle align="center">
        Device Logs - {uuid}
      </DialogTitle>
      <DialogContent>
        {!!logs ? logs.length === 0 ? (
          <Typography>There are no logs available for this device.</Typography>
        ) : (
          <LogViewer
            uuid={uuid}
            logs={logs!}
            archives={archives}
            onReload={handleReload}
          />
        ) : !!error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <Typography>Loading...</Typography>
        )}
      </DialogContent>
    </Dialog>
  );
};