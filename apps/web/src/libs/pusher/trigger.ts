import pusher from '@/libs/pusher/server'
export const trigger = async (channel: string, event: string, data) => {
  return await pusher.trigger(channel, event, data)
}
