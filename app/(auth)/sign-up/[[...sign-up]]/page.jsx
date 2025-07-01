'use client'

import { SignUpForm } from '@/components/signup-form'
import Image from 'next/image'
export default function SignUpPage() {
  return (
     <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <a href="#" className="flex items-center gap-2 self-center font-medium">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Image src={"/logo.png"} alt='logo' width={50} height={50} />
        </div>
            Iftin Hotel
          </a>
          <SignUpForm/>
        </div>
      </div>
  )
}