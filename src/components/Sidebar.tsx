"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { FileText, MessageSquare } from "lucide-react";

const navItems = [
  {
    title: "文件",
    href: "/documents",
    icon: FileText,
  },
  {
    title: "聊天",
    href: "/chat",
    icon: MessageSquare,
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Dark overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 transition-opacity duration-200 ease-in-out md:hidden z-40",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          "fixed left-0 pt-14 top-0 z-50 md:z-0 h-screen w-3/5 border-r bg-background transition-transform duration-200 ease-in-out md:w-48 md:translate-x-0",
          !isOpen && "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col items-start py-4 gap-4 px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-row items-center w-full px-3 h-10 rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground gap-3",
                  isActive && "bg-accent text-accent-foreground"
                )}
                title={item.title}
                onClick={onClose}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm">{item.title}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
