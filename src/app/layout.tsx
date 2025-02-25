"use client";

import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { UserProvider } from "@/lib/context/UserContext";
import { usePathname, useRouter } from "next/navigation";
import { getProfile } from "@/lib/services/auth";
import { useEffect } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      if (pathname !== "/login") {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        try {
          const user = await getProfile();
          // Update UserContext state
          document.dispatchEvent(
            new CustomEvent("updateUser", { detail: user })
          );
        } catch (error) {
          localStorage.removeItem("token");
          router.push("/login");
        }
      }
    };

    checkAuth();
  }, [pathname]);

  return (
    <html lang="zh" className={GeistSans.className}>
      <body>
        <UserProvider>
          {children}
          <Toaster />
        </UserProvider>
      </body>
    </html>
  );
}
