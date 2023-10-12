import {
  Card,
  CardActions,
  CardContent,
  Divider,
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

import { getTimezoneName } from '../../modules';
import { Schedule } from '../../types';

interface ScheduleCardProps {
  schedule: any;
  onEdit: (schedule: Schedule) => void;
  onDelete: (name: string) => void;
  onEnable: (schedule: Schedule, enabled: boolean) => void;
};

export const ScheduleCard = (props: ScheduleCardProps) => {
  const { schedule, onEdit, onDelete, onEnable } = props;

  return (
    <Card elevation={3} style={{border: '1px solid grey', borderRadius: 16}}>
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
        <Typography color="textSecondary">
          Timezone: {getTimezoneName(schedule.timezoneOffset)}
        </Typography>
        <Typography color="textSecondary">
          Start: {new Date(schedule.startTime).toLocaleString()}
        </Typography>
        <Typography color="textSecondary" style={{marginBottom: 8}}>
          End: {new Date(schedule.endTime).toLocaleString()}
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
            <IconButton onClick={() => onDelete(schedule.name)}>
              <DeleteIcon color="error" />
            </IconButton>
          </Tooltip>
        </div>
        <IconButton
          onClick={() => onEnable(schedule, !schedule.enabled)}
          aria-label={schedule.enabled ? 'Schedule Enabled' : 'Schedule Disabled'}
        >
          <Tooltip title={schedule.enabled ? 'Schedule Enabled' : 'Schedule Disabled'} arrow>
            {schedule.enabled
              ? <CheckCircleIcon color="primary" />
              : <CancelIcon color="error" />
            }
          </Tooltip>
        </IconButton>
      </CardActions>
    </Card>
  );
};