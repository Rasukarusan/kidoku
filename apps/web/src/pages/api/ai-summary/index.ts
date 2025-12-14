import { handleCreate } from './_create'
import { handleDelete } from './_delete'

export const config = {
  runtime: 'edge',
}

export default async (req: Request) => {
  switch (req.method) {
    case 'POST':
      return handleCreate(req)
    case 'DELETE':
      return handleDelete(req)
    default:
      return new Response(
        JSON.stringify({ result: false, error: 'Method not allowed' }),
        { status: 405 }
      )
  }
}
