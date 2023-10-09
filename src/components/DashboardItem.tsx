import {
  Card,
  CardContent,
  Typography,
} from '@mui/material';

export const DashboardItem = (props: any) => {
  const { title, value, img, icon, iconStyle = {} } = props;
  const Icon = icon;

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography
          variant="h4"
          align="center"
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {icon ? (
            <Icon fontSize="large" style={{...iconStyle, marginRight: 8}} />
          ) : (
            <img src={img} alt='' style={{...iconStyle, marginRight: 8}} />
          )}
          {value}
        </Typography>
        <Typography variant="h6" align="center">
          {title}
        </Typography>
      </CardContent>
    </Card>
  );
};