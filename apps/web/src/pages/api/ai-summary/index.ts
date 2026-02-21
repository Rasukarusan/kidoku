import { handleCreate } from './_create'

export const config = {
  runtime: 'edge',
}

export default async (req: Request) => {
  switch (req.method) {
    case 'POST':
      return handleCreate(req)
    default:
      return new Response(
        JSON.stringify({ result: false, error: 'Method not allowed' }),
        { status: 405 }
      )
  }
}
