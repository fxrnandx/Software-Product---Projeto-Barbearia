import { del, get, post, put } from "./BarberShopApi";
import { Service } from "./services";
import { Employee } from "./employees";
import dayjs, { Dayjs } from "dayjs";
import { setLocation } from "@/providers/Locationprovider";
import { getCoordinatesByLocation } from "./location";

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
  state: string;
  latitude?: number;
  longitude?: number;
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
  const shop = { ...body,
    openAt: dayjs(body.openAt as unknown as string, 'HH:mm'),
    closeAt: dayjs(body.closeAt as unknown as string, 'HH:mm')
   };
   setLocation({ latitude: shop.latitude, longitude: shop.longitude, state: shop.state, city: shop.city });
  return shop as Shop;
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
    openAt: (data.openAt as Dayjs)?.format('HH:mm'),
    closeAt: (data.closeAt as Dayjs)?.format('HH:mm')
   };
  if (shop.logo?.startsWith("data:image/")) {
    shop.logo = (shop.logo as string).replace('data:', '').replace(/^.+,/, '');
  } else {
    delete shop.logo;
  }
  if( (!shop.latitude || !shop.longitude) || (shop.latitude === 0 && shop.longitude === 0) ) {
    const coordinates = await getCoordinatesByLocation({ address: `${shop.street}, ${shop.number}, ${shop.city} - ${shop.state}, ${shop.zipCode}` });
    if( coordinates.results?.length > 0 ) {
      const location = coordinates.results[0].geometry.location;
      shop.latitude = location.lat;
      shop.longitude = location.lng;
      setLocation({ latitude: shop.latitude, longitude: shop.longitude, state: shop.state, city: shop.city });
    }
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
    openAt: (data.openAt as Dayjs)?.format('HH:mm'),
    closeAt: (data.closeAt as Dayjs)?.format('HH:mm')
   };
  if( !shop.latitude || !shop.longitude ) {
    const coordinates = await getCoordinatesByLocation({ address: `${shop.street}, ${shop.number}, ${shop.city} - ${shop.state}, ${shop.zipCode}` });
    if( coordinates.results?.length > 0 ) {
      const location = coordinates.results[0].geometry.location;
      shop.latitude = location.lat;
      shop.longitude = location.lng;
      setLocation({ latitude: shop.latitude, longitude: shop.longitude, state: shop.state, city: shop.city });
    }
  }
  shop.logo = (shop.logo as string)?.replace('data:', '').replace(/^.+,/, '');
  const { statusCode, body } = await post({ path: `/Shops`, body: shop, headers: { "Content-Type": "application/json" } });
  if (statusCode >= 400) {
    console.error(body);
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

export async function getNearbyShops(latitude: number, longitude: number): Promise<Shop[]> {
  const { statusCode, body } = await get<Shop[]>({ path: `/Shops/nearby`, query: { latitude: latitude.toString(), longitude: longitude.toString(), radius: "50" } });
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