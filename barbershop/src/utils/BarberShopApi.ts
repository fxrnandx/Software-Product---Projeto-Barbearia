'use server';
import { request } from "undici";
import { auth } from "./auth";

interface Params {
  path: string;
  headers?: Record<string, string>;
  query?: Record<string, string>;
}

const basePath = process.env.BACKEND_URL || "http://localhost:3000";

export async function get<T>(params: Params) {
  const session = await auth();
  console.log(`GET ${basePath}${params.path}`);
  const { statusCode, body } = await request(
    `${basePath}${params.path}`,
    {
      headers: { ...params.headers, Authorization: `Bearer ${session?.accessToken}` },
      query: params.query,
    }
  );
  
  return { statusCode, body: await body.json() as T };
}

export async function post<T>(params: Params & { body?: any }) {
  const session = await auth();
  console.log(`POST ${basePath}${params.path}`);
  const { statusCode, body } = await request(
    `${basePath}${params.path}`,
    {
      method: "POST",
      headers: { ...params.headers, Authorization: `Bearer ${session?.accessToken}` },
      body: JSON.stringify(params.body),
    }
  );
  return { statusCode, body: await body.json() as T };
}

export async function put<T>(params: Params & { body?: any }) {
  const session = await auth();
  console.log(`PUT ${basePath}${params.path}`);
  const { statusCode, body } = await request(
    `${basePath}${params.path}`,
    {
      method: "PUT",
      headers: { ...params.headers, Authorization: `Bearer ${session?.accessToken}` },
      body: JSON.stringify(params.body),
    }
  );
  return { statusCode, body: await body.json() as T };
}

export async function del(params: Params) {
  const session = await auth();
  console.log(`DELETE ${basePath}${params.path}`);
  const { statusCode, body } = await request(
    `${basePath}${params.path}`,
    {
      method: "DELETE",
      headers: { ...params.headers, Authorization: `Bearer ${session?.accessToken}` },
    }
  );
  return { statusCode, body: await body.json() };
}
