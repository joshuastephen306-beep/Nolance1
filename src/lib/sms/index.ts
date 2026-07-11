import twilio from 'twilio'

let client: twilio.Twilio | null = null

function getClient(): twilio.Twilio {
  if (!client) {
    client = twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!
    )
  }
  return client
}

export async function sendSMS(to: string, message: string): Promise<boolean> {
  try {
    await getClient().messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to,
    })
    return true
  } catch (error) {
    console.error('SMS send error:', error)
    return false
  }
}

export async function sendVerificationCode(phone: string, code: string): Promise<boolean> {
  const message = `Your Nolance verification code is: ${code}. It expires in 10 minutes. Do not share this code with anyone.`
  return sendSMS(phone, message)
}

export async function sendOrderNotification(phone: string, orderNumber: string, message: string): Promise<boolean> {
  const sms = `Nolance: ${message} — Order ${orderNumber}. View at nolance.com/orders/${orderNumber}`
  return sendSMS(phone, sms)
}

export async function sendWithdrawalAlert(phone: string, amount: number): Promise<boolean> {
  const message = `Nolance: Your withdrawal of $${amount} has been processed. Funds will arrive shortly.`
  return sendSMS(phone, message)
}

export async function sendSecurityAlert(phone: string, event: string): Promise<boolean> {
  const message = `Nolance Security: ${event}. If this was not you, secure your account at nolance.com/settings/security`
  return sendSMS(phone, message)
}
