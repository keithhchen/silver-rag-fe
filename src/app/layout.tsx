"use client";

import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { UserProvider, useUser } from "@/lib/context/UserContext";
import { usePathname, useRouter } from "next/navigation";
import { getProfile } from "@/lib/services/auth";
import { useEffect } from "react";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { setUser } = useUser();

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
          setUser(user);
        } catch (error) {
          console.error(error);
          localStorage.removeItem("token");
          router.push("/login");
        }
      }
    };

    checkAuth();
  }, [pathname, router, setUser]);

  return (
    <>
      {children}
      <Toaster />
    </>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh" className={GeistSans.className}>
      <body>
        <UserProvider>
          <LayoutContent>{children}</LayoutContent>
        </UserProvider>
      </body>
    </html>
  );
}
