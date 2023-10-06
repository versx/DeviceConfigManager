import {
  Card,
  CardActions,
  CardContent,
  Divider,
  Grid,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { DateTime } from 'luxon';

import { Schedule } from '../../types';

interface ScheduleListProps {
  schedules: Schedule[];
  onEdit: (schedule: Schedule) => void;
  onDelete: (name: string) => void;
};

export const ScheduleList = (props: ScheduleListProps) => {
  const { schedules, onEdit, onDelete } = props;

  const getTimezoneName = (offset: number): string => {
    const timezone = `Etc/GMT${offset >= 0 ? '+' : '-'}${Math.abs(offset)}`;
    const dateTime = DateTime.now().setZone(timezone);
    return dateTime.zoneName!;
  };

  return (
    <Grid container spacing={3}>
      {schedules.map((schedule) => (
        <Grid item xs={12} sm={6} md={4} key={schedule.name}>
          <Card elevation={3} style={{borderRadius: 16}}>
            <CardContent>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'row', marginBottom: 8 }}>
                <ScheduleIcon color="primary" fontSize="large" sx={{marginRight: 1}} />
                <Typography variant="h6" component="h2">
                  {schedule.name}
                </Typography>
              </div>
              <Divider style={{marginBottom: 8}} />
              <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8}}>
                <Typography color="textSecondary">
                  Config: {schedule.config}
                </Typography>
                <Typography color="textSecondary">
                  Next Config: {schedule.nextConfig}
                </Typography>
              </div>
              <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8}}>
                <Typography color="textSecondary">
                  Start: {new Date(schedule.startTime).toLocaleTimeString()}
                </Typography>
                <Typography color="textSecondary">
                  End: {new Date(schedule.endTime).toLocaleTimeString()}
                </Typography>
              </div>
              <Typography color="textSecondary" style={{marginBottom: 8}}>
                Timezone: {getTimezoneName(schedule.timezoneOffset)}
              </Typography>
              <Typography color="textSecondary">
                Devices:
              </Typography>
              <ul color="textSecondary" style={{padding: 0, margin: 0, paddingLeft: 25}}>
                {schedule.uuids.map((uuid: string, index: number) => (
                  <li key={index}>{uuid}</li>
                ))}
              </ul>
            </CardContent>
            <CardActions>
              <div style={{ flex: 1 }}>
                <Tooltip title="Edit Schedule" arrow>
                  <IconButton color="primary" onClick={() => onEdit(schedule)}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Schedule" arrow>
                  <IconButton color="error" onClick={() => onDelete(schedule.name)}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </div>
              {schedule.enabled ? (
                <Tooltip title="Schedule Enabled" arrow>
                  <CheckCircleIcon color="primary" />
                </Tooltip>
              ) : (
                <Tooltip title="Schedule Disabled" arrow>
                  <CancelIcon color="error" />
                </Tooltip>
              )}
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};