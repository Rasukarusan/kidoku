import type { NextApiRequest, NextApiResponse } from 'next'

import type { Socket as NetSocket } from 'net'
import type { Server as HttpServer } from 'http'
import { Server as SocketServer } from 'socket.io'

// Next.jsの型定義を拡張してSocket.IOの型定義を追加
type ReseponseWebSocket = NextApiResponse & {
  socket: NetSocket & { server: HttpServer & { io?: SocketServer } }
}

// Next.jsのAPIルーティングの入り口となる関数
export default function SocketHandler(
  req: NextApiRequest,
  res: ReseponseWebSocket
) {
  console.log('いくぜ')
  if (res.socket.server.io) {
    console.log('already-set-up')
    return res.status(200).json({ result: true, message: 'already-set-up' })
  }
  const io = new SocketServer(res.socket.server, {
    addTrailingSlash: false,
  })

  // クライアントが接続してきたら、コネクションを確立する
  io.on('connection', (socket) => {
    const clientId = socket.id
    console.log(`A client connected. ID: ${clientId}`)

    // メッセージを受信したら、全クライアントに送信する
    socket.on('message', (data) => {
      console.log('Received message:', data)
      io.emit('message', data)
    })

    // クライアントが切断した場合の処理
    socket.on('disconnect', () => {
      console.log('A client disconnected.')
    })
  })
  return res.status(200).json({ result: true })
}
