"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export function SimpatisanForm({ taskId }: { taskId: string }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
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

          <Button type="submit" className="w-full h-11 font-semibold" disabled={isLoading}>
            {isLoading ? "Memproses..." : "Submit Task"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
