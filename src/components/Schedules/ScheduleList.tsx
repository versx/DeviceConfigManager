import { Grid } from '@mui/material';

import { ScheduleCard } from '../../components';
import { Schedule } from '../../types';

interface ScheduleListProps {
  schedules: Schedule[];
  onEdit: (schedule: Schedule) => void;
  onDelete: (name: string) => void;
};

export const ScheduleList = (props: ScheduleListProps) => {
  const { schedules, onEdit, onDelete } = props;

  return (
    <Grid container spacing={3}>
      {schedules.map((schedule) => (
        <Grid item xs={12} sm={6} md={4} key={schedule.name}>
          <ScheduleCard
            schedule={schedule}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </Grid>
      ))}
    </Grid>
  );
};