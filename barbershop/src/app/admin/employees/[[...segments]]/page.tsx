import { auth } from "@/utils/auth";
import View from "./view";
import { unauthorized } from "next/navigation";
import { getShopsOptions } from "@/utils/employees";

export default async function EmployeePage() {
  const session = await auth();
  if (!session) {
    return unauthorized();
  }
  const shops = await getShopsOptions();
  return (<View shops={shops} />);
}