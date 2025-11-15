import { Suspense } from 'react'
import RegisterForm from '@/components/register-form'

// Anda bisa membuat komponen loading yang lebih menarik
function FormLoading() {
  return <div>Memuat formulir...</div>
}

export default function RegisterPage() {
  return (
    <div>
      <Suspense fallback={<FormLoading />}>
        <RegisterForm />
      </Suspense>
    </div>
  )
}

