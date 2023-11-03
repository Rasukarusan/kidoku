import { isAdmin } from '@/utils/api'
import { sendWelcomeMail } from '@/libs/resend/emails/welcome'

export default async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(401).json({ result: false })
    }
    const { to } = req.body
    sendWelcomeMail(to)
    res.status(200).json({ result: true })
  } catch (e) {
    console.error(e)
    res.status(400).json({ result: false })
  }
}
