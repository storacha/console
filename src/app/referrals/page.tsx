'use client'

import { useState } from 'react'
import { createRefcode } from "@/lib/referrals"
import useSWR from "swr"
import { useW3 } from "@w3ui/react"

export const runtime = "edge"

const fetcher = (url: string): any => fetch(url).then((res) => res.json());

interface RefcodeResult {
  refcode: string
}

interface Referral {
  referredAt: string
  reward: boolean
}

interface ReferralsResult {
  referrals: Referral[]
}

export default function ReferralsPage () {

  const [{ accounts }] = useW3()
  const account = accounts[0]
  const accountEmail = account?.toEmail()
  const [formEmail, setFormEmail] = useState<string>()
  const email = accountEmail || formEmail
  const { data: refcodeResult, mutate: mutateRefcode } = useSWR<RefcodeResult>(email && `/referrals/refcode/${encodeURIComponent(email)}`, fetcher)
  const refcode = refcodeResult?.refcode
  const { data: referralsResult } = useSWR<ReferralsResult>(refcode && `/referrals/list/${refcode}`, fetcher)
  const referrals = referralsResult?.referrals
  const referralLink = refcode && `${location.protocol}//${location.host}/?refcode=${refcode}`
  return (
    <div className='flex flex-col justify-center p-10'>
      <h3 className='text-xl pb-4'>Create a Referral Link</h3>
      <p className='pb-4'>
        When you refer new Storacha users you get free storage and loyalty points!
      </p>
      {refcode ? (
        <>
          <h3 className="text-xl">Referral link</h3>
          <a href={referralLink}>{referralLink}</a>
          <h3 className="text-xl">Referrals</h3>
          {referrals && (referrals.length > 0) ? (
            referrals.map((referral, i) =>
              <p key={i}>
                Referred at: {referral.referredAt} | Rewarded: {referral.reward}
              </p>
            )
          ) : (
            <p>You do not have any referrals</p>
          )}
        </>
      ) : (
        accountEmail ? (
          <button className={`inline-block bg-hot-red border border-hot-red hover:bg-white hover:text-hot-red font-epilogue text-white uppercase text-sm px-6 py-2 rounded-full whitespace-nowrap`}
            onClick={async () => {
              const referralData = new FormData()
              referralData.append('email', accountEmail)
              await createRefcode(referralData)
              mutateRefcode()
            }}>
            Create
          </button>
        ) : (
          <form onSubmit={(e) => {
            e.preventDefault()
            createRefcode(new FormData(e.currentTarget))
            mutateRefcode()
          }} className=''>
            <label className='block mb-2 uppercase text-xs text-hot-red font-epilogue m-1' htmlFor='email'>Your Email</label>
            <input
              id='email'
              name='email'
              type='email'
              className='text-black py-2 px-2 rounded-xl block mb-4 border border-hot-red w-80'
              placeholder='Email'
              required={true}
              onChange={(e) => { setFormEmail(e.target.value) }}
            />
            <button type='submit' className={`inline-block bg-hot-red border border-hot-red hover:bg-white hover:text-hot-red font-epilogue text-white uppercase text-sm px-6 py-2 rounded-full whitespace-nowrap`}>
              Create
            </button>
          </form>
        )
      )}
    </div >
  )
}