'use client';
import { Crud } from "@toolpad/core";
import { useParams } from "next/navigation";
import { serviceCache, serviceDataSource } from "@/data/service";
import { Service } from "@/utils/services";

interface ViewProps {
  shops: { value: number; label: string }[];
}

export default function View({ shops }: ViewProps) {
  const params = useParams();
  const [shopId] = params.segments ?? [];
  const source = { ...serviceDataSource, fields: [...serviceDataSource.fields, 
    {
      field: "shopId",
      headerName: "Shop",
      type: "singleSelect",
      valueOptions: shops,
      sortable: false,
      hideSortIcons: false,
      filterable: false,
    }] as typeof serviceDataSource.fields};

  return (
    <Crud<Service>
      dataSource={source}
      dataSourceCache={serviceCache}
      rootPath={`/admin/services`}
      slotProps={{
        form: {
          dateTimePicker: {
            views: ['hours', 'minutes'],
            ampm: false,
          }
        }
      }}
      pageTitles={{
        show: `Service ${shopId}`,
        create: 'Create Service',
        edit: `Edit Service ${shopId}`,
      }}
    />
    )
}