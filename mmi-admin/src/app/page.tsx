"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    const isAuthenticated =
      localStorage.getItem("admin-auth") === "true" ||
      document.cookie.includes("admin-auth=true");

    if (!isAuthenticated) {
      router.push("/admin/login");
    } else {
      router.push("/admin/"); 
    }
  }, [router]);

  return null; 
}
