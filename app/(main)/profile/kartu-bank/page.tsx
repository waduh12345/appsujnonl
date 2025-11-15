"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, CreditCard, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const banks = ["BCA", "Mandiri", "BNI", "BRI", "CIMB Niaga", "Permata", "Danamon"]

const savedBankAccounts = [
  {
    id: 1,
    bank: "BCA",
    accountNumber: "1234567890",
    accountName: "John Doe",
    isPrimary: true,
  },
  {
    id: 2,
    bank: "Mandiri",
    accountNumber: "9876543210",
    accountName: "John Doe",
    isPrimary: false,
  },
]

export default function KartuBankPage() {
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
          <h1 className="text-lg font-bold">Kartu Bank</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Saved Bank Accounts */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold">Rekening Tersimpan</h2>
          {savedBankAccounts.map((account) => (
            <Card key={account.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <CreditCard className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{account.bank}</p>
                      <p className="text-sm text-muted-foreground">{account.accountNumber}</p>
                      <p className="text-sm text-muted-foreground">{account.accountName}</p>
                      {account.isPrimary && (
                        <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          Utama
                        </span>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add New Bank Account */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Tambah Rekening Baru
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bank">Nama Bank</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih bank" />
                </SelectTrigger>
                <SelectContent>
                  {banks.map((bank) => (
                    <SelectItem key={bank} value={bank}>
                      {bank}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="account-number">Nomor Rekening</Label>
              <Input id="account-number" type="number" placeholder="Masukkan nomor rekening" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="account-name">Nama Pemilik Rekening</Label>
              <Input id="account-name" placeholder="Sesuai dengan buku tabungan" />
            </div>

            <Button className="w-full">Simpan Rekening</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
