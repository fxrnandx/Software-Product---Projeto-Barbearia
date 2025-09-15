import { del, get, post, put } from "./BarberShopApi";

export type Service = {
  id: number;
  shopId: number;
  image?: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  quantity?: number;
};

export async function getServiceById(id: number): Promise<Service | null> {
  const { statusCode, body } = await get<Service>({ path: `/Services/${id}` });
  if (statusCode > 400) {
    return null;
  }
  return body;
}

export async function getServices(
  limit: number,
  offset: number
): Promise<Service[]> {
  const { statusCode, body } = await get<Service[]>({
    path: `/Services`,
    query: { limit: limit.toString(), offset: offset.toString() },
  });
  if (statusCode > 400) {
    throw new Error(`Failed to fetch services: ${body}`);
  }
  return body;
}

export async function countServices(): Promise<number> {
  const { statusCode, body } = await get<number>({ path: `/Services/count` });
  if (statusCode > 400) {
    throw new Error(`Failed to count services: ${body}`);
  }
  return body;
}

export async function createService(data: Omit<Service, 'id'>): Promise<Service> {
  if (data.image?.startsWith("data:image/")) {
    data.image = (data.image as string).replace('data:', '').replace(/^.+,/, '');
  } else {
    delete data.image;
  }
  const { statusCode, body } = await post<Service>({
    headers: { "Content-Type": "application/json" },
    path: `/Services`,
    body: data,
  });
  if (statusCode >= 400) {
    throw new Error(`Failed to create service: ${body}`);
  }
  return body;
}

export async function updateService(id: number, data: Partial<Omit<Service, 'id'>>): Promise<Service> {
  if (data.image?.startsWith("data:image/")) {
    data.image = (data.image as string).replace('data:', '').replace(/^.+,/, '');
  } else {
    delete data.image;
  }
  const { statusCode, body } = await put<Service>({
    headers: { "Content-Type": "application/json" },
    path: `/Services/${id}`,
    body: data,
  });
  if (statusCode >= 400) {
    throw new Error(`Failed to update service: ${body}`);
  }
  return body;
}

export async function deleteService(id: number): Promise<void> {
  const { statusCode, body } = await del({ path: `/Services/${id}` });
  if (statusCode >= 400) {
    throw new Error(`Failed to delete service: ${body}`);
  }
}

