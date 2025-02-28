"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser } from "@/lib/context/UserContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Menu } from "lucide-react";

interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { user, setUser } = useUser();
  const router = useRouter();

  const handleSignIn = () => {
    router.push("/login");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    router.push("/login");
  };

  return (
    <div className="sticky top-0 z-40 px-4 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 select-none">
      <div className="flex h-14 items-center">
        <Button
          variant="ghost"
          className="mr-2 px-2 md:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="mr-4 flex">
          <Link className="mr-6 flex items-center space-x-2" href="/">
            <span className="font-bold inline-block">
              中欧银发经济 AI 知识库
            </span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Add search or other elements here if needed */}
          </div>
          <nav className="flex items-center">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-fit rounded-lg px-4 flex items-center gap-2"
                  >
                    <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-[10px] text-primary-foreground">
                      {user.username[0].toUpperCase()}
                    </div>
                    <span className="text-sm">{user.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleLogout}>
                    退出
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                className="relative h-8 w-fit rounded-lg px-4"
                onClick={handleSignIn}
              >
                登录
              </Button>
            )}
          </nav>
        </div>
      </div>
    </div>
  );
}
