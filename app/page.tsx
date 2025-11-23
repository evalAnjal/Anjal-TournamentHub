import { getUserFromCookies } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function RootPage() {
  const user = await getUserFromCookies();

  if (!user) redirect("/login");
  

  return (
    <div>
      <h1>Welcome {user.name || 'Undefined'}</h1>
      <h1>Email {user.email}</h1>
      <h1>ID {user.id}</h1>
      <h1>Expires in {user.exp}</h1>
    </div>
  );
}
