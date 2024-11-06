'use client'
import { useState } from 'react'
import useSWR from "swr"
import { useW3 } from "@w3ui/react"
import { createRefcode } from '../referrals'

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

const fetcher = (url: string): any => fetch(url).then((res) => res.json())

export function useReferrals () {
  const [{ accounts }] = useW3()
  const account = accounts[0]
  const accountEmail = account?.toEmail()
  const [referrerEmail, setReferrerEmail] = useState<string>()
  const email = accountEmail || referrerEmail
  const { data: refcodeResult, mutate: mutateRefcode, isLoading: refcodeIsLoading } = useSWR<RefcodeResult>(email && `/referrals/refcode/${encodeURIComponent(email)}`, fetcher)
  const refcode = refcodeResult?.refcode
  const { data: referralsResult, isLoading: referralsAreLoading } = useSWR<ReferralsResult>(refcode && `/referrals/list/${refcode}`, fetcher)
  const referrals = referralsResult?.referrals
  const referralLink = refcode && `${location.protocol}//${location.host}/?refcode=${refcode}`
  return {
    refcodeIsLoading, referralsAreLoading,
    referrerEmail, setReferrerEmail, accountEmail, email,
    refcode, createRefcode, mutateRefcode, referrals, referralLink
  }
}