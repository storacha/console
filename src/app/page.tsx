'use client';
import { useW3, Space, Principal } from '@w3ui/react'
import { DidIcon } from '@/components/DidIcon'
import Link from 'next/link'
import { SpacesNav } from './space/layout'
import { H1, H2 } from '@/components/Text'
import SidebarLayout from '@/components/SidebarLayout'
import { ReactNode } from 'react'
import { CID } from 'multiformats/cid'
import { Delegation } from '@ucanto/core/delegation';

export default function HomePage () {
  return (
    <SidebarLayout>
      <SpacePage />
    </SidebarLayout>
  )
}

function SpacePage (): ReactNode {
  const [{ spaces }] = useW3()

  if (spaces.length === 0) {
    return <div></div>
  }

  return (
    <>
      <SpacesNav />
      <H1>Spaces</H1>
      <H2>Pick a Space</H2>
      <div className='max-w-lg border rounded-2xl border-hot-red bg-white'>
        { spaces.map(s => <Item space={s} key={s.did()} /> ) }
      </div>
    </>
  )
}

function Item ({space}: {space: Space}) {
  return (
    <Link href={`/space/${space.did()}`} className='flex flex-row items-start gap-4 p-4 text-left hover:bg-hot-yellow-light border-b last:border-0 border-hot-red first:rounded-t-2xl last:rounded-b-2xl'>
      <DidIcon did={space.did()} />
      <div className='grow overflow-hidden whitespace-nowrap text-ellipsis'>
        <span className='font-epilogue text-lg text-hot-red leading-5 m-0'>
          {space.name || 'Untitled'}
        </span>
        <span className='font-mono text-xs block'>
          {space.did()}
        </span>
      </div>
    </Link>
  )
}

const idCss = `
  padding: 0 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`
const idIconCss = `
  font-size: 0.7em;
`;


const didCss = `
  ${idCss}
  background-color: hsla(300, 100%, 50%, 0.2);
`;

const cidCss = `
  ${idCss}
  background-color: hsla(49, 100%, 50%, 0.2);
`;

const isPrincipal = (obj: object): obj is Principal => "did" in obj && typeof obj.did === 'function';
const isCID = (obj: object): obj is CID => "bytes" in obj && '/' in obj && typeof obj.bytes !== 'undefined' && obj['/'] === obj.bytes;

if (typeof window !== 'undefined') {
  // @ts-expect-error
  window.devtoolsFormatters = [
    {
      header: function(obj: object) {
        if (isPrincipal(obj)) {
          return ["div", {style: didCss}, ["div", {style: idIconCss}, "🪪"], ["div", {}, obj.did()]]
        } 
      },
      hasBody: function(obj: object) {
        if (isPrincipal(obj)) {
          return false
        }
      },
    },
    {
      header: function(obj: object) {
        if (isCID(obj)) {
          return ["div", {style: cidCss}, ["div", {style: idIconCss}, "📜"], ["div", {}, obj.toString()]]
        } 
      },
      hasBody: function(obj: object) {
        if (isCID(obj)) {
          return false
        }
      },
    }
  ]


  // const blocksSymbol = Symbol('blocks')

  // Object.defineProperty(Delegation.prototype, 'blocks', {
  //   set: function(value) {
  //     console.log('setting blocks', value)
  //     this[blocksSymbol] = value
  //   },
  //   get: function() {
  //     return this[blocksSymbol]
  //   }
  // })

  // // @ts-expect-error
  // window.Delegation = Delegation
 
}

