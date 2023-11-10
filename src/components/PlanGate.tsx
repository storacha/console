'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useKeyring, Plan } from '@w3ui/react-keyring';
import StripePricingTable from './PricingTable';
import DefaultLoader from './Loader';

export function PlanGate ({ children }: { children: ReactNode }): ReactNode {
  const [error, setError] = useState<any>()
  const [{ account }, { getPlan }] = useKeyring();
  const [plan, setPlan] = useState<Plan>()
  useEffect(function () {
    (async function () {
      if (account) {
        try {
          const result = await getPlan(account as `${string}@${string}`)
          if (result.ok) {
            setPlan(result.ok)
          } else {
            setError(result.error)
          }
        } catch (err) {
          console.error("CAUGHT ERROR", err)
          setError(err)
        }
      }
    })()
  }, [account, getPlan])
  if (!plan && !error) {
    return <DefaultLoader className='w-12 h-12 text-white' />
  }

  if (!plan?.product) {
    return (
      <div className="flex flex-col items-center h-screen">
        <div className="text-white bg-gray-900/60 w-full rounded-md overflow-hidden">
          <div className='px-10 py-4'>
            <h1 className="my-4 text-lg">Welcome {account}!</h1>
            <p className='max-w-xl mb-2'>
              To get started with w3up you&apos;ll need to sign up for a subscription. If you choose
              the free plan we won&apos;t charge your credit card, but we do need a card on file
              before we will store your bits.
            </p>
            <p>
              Pick a plan below and complete the Stripe checkout flow to get started!
            </p>
          </div>
          <StripePricingTable className='rounded-md'/>
        </div>
      </div>
    )
  }

  return children
}

export function MaybePlanGate ({ children }: { children: ReactNode }): ReactNode {
  if (process.env.NEXT_PUBLIC_DISABLE_PLAN_GATE == 'true') {
    return children
  } else {
    return <PlanGate>{children}</PlanGate>
  }
}