"use client";

import Link from "next/link";
import { useUser } from "@/components/providers/user-provider";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useIntl } from "react-intl";
import { PersonIcon } from "@radix-ui/react-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function TopBar() {
  const { username, logout } = useUser();
  const intl = useIntl();

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center space-x-4">
          <Link href="/" className="font-bold">
            Silver RAG
          </Link>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <LanguageSwitcher />
          {username ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <PersonIcon className="h-4 w-4" />
                  {username}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={logout}>
                  {intl.formatMessage({ id: "auth.signOut" })}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <PersonIcon className="h-4 w-4" />
                {intl.formatMessage({ id: "auth.signIn" })}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
