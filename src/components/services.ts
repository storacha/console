import type { Service } from '@w3ui/react'
import { connect } from '@ucanto/client'
import { CAR, HTTP } from '@ucanto/transport'
import * as DID from '@ipld/dag-ucan/did'


export const serviceURL = new URL(
  // 'https://staging.up.web3.storage'
  process.env.NEXT_PUBLIC_W3UP_SERVICE_URL ?? 'https://up.web3.storage'
)

export const receiptsURL = new URL(
  // 'https://staging.up.web3.storage/receipt/'
  process.env.NEXT_PUBLIC_W3UP_RECEIPTS_URL ?? 'https://up.web3.storage/receipt/'
)

export const servicePrincipal = DID.parse(
  // 'did:web:staging.web3.storage'
  process.env.NEXT_PUBLIC_W3UP_SERVICE_DID ?? 'did:web:web3.storage'
)

export const serviceConnection = connect<Service>({
  id: servicePrincipal,
  codec: CAR.outbound,
  channel: HTTP.open<any>({
    url: serviceURL,
    method: 'POST',
  }),
})

export const gatewayHost = process.env.NEXT_PUBLIC_W3UP_GATEWAY_HOST ?? 'w3s.link'
