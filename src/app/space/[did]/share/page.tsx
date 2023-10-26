'use client'

import { SpaceShare } from '@/share'

export default function SharePage (): JSX.Element {
  const nop = () => {}
  return (
    <SpaceShare viewSpace={nop} />
  )
}
