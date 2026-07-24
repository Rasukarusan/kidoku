import { handleCreate } from './_create'
import { handleGet } from './_get'

export const config = {
  runtime: 'edge',
}

export default async (req: Request) => {
  switch (req.method) {
    case 'GET':
      return handleGet(req)
    case 'POST':
      return handleCreate(req)
    default:
      return new Response(
        JSON.stringify({ result: false, error: 'Method not allowed' }),
        { status: 405 }
      )
  }
}
