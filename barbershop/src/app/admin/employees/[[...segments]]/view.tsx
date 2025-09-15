'use client';
import { employeeCache } from "@/data/employee";
import { Employee } from "@/utils/employees";
import { Crud } from "@toolpad/core";
import { useParams } from "next/navigation";
import { employeeDataSource } from "@/data/employee";

interface ViewProps {
  shops: { value: number; label: string }[];
}

export default function View({ shops }: ViewProps) {
  const params = useParams();
  const [shopId] = params.segments ?? [];
  const source = { ...employeeDataSource, fields: [...employeeDataSource.fields, 
    {
      field: "shopId",
      headerName: "Workplace",
      type: "singleSelect",
      valueOptions: shops,
      sortable: false,
      hideSortIcons: false,
      filterable: false,
    }] as typeof employeeDataSource.fields};

  return (
    <Crud<Employee>
      dataSource={source}
      dataSourceCache={employeeCache}
      rootPath={`/admin/employees`}
      slotProps={{
        form: {
          dateTimePicker: {
            views: ['hours', 'minutes'],
            ampm: false,
          }
        }
      }}
      pageTitles={{
        show: `Employee ${shopId}`,
        create: 'Create Employee',
        edit: `Edit Employee ${shopId}`,
      }}
    />
    )
}