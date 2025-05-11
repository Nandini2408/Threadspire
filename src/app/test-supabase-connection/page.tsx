import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'

export default function TestSupabaseConnection() {
  const [status, setStatus] = useState('Checking...')

  useEffect(() => {
    async function checkConnection() {
      const { data, error } = await supabase.from('users').select('*').limit(1)
      if (error) {
        console.error('Supabase error:', error)
        setStatus('❌ Not connected! Check the browser console for details.')
      } else {
        console.log('Supabase data:', data)
        setStatus('✅ Connected! Check the browser console for data.')
      }
    }
    checkConnection()
  }, [])

  return (
    <div style={{ padding: 32, fontSize: 20 }}>
      <b>Supabase Connection Test</b>
      <div style={{ marginTop: 16 }}>{status}</div>
      <div style={{ marginTop: 16, fontSize: 14, color: '#888' }}>
        (Open your browser console to see the result)
      </div>
    </div>
  )
} 