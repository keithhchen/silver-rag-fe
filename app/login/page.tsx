"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/components/providers/user-provider";
import { useIntl } from "react-intl";
import {
  API_ENDPOINTS,
  API_CONFIG,
  type LoginResponse,
} from "@/lib/api-config";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useUser();
  const intl = useIntl();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.USERS.LOGIN, {
        method: "POST",
        headers: API_CONFIG.headers,
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error("Invalid credentials");
      }

      const data = (await response.json()) as LoginResponse;
      login(data.access_token, data.username, data.uuid);
      router.push("/");
    } catch (err) {
      console.error(err);
      setError("Failed to login. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {intl.formatMessage({ id: "auth.signIn" })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder={intl.formatMessage({ id: "auth.username" })}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder={intl.formatMessage({ id: "auth.password" })}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            {error && (
              <p className="text-sm text-red-500">
                {intl.formatMessage({ id: "auth.error" })}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading
                ? intl.formatMessage({ id: "auth.signingIn" })
                : intl.formatMessage({ id: "auth.signIn" })}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
