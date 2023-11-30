import prisma from '@/libs/prisma'

export default async (req, res) => {
  try {
    const name = req.query.username as string
    const user = await prisma.user.findUnique({
      where: { name },
    })
    if (!user) {
      res.status(200).json({ image: '' })
    }
    res.status(200).json({ image: user.image })
  } catch (e) {
    console.error(e)
    res.status(400).json({ result: false })
  }
}
