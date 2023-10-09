import { ChangeEvent, MouseEvent } from 'react';

export type Order = 'asc' | 'desc';

export interface HeadCell<T> {
  id: keyof T;
  label: string;
  disablePadding: boolean;
  minWidth?: number;
  maxWidth?: number;
  align?: 'left' | 'right' | 'center' | 'justify' | 'inherit' | undefined;
  format?: (row: T, value: any) => any;
  isAdmin?: boolean;
  style?: any;
  hidden?: boolean;
};

export interface TableProps<T> {
  headCells: readonly HeadCell<T>[];
  numSelected: number;
  onRequestSort: (property: keyof T) => (event: MouseEvent<unknown>) => void;
  onSelectAllClick: (event: ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
  isAdmin: boolean;
  disableCheckbox?: boolean;
};

export interface TableToolbarProps {
  numSelected: number;
  search: string;
  onDelete: () => void;
  onSearch: (keyword: string) => void;
};