"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { Upload, X } from "lucide-react"

export function OtherTaskForm({ taskId }: { taskId: string }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  })
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
  }

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
            <Label htmlFor="title">Judul</Label>
            <Input
              id="title"
              type="text"
              placeholder="Masukkan judul"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              placeholder="Masukkan deskripsi lengkap"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              className="min-h-32"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Upload Gambar</Label>
            {!imagePreview ? (
              <label
                htmlFor="image"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-accent transition-colors"
              >
                <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">Klik untuk upload gambar</span>
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  required
                />
              </label>
            ) : (
              <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border">
                <img src={imagePreview || "/placeholder.svg"} alt="Preview" className="w-full h-full object-cover" />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={removeImage}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          <Button type="submit" className="w-full h-11 font-semibold" disabled={isLoading}>
            {isLoading ? "Memproses..." : "Submit Task"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
