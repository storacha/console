'use client'

import { H2 } from '@/components/Text'
import { useW3, UploadGetSuccess, FilecoinInfoSuccess } from '@w3ui/react'
import useSWR from 'swr'
import { parse as parseLink } from 'multiformats/link'
import DefaultLoader from '@/components/Loader'
import * as Claims from '@web3-storage/content-claims/client'
import { Piece, PieceLink } from '@web3-storage/data-segment'

interface PageProps {
  params: {
    did: string
    cid: string
  }
}

export default function ItemPage ({ params }: PageProps): JSX.Element {
  const [{ client, spaces }] = useW3()
  const spaceDID = decodeURIComponent(params.did)
  const space = spaces.find(s => s.did() === spaceDID)
  const root = parseLink(params.cid)

  const uploadKey = `/space/${spaceDID}/upload/${root}`
  const upload = useSWR<UploadGetSuccess|undefined>(uploadKey, {
    fetcher: async () => {
      if (!client || !space) return

      if (client.currentSpace()?.did() !== space.did()) {
        await client.setCurrentSpace(space.did())
      }

      return await client.capability.upload.get(root)
    },
    onError: err => console.error(err.message, err.cause)
  })

  const filecoinInfoKey = `/space/${spaceDID}/filecoin/info/${root}`
  const filecoinInfo = useSWR<FilecoinInfoSuccess|undefined>(filecoinInfoKey, {
    fetcher: async () => {
      if (!client || !space) return

      if (client.currentSpace()?.did() !== space.did()) {
        await client.setCurrentSpace(space.did())
      }

      const claims = await Claims.read(root)
      let pieceLink
      for (const claim of claims) {
        if (claim.type === 'assert/equals' && isPieceLink(claim.equals)) {
          pieceLink = claim.equals
          break
        }
      }
      if (!pieceLink) {
        console.log(`No piece equivalency claim found for: ${root}`)
        return
      }

      const { out } = await client.capability.filecoin.info(pieceLink)
      if (out.ok) {
        return out.ok
      }
    },
    onError: err => console.error(err.message, err.cause)
  })

  if (upload.isLoading) {
    return (
      <div className='text-center'>
        <DefaultLoader  className='w-12 h-12 inline-block' />
      </div>
    )
  }

  if (!upload.data) {
    return <h1>Not Found</h1>
  }
  const url = `https://${upload.data.root.toString()}.ipfs.w3s.link`
  return (
    <div>
      <H2>Root CID</H2>
      <div className="pb-5 font-mono text-sm overflow-hidden no-wrap text-ellipsis">
        { upload.data.root.toString() }
      </div>
      <H2>URL</H2>
      <div className="pb-5">
        <a href={url} className="font-mono text-sm underline m-0 p-0 block">{url}</a>
      </div>
      <H2>Shards</H2>
      <div className='pb-5'>
         { upload.data.shards?.map(link => <Shard cid={link.toString()} key={link.toString()} />) }
      </div>
      <H2>Storage Providers</H2>
      <p className='font-mono text-sm'>
        {filecoinInfo.data
          ? (
            <a href={`https://filfox.info/deal/${filecoinInfo.data.deals[0].aux.dataSource.dealID}`}>f0{filecoinInfo.data.deals[0].provider}</a>
          ) : 'Aggregating...'}
      </p>
    </div>
  )
}

function Shard ({ cid }: { cid: string}) {
  return <div className="font-mono text-sm overflow-hidden no-wrap text-ellipsis">{cid}</div> 
}

function isPieceLink(link: any): link is PieceLink {
  try {
    Piece.fromLink(link)
    return true
  } catch {
    return false
  }
}
