import { getRequestContext } from "@cloudflare/next-on-pages"
import { generateRefcode } from "@/lib/referrals"

export const runtime = "edge"

export async function POST(request: Request){
  const form = await request.formData()
  const email = form.get('email')
  const refcode = generateRefcode()
  const referralsDB = getRequestContext().env.REFERRALS
  const insertStmt = referralsDB.prepare(`
    INSERT INTO users (email, refcode) 
    VALUES (?, ?)
    `).bind(email, refcode)
  const result = await insertStmt.run()
  if (result.error) {
    return {
      errors: [result.error]
    }
  }
  return Response.json({
    refcode
  })
}