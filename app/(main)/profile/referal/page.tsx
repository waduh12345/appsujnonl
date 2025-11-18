"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Copy, Share2, Users } from "lucide-react";
import Link from "next/link";

const referrals = [
  {
    id: 1,
    name: "Ahmad Rizki",
    email: "ahmad.rizki@email.com",
    joinDate: "20 Feb 2024",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    name: "Siti Nurhaliza",
    email: "siti.nur@email.com",
    joinDate: "18 Feb 2024",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    name: "Budi Santoso",
    email: "budi.santoso@email.com",
    joinDate: "15 Feb 2024",
    avatar: "/placeholder.svg?height=40&width=40",
  },
];

export default function ReferalPage() {
  const referralCode = "JOHNDOE2024";
  const referralLink = "https://digitalkta.app/ref/JOHNDOE2024";

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // In a real app, show a toast notification
  };

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
          <h1 className="text-lg font-bold">Referal Saya</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Referral Stats */}
        <Card
          className="border-0 text-white"
          style={{
            background:
              "linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)",
          }}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-white/80 mb-1">Total Referal</p>
                <p className="text-3xl font-bold">{referrals.length}</p>
              </div>
              <div className="h-16 w-16 rounded-full bg-white/10 flex items-center justify-center">
                <Users className="h-8 w-8" />
              </div>
            </div>
            <p className="text-xs text-white/60">
              Ajak teman dan dapatkan bonus untuk setiap referal yang bergabung!
            </p>
          </CardContent>
        </Card>

        {/* Referral Code */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Kode Referal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={referralCode}
                readOnly
                className="font-mono font-bold text-center text-lg"
              />
              <Button size="icon" onClick={() => copyToClipboard(referralCode)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Bagikan kode ini kepada teman Anda
            </p>
          </CardContent>
        </Card>

        {/* Referral Link */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Link Referal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input value={referralLink} readOnly className="text-sm" />
              <Button size="icon" onClick={() => copyToClipboard(referralLink)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: "Gabung Masbettet",
                    text: "Bergabunglah dengan Masbettet menggunakan kode referal saya!",
                    url: referralLink,
                  });
                }
              }}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Bagikan Link
            </Button>
          </CardContent>
        </Card>

        {/* Referral List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Daftar Referal</CardTitle>
            <p className="text-sm text-muted-foreground">
              {referrals.length} orang telah bergabung menggunakan referal Anda
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {referrals.map((referral) => (
              <div
                key={referral.id}
                className="flex items-center gap-3 p-3 rounded-lg border"
              >
                <Avatar>
                  <AvatarImage src={referral.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="bg-primary text-white">
                    {referral.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{referral.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {referral.email}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    {referral.joinDate}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

