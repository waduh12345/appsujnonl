"use client";

import type React from "react";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, Lock, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const signInRes = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (signInRes?.ok) {
        router.replace("/");
      } else {
        setError("Gagal masuk. Email atau password salah.");
      }
    } catch (err: unknown) {
      console.error("Login error:", err);
      setError("Login gagal. Cek kembali email dan password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      {/* Decorative background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <Card className="border-border shadow-xl">
        <CardHeader className="space-y-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-accent-foreground rounded-2xl flex items-center justify-center shadow-lg">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Digital KTA
          </CardTitle>
          <CardDescription className="text-center">
            Masuk ke akun Anda untuk melanjutkan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 pl-10"
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}

            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-sm text-primary font-medium hover:underline"
              >
                Lupa password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full h-12 font-semibold text-base group"
              disabled={isLoading}
            >
              {isLoading ? (
                "Memproses..."
              ) : (
                <>
                  Masuk
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Atau</span>
              </div>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              Belum punya akun?{" "}
              <Link
                href="/anggota/register"
                className="text-primary font-semibold hover:underline"
              >
                Daftar sekarang
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}