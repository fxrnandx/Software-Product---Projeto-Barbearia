"use client";
import z from "zod";
import UploadAvatars from "@/components/UploadAvatar";
import {
  countOwnerShops,
  createShop,
  deleteShop,
  getOwnerShops,
  getShopById,
  Shop,
  updateShop,
} from "@/utils/shops";
import { Avatar, Typography } from "@mui/material";
import { DataSource, DataSourceCache } from "@toolpad/core";
import CnpjInput from "@/components/CnpjInput";
import HoursTimePicker from "@/components/TimePicker";
import dayjs, { Dayjs } from "dayjs";
import WorkingDaysSelect from "@/components/FormMultiSelect";
import ZipCodeInput from "@/components/ZipCodeInput";
import { getLocation } from "@/providers/Locationprovider";

export const shopDataSource: DataSource<Shop> = {
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
      field: "street",
      headerName: "Street",
      sortable: false,
      hideSortIcons: true,
      filterable: false,
    },
    {
      field: "number",
      headerName: "Number",
      sortable: false,
      hideSortIcons: true,
      filterable: false,
    },
    {
      field: "zipCode",
      headerName: "ZIP Code",
      sortable: false,
      hideSortIcons: true,
      filterable: false,
      renderFormField: ({ value, onChange, error }) => (
        <ZipCodeInput value={value as string} onChange={onChange} error={error} />
      ),
    },
    {
      field: "cnpj",
      headerName: "CNPJ",
      sortable: false,
      hideSortIcons: true,
      filterable: false,
      valueGetter: (value) =>
        (value as string).replace(
          /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
          "$1.$2.$3/$4-$5"
        ),
      renderFormField: ({ value, onChange, error }) => (
        <CnpjInput value={value as string} onChange={onChange} error={error} />
      ),
    },
    {
      field: "email",
      headerName: "Email",
      sortable: false,
      hideSortIcons: true,
      filterable: false,
    },
    {
      field: "phone",
      headerName: "Phone",
      sortable: false,
      hideSortIcons: true,
      filterable: false,
    },
    {
      field: "logo",
      headerName: "Logo",
      sortable: false,
      hideSortIcons: true,
      filterable: false,
      renderCell: ({ value }) => <Avatar src={value} alt="Logo" />,
      renderFormField: ({ value, onChange, error }) => (
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Typography variant="body1">Logo:</Typography>
          <UploadAvatars
            value={value as string}
            onChange={onChange}
            error={error}
          />
        </div>
      ),
    },
    {
      field: "openAt",
      headerName: "Open At",
      sortable: false,
      hideSortIcons: true,
      filterable: false,
      renderFormField: ({ value, onChange, error }) => (
        <HoursTimePicker
          label="Open At"
          value={value as Dayjs | null}
          onChange={onChange as any}
          error={error}
        />
      ),
    },
    {
      field: "closeAt",
      headerName: "Close At",
      sortable: false,
      hideSortIcons: true,
      filterable: false,
      renderFormField: ({ value, onChange, error }) => (
        <HoursTimePicker
          label="Close At"
          value={value as Dayjs | null}
          onChange={onChange as any}
          error={error}
        />
      ),
    },
    {
      field: "workingDays",
      headerName: "Working Days",
      sortable: false,
      hideSortIcons: true,
      filterable: false,
      valueFormatter: ({ value }) => {
        return value && (value as string[]).join(", ");
      },
      renderFormField: ({ value, onChange, error }) => (
        <WorkingDaysSelect
          value={value as string[]}
          onChange={onChange}
          error={error}
        />
      ),
    },
  ],
  getMany: async ({ paginationModel }) => {
    const { page, pageSize } = paginationModel;
    const items = await getOwnerShops(pageSize, page * pageSize);
    return {
      items,
      totalCount: await countOwnerShops(),
      itemCount: items.length,
    };
  },
  getOne: async (shopId) => {
    const id = shopId as string;
    const shop = await getShopById(id);
    if (!shop) {
      throw new Error(`Shop with ID ${id} not found`);
    }
    return shop;
  },
  createOne: async (shop) => {
    shop = {...shop, ...getLocation()}
    return await createShop(shop as Omit<Shop, 'id'>);
  },
  updateOne: async (id, data) => {
    data = { ...data, ...getLocation() };
    return await updateShop(id as string, data);
  },
  deleteOne: async (id) => {
    return await deleteShop(id as string);
  },
  validate: z.object({
    name: z.string({ error: "Name is required" }).nonempty("Name is required"),
    cnpj: z
      .string({ error: "CNPJ is required" })
      .nonempty("CNPJ is required")
      .min(18, "CNPJ must be at least 18 characters")
      .max(18, "CNPJ must be at most 18 characters")
      .refine((value) => validarCnpj(value), {
        message: "CNPJ is invalid",
      }),
    openAt: z.instanceof(dayjs as unknown as typeof Dayjs, { error: "Open At is required" }),
    closeAt: z.instanceof(dayjs as unknown as typeof Dayjs, {
      error: "Close At is required",}),
    zipCode: z
      .string({ error: "ZIP Code is required" })
      .nonempty("ZIP Code is required"),
    workingDays: z.array(z.string()).min(1, "Select at least one working day"),
  })["~standard"].validate,
};

export const shopCache = new DataSourceCache();

function calcularDigitoVerificador(sequencia: string): string {
  let soma = 0;
  let multiplicador = 2;

  for (let i = sequencia.length - 1; i >= 0; i--) {
    soma += parseInt(sequencia[i]) * multiplicador;
    multiplicador = multiplicador === 9 ? 2 : multiplicador + 1;
  }

  const resto = soma % 11;
  return resto < 2 ? "0" : String(11 - resto);
}

// Função para validar o CNPJ
function validarCnpj(cnpj: string): boolean {
  const cnpjLimpo = cnpj.replace(/[^\d]/g, ""); // Remove caracteres não numéricos
  if (cnpjLimpo.length !== 14) {
    return false; // CNPJ deve ter 14 dígitos
  }
  if (/^(\d)\1{13}$/.test(cnpjLimpo)) {
    return false;
  }

  const parte1 = cnpjLimpo.substring(0, 12);
  const digito1 = calcularDigitoVerificador(parte1);
  const digito1Verificado = parte1 + digito1;
  const parte2 = cnpjLimpo.substring(0, 13);
  const digito2 = calcularDigitoVerificador(parte2);

  return cnpjLimpo.endsWith(digito1 + digito2);
}
