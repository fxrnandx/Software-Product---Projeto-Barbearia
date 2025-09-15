import { getScheduleReports } from "@/utils/schedules";
import View from "./View";
export default async function Page() {
  const initialData = await getScheduleReports(0, 0);
  return <View initialData={initialData} />
}