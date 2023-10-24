'use client'

import { useState } from 'react'
import { DIDKey } from '@ucanto/interface'
import { useKeyring } from '@w3ui/react-keyring'
import { SpaceSection } from '@/components/SpaceSection'
import Link from 'next/link'
import BackIcon from '@/components/BackIcon'

export default function Home ({ params }: { params: { did: DIDKey }}): JSX.Element {
  const [share, setShare] = useState(false)
  const [{ space }, { setCurrentSpace }] = useKeyring()

  function viewSpace (did: DIDKey): void {
    setShare(false)
    void setCurrentSpace(did)
  }

  const did = decodeDidKey(params.did)

  if (!did) {
    return <h1>NO SPACE?</h1>
  }

  if (space && space?.did() !== did) {
    setCurrentSpace(did)
    return <div></div>
  }

  return (
    <SpaceSection viewSpace={viewSpace} share={share} setShare={setShare} />
  )
}

function decodeDidKey (str: string): DIDKey | undefined {
  if (!str) return
  const did = decodeURIComponent(str)
  if (!did.startsWith('did:key:')) return
  return did as DIDKey
}

