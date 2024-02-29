import Pusher from 'pusher'
import pusher from '@/libs/pusher/server'
export const trigger = async (
  channel: string,
  event: string,
  data,
  params?: Pusher.TriggerParams
) => {
  return await pusher.trigger(channel, event, data)
}
