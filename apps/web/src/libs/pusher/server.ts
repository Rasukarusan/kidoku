import Pusher from 'pusher'

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  secret: process.env.PUSHER_SECRET,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY,
  useTLS: true,
})
export default pusher
