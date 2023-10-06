import { ChangeEvent, MouseEvent } from 'react';

export type Order = 'asc' | 'desc';

export interface HeadCell<T> {
  id: keyof T;
  label: string;
  disablePadding: boolean;
  minWidth?: number;
  align?: 'left' | 'right' | 'center' | 'justify' | 'inherit' | undefined;
  //format?: (value: number) => string;
  isAdmin?: boolean;
  style?: any;
};

export interface TableProps<T> {
  headCells: readonly HeadCell<T>[];
  numSelected: number;
  onRequestSort: (property: keyof T) => (event: MouseEvent<unknown>) => void;
  onSelectAllClick: (event: ChangeEvent<HTMLInputElement>) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
  isAdmin: boolean;
};

export interface TableToolbarProps {
  numSelected: number;
  search: string;
  onDelete: () => void;
  onSearch: (keyword: string) => void;
};