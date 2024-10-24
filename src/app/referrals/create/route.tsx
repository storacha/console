import { getRequestContext } from "@cloudflare/next-on-pages"

export const runtime = "edge"

export async function POST(request: Request){
  const form = await request.formData()
  const email = form.get('email')
  const refcode = form.get('refcode')
  const referralsDB = getRequestContext().env.REFERRALS
  const insertStmt = referralsDB.prepare(`
    INSERT INTO referrals (email, refcode) 
    VALUES (?, ?)
    `).bind(email, refcode)
  const result = await insertStmt.run()
  if (result.error) {
    return {
      errors: [result.error]
    }
  }
  return Response.json({})
}