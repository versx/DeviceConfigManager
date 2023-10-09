import {
  Card,
  CardContent,
  Tooltip,
  Typography,
} from '@mui/material';

interface DashboardItemProps {
  title: string;
  value: string | number;
  img?: string;
  icon?: any;
  iconStyle?: any;
  href?: string | null;
};

export const DashboardItem = (props: DashboardItemProps) => {
  const { title, value, img, icon, iconStyle = {}, href = null } = props;
  const Icon = icon;

  const card = (
    <Card
      variant="outlined"
      onClick={() => href ? window.location.href = href : {}}
      onMouseOver={(event: any) => event.currentTarget.style.cursor = href ? 'pointer' : 'inherit'}
      style={{border: '1px solid grey', borderRadius: 8}}
    >
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
            <img src={img} alt={title} style={{...iconStyle, marginRight: 4}} />
          )}
          {value}
        </Typography>
        <Typography variant="h6" align="center">
          {title}
        </Typography>
      </CardContent>
    </Card>
  );
  return href ? (
    <Tooltip title={title} placement="top" arrow>
      {card}
    </Tooltip>
  ) : (
    card
  );
};