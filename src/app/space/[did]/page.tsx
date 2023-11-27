'use client'

import { UploadsList } from '@/components/UploadsList'
import { useW3, UnknownLink, UploadListSuccess } from '@w3ui/react'
import useSWR from 'swr'
import { useRouter, usePathname } from 'next/navigation'

interface PageProps {
  params: {
    did: string
  },
  searchParams: {
    cursor: string
    pre: string
  }
}

export default function Page ({ params, searchParams }: PageProps): JSX.Element {
  const [{ client, spaces }] = useW3()
  const spaceDID = decodeURIComponent(params.did)
  const space = spaces.find(s => s.did() === spaceDID)

  const key = `/space/${spaceDID}/uploads?cursor=${searchParams.cursor ?? ''}&pre=${searchParams.pre ?? 'false'}`
  const { data: uploads, isLoading, mutate } = useSWR<UploadListSuccess|undefined>(key, {
    fetcher: async () => {
      if (!client || !space) return

      if (client.currentSpace()?.did() !== space.did()) {
        await client.setCurrentSpace(space.did())
      }

      return await client.capability.upload.list({
        cursor: searchParams.cursor,
        pre: searchParams.pre === 'true'
      })
    },
    onError: err => console.error(err.message, err.cause)
  })

  const router = useRouter()
  const pathname = usePathname()

  if (!space) return <div />

  const handleSelect = (root: UnknownLink) => router.push(`${pathname}/root/${root}`)
  const handleNext = () => router.push(`${pathname}?cursor=${uploads?.after}`)
  const handlePrev = () => router.push(`${pathname}?cursor=${uploads?.before}`)
  const handleRefresh = () => mutate()

  return (
    <UploadsList
      space={space}
      uploads={uploads?.results ?? []}
      loading={isLoading}
      onSelect={handleSelect}
      onNext={handleNext}
      onPrev={handlePrev}
      onRefresh={handleRefresh}
    />
  )
}
