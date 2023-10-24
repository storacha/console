import { useEffect } from 'react';
import { useKeyring } from '@w3ui/react-keyring';
import { useUploadsList } from '@w3ui/react-uploads-list';
import { ShareIcon } from '@heroicons/react/20/solid';
import { SpaceShare } from '@/share';
import { Uploader } from './Uploader';
import { UploadsList } from './UploadsList';
import { SpaceRegistrar } from './SpaceRegistrar';
import { DidIcon } from './DidIcon';
import { DIDKey } from '@ucanto/interface';
import { H2 } from './Text';
import Link from 'next/link';

interface SpaceSectionProps {
  viewSpace: (did: DIDKey) => void;
  setShare: (share: boolean) => void;
  share: boolean;
}
export function SpaceSection (props: SpaceSectionProps): JSX.Element {
  const { viewSpace, share, setShare } = props;
  const [{ space }] = useKeyring();
  const [, { reload }] = useUploadsList();
  // reload the uploads list when the space changes
  // TODO: this currently does a network request - we'd like to just reset
  // to the latest state we have and revalidate in the background (SWR)
  // but it's not clear how all that state should work yet - perhaps
  // we need some sort of state management primitive in the uploads list?
  useEffect(() => {
//    void reload();
  }, [space, reload]);
  const registered = Boolean(space?.registered());
  return (
    <div>
      {space !== undefined && (
        <section>
          <header className='py-3'>
            <div className='flex flex-row items-start gap-2'>
              <DidIcon did={space.did()} />
              <div className='grow overflow-hidden whitespace-nowrap text-ellipsis text-gray-500'>
                <h1 className='text-xl font-semibold leading-5 text-white'>
                  {space.name() ?? 'Untitled'}
                </h1>
                <label className='font-mono text-xs'>
                  {space.did()}
                </label>
              </div>
              <button
                className='h-6 w-6 text-gray-500 hover:text-gray-100'
                onClick={() => setShare(!share)}>
                <ShareIcon />
              </button>
            </div>
          </header>
          <nav>
            <ul className="flex max-w-lg pt-4">
              <li className="mr-3">
                <Link className="w3ui-button inline-block font-mono" href="list">List</Link>
              </li>
              <li className="mr-3">
                <a className="w3ui-button inline-block font-mono" href="share">Share</a>
              </li>
              <li className="mr-3">
                <a className="w3ui-button inline-block font-mono" href="share">Upload</a>
              </li>
            </ul>
          </nav>
        </section>
      )}
      
      <div className='container mx-auto'>
        {share && <SpaceShare viewSpace={viewSpace} />}
        {(space && !registered) && !share && <SpaceRegistrar />}
        {!space && (
          <div className="text-center">
            <h1 className="text-xl">Select a space from the dropdown on the left to get started.</h1>
          </div>
        )}
        {registered && !share && (
          <>
            <div className='mt-8'>
              <UploadsList />
            </div>
            <div className='mt-8'>
            <H2>Upload</H2>
            <Uploader
              onUploadComplete={() => {
                void reload();
              }} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
