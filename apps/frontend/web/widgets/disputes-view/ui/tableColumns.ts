import { ColDef } from 'ag-grid-community';

import { EditButtonCellRenderer } from '@/shared/ui/EditButtonCellRenderer';

export const columns: ColDef<any>[] = [
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
    headerName: 'Actions',
    field: 'id',
    cellRenderer: EditButtonCellRenderer,
    cellRendererParams: {
      url: '/disputes/$id/edit'
    }
  },
];
