'use client'

import { H2 } from '@/components/Text'
import { useW3, FilecoinInfoSuccess, StoreGetSuccess } from '@w3ui/react'
import useSWR from 'swr'
import { parse as parseLink } from 'multiformats/link'
import DefaultLoader from '@/components/Loader'
import * as Claims from '@web3-storage/content-claims/client'
import { Aggregate, MerkleTreeNode, Piece, PieceLink, PieceView, ProofData } from '@web3-storage/data-segment'
import { Proof } from '@web3-storage/data-segment'
import CopyIcon from '@/components/CopyIcon'
import { EqualsClaim } from '@web3-storage/content-claims/client/api'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { filesize } from '@/lib'
import archy from 'archy'
import { base32 } from 'multiformats/bases/base32'

interface PageProps {
  params: {
    did: string
    cid: string
    shard: string
  }
}

export default function ItemPage ({ params }: PageProps): JSX.Element {
  const [{ client, spaces }] = useW3()
  const spaceDID = decodeURIComponent(params.did)
  const space = spaces.find(s => s.did() === spaceDID)
  const root = parseLink(params.cid)
  const shard = parseLink(params.shard)

  const storeKey = `/space/${spaceDID}/store/get?link=${shard}`
  const store = useSWR<StoreGetSuccess|undefined>(storeKey, {
    fetcher: async () => {
      if (!client || !space) return

      if (client.currentSpace()?.did() !== space.did()) {
        await client.setCurrentSpace(space.did())
      }

      return await client.capability.store.get(shard)
    },
    onError: err => console.error(err.message, err.cause)
  })

  const claimKey = `/assert/equals?content=${shard}`
  const claim = useSWR<EqualsClaim|undefined>(claimKey, {
    fetcher: async () => {
      const claims = await Claims.read(shard)
      for (const claim of claims) {
        if (claim.type === 'assert/equals' && isPieceLink(claim.equals)) {
          return claim
        }
      }
    },
    onError: err => console.error(err.message, err.cause)
  })

  const filecoinInfoKey = `/filecoin/info?piece=${claim.data?.equals}`
  const filecoinInfo = useSWR<FilecoinInfoSuccess|undefined>(filecoinInfoKey, {
    fetcher: async () => {
      if (!client || !space || !claim.data) return

      if (client.currentSpace()?.did() !== space.did()) {
        await client.setCurrentSpace(space.did())
      }

      const { out } = await client.capability.filecoin.info(claim.data.equals as PieceLink)
      if (out.error) {
        throw new Error('failed to get filecoin info', { cause: out.error })
      }
      console.log(out.ok.aggregates)
      return out.ok
    },
    onError: err => console.error(err.message, err.cause)
  })

  if (!space) {
    return <h1>Space not found</h1>
  }
  return (
    <div>
      <Breadcrumbs space={space.did()} root={root} shard={shard} />
      <H2>Shard CID</H2>
      <div className='pb-5 font-mono text-sm overflow-hidden no-wrap text-ellipsis'>
        {shard.toString()}
        <CopyIcon text={shard.toString()} />
      </div>
      <H2>Piece CID</H2>
      <div className='pb-5 font-mono text-sm overflow-hidden no-wrap text-ellipsis'>
        {claim.isLoading
          ? <DefaultLoader className='w-5 h-5 inline-block' />
          : claim.data
            ? <>{claim.data.equals.toString()}<CopyIcon text={String(claim.data.equals)} /></>
            : 'Unknown'}
      </div>
      <H2>Size</H2>
      <div className='pb-5 font-mono text-sm overflow-hidden no-wrap text-ellipsis'>
        {store.isLoading
          ? <DefaultLoader className='w-5 h-5 inline-block' />
          : store.data
            ? filesize(store.data.size)
            : 'Unknown'}
      </div>
      <H2>Aggregate CID</H2>
      <div className='pb-5 font-mono text-sm overflow-hidden no-wrap text-ellipsis'>
        {claim.isLoading || filecoinInfo.isLoading
          ? <DefaultLoader className='w-5 h-5 inline-block' />
          : filecoinInfo.data && filecoinInfo.data.aggregates.length
            ? filecoinInfo.data.aggregates.map(({ aggregate, inclusion }) => {
                const piece = filecoinInfo.data?.piece
                if (!piece) return <div />
                return (
                  <div key={aggregate.toString()}>
                    {aggregate.toString()}<CopyIcon text={aggregate.toString()} />
                    <br/>
                    <span className='font-sans opacity-60'>aka </span>
                    {Piece.fromLink(aggregate).toInfo().link.toString()}<CopyIcon text={aggregate.toString()} />
                    <H2 className='mt-5'>Inclusion Proof</H2>
                    <pre className='font-mono text-sm overflow-x-auto'>
                      {renderInclusionProof(inclusion.subtree, Piece.fromLink(piece))}
                    </pre>
                  </div>
                )
              })
            : 'Unknown'}
      </div>
      <H2>Storage Providers</H2>
      <div className='pb-5 font-mono text-sm overflow-hidden no-wrap text-ellipsis'>
        {claim.isLoading || filecoinInfo.isLoading
            ? <DefaultLoader className='w-5 h-5 inline-block' />
            : filecoinInfo.data && filecoinInfo.data.deals.length
              ? (
                  <ol className='list-decimal list-inside'>
                    {filecoinInfo.data.deals.map(d => (
                      <li key={d.aux.dataSource.dealID}>
                        <a href={`https://filfox.info/address/f0${d.provider}`} target='_blank' className='underline'>f0{d.provider}</a>
                        <span className='text-xs tracking-wider font-bold px-2 text-black font-mono inline-block'>@</span>
                        <a href={`https://filfox.info/deal/${d.aux.dataSource.dealID}`} target='_blank' className='underline'>{d.aux.dataSource.dealID.toString()}</a>
                      </li>
                    ))}
                  </ol>
                )
              : 'None'}
      </div>
    </div>
  )
}

function isPieceLink(link: any): link is PieceLink {
  try {
    Piece.fromLink(link)
    return true
  } catch {
    return false
  }
}

const MAX_DEPTH = 63

// Adapted from https://github.com/web3-storage/data-segment/blob/e9cdcbf76232e5b92ae1d13f6cf973ec9ab657ef/src/proof.js#L62-L86
function renderInclusionProof (proof: ProofData, piece: PieceView): string {
  if (Proof.depth(proof) > MAX_DEPTH) {
    throw new RangeError('merkle proofs with depths greater than 63 are not supported')
  }

  let position = BigInt(Proof.offset(proof))
  if (position >> BigInt(Proof.depth(proof)) !== 0n) {
    throw new RangeError('offset greater than width of the tree')
  }

  const { root } = piece
  let nodes: archy.Data['nodes'] = []
  let top = root
  let right = 0n

  for (const [i, node] of Object.entries(Proof.path(proof))) {
    right =  position & 1n
    position = position >> 1n

    const label = top === root
      ? Piece.toLink(piece).toString()
      // : `MerkleTreeNode(${top.length}) [${top}]`
      : base32.encode(top)

    if (right === 1n) {
      nodes = [base32.encode(node), { label, nodes }]
    } else {
      nodes = [{ label, nodes }, base32.encode(node)]
    }
    top = right === 1n ? Proof.computeNode(node, top) : Proof.computeNode(top, node)
  }

  // Derive the aggregate tree height by adding depth of the proof tree to the
  // height of the piece (sub)tree.
  const height = piece.height + Proof.depth(proof)
  const aggregate = Aggregate.toLink({ root: top, height })

  return archy({ label: aggregate.toString(), nodes })
}
