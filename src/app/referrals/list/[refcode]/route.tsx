import { getRequestContext } from "@cloudflare/next-on-pages"

export const runtime = "edge"

export async function GET (
  request: Request,
  { params: { refcode } }: { params: { refcode: string } }
) {
  const referralsDB = getRequestContext().env.REFERRALS
  const result = await referralsDB.prepare(`
    SELECT referred_at, reward FROM referrals
    WHERE refcode = ?
    `).
    bind(refcode).
    all();
  const referrals = result.results.map(result => ({
    referredAt: result.referred_at,
    reward: Boolean(result.reward)
  }))
  return Response.json({ referrals })
}
