"use client";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("admin-auth");
    document.cookie = "admin-auth=; path=/; max-age=0";
    router.push("/admin/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="text-red-500 hover:text-red-700 text-sm font-medium"
    >
      Sair
    </button>
  );
}
