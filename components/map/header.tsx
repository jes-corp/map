"use client"
import { Button } from "@/components/ui/button";
import { ArrowLeft, User } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MapHeader() {
    const router = useRouter();

    return (
        <header className="w-full flex justify-center px-6">
            <div className="flex flex-row items-center justify-between w-full max-w-5xl pt-10">
                <div className="text-xl font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-default">
                    MAP
                </div>
                <div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full cursor-pointer h-10 w-10"
                        onClick={() => router.push("/profile")}
                    >
                        <User className="w-5 h-5" />
                    </Button>
                </div>

            </div>
        </header >
    )
}