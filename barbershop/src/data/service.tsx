import UploadAvatars from "@/components/UploadAvatar";
import { countServices, createService, deleteService, getServiceById, getServices, Service, updateService } from "@/utils/services";
import { Avatar, Typography } from "@mui/material";
import { DataSource, DataSourceCache } from "@toolpad/core";
import z from "zod";

export const serviceDataSource: DataSource<Service> = {
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
      field: "description",
      headerName: "Description",
      sortable: false,
      hideSortIcons: true,
      filterable: false,
    },
    {
      field: "price",
      headerName: "Price",
      type: "number",
      sortable: false,
      hideSortIcons: true,
      filterable: false,
      renderCell: ({ value }) => value?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    },
    {
      field: "duration",
      headerName: "Duration (minutes)",
      type: "number",
      sortable: false,
      hideSortIcons: true,
      filterable: false,
      renderCell: ({ value }) => value ? `${value} min` : '',
    },
    {
      field: "image",
      headerName: "Image",
      sortable: false,
      hideSortIcons: true,
      filterable: false,
      renderCell: ({ value }) => <Avatar src={value} alt="Logo" />,
      renderFormField: ({ value, onChange, error }) => (
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Typography variant="body1">Imagem:</Typography>
          <UploadAvatars
            value={value as string}
            onChange={onChange}
            error={error}
          />
        </div>
      ),
    },
  ],
  getMany: async ({ paginationModel }) => {
    const { page, pageSize } = paginationModel;
    const items = await getServices(pageSize, page * pageSize);
    return {
      items,
      totalCount: await countServices(),
      itemCount: items.length,
    };
  },
  getOne: async (serviceId) => {
    const id = serviceId as number;
    const service = await getServiceById(id);
    if (!service) {
      throw new Error(`Service with ID ${id} not found`);
    }
    return service;
  },
  createOne: async (service) => {
    return await createService(service as Omit<Service, 'id'>);
  },
  updateOne: async (id, data) => {
    return await updateService(id as number, data as Partial<Omit<Service, 'id'>>);
  },
  deleteOne: async (id) => {
    return await deleteService(id as number);
  },
  validate: z.object({
    name: z.string({error: "Name is required"}).min(2,{error: "Name must be at least 2 characters long"}).max(100),
    description: z.string().max(500).optional(),
    price: z.number({error: "Price is required"}).min(1, {error: "Price must be greater than 0"}),
    duration: z.number({error: "Duration is required"}).min(1, {error: "Duration must be at least 1 minute"}),
    image: z.string().optional(),
  })["~standard"].validate
};

export const serviceCache = new DataSourceCache();