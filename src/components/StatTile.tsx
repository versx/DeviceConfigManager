import {
  Card,
  CardContent,
  Color,
  Typography,
} from '@mui/material';

import { useColorMode } from '../contexts';

interface StatTileProps {
  title: string;
  value: number;
  color: string[] | Color | undefined | any;
  elevation?: number;
};

export const StatTile = (props: StatTileProps) => {
  const { title, value, color = 'primary.main', elevation = 3 } = props;
  const { mode } = useColorMode();
  const themeColor = mode === 'dark' ? 'white' : 'grey'; //'rgb(224, 224, 224)';

  return (
    <Card
      elevation={elevation}
      style={{
        border: `1px solid ${themeColor}`,
        borderRadius: '8px',
      }}
    >
      <CardContent style={{ textAlign: 'center' }}>
        <Typography variant="h5" color={color} gutterBottom>
          {value}
        </Typography>
        <Typography variant="subtitle1">
          {title}
        </Typography>
      </CardContent>
    </Card>
  );
};