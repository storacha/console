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
            console.error("error fetching plan, skipping plan selection: ", result.error)
            setError(result.error)
          }
        } catch (err) {
          console.log("error fetching plan, skipping plan selection: ", err)
          setError(err)
        }
      }
    })()
  }, [account, getPlan])
  if (!plan && !error) {
    return <DefaultLoader className='w-12 h-12 text-white' />
  }
  // if we get an error loading a plan, skip plan selection
  // TODO: we should let the user recover from this, likely by letting them escalate privileges, but
  // for now just skip plan selection and move on.
  if (error || plan?.product) {
    return children;
  }
  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <div className="text-gray-200 text-center">
        <h1 className="my-4 text-lg">Welcome {account}!</h1>
        <p>
          To get started with w3up you&apos;ll need to sign up for a subscription. If you choose
          the free plan we won&apos;t charge your credit card, but we do need a card on file
          before we will store your bits.
        </p>
        <p>
          Pick a plan below and complete the Stripe signup flow to get started!
        </p>
        <StripePricingTable />
      </div>
    </div>
  );
}
