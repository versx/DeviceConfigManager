import {
  Container,
  Typography,
} from '@mui/material';

import { BreadcrumbItem, Breadcrumbs } from '../components';

const crumbs: BreadcrumbItem[] = [{
  text: 'Dashboard',
  href: '/',
  selected: false,
},{
  text: '404 Not Found',
  href: '/',
  selected: true,
}];

export const NotFoundPage = () => {
  return (
    <Container style={{ height: '35vh', textAlign: 'center' }}>
      <Breadcrumbs crumbs={crumbs} />

      <Typography variant="h3" gutterBottom>
        404
      </Typography>
      <Typography variant="h5" gutterBottom>
        Page Not Found
      </Typography>
    </Container>
  );
};