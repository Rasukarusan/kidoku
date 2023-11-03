import { Resend } from 'resend'
import SupportEmail from '@/libs/email/SupportEmail'
import { isAdmin } from '@/utils/api'
import WelcomeEmail from '@/libs/email/WelcomeEmail'

export default async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(401).json({ result: false })
    }
    const resend = new Resend(process.env.RESEND_API_KEY)
    const { to } = req.body

    resend.sendEmail({
      from: process.env.MAIL_FROM,
      to,
      subject: 'アカウント登録完了メール',
      react: WelcomeEmail({ email: to }),
    })
    res.status(200).json({ result: true })
  } catch (e) {
    console.error(e)
    res.status(400).json({ result: false })
  }
}
