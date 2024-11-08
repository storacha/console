import { customAlphabet } from 'nanoid'

// 16 characters from this alphabet is plenty safe enough - per https://zelark.github.io/nano-id-cc/
// "399B IDs needed, in order to have a 1% probability of at least one collision."
const REFCODE_LENGTH = 16
// from https://github.com/CyberAP/nanoid-dictionary - "This list should protect you from accidentally getting obscene words in generated strings."
const nanoid = customAlphabet("6789BCDFGHJKLMNPQRTWbcdfghjkmnpqrtwz")

export const generateRefcode = () => nanoid(REFCODE_LENGTH)

export const REFERRALS_SERVICE = 'http://localhost:4000'

export async function createRefcode (form: FormData) {
  return fetch(`${REFERRALS_SERVICE}/refcode/create`, {
    method: 'POST',
    body: form
  })
}

export async function createReferral (form: FormData) {
  return fetch(`${REFERRALS_SERVICE}/referrals/create`, {
    method: 'POST',
    body: form
  })
}