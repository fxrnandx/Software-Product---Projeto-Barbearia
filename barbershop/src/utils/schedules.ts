import { get, post } from "./BarberShopApi";

export type Schedule = {
  id?: number;
  employeeId: number;
  date: string;
  duration: number;
}

export type Report = {
  label: string;
  datetime: string;
  quantity: number;
}

export async function createSchedule(data: Omit<Schedule, 'id'>): Promise<Schedule> {
  const { statusCode, body } = await post<Schedule>({
    path: `/Schedules`,
    body: data,
    headers: { "Content-Type": "application/json" }
  });
  if (statusCode >= 400) {
    console.error('Failed to create schedule', statusCode, body);
    throw new Error(`Failed to create schedule: ${body}`);
  }
  return body;
}

export async function getScheduleReports(groupBy: number, timeFrame: number): Promise<Report[]> {
  const { statusCode, body } = await get<Report[]>({
    path: `/Schedules/report`,
    query: { group: groupBy.toString(), frame: timeFrame.toString() }
  });
  if (statusCode >= 400) {
    console.error('Failed to fetch schedule report', statusCode, body);
    throw new Error(`Failed to fetch schedule report: ${body}`);
  }
  return body;
}