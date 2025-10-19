import { NextRequest, NextResponse } from 'next/server'
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'

export async function POST(request: NextRequest) {
  try {
    const { email, message } = await request.json()

    // Validate input
    if (!email || !message) {
      return NextResponse.json(
        { error: 'Email and message are required' },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Check if AWS credentials are configured
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.error('AWS credentials not configured. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables.')
      return NextResponse.json(
        { error: 'Email service not configured. Please contact the administrator.' },
        { status: 503 }
      )
    }

    // Configure SES client
    const sesClient = new SESClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    })

    // Prepare email parameters
    const params = {
      Source: process.env.SMTP_FROM || 'noreply@jpkramer.com',
      Destination: {
        ToAddresses: ['whitepine-contact@jpkramer.com'],
      },
      ReplyToAddresses: [email],
      Message: {
        Subject: {
          Data: `Contact Form Submission from ${email}`,
          Charset: 'UTF-8',
        },
        Body: {
          Text: {
            Data: `From: ${email}\n\nMessage:\n${message}`,
            Charset: 'UTF-8',
          },
          Html: {
            Data: `
              <h3>Contact Form Submission</h3>
              <p><strong>From:</strong> ${email}</p>
              <p><strong>Message:</strong></p>
              <p>${message.replace(/\n/g, '<br>')}</p>
            `,
            Charset: 'UTF-8',
          },
        },
      },
    }

    // Send email via SES
    const command = new SendEmailCommand(params)
    await sesClient.send(command)

    return NextResponse.json(
      { success: true, message: 'Message sent successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error sending contact email:', JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    }))
    
    return NextResponse.json(
      { error: 'Failed to send message. Please try again later.' },
      { status: 500 }
    )
  }
}

