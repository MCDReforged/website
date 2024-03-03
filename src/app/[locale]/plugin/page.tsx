import { redirect } from "@/common/navigation";
import { routes } from "@/site/routes";

export default function Page() {
  redirect(routes.catalogue())
}
