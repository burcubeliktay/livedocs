"use client"
import { ClientSideSuspense, RoomProvider } from '@liveblocks/react/suspense'
import React, { useEffect, useRef, useState } from 'react'
import Header from '@/components/Header'
import { Editor } from '@/components/editor/Editor'
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import ActiveCollaborators from './ActiveCollaborators'
import { Input } from './ui/input'
import Image from 'next/image'
import useOutsideClick from '@/lib/hooks/useOutsideClick'
import { updateDocument } from '@/lib/actions/room.actions'
import Loader from './Loader'
import ShareModal from './ShareModal'

const CollaborativeRoom = ({ roomId, roomMetadata, users, currentUserType, userId }: CollaborativeRoomProps) => {

  const [documentTitle, setDocumentTitle] = useState<string>(roomMetadata.title);
  const [editing, setEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const updateTitleHandler = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setLoading(true);

      if (documentTitle !== roomMetadata.title) {
        const updatedDocument = await updateDocument(roomId, documentTitle);
        if (updatedDocument) {
          setEditing(false);
        }
      }
      try {

      } catch (error) {

      }
      setLoading(false);
    }
  };

  const containerRef = useOutsideClick({
    onOutsideClick: () => {
      setEditing(false),
        (documentTitle !== roomMetadata.title) &&
        updateDocument(roomId, documentTitle)
    }
  });

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  return (
    <RoomProvider id={roomId}>
      <ClientSideSuspense fallback={<Loader />}>
        <div className="collaborative-room">
          <Header>
            <div ref={containerRef} className="flex w-fit items-center justify-center gap-2">
              {editing && !loading ?
                <Input type="text"
                  ref={inputRef}
                  value={documentTitle}
                  placeholder='Enter title'
                  onChange={(e) => { setDocumentTitle(e.target.value) }}
                  onKeyDown={updateTitleHandler}
                  disabled={!editing}
                  className='document-title-input'
                /> :

                <>
                  <p className="document-title">{documentTitle}</p>
                </>
              }

              {currentUserType === "editor" && !editing &&
                <Image
                  src={"/assets/icons/edit.svg"}
                  alt="edit"
                  width={24}
                  height={24}
                  onClick={() => setEditing(true)}
                  className='cursor-pointer'
                />
              }
              {currentUserType !== "editor" && !editing &&
                <p className='view-only-tag'>View only</p>
              }
              {loading && <p className='text-sm text-gray-400'>saving...</p>}
            </div>
            <div className="flex w-full flex-1 justify-end gap-2 sm:gap-2">
              <ActiveCollaborators />
              <ShareModal
                roomId={roomId}
                collaborators={users}
                creatorId={roomMetadata.creatorId}
                currentUserType={currentUserType}
              />
              <SignedOut>
                <SignInButton />
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>

          </Header>
          <Editor creatorId={roomMetadata.creatorId} userId={userId} roomId={roomId} currentUserType={currentUserType} />
        </div>
      </ClientSideSuspense>
    </RoomProvider>
  )
}

export default CollaborativeRoom