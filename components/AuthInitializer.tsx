"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const fetchUser = useAuthStore((state) => state.fetchUser);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return <>{children}</>;
}
