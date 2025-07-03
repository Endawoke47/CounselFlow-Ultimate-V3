import { IMatter } from '1pd-types/src/matters';
import { ColDef } from 'ag-grid-community';

import { EditButtonCellRenderer } from '@/shared/ui/EditButtonCellRenderer';

export const columns: ColDef<IMatter>[] = [
  {
    headerName: 'ID',
    field: 'id',
  },
  {
    headerName: 'Name',
    field: 'name',
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
    cellRendererParams: {
      url: '/matters/$id/edit'
    }
  },
];
