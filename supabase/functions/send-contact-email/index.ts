import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { name, email, subject, message } = await req.json()
    console.log('Received data:', { name, email, subject, message })

    // Validate required fields
    if (!name || !email || !subject || !message) {
      console.log('Validation failed: missing fields')
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log('Validation failed: invalid email format')
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Prepare Resend API call
    const apiKey = Deno.env.get('RESEND_API_KEY')
    console.log('API Key exists:', !!apiKey)
    
    const emailData = {
      from: 'onboarding@resend.dev',
      to: 'vaggelisbobonhs@gmail.com',
      subject: `Νέο μήνυμα επικοινωνίας: ${subject}`,
      html: `
        <!DOCTYPE html>
        <html lang="el">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Νέο Μήνυμα Επικοινωνίας</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f8f9fa;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 12px;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: 600;
            }
            .header p {
              margin: 10px 0 0 0;
              opacity: 0.9;
              font-size: 14px;
            }
            .content {
              padding: 30px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 25px;
            }
            .info-item {
              background-color: #f8f9fa;
              padding: 15px;
              border-radius: 8px;
              border-left: 4px solid #1976d2;
            }
            .info-label {
              font-weight: 600;
              color: #1976d2;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 5px;
            }
            .info-value {
              font-size: 14px;
              color: #333;
              word-break: break-word;
            }
            .message-section {
              background-color: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
              border: 1px solid #e9ecef;
            }
            .message-label {
              font-weight: 600;
              color: #1976d2;
              margin-bottom: 10px;
              font-size: 14px;
            }
            .message-content {
              background-color: white;
              padding: 15px;
              border-radius: 6px;
              border: 1px solid #e9ecef;
              white-space: pre-wrap;
              font-size: 14px;
              line-height: 1.6;
            }
            .footer {
              background-color: #f8f9fa;
              padding: 20px 30px;
              text-align: center;
              border-top: 1px solid #e9ecef;
            }
            .footer p {
              margin: 0;
              color: #666;
              font-size: 12px;
            }
            .logo {
              font-size: 18px;
              font-weight: 700;
              margin-bottom: 10px;
            }
            @media (max-width: 600px) {
              .info-grid {
                grid-template-columns: 1fr;
              }
              .header, .content, .footer {
                padding: 20px;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">📧 DS UTH Τράπεζα Θεμάτων</div>
              <h1>Νέο Μήνυμα Επικοινωνίας</h1>
              <p>Έχετε λάβει νέο μήνυμα από τη φόρμα επικοινωνίας</p>
            </div>
            
            <div class="content">
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">Όνομα</div>
                  <div class="info-value">${name}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Email</div>
                  <div class="info-value">${email}</div>
                </div>
              </div>
              
              <div class="info-item">
                <div class="info-label">Θέμα</div>
                <div class="info-value">${subject}</div>
              </div>
              
              <div class="message-section">
                <div class="message-label">Μήνυμα</div>
                <div class="message-content">${message}</div>
              </div>
            </div>
            
            <div class="footer">
              <p>Αυτό το μήνυμα στάλθηκε από τη φόρμα επικοινωνίας του DS UTH Τράπεζα Θεμάτων</p>
              <p>⏰ ${new Date().toLocaleString('el-GR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
            </div>
          </div>
        </body>
        </html>
      `
    }
    
    console.log('Sending email to Resend API...')
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData)
    })

    console.log('Resend API response status:', res.status)
    
    if (!res.ok) {
      const errorText = await res.text()
      console.log('Resend API error:', errorText)
      return new Response(JSON.stringify({ error: `Resend API error: ${res.status} - ${errorText}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const result = await res.json()
    console.log('Email sent successfully:', result)

    return new Response(JSON.stringify({ success: true, data: result }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Function error:', error)
    
    return new Response(
      JSON.stringify({ error: `Function error: ${error.message}` }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}) 