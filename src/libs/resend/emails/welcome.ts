import { resend } from '..'
import WelcomeEmail from '../templates/WelcomeEmail'

export const sendWelcomeMail = (to: string) => {
  try {
    resend.sendEmail({
      from: process.env.MAIL_FROM,
      to,
      subject: 'アカウント登録完了メール',
      react: WelcomeEmail({ email: to }),
    })
    return true
  } catch (e) {
    console.error(e)
    return false
  }
}
