import { useEffect } from 'react'
import { CategoriesList } from './components/CategoriesList'
import { useGroupStore, GroupStore, ThreadStore, useThreadStore, useMessageStore, MessageStore, useUserStore, UserStore } from '../../store'
import { type Group } from '../../common/types/group'
import { GroupItem } from './components/GroupItem'
import { type Thread } from '../../common/types/threads'
import { ThreadPreviewItem } from './components/ThreadPreviewItem'
import type { Message } from '../../common/types/message'

// error context
import { useError } from '../../context/ErrorContext'
import { ErrorBanner } from '../../common/components/layout/ErrorBanner'

// UI components
import { MessagePreviewItem } from './components/MessagePreviewItem'
import { Card } from '../../common/components/ui/cards/Card'
import { RegisterLoginButtons } from './components/RegisterLoginButtons'
import { Carousel } from '../../common/components/ui/news-carousel/Carousel'
import { Statistic } from './components/Statistic'
import { ImageCardItem } from '../../common/components/ui/cards/ImageCardItem'

// Skeletons
import { GroupItemSkeleton } from '../../common/components/ui/skeleton/GroupItemSkeleton'
import { ThreadListSkeleton } from '../../common/components/ui/skeleton/ThreadListSkeleton'

// misc
import dayjs from 'dayjs'
import { formatCompactNumber } from '../../common/utils/compactNumber'

// auth
import { useAuth } from '../../context/AuthContext'
import type { User } from '../../common/types/users'

export const Home = () => {

  const { user: rawUser } = useAuth();
  const theUser = rawUser as User | null;

  const { groups = [], loading: groupsLoading, error } = useGroupStore();
  const { threadsByCategory: threads, loading: threadsLoading, totalCount: totalThreads } = useThreadStore();
  const { messagesByThread: messages, totalCount: totalMessages } = useMessageStore();
  const { totalCount: totalUsers, users: latestUsers } = useUserStore();

  // Evaluate loading flags seperatly for skeletons
  const isThreadsLoading = threadsLoading['all'] ?? true
  const latestThreads = threads?.["all"] ?? [];
  const latestMessages = messages?.["all"] ?? [];
  const { setError } = useError()

  useEffect(() => {
    GroupStore.fetch()
    ThreadStore.fetch(null, 3)
    ThreadStore.countTotal()
    MessageStore.fetchLatestOverview(3)
    MessageStore.countTotal()
    UserStore.countTotal()
    UserStore.fetch(1)

    if (error !== null) {
      setError(error)
    }

  }, [error, setError])

  return (
    <>
      {error && (<ErrorBanner />)}
      <main className='layout'>

        <div className="container first">

          <Card
            header={<h2>Latest News</h2>}
            content={<Carousel />}
            options={{ divided: { top: true, bottom: false }, noPadding: true }}
          />

          {groupsLoading && groups.length === 0 ? (
            <>
              <GroupItemSkeleton />
              <GroupItemSkeleton />
            </>
          ) : (
            groups?.map((group: Group) => (
              <GroupItem key={`group-${group.id}`} {...group}>
                <CategoriesList {...group} />
              </GroupItem>
            ))
          )}
        </div>

        <div className="container second">
          {!theUser && (
            <Card
              header={<h2>Talk with us!</h2>}
              content={<div style={{ padding: 'clamp(1em, 2vw, 1.25em)' }}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Sit, odio. Aspernatur, saepe eum animi in hic fugit ullam maxime quam earum.</div>}
              footer={<RegisterLoginButtons />}
              options={{ divided: { top: true, bottom: true } }}
            />
          )}

          {/* Latest threads skeleton */}
          {isThreadsLoading ? (
            <ThreadListSkeleton count={3} />
          ) : (
            <Card
              // not working because the pagination is not OK
              header={<h2>Latest topics</h2>}
              content={
                <div className="threads">
                  {latestThreads.map((thread: Thread) => (
                    <ThreadPreviewItem
                      key={`latest-thread-${thread.id}`}
                      {...thread}
                      iconStats={true}
                      showAuthorInfo='first'
                    />
                  ))}
                </div>
              }
              options={{ noPadding: true, divided: { top: true, bottom: false } }}
            />
          )}

          <Card
            header={<h2>Welcome at our forum!</h2>}
            content={<div style={{ padding: 'clamp(1em, 2vw, 1.25em)' }}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Corrupti, omnis sit rerum facere magnam illum, officiis odio beatae neque illo voluptatibus? Iste, minima assumenda porro explicabo neque atque! Sequi.</div>}
            options={{ divided: { top: true, bottom: false } }}
          />

          {/* Latest Replies */}
          <Card
            header={<>
              <h2>Latest Replies</h2>
            </>}
            content={<div className="messages">
              {latestMessages.map((message: Message) => (
                <MessagePreviewItem key={`latest-message-${message.id}`} {...message} />
              ))}
            </div>}
            options={{ noPadding: true, divided: { top: true, bottom: false } }}
          />

          {/* Forum Stats */}
          <Card
            header={<h2>Forum stats</h2>}
            content={<>
              <Statistic value={formatCompactNumber(totalThreads)} subject={"Total amount of subjects"} />
              <Statistic value={formatCompactNumber(totalMessages)} subject={"Total amount of messages"} />
            </>}
            options={{ noPadding: true, divided: { top: true, bottom: false }, allowHorizontal: true }}
          />

          {/* Member Stats */}
          <Card
            header={<h2>Member stats</h2>}
            content={<>
              <Statistic value={formatCompactNumber(totalUsers)} subject={"Total amount of members"} />
              {/* Guard check: Only render the member info if the data is actually there */}
              {latestUsers && latestUsers.length > 0 ? (
                <ImageCardItem
                  image={latestUsers[0].avatar}
                  main={
                    <>
                      <p><strong>{latestUsers[0].username}</strong></p>
                      <p>Newest member - {dayjs(latestUsers[0].createdAt).fromNow()}</p>
                    </>
                  }
                  options={{ contentDirection: "horizontal", centered: true, thumbImage: true, imageShape: "circle" }}
                />
              ) : (
                // fallback
                <p>Loading newest member...</p>
              )}
            </>}
            options={{ noPadding: true, divided: { top: true, bottom: false }, allowHorizontal: true }}
          />
        </div>
      </main>
    </>
  )
}
