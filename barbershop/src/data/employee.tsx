"use client";
import WorkingDaysSelect from "@/components/FormMultiSelect";
import HoursTimePicker from "@/components/TimePicker";
import UploadAvatars from "@/components/UploadAvatar";
import { countEmployees, createEmployee, deleteEmployee, Employee, getEmployeeById, getEmployees, updateEmployee } from "@/utils/employees";
import { Avatar, Typography } from "@mui/material";
import { DataSource, DataSourceCache } from "@toolpad/core";
import dayjs, { Dayjs } from "dayjs";
import z from "zod";


export const employeeDataSource : DataSource<Employee> = {
  fields: [
    {
      field: "id",
      headerName: "ID",
      sortable: false,
      hideSortIcons: true,
      filterable: false,
    },
    {
      field: "name",
      headerName: "Name",
      sortable: false,
      hideSortIcons: true,
      filterable: false,
    },
    {
      field: "startHour",
      headerName: "Start Hour",
      sortable: false,
      hideSortIcons: true,
      filterable: false,
      renderFormField: ({ value, onChange, error }) => (
        <HoursTimePicker
          label="Start Hour"
          value={value as Dayjs | null}
          onChange={onChange as any}
          error={error}
        />
      ),
    },
    {
      field: "stopHour",
      headerName: "Stop Hour",
      sortable: false,
      hideSortIcons: true,
      filterable: false,
      renderFormField: ({ value, onChange, error }) => (
        <HoursTimePicker
          label="Stop Hour"
          value={value as Dayjs | null}
          onChange={onChange as any}
          error={error}
        />
      ),
    },
    {
      field: "startInterval",
      headerName: "Start Interval",
      sortable: false,
      hideSortIcons: true,
      filterable: false,
      renderFormField: ({ value, onChange, error }) => (
        <HoursTimePicker
          label="Start Interval"
          value={value as Dayjs | null}
          onChange={onChange as any}
          error={error}
        />
      ),
    },
    {
      field: "intervalDuration",
      headerName: "Interval Duration (min)",
      sortable: false,
      hideSortIcons: true,
      filterable: false,
      type: 'number',
    },
    {
      field: "photo",
      headerName: "Photo",
      sortable: false,
      hideSortIcons: true,
      filterable: false,
      renderCell: ({ value }) => <Avatar src={value} alt="Logo" />,
      renderFormField: ({ value, onChange, error }) => (
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Typography variant="body1">Foto:</Typography>
          <UploadAvatars
            value={value as string}
            onChange={onChange}
            error={error}
          />
        </div>
      ),
    },
    {
      field: "workingDays",
      headerName: "Working Days",
      valueFormatter: ({ value }) =>{
        return value && (value as string[]).join(', ');
      },
      renderFormField: ({ value, onChange, error }) => (
        <WorkingDaysSelect
          value={value as string[]}
          onChange={onChange}
          error={error}
        />
      ),
      sortable: false,
      hideSortIcons: true,
      filterable: false,
    },
  ],
  getMany: async ({ paginationModel }) => {
    const { page, pageSize } = paginationModel;
    const items = await getEmployees(pageSize, page * pageSize);
    return {
      items,
      totalCount: await countEmployees(),
      itemCount: items.length,
    };
  },
  getOne: async (employeeId) => {
    const id = employeeId as string;
    const employee = await getEmployeeById(parseInt(id));
    if (!employee) {
      throw new Error(`Employee with ID ${id} not found`);
    }
    return employee;
  },
  createOne: async (employee) => {
    return await createEmployee(employee as Omit<Employee, 'id'>);
  },
  updateOne: async (id, data) => {
    return await updateEmployee(id as number, data as Partial<Omit<Employee, 'id'>>);
  },
  deleteOne: async (id) => {
    return await deleteEmployee(id as number);
  },
  validate: z.object({
    name: z.string().min(1, "Name is required"),
    shopId: z.number().min(1, "Shop is required"),
    startHour: z.instanceof(dayjs as unknown as typeof Dayjs, {error: "Start Hour is required"}),
    stopHour: z.instanceof(dayjs as unknown as typeof Dayjs, {error: "Stop Hour is required"}),
    startInterval: z.instanceof(dayjs as unknown as typeof Dayjs, {error: "Invalid Start Interval"}).optional(),
    photo: z.string().optional(),
    workingDays: z.array(z.string()).min(1, "At least one working day is required"),
  })["~standard"].validate  
};

export const employeeCache = new DataSourceCache();