// app/(main)/login/page.tsx
import { Suspense } from 'react'
import LoginForm from '@/components/login-form'

// Anda bisa membuat komponen loading yang lebih menarik
function FormLoading() {
  return <div>Memuat formulir...</div>
}

export default function LoginPage() {
  return (
    <div>
      <Suspense fallback={<FormLoading />}>
        <LoginForm />
      </Suspense>
    </div>
  )
}

