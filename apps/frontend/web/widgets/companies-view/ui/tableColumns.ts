import { ICompany } from '@counselflow/types';
import { ColDef } from 'ag-grid-community';

import { EditButtonCellRenderer } from '@/shared/ui/EditButtonCellRenderer';

export const columns: ColDef<ICompany>[] = [
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
    headerName: 'Actions',
    field: 'id',
    cellRenderer: EditButtonCellRenderer,
    cellRendererParams: {
      url: '/companies/$id/edit'
    }
  },
];
