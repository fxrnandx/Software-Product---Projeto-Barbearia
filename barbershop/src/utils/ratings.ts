import { get, post } from "./BarberShopApi";

export type rating = {
  id: number;
  comment?: string;
  shopId: number;
  value: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  date: Date;
  userName?: string;
  image?: string;
  images?: string[];
}

export async function createRating(data : Omit<rating, 'id' | 'date'>) {
  const rating = {
    ...data,
    images: (data.images || []).map(img => img.replace(/^data:image\/[a-z]+;base64,/, ''))
  };
  console.log(rating);
  const { body, statusCode} = await post<rating>({
    path: `/Shops/${rating.shopId}/ratings`,
    headers: { 'Content-Type': 'application/json' },
    body: rating
  });
  if (statusCode >= 400) {
    console.error('Failed to create rating', statusCode, body);
    throw new Error(`Failed to create rating: ${body}`);
  }
  return body;
}

export async function getShopRatings(shopId: number, page: number, limit: number): Promise<rating[]> {
  const { body, statusCode } = await get<rating[]>({
    path: `/Shops/${shopId}/ratings`,
    headers: { 'Content-Type': 'application/json' },
    query: { offset: page.toString(), limit: limit.toString() }
  });
  if (statusCode >= 400) {
    console.error('Failed to get shop ratings', statusCode, body);
    throw new Error(`Failed to get shop ratings: ${body}`);
  }
  return body;
}

export async function getShopRatingsCount(shopId: number): Promise<number> {
  const { body, statusCode } = await get<number>({
    path: `/Shops/${shopId}/ratings/count`,
    headers: { 'Content-Type': 'application/json' }
  });
  if (statusCode >= 400) {
    console.error('Failed to get shop ratings count', statusCode, body);
    throw new Error(`Failed to get shop ratings count: ${body}`);
  }
  return body;
}