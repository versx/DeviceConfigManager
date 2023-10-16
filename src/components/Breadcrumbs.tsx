import {
  Breadcrumbs as MuiBreadcrumbs,
  Link,
  Typography,
} from '@mui/material';
import { NavigateNext as NavigateNextIcon } from '@mui/icons-material';

import { ActiveMenuItemColor } from '../consts';

export interface BreadcrumbProps {
  crumbs: BreadcrumbItem[];
};

export interface BreadcrumbItem {
  text: string;
  color?: string;
  href: string;
  selected: boolean;
};

export const Breadcrumbs = (props: BreadcrumbProps) => {
  const { crumbs } = props;

  return (
    <div role="presentation" style={{paddingTop: '10px', paddingBottom: '30px'}}>
      <MuiBreadcrumbs
        aria-label="breadcrumb"
        separator={<NavigateNextIcon fontSize="small" />}
        //style={{color: 'white'}}
        style={{ color: 'inherit' }}
      >
        {crumbs.map((crumb: BreadcrumbItem) => crumb.selected ? (
          <Typography
            key={crumb.text}
            color={ActiveMenuItemColor}
          >
            {crumb.text}
          </Typography>
        ) : (
          <Link
            key={crumb.text}
            underline="hover"
            color={crumb.color ?? 'inherit'}
            href={crumb.href}
            //style={{textDecoration: 'none'}}
          >
            {crumb.text}
          </Link>
        ))}
      </MuiBreadcrumbs>
    </div>
  );
};