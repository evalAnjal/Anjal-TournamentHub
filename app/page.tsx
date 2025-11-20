import { getUserFromCookies } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function RootPage() {
  const user = await getUserFromCookies();

  if (!user) redirect("/login");
  console.log(user)

  return (
    <div>
      <h1>Welcome {user.name || 'Undefined'}</h1>
    </div>
  );
}
