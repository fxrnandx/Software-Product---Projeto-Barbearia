'use server';
import { request } from "undici";
import { auth } from "./auth";

export async function getLocationByCoordinates(lat: number, lon: number) {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }
  console.log(`GET https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}`);
  const { statusCode, body } = await request(
    `https://maps.googleapis.com/maps/api/geocode/json`,
    {
      query: { latlng: `${lat},${lon}`, key: process.env.GOOGLE_MAPS_API_KEY },
    }
  );

  if (statusCode !== 200) {
    console.error(`Error fetching location: ${statusCode}`);
    throw new Error(`Error fetching location: ${statusCode}`);
  }
  const data = await body.json();
  return data as any;
}

export async function getCoordinatesByLocation({address}: {address: string }) {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }
  console.log(`GET https://maps.googleapis.com/maps/api/geocode/json?address=${address}`);
  const { statusCode, body } = await request(
    `https://maps.googleapis.com/maps/api/geocode/json`,
    {
      query: { address: address, key: process.env.GOOGLE_MAPS_API_KEY },
    }
  );
  if (statusCode !== 200) {
    console.error(`Error fetching coordinates: ${statusCode}`);
    throw new Error(`Error fetching coordinates: ${statusCode}`);
  }
  const data = await body.json();
  return data as any;
}
