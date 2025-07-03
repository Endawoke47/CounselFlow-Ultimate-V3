import { ColDef } from 'ag-grid-community';
import { ICellRendererParams } from 'ag-grid-community';

import { IContract } from '../../../../../1pd-types/src/contracts';

import { EditButtonCellRenderer } from '@/shared/ui/EditButtonCellRenderer';

export const columns: ColDef<IContract>[] = [
  {
    headerName: 'ID',
    field: 'id',
  },
  {
    headerName: 'Title',
    field: 'title',
  },
  {
    headerName: 'Description',
    field: 'description',
  },
  {
    headerName: 'Status',
    field: 'status',
  },
  {
    headerName: 'Type',
    field: 'type',
  },
  {
    headerName: 'Priority',
    field: 'priority',
  },
  {
    headerName: 'Actions',
    field: 'id',
    cellRenderer: EditButtonCellRenderer,
    cellRendererParams: (params: ICellRendererParams<IContract>) => ({
      url: `/contracts/${params.value}/edit`,
    }),
  },
];
