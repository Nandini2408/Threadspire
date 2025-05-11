import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/next-auth.config'
import { supabase } from '@/lib/supabase'
import { rateLimit } from '@/lib/utils/rate-limit'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    // Rate limit by email
    const response = await rateLimit(`reset-password:${email}`)
    if (response) return response

    // Generate reset token
    const { data: resetData, error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXTAUTH_URL}/auth/reset-password`,
    })

    if (resetError) {
      return NextResponse.json(
        { error: 'Failed to send reset email' },
        { status: 400 }
      )
    }

    return NextResponse.json({ message: 'Reset email sent' })
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { password } = await req.json()

    // Rate limit by user ID
    const response = await rateLimit(`reset-password:${session.user.id}`)
    if (response) return response

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    })

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update password' },
        { status: 400 }
      )
    }

    return NextResponse.json({ message: 'Password updated successfully' })
  } catch (error) {
    console.error('Password update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 