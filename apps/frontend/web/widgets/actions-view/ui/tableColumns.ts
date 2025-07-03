import { TCreateActionResponse } from '1pd-types';
import { ColDef } from 'ag-grid-community';

import { EditButtonCellRenderer } from '@/shared/ui/EditButtonCellRenderer';

export const columns: ColDef<TCreateActionResponse>[] = [
  {
    headerName: 'ID',
    field: 'id',
  },
  {
    headerName: 'Name',
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
      url: '/actions/$id/edit'
    }
  },
];
