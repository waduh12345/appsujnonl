"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"

// Sample data
const provinces = [
  { id: "1", name: "DKI Jakarta" },
  { id: "2", name: "Jawa Barat" },
  { id: "3", name: "Jawa Tengah" },
]

const cities: Record<string, { id: string; name: string }[]> = {
  "1": [
    { id: "1-1", name: "Jakarta Pusat" },
    { id: "1-2", name: "Jakarta Utara" },
  ],
  "2": [
    { id: "2-1", name: "Bandung" },
    { id: "2-2", name: "Bekasi" },
  ],
}

const kelurahan: Record<string, { id: string; name: string }[]> = {
  "1-1": [
    { id: "1-1-1", name: "Gambir" },
    { id: "1-1-2", name: "Tanah Abang" },
  ],
  "1-2": [
    { id: "1-2-1", name: "Kelapa Gading" },
    { id: "1-2-2", name: "Tanjung Priok" },
  ],
}

export function RecruitmentForm({ taskId }: { taskId: string }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    province: "",
    city: "",
    kelurahan: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      alert("Task berhasil disubmit!")
      router.push("/task")
    }, 1000)
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nama Lengkap</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Masukkan nama lengkap"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="nama@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">No. HP</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="08xxxxxxxxxx"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Alamat</Label>
            <Textarea
              id="address"
              placeholder="Masukkan alamat lengkap"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
              className="min-h-20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="province">Provinsi</Label>
            <Select
              value={formData.province}
              onValueChange={(value) => setFormData({ ...formData, province: value, city: "", kelurahan: "" })}
              required
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Pilih provinsi" />
              </SelectTrigger>
              <SelectContent>
                {provinces.map((province) => (
                  <SelectItem key={province.id} value={province.id}>
                    {province.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Kabupaten/Kota</Label>
            <Select
              value={formData.city}
              onValueChange={(value) => setFormData({ ...formData, city: value, kelurahan: "" })}
              disabled={!formData.province}
              required
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Pilih kabupaten/kota" />
              </SelectTrigger>
              <SelectContent>
                {formData.province &&
                  cities[formData.province]?.map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="kelurahan">Kelurahan</Label>
            <Select
              value={formData.kelurahan}
              onValueChange={(value) => setFormData({ ...formData, kelurahan: value })}
              disabled={!formData.city}
              required
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Pilih kelurahan" />
              </SelectTrigger>
              <SelectContent>
                {formData.city &&
                  kelurahan[formData.city]?.map((kel) => (
                    <SelectItem key={kel.id} value={kel.id}>
                      {kel.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full h-11 font-semibold" disabled={isLoading}>
            {isLoading ? "Memproses..." : "Submit Task"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
