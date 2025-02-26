"use client";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/context/UserContext";

export default function Home() {
  const [count, setCount] = useState(0);
  const { user } = useUser();

  return (
    <div className="flex justify-center grid-rows-[60px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="flex h-full flex-col items-center justify-center gap-4 pb-32 select-none">
        <h3 className="text-xl font-medium flex items-center justify-center gap-2">
          👋 欢迎使用
        </h3>
        <p className="text-muted-foreground">上传文件，或与知识库聊天</p>
      </div>
    </div>
  );
}
