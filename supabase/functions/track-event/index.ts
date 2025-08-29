import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// 1x1 transparent GIF in base64
const GIF_PIXEL = 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const tagCode = url.searchParams.get('tag')
    
    if (!tagCode) {
      console.log('Missing tag parameter')
      return new Response('Missing tag parameter', { 
        status: 400, 
        headers: corsHeaders 
      })
    }

    // Create Supabase client with service role key to bypass RLS
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Find the tag by code
    const { data: tag, error: tagError } = await supabase
      .from('tags')
      .select('id, type')
      .eq('code', tagCode)
      .single()

    if (tagError || !tag) {
      console.log('Tag not found:', tagCode, tagError)
      return new Response('Tag not found', { 
        status: 404, 
        headers: corsHeaders 
      })
    }

    // Get user agent and IP
    const userAgent = req.headers.get('user-agent')
    const ip = req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               'unknown'

    // Get additional metadata based on request method
    let metadata = {}
    if (req.method === 'POST') {
      try {
        const body = await req.json()
        metadata = body
      } catch (e) {
        // If JSON parsing fails, continue with empty metadata
      }
    }

    // Map tag type to event type
    const eventTypeMapping = {
      'click-button': 'click',
      'pin': 'view',
      'page-view': 'page_view'
    }
    
    const eventType = eventTypeMapping[tag.type as keyof typeof eventTypeMapping] || tag.type

    // Insert event record
    const { error: insertError } = await supabase
      .from('events')
      .insert({
        tag_id: tag.id,
        event_type: eventType,
        user_agent: userAgent,
        ip_address: ip,
        metadata: metadata
      })

    if (insertError) {
      console.error('Error inserting event:', insertError)
      return new Response('Error recording event', { 
        status: 500, 
        headers: corsHeaders 
      })
    }

    console.log(`Event recorded: ${eventType} for tag ${tagCode}`)

    // Return appropriate response based on request method
    if (req.method === 'GET') {
      // Return 1x1 pixel GIF for GET requests
      const gifBuffer = Uint8Array.from(atob(GIF_PIXEL), c => c.charCodeAt(0))
      return new Response(gifBuffer, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'image/gif',
          'Content-Length': gifBuffer.length.toString(),
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      })
    } else {
      // Return JSON response for POST requests
      return new Response(
        JSON.stringify({ success: true, event_type: eventType }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      )
    }

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response('Internal server error', { 
      status: 500, 
      headers: corsHeaders 
    })
  }
})