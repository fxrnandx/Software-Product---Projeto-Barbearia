import { getScheduleReports } from "@/utils/schedules";
import View from "./View";
import { auth } from "@/utils/auth";
import { unauthorized } from "next/navigation";
export default async function Page() {
  const session = await auth();
  if (!session) {
    return unauthorized();
  }else {
    const initialData = await getScheduleReports(0, 0);
    return <View initialData={initialData} />
  }
}