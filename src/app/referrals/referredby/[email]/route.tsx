import { getRequestContext } from "@cloudflare/next-on-pages"

export const runtime = "edge"

export async function GET (
  request: Request,
  { params: { email } }: { params: { email: string } }
) {
  const result = await getRequestContext().env.REFERRALS.
    prepare(`SELECT refcode FROM referrals WHERE email = ?`).
    bind(email).
    first()
  return Response.json({
    refcode: result?.refcode
  })
}
