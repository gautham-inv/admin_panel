import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import LogoutButton from "./LogoutButton";
import AdminNav from "./AdminNav";

export default async function AdminHeader() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return null;
  }

  return (
    <header className="bg-gradient-to-r from-[#005C89] to-[#003d5c] text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Innovin Admin Panel</h1>
            <p className="text-sm text-white/80 mt-1">{session.user?.email}</p>
          </div>
          <LogoutButton />
        </div>
        <AdminNav />
      </div>
    </header>
  );
}
