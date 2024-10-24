'use server'

import { customAlphabet } from 'nanoid'
import { getRequestContext } from "@cloudflare/next-on-pages"

// 16 characters from this alphabet is plenty safe enough - per https://zelark.github.io/nano-id-cc/
// "399B IDs needed, in order to have a 1% probability of at least one collision."
const REFCODE_LENGTH = 16
// from https://github.com/CyberAP/nanoid-dictionary - "This list should protect you from accidentally getting obscene words in generated strings."
const nanoid = customAlphabet("6789BCDFGHJKLMNPQRTWbcdfghjkmnpqrtwz")

export const generateRefcode = () => nanoid(REFCODE_LENGTH)

export async function createRefcode (form: FormData) {
  'use server'
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

export async function createReferral (form: FormData) {
  'use server'
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