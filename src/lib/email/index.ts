import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

const FROM = `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`
const APP_URL = process.env.NEXT_PUBLIC_APP_URL
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Nolance'

// ── BASE TEMPLATE ─────────────────────────────────────────────
function baseTemplate(content: string, title: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f8f9fb;font-family:Inter,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fb;padding:40px 0">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06)">
        <!-- Header -->
        <tr>
          <td style="background:#0a1628;padding:28px 40px">
            <span style="font-size:22px;font-weight:600;color:#ffffff;letter-spacing:-0.5px">
              Nol<span style="color:#1aab5f">ance</span>
            </span>
          </td>
        </tr>
        <!-- Content -->
        <tr>
          <td style="padding:40px">
            ${content}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f8f9fb;padding:24px 40px;border-top:1px solid #e2e8f0">
            <p style="margin:0;font-size:12px;color:#8896a7;line-height:1.6">
              This email was sent by ${APP_NAME} · 
              <a href="${APP_URL}/legal/privacy" style="color:#1aab5f;text-decoration:none">Privacy Policy</a> · 
              <a href="${APP_URL}/settings/notifications" style="color:#1aab5f;text-decoration:none">Unsubscribe</a>
            </p>
            <p style="margin:8px 0 0;font-size:11px;color:#b0bcc8">
              © ${new Date().getFullYear()} Nolance. All rights reserved.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function h1(text: string) {
  return `<h1 style="margin:0 0 16px;font-size:24px;font-weight:600;color:#0a1628;line-height:1.25">${text}</h1>`
}

function p(text: string) {
  return `<p style="margin:0 0 16px;font-size:15px;color:#4a5568;line-height:1.6">${text}</p>`
}

function codeBox(code: string) {
  return `
  <div style="background:#f0f4ff;border:1px solid #c7d8ff;border-radius:10px;padding:24px;text-align:center;margin:24px 0">
    <p style="margin:0 0 8px;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;font-weight:500">Your verification code</p>
    <p style="margin:0;font-size:36px;font-weight:700;color:#0a1628;letter-spacing:10px">${code}</p>
    <p style="margin:8px 0 0;font-size:12px;color:#8896a7">This code expires in 10 minutes</p>
  </div>`
}

function btn(text: string, url: string) {
  return `
  <div style="margin:24px 0">
    <a href="${url}" style="display:inline-block;background:#1aab5f;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 32px;border-radius:8px">${text}</a>
  </div>`
}

function infoBox(text: string) {
  return `
  <div style="background:#e8f9f0;border-left:4px solid #1aab5f;border-radius:6px;padding:16px 20px;margin:20px 0">
    <p style="margin:0;font-size:14px;color:#0a1628">${text}</p>
  </div>`
}

function warnBox(text: string) {
  return `
  <div style="background:#fef3cd;border-left:4px solid #f59e0b;border-radius:6px;padding:16px 20px;margin:20px 0">
    <p style="margin:0;font-size:14px;color:#92400e">${text}</p>
  </div>`
}

// ── SEND HELPER ───────────────────────────────────────────────
async function send(to: string, subject: string, html: string) {
  await transporter.sendMail({ from: FROM, to, subject, html })
}

// ============================================================
// EMAIL FUNCTIONS
// ============================================================

// ── WELCOME ───────────────────────────────────────────────────
export async function sendWelcomeEmail(to: string, username: string) {
  const html = baseTemplate(`
    ${h1(`Welcome to Nolance, ${username}! 👑`)}
    ${p('You have just joined the world\'s greatest freelancing platform. One account. Four powerful sections. Unlimited opportunity.')}
    ${infoBox('Your account is ready. Start by exploring gigs, posting a job on Scout, or browsing the Marketplace.')}
    ${btn('Get Started', `${APP_URL}`)}
    ${p('If you have any questions, our support team is always here to help.')}
  `, 'Welcome to Nolance')}
  await send(to, `Welcome to ${APP_NAME}, ${username}!`, html)
}

// ── EMAIL VERIFICATION ────────────────────────────────────────
export async function sendEmailVerification(to: string, username: string, code: string, token: string) {
  const html = baseTemplate(`
    ${h1('Verify your email address')}
    ${p(`Hi ${username}, please verify your email address to activate your Nolance account. Enter the code below or click the button.`)}
    ${codeBox(code)}
    ${btn('Verify Email Address', `${APP_URL}/auth/verify-email?token=${token}`)}
    ${p('If you did not create a Nolance account, you can safely ignore this email.')}
  `, 'Verify Your Email')}
  await send(to, 'Verify your Nolance email address', html)
}

// ── PASSWORD RESET ────────────────────────────────────────────
export async function sendPasswordReset(to: string, username: string, token: string) {
  const html = baseTemplate(`
    ${h1('Reset your password')}
    ${p(`Hi ${username}, we received a request to reset your Nolance password. Click the button below to create a new password.`)}
    ${btn('Reset Password', `${APP_URL}/auth/reset-password?token=${token}`)}
    ${warnBox('This link expires in 1 hour. If you did not request a password reset, please contact our support team immediately.')}
  `, 'Reset Your Password')}
  await send(to, 'Reset your Nolance password', html)
}

// ── PHONE NUMBER ADDED ────────────────────────────────────────
export async function sendPhoneAddedEmail(to: string, username: string, phone: string) {
  const html = baseTemplate(`
    ${h1('Phone number added to your account')}
    ${p(`Hi ${username}, a phone number has been added to your Nolance account.`)}
    ${infoBox(`Phone number added: <strong>${phone}</strong>`)}
    ${warnBox('If you did not add this phone number, please change your password immediately and contact our support team.')}
    ${btn('Secure My Account', `${APP_URL}/settings/security`)}
  `, 'Phone Number Added')}
  await send(to, 'Phone number added to your Nolance account', html)
}

// ── NEW LOGIN ─────────────────────────────────────────────────
export async function sendNewLoginEmail(to: string, username: string, device: string, location: string) {
  const html = baseTemplate(`
    ${h1('New login detected')}
    ${p(`Hi ${username}, a new login to your Nolance account was detected.`)}
    ${infoBox(`Device: <strong>${device}</strong><br/>Location: <strong>${location}</strong><br/>Time: <strong>${new Date().toUTCString()}</strong>`)}
    ${warnBox('If this was not you, secure your account immediately by changing your password.')}
    ${btn('Secure My Account', `${APP_URL}/settings/security`)}
  `, 'New Login Detected')}
  await send(to, 'New login to your Nolance account', html)
}

// ── NEW ORDER (SELLER) ────────────────────────────────────────
export async function sendNewOrderEmail(to: string, sellerName: string, orderNumber: string, gigTitle: string, buyerName: string, amount: number, deadline: string) {
  const html = baseTemplate(`
    ${h1('You have a new order! 🎉')}
    ${p(`Hi ${sellerName}, great news — you have received a new order on Nolance.`)}
    ${infoBox(`
      Order: <strong>${orderNumber}</strong><br/>
      Gig: <strong>${gigTitle}</strong><br/>
      From: <strong>${buyerName}</strong><br/>
      Amount: <strong>$${amount}</strong><br/>
      Deadline: <strong>${deadline}</strong>
    `)}
    ${btn('View Order', `${APP_URL}/orders/${orderNumber}`)}
    ${p('Please start working on this order and deliver before the deadline. On-time delivery helps your ranking!')}
  `, 'New Order Received')}
  await send(to, `New order received — ${orderNumber}`, html)
}

// ── ORDER DELIVERED (BUYER) ───────────────────────────────────
export async function sendOrderDeliveredEmail(to: string, buyerName: string, orderNumber: string, gigTitle: string) {
  const html = baseTemplate(`
    ${h1('Your order has been delivered!')}
    ${p(`Hi ${buyerName}, your order has been delivered and is ready for your review.`)}
    ${infoBox(`Order: <strong>${orderNumber}</strong><br/>Gig: <strong>${gigTitle}</strong>`)}
    ${btn('Review Delivery', `${APP_URL}/orders/${orderNumber}`)}
    ${p('You have 3 days to review and request revisions if needed. After 3 days, the order will be automatically marked as complete.')}
  `, 'Order Delivered')}
  await send(to, `Your order has been delivered — ${orderNumber}`, html)
}

// ── ORDER COMPLETED ───────────────────────────────────────────
export async function sendOrderCompletedEmail(to: string, sellerName: string, orderNumber: string, earnings: number, clearanceDate: string) {
  const html = baseTemplate(`
    ${h1('Order completed — funds incoming! 💰')}
    ${p(`Hi ${sellerName}, your order has been completed and your earnings are on their way.`)}
    ${infoBox(`
      Order: <strong>${orderNumber}</strong><br/>
      Your earnings: <strong>$${earnings}</strong><br/>
      Clears on: <strong>${clearanceDate}</strong>
    `)}
    ${btn('View Earnings', `${APP_URL}/dashboard/earnings`)}
    ${p('Don\'t forget to leave a review for your buyer — great relationships lead to repeat orders!')}
  `, 'Order Completed')}
  await send(to, `Order completed — $${earnings} incoming`, html)
}

// ── FUNDS CLEARED ─────────────────────────────────────────────
export async function sendFundsClearedEmail(to: string, username: string, amount: number) {
  const html = baseTemplate(`
    ${h1('Your funds are ready to withdraw! ✅')}
    ${p(`Hi ${username}, <strong>$${amount}</strong> has cleared and is now available in your Nolance balance.`)}
    ${infoBox(`Available balance: <strong>$${amount}</strong> is ready to withdraw`)}
    ${btn('Withdraw Now', `${APP_URL}/dashboard/earnings`)}
    ${p('You can withdraw to any Nigerian bank, PayPal, Grey, Wise, Payoneer, or any international bank.')}
  `, 'Funds Ready to Withdraw')}
  await send(to, `$${amount} is ready to withdraw`, html)
}

// ── WITHDRAWAL SUCCESS ────────────────────────────────────────
export async function sendWithdrawalSuccessEmail(to: string, username: string, amount: number, method: string) {
  const html = baseTemplate(`
    ${h1('Withdrawal successful!')}
    ${p(`Hi ${username}, your withdrawal has been processed successfully.`)}
    ${infoBox(`
      Amount: <strong>$${amount}</strong><br/>
      Method: <strong>${method}</strong><br/>
      Status: <strong>Processed</strong>
    `)}
    ${p('Funds should arrive within the expected timeframe for your chosen withdrawal method. Contact support if you have not received your funds.')}
    ${btn('View Transaction History', `${APP_URL}/dashboard/earnings`)}
  `, 'Withdrawal Successful')}
  await send(to, `Withdrawal of $${amount} processed`, html)
}

// ── WITHDRAWAL FLAGGED ────────────────────────────────────────
export async function sendWithdrawalFlaggedEmail(to: string, username: string, amount: number, reason: string) {
  const html = baseTemplate(`
    ${h1('Withdrawal under review')}
    ${p(`Hi ${username}, your withdrawal request of <strong>$${amount}</strong> has been flagged for review.`)}
    ${warnBox(`Reason: ${reason}`)}
    ${p('Our team will review your withdrawal within 2 business days. You can appeal this decision through the Resolution Center.')}
    ${btn('Appeal This Decision', `${APP_URL}/resolution/appeal`)}
  `, 'Withdrawal Under Review')}
  await send(to, `Your withdrawal of $${amount} is under review`, html)
}

// ── NEW MESSAGE ───────────────────────────────────────────────
export async function sendNewMessageEmail(to: string, username: string, senderName: string, preview: string, conversationId: string) {
  const html = baseTemplate(`
    ${h1('You have a new message')}
    ${p(`Hi ${username}, <strong>${senderName}</strong> sent you a message on Nolance.`)}
    ${infoBox(`"${preview.substring(0, 120)}${preview.length > 120 ? '...' : ''}"`)}
    ${btn('Reply Now', `${APP_URL}/dashboard/messages`)}
    ${p('Responding quickly improves your response rate and seller ranking.')}
  `, 'New Message')}
  await send(to, `New message from ${senderName}`, html)
}

// ── NEW REVIEW ────────────────────────────────────────────────
export async function sendNewReviewEmail(to: string, username: string, rating: number, reviewerName: string, comment: string, gigTitle: string) {
  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating)
  const html = baseTemplate(`
    ${h1('You received a new review!')}
    ${p(`Hi ${username}, <strong>${reviewerName}</strong> left you a review for your gig.`)}
    ${infoBox(`
      Gig: <strong>${gigTitle}</strong><br/>
      Rating: <strong>${stars} (${rating}/5)</strong><br/>
      Comment: "${comment}"
    `)}
    ${btn('View Review', `${APP_URL}/dashboard/gigs`)}
    ${p('You can publicly respond to this review from your seller dashboard.')}
  `, 'New Review Received')}
  await send(to, `New ${rating}-star review from ${reviewerName}`, html)
}

// ── GIG APPROVED ─────────────────────────────────────────────
export async function sendGigApprovedEmail(to: string, username: string, gigTitle: string, gigSlug: string) {
  const html = baseTemplate(`
    ${h1('Your gig is live! 🚀')}
    ${p(`Hi ${username}, great news — your gig has been approved and is now live on Nolance.`)}
    ${infoBox(`Gig: <strong>${gigTitle}</strong>`)}
    ${btn('View Your Gig', `${APP_URL}/gig/${gigSlug}`)}
    ${p('Share your gig link on social media and in NOLANCE Communities to get your first orders!')}
  `, 'Gig Approved')}
  await send(to, `Your gig is now live — "${gigTitle}"`, html)
}

// ── GIG DENIED ────────────────────────────────────────────────
export async function sendGigDeniedEmail(to: string, username: string, gigTitle: string, reason: string) {
  const html = baseTemplate(`
    ${h1('Your gig needs some changes')}
    ${p(`Hi ${username}, your gig could not be approved yet. Please review the feedback below and make the necessary changes.`)}
    ${warnBox(`Reason: ${reason}`)}
    ${infoBox(`Gig: <strong>${gigTitle}</strong>`)}
    ${btn('Edit Your Gig', `${APP_URL}/dashboard/gigs`)}
    ${p('Once you have made the changes, resubmit your gig for review. Our team will review it within 24 hours.')}
  `, 'Gig Needs Changes')}
  await send(to, `Your gig needs changes — "${gigTitle}"`, html)
}

// ── ACCOUNT WARNING ───────────────────────────────────────────
export async function sendAccountWarningEmail(to: string, username: string, violation: string, strike: number) {
  const html = baseTemplate(`
    ${h1('Important notice about your account')}
    ${p(`Hi ${username}, we have issued a notice on your Nolance account.`)}
    ${warnBox(`Violation: <strong>${violation}</strong><br/>Strike: <strong>${strike} of 3</strong>`)}
    ${p('Please review the NOLANCE Community Guidelines and ensure your activity complies with our policies. Continued violations may result in account suspension.')}
    ${btn('View Guidelines', `${APP_URL}/legal/community-guidelines`)}
    ${btn('Appeal This Decision', `${APP_URL}/resolution/appeal`)}
  `, 'Account Notice')}
  await send(to, 'Important notice about your Nolance account', html)
}

// ── ACCOUNT SUSPENDED ─────────────────────────────────────────
export async function sendAccountSuspendedEmail(to: string, username: string, reason: string, fundsReleaseDate: string) {
  const html = baseTemplate(`
    ${h1('Your account has been suspended')}
    ${p(`Hi ${username}, your Nolance account has been suspended due to repeated policy violations.`)}
    ${warnBox(`Reason: ${reason}`)}
    ${infoBox(`Any funds in your account will be held for 30 days and released on: <strong>${fundsReleaseDate}</strong>`)}
    ${p('You can appeal this decision through our Resolution Center. Our team will review all appeals within 5 business days.')}
    ${btn('Appeal Suspension', `${APP_URL}/resolution/appeal`)}
  `, 'Account Suspended')}
  await send(to, 'Your Nolance account has been suspended', html)
}

// ── FUND HOLD ─────────────────────────────────────────────────
export async function sendFundHoldEmail(to: string, username: string, amount: number, holdDays: number, releaseDate: string, reason: string) {
  const html = baseTemplate(`
    ${h1('Funds placed on hold')}
    ${p(`Hi ${username}, a hold has been placed on <strong>$${amount}</strong> in your Nolance account.`)}
    ${warnBox(`Reason: ${reason}`)}
    ${infoBox(`
      Amount held: <strong>$${amount}</strong><br/>
      Hold period: <strong>${holdDays} days</strong><br/>
      Estimated release: <strong>${releaseDate}</strong>
    `)}
    ${p('If you believe this hold was placed in error, please appeal through the Resolution Center.')}
    ${btn('Appeal Hold', `${APP_URL}/resolution/appeal`)}
  `, 'Funds On Hold')}
  await send(to, `$${amount} placed on hold — action required`, html)
}

// ── SCOUT PROPOSAL RECEIVED ───────────────────────────────────
export async function sendProposalReceivedEmail(to: string, buyerName: string, jobTitle: string, sellerName: string, jobId: string) {
  const html = baseTemplate(`
    ${h1('New proposal on your job')}
    ${p(`Hi ${buyerName}, <strong>${sellerName}</strong> submitted a proposal on your Scout job.`)}
    ${infoBox(`Job: <strong>${jobTitle}</strong>`)}
    ${btn('Review Proposal', `${APP_URL}/scout/job/${jobId}`)}
    ${p('Review all proposals and message the seller you like most directly from the proposal page.')}
  `, 'New Proposal Received')}
  await send(to, `New proposal on "${jobTitle}"`, html)
}

// ── MANAGED SERVICES UPDATE ───────────────────────────────────
export async function sendManagedServicesUpdateEmail(to: string, username: string, requestTitle: string, status: string, requestId: string) {
  const html = baseTemplate(`
    ${h1('Update on your Managed Services request')}
    ${p(`Hi ${username}, there is an update on your NOLANCE Managed Services request.`)}
    ${infoBox(`
      Project: <strong>${requestTitle}</strong><br/>
      Status: <strong>${status}</strong>
    `)}
    ${btn('View Request', `${APP_URL}/managed/orders/${requestId}`)}
  `, 'Managed Services Update')}
  await send(to, `Managed Services update — "${requestTitle}"`, html)
}
