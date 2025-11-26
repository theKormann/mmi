"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useAuthGuard() {
  const router = useRouter();

  useEffect(() => {
    const isAuthenticated =
      typeof window !== "undefined" &&
      (localStorage.getItem("admin-auth") === "true" ||
        document.cookie.includes("admin-auth=true"));

    if (!isAuthenticated) {
      router.replace("/admin/login");
    }
  }, [router]);
}
