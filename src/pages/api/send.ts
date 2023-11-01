import { Resend } from 'resend'
import SupportEmail from '@/libs/email/SupportEmail'

export default async (req, res) => {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const { to } = req.body

    resend.sendEmail({
      from: 'onboarding@resend.dev',
      to,
      subject: 'Hello World',
      react: SupportEmail({ email: to }),
    })
    res.status(200).json({ result: true })
  } catch (e) {
    console.error(e)
    res.status(400).json({ result: false })
  }
}
