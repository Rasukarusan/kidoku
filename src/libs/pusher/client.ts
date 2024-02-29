import Pusher from 'pusher-js'
const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  // userAuthentication: {
  //   endpoint: '/api/pusher/user-auth',
  //   transport: 'ajax',
  //   params: { hoge: 'fofo' },
  //   headers: { cussus: 'kasutamudayo' },
  //   paramsProvider: null,
  //   headersProvider: null,
  // },
  channelAuthorization: {
    endpoint: '/api/pusher/auth',
    transport: 'ajax',
    params: { hoge: 'channel-fofo' },
    headers: { cussus: 'channel-kasutamudayo' },
    paramsProvider: null,
    headersProvider: null,
  },
})
export default pusher
