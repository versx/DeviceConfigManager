import React, { ReactElement } from 'react';
import {
  Container,
  Paper,
  Typography,
} from '@mui/material';
import { Theme, useTheme } from '@mui/material/styles';

const useStyles: any = (theme: Theme, height: string = '130px', width: string = '220px') => ({
  cardContainer: {
    //border: '1px solid rgb(224, 224, 224)', //#e0e0e0
    border: '1px solid grey', //#e0e0e0
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    width: width ?? '220px', // fixed width
    height: height ?? '130px', // fixed height
  },
  iconAndTextContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',  // This pushes the items to the far ends
    marginBottom: '8px',
  },
  icon: {
    marginRight: '8px',
  },
  value: {
    alignSelf: 'flex-end',
    flexGrow: 1, // this will push the value to the bottom of the container
    display: 'flex',
    alignItems: 'flex-end',
  },
});

export interface CardDisplayProps {
  text: string;
  icon: ReactElement;
  value: string | number;
  href?: string;
  valueSize?: number;
  height?: string;
  width?: string;
  elevation?: number;
};

export const CardDisplay = (props: CardDisplayProps) => {
  const {
    text, icon, value, href,
    valueSize = 20, elevation = 3,
    height = '120px', width = '220px',
  } = props;
  const theme = useTheme();
  const classes = useStyles(theme, height, width);

  const Card = () => (
    <Container
      component={Paper}
      elevation={elevation}
      style={classes.cardContainer}
    >
      <div style={classes.iconAndTextContainer}>
        <span style={classes.icon}>{icon}</span>
        <Typography variant="body1">{text}</Typography>
      </div>
      <Typography variant="h6" style={{...classes.value, fontSize: valueSize}}>
        <strong>{value}</strong>
      </Typography>
    </Container>
  );

  return !href ? (
    <Card />
  ) : (
    <a
      href={href}
      style={{textDecoration: 'none', color: 'inherit'}}
    >
      <Card />
    </a>
  );
};