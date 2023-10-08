import { Grid } from '@mui/material';

import { ScheduleCard } from '../../components';
import { Schedule } from '../../types';

interface ScheduleListProps {
  schedules: Schedule[];
  onEdit: (schedule: Schedule) => void;
  onDelete: (name: string) => void;
  onEnable: (schedule: Schedule, enabled: boolean) => void;
};

export const ScheduleList = (props: ScheduleListProps) => {
  const { schedules, onEdit, onDelete, onEnable } = props;

  return (
    <Grid container spacing={3}>
      {schedules.map((schedule) => (
        <Grid item xs={12} sm={6} md={4} key={schedule.name}>
          <ScheduleCard
            schedule={schedule}
            onEdit={onEdit}
            onDelete={onDelete}
            onEnable={onEnable}
          />
        </Grid>
      ))}
    </Grid>
  );
};