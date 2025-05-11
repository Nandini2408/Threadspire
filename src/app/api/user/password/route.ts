import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/next-auth.config'
import { supabase } from '@/lib/supabase'

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { currentPassword, newPassword } = body

  // Verify current password
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: session.user.email!,
    password: currentPassword,
  })

  if (signInError) {
    return NextResponse.json(
      { error: 'Current password is incorrect' },
      { status: 400 }
    )
  }

  // Update password
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (updateError) {
    return NextResponse.json(
      { error: 'Failed to update password' },
      { status: 500 }
    )
  }

  return NextResponse.json({ message: 'Password updated successfully' })
} 