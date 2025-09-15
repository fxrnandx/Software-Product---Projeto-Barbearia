import { DataModel } from "@toolpad/core";
import { del, get, post, put } from "./BarberShopApi";
import { Service } from "./services";
import { Employee } from "./employees";
import { Dayjs } from "dayjs";

export interface DaysOfWeek {
  value: string;
  label: string;
}

export const daysOfWeek: DaysOfWeek[] = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

export type Shop = {
  id: number;
  name: string;
  logo?: string;
  street: string;
  number: string;
  city: string;
  zipCode: string;
  cnpj: string;
  email?: string;
  phone?: string;
  openAt: Dayjs;
  closeAt: Dayjs;
  workingDays: string[];
  rating?: number;
}

export type ShopView = {
  shop: Shop;
  services: Array<Service>;
  hours: Array<{
    day: string;
    open: string;
    close: string;
    interval?: {
      start: string;
      end: string;
    };
  }>;
  employees: Array<Employee>;
}

export async function getShopById(id: string): Promise<Shop> {
  const { statusCode, body } = await get<Shop>({ path: `/Shops/${id}` });
  if (statusCode !== 200) {
    throw new Error(`Failed to fetch shop: ${body}`);
  }
  return body;
}

export async function getOwnerShops(limit: number, offset: number): Promise<Shop[]> {
  const { statusCode, body } = await get<Shop[]>({
    path: `/Shops/owner`,
    query: { limit: limit.toString(), offset: offset.toString() },
  });
  if (statusCode !== 200) {
    throw new Error(`Failed to fetch shops: ${body}`);
  }
  return body;
}

export async function updateShop(id: string, data: Partial<Shop>): Promise<Shop> {
  const shop = { ...data,
    openAt: (data.openAt as Dayjs).format('HH:mm'),
    closeAt: (data.closeAt as Dayjs).format('HH:mm')
   };
  if (shop.logo?.startsWith("data:image/")) {
    shop.logo = (shop.logo as string).replace('data:', '').replace(/^.+,/, '');
  } else {
    delete shop.logo;
  }
  const { statusCode, body } = await put({ path: `/Shops/${id}`, body: shop, headers: { "Content-Type": "application/json" } });
  if (statusCode !== 200) {
    throw new Error(`Failed to update shop: ${body}`);
  }
  return body as Shop;
}

export async function countOwnerShops(): Promise<number> {
  const { statusCode, body } = await get<number>({ path: `/Shops/owner/count` });
  if (statusCode !== 200) {
    throw new Error(`Failed to count shops: ${body}`);
  }
  return body;
}

export async function createShop(data: Omit<Shop, 'id'>): Promise<Shop> {
  const shop = { ...data,
    openAt: (data.openAt as Dayjs).format('HH:mm'),
    closeAt: (data.closeAt as Dayjs).format('HH:mm')
   };
  shop.logo = (shop.logo as string)?.replace('data:', '').replace(/^.+,/, '');
  const { statusCode, body } = await post({ path: `/Shops`, body: shop, headers: { "Content-Type": "application/json" } });
  if (statusCode >= 400) {
    throw new Error(`Failed to create shop: ${statusCode}`);
  }
  return body as Shop;
}

export async function deleteShop(id: string): Promise<void> {
  const { statusCode, body } = await del({ path: `/Shops/${id}` });
  if (statusCode >= 400) {
    throw new Error(`Failed to delete shop: ${body}`);
  }
}

export async function getShops(): Promise<Shop[]> {
  const { statusCode, body } = await get<Shop[]>({ path: `/Shops` });
  if (statusCode !== 200) {
    throw new Error(`Failed to fetch shops: ${body}`);
  }
  return body;
}

export async function getFullShopById(id: string): Promise<ShopView> {
  const { statusCode, body } = await get<ShopView>({ path: `/Shops/full/${id}` });
  if (statusCode !== 200) {
    throw new Error(`Failed to fetch full shop: ${body}`);
  }
  return body;
}