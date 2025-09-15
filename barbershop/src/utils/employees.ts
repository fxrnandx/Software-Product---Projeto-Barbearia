import { del, get, post, put } from "./BarberShopApi";
import { Schedule } from "./schedules";
import { getOwnerShops } from "./shops";
import dayjs, { Dayjs } from "dayjs";
const format = 'HH:mm:ss';
export type Employee =  {
  id: number;
  name: string;
  shopId: number | null | undefined;
  startHour: Dayjs;
  stopHour: Dayjs;
  startInterval?: Dayjs;
  intervalDuration?: number;
  photo?: string;
  workingDays?: string[];
  schedules?: Schedule[];
}

export async function getEmployeeById(id: number): Promise<Employee | null> {
  const { statusCode, body } = await get<Employee>({
    path: `/Employees/${id}`,
  });
  if (statusCode !== 200) {
    return null;
  }
  return {
    ...body,
    startHour: dayjs(`2022-04-17T${body.startHour}`),
    stopHour: dayjs(`2022-04-17T${body.stopHour}`),
    startInterval: body.startInterval ? dayjs(`2022-04-17T${body.startInterval}`) : undefined
  };
}

export async function getEmployees(
  limit: number,
  offset: number
): Promise<Employee[]> {
  const { statusCode, body } = await get<Employee[]>({
    path: `/Employees`,
    query: { limit: limit.toString(), offset: offset.toString() },
  });
  if (statusCode !== 200) {
    throw new Error(`Failed to fetch employees: ${body}`);
  }
  return body;
}

export async function countEmployees(): Promise<number> {
  const { statusCode, body } = await get<number>({
    path: `/Employees/count`,
  });
  if (statusCode !== 200) {
    throw new Error(`Failed to count employees: ${body}`);
  }
  return body;
}

export async function getShopsOptions(): Promise<{ value: number; label: string }[]> {
  const shops = await getOwnerShops(1000, 0);
  return shops?.map((shop) => ({
    value: shop.id as number,
    label: shop.name,
  })) ?? [];
}

export async function createEmployee(employee: Omit<Employee, 'id'>): Promise<Employee> {
  const data = { ...employee, 
    startHour: employee.startHour?.format(format), 
    stopHour: employee.stopHour?.format(format),
    startInterval: employee.startInterval?.format(format),
    photo: employee.photo ? employee.photo.replace('data:', '').replace(/^.+,/, '') : undefined,
  } as any;

  const { statusCode, body } = await post<Employee>({
    headers: { "Content-Type": "application/json" },
    path: `/Employees`,
    body: data,
  });
  if (statusCode !== 200 && statusCode !== 201) {
    console.error('Failed to create employee', statusCode, body);
    throw new Error(`Failed to create employee: ${body}`);
  }
  return body;
};

export async function updateEmployee(id: number, employee: Partial<Omit<Employee, 'id'>>): Promise<Employee> {
  const data = { ...employee, 
    startHour: employee.startHour?.format(format), 
    stopHour: employee.stopHour?.format(format),
    startInterval: employee.startInterval?.format(format),
  } as any;
  if (data.photo?.startsWith("data:image/")) {
    data.photo = (data.photo as string).replace('data:', '').replace(/^.+,/, '');
  } else {
    delete data.photo;
  }
  const { statusCode, body } = await put<Employee>({
    headers: { "Content-Type": "application/json" },
    path: `/Employees/${id}`,
    body: data,
  });
  if (statusCode !== 200) {
    throw new Error(`Failed to update employee: ${body}`);
  }
  return body;
};

export async function deleteEmployee(id: number): Promise<void> {
  const { statusCode, body } = await del({
    path: `/Employees/${id}`,
  });
  if (statusCode !== 200) {
    throw new Error(`Failed to delete employee: ${body}`);
  }
};