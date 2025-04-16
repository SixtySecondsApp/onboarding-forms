import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
// Import schema types (adjust path if needed)
// import type { InsertInvitation, User } from '../../shared/schema.ts' 

console.log("invite-user function booting up")

serve(async (req: Request) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Initialize Supabase Admin Client (uses service_role key)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } } // Important for server-side
    )

    // 2. Get requesting user's JWT from Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error("Missing Authorization header")
    }
    const jwt = authHeader.replace('Bearer ', '')

    // 3. Get user data from JWT (verifies the token)
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(jwt)
    if (userError || !user) {
      console.error("Auth error:", userError)
      return new Response(JSON.stringify({ error: 'Unauthorized: Invalid token' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    // 4. TODO: Check if user has 'admin' role 
    //    - Fetch user profile from public.users table using user.id
    //    - Example: const { data: profile } = await supabaseAdmin.from('users').select('role').eq('user_id', user.id).single()
    //    - if (profile?.role !== 'admin') { /* throw 403 Forbidden */ }

    // 5. Parse request body 
    const { email, role } = await req.json()
    if (!email || !role) {
      throw new Error("Missing email or role in request body")
    }
    // TODO: Add validation for email format and role value ('admin', 'editor', 'viewer')

    // 6. Generate unique token & expiry
    const token = crypto.randomUUID() 
    const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000) // Example: 24 hours expiry

    // 7. Insert invitation into database
    // TODO: Type the insertion data using InsertInvitation
    const { data: newInvitation, error: insertError } = await supabaseAdmin
      .from('invitations')
      .insert({
        email: email,
        role: role,
        token: token,
        expires_at: expires_at.toISOString(),
        invited_by: user.id, // ID of the admin user sending the invite
        status: 'pending', 
      })
      .select()
      .single()

    if (insertError) {
      console.error("DB Insert Error:", insertError)
      throw new Error(`Failed to create invitation: ${insertError.message}`)
    }

    console.log("Invitation created:", newInvitation)

    // 8. TODO: Send invitation email
    //    - Construct invitation link: `${Deno.env.get('SITE_URL')}/accept-invitation?token=${token}`
    //    - Use an email service (e.g., Resend, SendGrid) via another function or directly if simple

    return new Response(JSON.stringify({ success: true, invitation: newInvitation }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 201, // 201 Created
    })

  } catch (error) {
    console.error("Function Error:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: error instanceof Error && (error.message === 'Missing Authorization header' || error.message.includes('Unauthorized')) ? 401 
           : error instanceof Error && error.message === 'Missing email or role' ? 400
           : 500, 
    })
  }
}) 