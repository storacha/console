import { H2 } from '@/components/Text'
import Link from 'next/link'

export default function Layout ({children}): JSX.Element {

  return (
    <section>
      <H2 explain='a decentralised bucket identified by a DID'>
        <Link href='/space'>Space</Link>
      </H2>
      {children}
    </section>
  )
}