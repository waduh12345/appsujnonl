"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Wallet } from "lucide-react";
import Link from "next/link";

export default function PenarikanPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center gap-4 p-4">
          <Link href="/profile">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-bold">Penarikan Saldo</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Available Balance */}
        <Card
          className="border-0 text-white"
          style={{
            background:
              "linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)",
          }}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="h-5 w-5" />
              <span className="text-sm">Saldo Tersedia</span>
            </div>
            <p className="text-3xl font-bold mb-1">Rp 350.000</p>
            <p className="text-xs text-white/60">Minimal penarikan Rp 50.000</p>
          </CardContent>
        </Card>

        {/* Withdrawal Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Form Penarikan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Jumlah Penarikan</Label>
              <Input id="amount" type="number" placeholder="Masukkan jumlah" />
              <p className="text-xs text-muted-foreground">
                Maksimal penarikan: Rp 350.000
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bank">Rekening Tujuan</Label>
              <div className="p-3 border rounded-lg">
                <p className="font-medium">BCA - 1234567890</p>
                <p className="text-sm text-muted-foreground">John Doe</p>
              </div>
              <Link href="/profile/kartu-bank">
                <Button variant="link" className="h-auto p-0 text-xs">
                  Ubah rekening tujuan
                </Button>
              </Link>
            </div>

            <Button className="w-full mt-6">Ajukan Penarikan</Button>

            <p className="text-xs text-muted-foreground text-center">
              Penarikan akan diproses dalam 1-3 hari kerja
            </p>
          </CardContent>
        </Card>

        {/* Withdrawal History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Riwayat Penarikan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Rp 200.000</p>
                <p className="text-xs text-muted-foreground">15 Feb 2024</p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                Berhasil
              </span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Rp 150.000</p>
                <p className="text-xs text-muted-foreground">10 Feb 2024</p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                Diproses
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

