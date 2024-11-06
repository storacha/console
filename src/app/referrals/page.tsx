'use client'

import CopyButton from '@/components/CopyButton'
import DefaultLoader from '@/components/Loader'
import { H1, H3 } from '@/components/Text'
import { useReferrals } from '@/lib/hooks'

export const runtime = "edge"

export function RefcodeCreator () {
  const { accountEmail, createRefcode, mutateRefcode, setReferrerEmail } = useReferrals()

  return (
    <>
      {
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
              onChange={(e) => { setReferrerEmail(e.target.value) }}
            />
            <button type='submit' className={`inline-block bg-hot-red border border-hot-red hover:bg-white hover:text-hot-red font-epilogue text-white uppercase text-sm px-6 py-2 rounded-full whitespace-nowrap`}>
              Create
            </button>
          </form>
        )
      }
    </>
  )
}

export function RefcodeLink () {
  const { referralLink } = useReferrals()
  if (referralLink) {
    return (
      <div className="border border-hot-red rounded-full px-4 py-2 flex flex-row justify-between items-center">
        <div>{referralLink}</div>
        <CopyButton text={referralLink} />
      </div>
    )
  } else {
    return <RefcodeCreator />
  }
}

export function ReferralsList () {
  const { referrals } = useReferrals()
  return (
    (referrals && referrals.length > 0) ? (
      <>
        <H3>Referrals</H3>
        <div className="divide-solid divide-hot-red py-4">
          {
            /**
             * TODO: once we can determine when a user signed up and what plan they signed up for, update
             * this UI to differentiate between them with different names and give users a countdown timer
             * in the lozenge.
             */
            referrals.map((referral, i) =>
              <div key={i} className="flex flex-row justify-between items-center py-4">
                <div>Referred Racha</div>
                <div className="rounded-full bg-hot-red-light text-hot-red px-4 py-2 font-mono text-sm">In Progress</div>
              </div>
            )
          }
        </div>
      </>
    ) : (
      <>
        <H3>Earn Free Storage and Racha Points!</H3>
        <p className='text-hot-red mb-4'>
          Turn your friends into Lite of Business Rachas and receive up to 16 months of Lite or
          3 months of Business for free! You can also earn Racha Points. Here you can learn more
          about the <a href="#TODONeedLink">details of the program</a>.
        </p>
      </>
    )
  )
}

export default function ReferralsPage () {
  const { refcodeIsLoading } = useReferrals()

  return (
    <div className='p-10 bg-racha-fire/50 w-full h-screen'>
      <H1>Generate a Referral Code</H1>
      <div className='border border-hot-red rounded-2xl bg-white p-5'>
        {refcodeIsLoading ? (
          <DefaultLoader className="text-hot-red h-6 w-6" />
        ) : (
          <>
            <ReferralsList />
            <RefcodeLink />
          </>
        )
        }
      </div>
    </div >
  )
}