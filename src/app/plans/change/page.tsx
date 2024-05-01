'use client'

import { usePlan } from "@/hooks"
import { useW3, DID, Client, AccountDID } from "@w3ui/react"
import { ArrowTopRightOnSquareIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import DefaultLoader from "@/components/Loader"
import { useState } from "react"
import SidebarLayout from "@/components/SidebarLayout"
import { toast } from 'react-hot-toast'
import { ucantoast } from "@/toaster"
import { ArrowPathIcon } from "@heroicons/react/20/solid"
import { useForm, SubmitHandler } from 'react-hook-form'
import { delegate } from "@ucanto/core/delegation"
import * as Access from "@web3-storage/access/access"
import * as DidMailto from "@web3-storage/did-mailto"
import * as Ucanto from "@ucanto/core"
import { Plan } from "@web3-storage/capabilities"
import { H2 } from "@/components/Text"
import { Capability, Delegation } from "@ucanto/interface"

interface PlanSectionProps {
  planID: DID
  planName: string
  flatFee: number
  flatFeeAllotment: number
  perGbFee: number
}

const PLANS: Record<string, DID<'web'>> = {
  starter: 'did:web:starter.web3.storage',
  lite: 'did:web:lite.web3.storage',
  business: 'did:web:business.web3.storage',
}

const planRanks: Record<string, number> = {
  [PLANS['starter']]: 0,
  [PLANS['lite']]: 1,
  [PLANS['business']]: 2
}

const buttonText = (currentPlan: string, newPlan: string) => (planRanks[currentPlan] > planRanks[newPlan]) ? 'Downgrade' : 'Upgrade'

function PlanSection ({ planID, planName, flatFee, flatFeeAllotment, perGbFee }: PlanSectionProps) {
  const [{ accounts }] = useW3()
  const { data: plan, setPlan, isLoading } = usePlan(accounts[0])
  const currentPlanID = plan?.product
  const isCurrentPlan = currentPlanID === planID
  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false)
  async function selectPlan (selectedPlanID: DID) {
    try {
      setIsUpdatingPlan(true)
      await ucantoast(setPlan(selectedPlanID), {
        loading: "Updating plan...",
        success: "Plan updated!",
        error: "Failed to update plan, check the console for more details."
      })
    } finally {
      setIsUpdatingPlan(false)
    }
  }
  return (
    <div className={`flex flex-col items-center rounded border-2 border-solid border-slate-800 w-[21rem] p-6 ${isCurrentPlan ? 'bg-blue-800/10' : 'bg-slate-800/10'}`}>
      <div className='text-2xl mb-6 flex flex-row justify-between w-full'>
        <div className='font-bold'>{planName}</div>
        <div>
          <span className='font-bold'>${flatFee}</span><span className='text-slate-600'>/mo</span>
        </div>
      </div>
      <div className='flex flex-row self-start space-x-2 mb-4'>
        <div className='pt-1'>
          <CheckCircleIcon className='w-6 h-6 font-bold' />
        </div>
        <div className='flex flex-col'>
          <div className='text-xl font-bold'>{flatFeeAllotment}GB storage</div>
          <div>Additional at ${perGbFee}/GB per month</div>
        </div>
      </div>
      <div className='flex flex-row self-start space-x-2 mb-8'>
        <div className='pt-1'>
          <CheckCircleIcon className='w-6 h-6 font-bold' />
        </div>
        <div className='flex flex-col'>
          <div className='text-xl font-bold'>{flatFeeAllotment}GB egress per month</div>
          <div>Additional at ${perGbFee}/GB per month</div>
        </div>
      </div>
      {
        (isLoading || isUpdatingPlan || !currentPlanID) ? (
          <DefaultLoader className='h-6 w-6' />
        ) : (
          isCurrentPlan ? (
            <div className='h-4'>
              {(currentPlanID === planID) && (
                <h5 className='font-bold'>Current Plan</h5>
              )}
            </div>
          ) : (
            <button className={`text-white bg-slate-800 hover:bg-blue-800 rounded py-2 px-8 text-sm font-medium transition-colors ease-in`}
              disabled={isCurrentPlan || isLoading} onClick={() => selectPlan(planID)}>{currentPlanID && buttonText(currentPlanID, planID)}</button>
          )
        )
      }
    </div >
  )
}

function getCapabilities (delegations: Delegation[]): Capability[] {
  if (delegations.length === 0) {
    return []
  } else {
    return delegations.map(delegation => {
      return delegation.capabilities.concat(getCapabilities(delegation.proofs as Delegation[]))
    }).flat()
  }
}

function findAccountsICanAdminister (client: Client): AccountDID[] {
  return Array.from(new Set(
    getCapabilities(client.proofs([{ can: Plan.createAdminSession.can, with: 'ucan:*' }]))
      .filter(cap => {
        const hasCapability = cap.can === Plan.createAdminSession.can || cap.can === 'plan/*' || '*'
        const isAccount = cap.with.startsWith('did:mailto:')
        return hasCapability && isAccount
      })
      .map(cap => cap.with) as AccountDID[]
  ))
}

interface DelegationPlanCreateAdminSessionInput {
  email: string
}
function DelegatePlanCreateAdminSessionForm ({ className = '' }: { className?: string }) {
  const [{ client, accounts }] = useW3()

  const { register, handleSubmit } = useForm<DelegationPlanCreateAdminSessionInput>()
  const onSubmit: SubmitHandler<DelegationPlanCreateAdminSessionInput> = async (data) => {
    const currentAccount = accounts[0]
    if (client && currentAccount) {
      const email = data.email as `${string}@${string}`
      await ucantoast(Access.delegate(client.agent, {
        delegations: [
          await delegate({
            issuer: client.agent.issuer,
            audience: Ucanto.DID.parse(DidMailto.fromEmail(email)),
            capabilities: [
              {
                with: currentAccount.did(),
                can: Plan.createAdminSession.can
              }
            ],
            // TODO default to 1 year for now, but let's add UI for this soon
            lifetimeInSeconds: 60 * 60 * 24 * 365,
            proofs: client.proofs([{
              with: currentAccount.did(),
              can: Plan.createAdminSession.can
            }])
          })

        ]
      }), {
        loading: 'Delegating...',
        success: `Delegated billing portal access to ${email}.`,
        error: `Error delegating billing portal access to ${email}.`
      })
    }
  }
  //console.log("PROOFS", client?.proofs().map(p => JSON.parse(JSON.stringify(p))))

  /*client?.proofs().reduce((m, delegation) => {
    const capabilities = delegation.capabilities.filter(cap => cap.can === '*' || cap.can === 'plan/*' || cap.can === 'plan/create-admin-session')
    if (capabilities.length > 0){
      console.log("CAPS", capabilities, JSON.parse(JSON.stringify(delegation)))
    }
    return m.concat()
  }, [])*/

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={`flex flex-col space-y-2 ${className}`}>
      <label className='w-full'>
        <H2>Delegate billing admin portal access</H2>
        <input className='text-black py-2 px-2 rounded block w-full border border-gray-800'
          placeholder='Email' type='email'
          {...register('email')} />
      </label>
      <input className='w3ui-button' type='submit' value='Delegate' />
    </form>
  )
}

function CustomerPortalLink ({ did }: { did: AccountDID }) {
  const { customerPortalLink, generateCustomerPortalLink, generatingCustomerPortalLink } = useCustomerPortalLink()
  return (
    <>
      {customerPortalLink ? (
        <div className='flex flex-row'>
          <button className='w3ui-button-colors w3ui-button-size p-2 mr-2' onClick={() => generateCustomerPortalLink(did)} disabled={generatingCustomerPortalLink}>
            <ArrowPathIcon className={`h-5 w-5 text-white ${generatingCustomerPortalLink ? 'animate-spin' : ''}`} />
          </button>
          <a className='w3ui-button' href={customerPortalLink} target="_blank" rel="noopener noreferrer">
            Open Customer Portal
            <ArrowTopRightOnSquareIcon className='relative inline h-5 w-4 ml-1 -mt-1' />
          </a>
        </div>
      ) : (
        <button className='w3ui-button' onClick={() => generateCustomerPortalLink(did)} disabled={generatingCustomerPortalLink}>
          Access Customer Portal for {DidMailto.toEmail(did as DidMailto.DidMailto)}
          {generatingCustomerPortalLink &&
            <ArrowPathIcon className='inline ml-2 h-5 w-5 text-white animate-spin' />
          }
        </button>
      )}
    </>
  )
}

function useCustomerPortalLink () {
  const [{ client, accounts }] = useW3()
  const account = accounts[0]
  const [customerPortalLink, setCustomerPortalLink] = useState<string>()
  const [generatingCustomerPortalLink, setGeneratingCustomerPortalLink] = useState(false)
  async function generateCustomerPortalLink (did: AccountDID) {
    if (!client) {
      toast.error('Error creating Stripe customer portal session, please see the console for more details.')
      console.debug(`w3up client is ${client}, could not generate customer portal link`)
    } else if (!account) {
      toast.error('Error creating Stripe customer portal session, please see the console for more details.')
      console.debug(`w3up account is ${account}, could not generate customer portal link`)
    } else {
      setGeneratingCustomerPortalLink(true)
      console.log("PROFOS", JSON.parse(JSON.stringify(client.proofs([{ can: Plan.createAdminSession.can, with: did }]))))
      const result = await account.plan.createAdminSession(did, location.href)
      setGeneratingCustomerPortalLink(false)
      if (result.ok) {
        setCustomerPortalLink(result.ok.url)
      } else {
        toast.error('Error creating Stripe customer portal session, please see the console for more details.')
        console.debug("Error creating admin session:", result.error)
      }
    }
  }
  return { customerPortalLink, generateCustomerPortalLink, generatingCustomerPortalLink }
}

function Plans () {
  const [{ client, accounts }] = useW3()
  const account = accounts[0]

  const [claimingDelegations, setClaimingDelegations] = useState(false)
  async function claimDelegations () {
    try {
      setClaimingDelegations(true)
      await client?.capability.access.claim()
      await client?.capability.access.claim({ audience: account.did() })
    } finally {
      setClaimingDelegations(false)
    }
  }
  const billingAdminAccounts: AccountDID[] = client ? findAccountsICanAdminister(client) : []
  console.log(billingAdminAccounts)
  return (
    <div className='py-8 flex flex-col items-center space-y-8'>
      <div className='flex flex-col items-center'>
        <h1 className='text-2xl font-mono mb-8 font-bold'>Billing</h1>
        <CustomerPortalLink did={account.did()} />
        <DelegatePlanCreateAdminSessionForm className='my-4' />
        <div>
          {/*<button className='w3ui-button' onClick={claimDelegations} disabled={claimingDelegations}>
            Check For Billing Admin Delegations
            {claimingDelegations &&
              <ArrowPathIcon className='inline ml-2 h-5 w-5 text-white animate-spin' />
            }
          </button>
          */}
          {billingAdminAccounts.map(did => (<CustomerPortalLink did={did} key={did} />))}
        </div>
      </div>
      <div className='flex flex-col items-center'>
        <h1 className='text-2xl font-mono mb-8 font-bold'>Plans</h1>
        <p className='mb-4'>Pick the price plan that works for you.</p>
        <div className='flex flex-col space-y-2 xl:flex-row xl:space-y-0 xl:space-x-2'>
          <PlanSection planID={PLANS['starter']} planName='Starter' flatFee={0} flatFeeAllotment={5} perGbFee={0.15} />
          <PlanSection planID={PLANS['lite']} planName='Lite' flatFee={10} flatFeeAllotment={100} perGbFee={0.05} />
          <PlanSection planID={PLANS['business']} planName='Business' flatFee={100} flatFeeAllotment={2000} perGbFee={0.03} />
        </div>
      </div>
    </div>
  )
}

export default function PlansPage () {
  return (
    <SidebarLayout>
      <Plans />
    </SidebarLayout>
  )
}
