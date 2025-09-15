import { getShopsOptions } from "@/utils/employees";
import View from "./view";
import { auth } from "@/utils/auth";
import { unauthorized } from "next/navigation";
export default async function ServicesPage() {
  const session = await auth();
  const shops = await getShopsOptions();
  if (!session) {
    return unauthorized();
  }
  return <View shops={shops} />;
}
