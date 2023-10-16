import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Container,
  Paper,
  TextField,
  Tooltip,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
} from '@mui/icons-material';
import { enqueueSnackbar } from 'notistack';

import { LogArchiveList, LogDetails, useStyles } from '..';
import { DefaultLogsReloadInterval } from '../../consts';
import { LogService } from '../../services';
import { Log, LogArchive } from '../../types';

interface LogViewerProps {
  uuid: string;
  logs: Log[];
  archives: LogArchive[];
  onReload: () => void;
};

interface LogViewerState {
  key: keyof Log;
  direction: 'asc' | 'desc';
};

export const LogViewer = (props: LogViewerProps) => {
  const { uuid, logs, archives, onReload } = props;
  const [searchTerm, setSearchTerm] = useState('');
  const theme = useTheme();
  const classes = useStyles(theme);

  const [sortConfig, setSortConfig] = useState<LogViewerState>({
    key: 'date',
    direction: 'desc',
  });

  const filteredAndSortedLogs = useMemo(() => [...logs]
    .filter(log => log.message.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a: any, b: any) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    })
    .slice(0, Math.min(100, logs.length))
    , [logs, sortConfig, searchTerm]);

  const handleSortChange = (key: keyof Log) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleReload = useCallback(() => {
    setTimeout(() => onReload(), DefaultLogsReloadInterval * 1000);
  }, [onReload]);

  const handleDelete = async () => {
    const result = window.confirm(`Are you sure you want to delete all logs for device '${uuid}'?`);
    if (!result) {
      return;
    }

    const response = await LogService.deleteLogs(uuid, '');
    if (response?.status !== 'ok') {
      enqueueSnackbar(`Failed to delete all device logs for '${uuid}' with error: ${response?.error}`, { variant: 'error' });
      return;
    }

    setSearchTerm('');
    setSortConfig({ key: 'date', direction: 'desc' });
    enqueueSnackbar(`All device logs for '${uuid}' deleted successfully!`, { variant: 'success' });
    onReload();
  };

  const handleDeleteArchive = async (archive: LogArchive) => {
    const result = window.confirm(`Are you sure you want to delete log archive ${archive.fileName} for device '${uuid}'?`);
    if (!result) {
      return;
    }

    const response = await LogService.deleteLogs(uuid, archive.path);
    if (response?.status !== 'ok') {
      enqueueSnackbar(`Failed to delete log archive ${archive.fileName} for '${uuid}' with error: ${response?.error}`, { variant: 'error' });
      return;
    }

    enqueueSnackbar(`Log archive ${archive.fileName} for '${uuid}' deleted successfully!`, { variant: 'success' });
    onReload();
  };

  useEffect(() => handleReload(), [handleReload]);

  return (
    <>
      <div style={classes.controls}>
        <div>
          <Tooltip
            title="Sort logs by date"
            arrow
          >
            <Button
              variant="contained"
              size="small"
              onClick={() => handleSortChange('date')}
            >
              Sort&nbsp;
              {sortConfig.direction === 'asc'
                ? <ArrowDownIcon fontSize='small' />
                : <ArrowUpIcon fontSize='small' />
              }
            </Button>
          </Tooltip>
          &nbsp;
          <Tooltip
            title="Delete all device logs"
            arrow
          >
            <Button              
              color="error"
              variant="contained"
              size="small"
              onClick={handleDelete}
            >
              Delete All
            </Button>
          </Tooltip>
        </div>
        <TextField 
          label="Search..." 
          variant="outlined" 
          size="small" 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <Container component={Paper} elevation={3} style={classes.logsContainer}>
        {filteredAndSortedLogs.map((log: Log, index: number) => (
          <LogDetails key={index} log={log} />
        ))}
      </Container>
      <br />
      <LogArchiveList
        archives={archives}
        onDelete={handleDeleteArchive}
      />
    </>
  );
};