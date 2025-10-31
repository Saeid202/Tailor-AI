import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }

  try {
    const { email } = await req.json()

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    // Store OTP in a simple JSON object (expires in 10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()
    
    // Send email via Resend
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Tailor AI <onboarding@resend.dev>', // Free Resend domain
        to: email,
        subject: 'Your Tailor AI Verification Code',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                }
                .header {
                  text-align: center;
                  padding: 20px 0;
                  border-bottom: 2px solid #f0f0f0;
                }
                .code-container {
                  text-align: center;
                  margin: 40px 0;
                  padding: 30px;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  border-radius: 12px;
                }
                .code {
                  font-size: 48px;
                  font-weight: bold;
                  letter-spacing: 10px;
                  color: white;
                  margin: 0;
                  text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
                }
                .info {
                  text-align: center;
                  color: #666;
                  margin: 20px 0;
                }
                .footer {
                  text-align: center;
                  margin-top: 40px;
                  padding-top: 20px;
                  border-top: 1px solid #eee;
                  color: #999;
                  font-size: 14px;
                }
              </style>
            </head>
            <body>
              <div class="header">
                <h1 style="color: #667eea; margin: 0;">🧵 Tailor AI</h1>
                <p style="margin: 10px 0 0 0; color: #666;">Your Verification Code</p>
              </div>

              <div style="padding: 30px 0;">
                <p>Hello!</p>
                <p>Your verification code for Tailor AI is:</p>

                <div class="code-container">
                  <h1 class="code">${otp}</h1>
                </div>

                <div class="info">
                  <p><strong>✓ Enter this code in the app to continue</strong></p>
                  <p>⏰ This code expires in <strong>10 minutes</strong></p>
                </div>

                <p style="margin-top: 40px;">If you didn't request this code, you can safely ignore this email.</p>
              </div>

              <div class="footer">
                <p>Tailor AI - AI-Powered Custom Tailoring</p>
                <p>Precision body measurements for perfect-fit clothing</p>
              </div>
            </body>
          </html>
        `,
      }),
    })

    if (!emailRes.ok) {
      throw new Error('Failed to send email')
    }

    // Store OTP temporarily (you can use Supabase storage or a simple cache)
    // For now, we'll return it to store in localStorage on client side
    return new Response(
      JSON.stringify({
        success: true,
        otp, // In production, don't return this! Use secure storage
        expiresAt,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }
})

