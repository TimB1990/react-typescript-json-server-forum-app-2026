import { useEffect } from 'react'
import './App.css'
import { CategoriesList } from './common/components/CategoriesList'
import { useGroupStore, GroupStore, ThreadStore, useThreadStore, useMessageStore, MessageStore } from './store'
import { type Group } from './common/types/group'
import { GroupItem } from './common/components/GroupItem'
import { type Thread } from './common/types/threads'
import { ThreadPreviewItem } from './common/components/ThreadPreviewItem'
import type { Message } from './common/types/message'

// font awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRightToBracket, faUserPlus } from '@fortawesome/free-solid-svg-icons';

// error context
import { useError } from './context/ErrorContext'
import { ErrorBanner } from './common/components/ErrorBanner'
import { MessagePreviewItem } from './common/components/MessagePreviewItem'
import { Card } from './common/components/Card'
import { RegisterLoginButtons } from './common/components/RegisterLoginButtons'

function App() {

  const { groups, loading, error } = useGroupStore();
  const { threadsByCategory: threads } = useThreadStore();
  const { messagesByThread: messages } = useMessageStore();

  const latestThreads = threads?.["all"] || [];
  const latestMessages = messages?.["all"] || [];

  const { setError } = useError()

  useEffect(() => {
    GroupStore.fetch()
    ThreadStore.fetch(null, 3)
    MessageStore.fetchLatestOverview(3)
  }, [])

  if (error !== null) {
    setError(error)
  }

  return (
    <>
      <header>Test</header>
      <main className='layout'>
        <ErrorBanner />
        <div className="container">
          {loading && groups.length === 0 ? (
            <p>Loading...</p>
          ) : (
            groups.map((group: Group) => (
              <GroupItem key={`group-${group.id}`} {...group}>
                <CategoriesList {...group} />
              </GroupItem>
            ))
          )}
        </div>

        <div className="container">
          <Card
            header={<h2>Talk with us!</h2>}
            content={<>Lorem ipsum dolor sit amet consectetur adipisicing elit. Sit, odio. Aspernatur, saepe eum animi in hic fugit ullam maxime quam earum.</>}
            footer={<RegisterLoginButtons />}
            options={{ divided: { top: true, bottom: true } }}
          />

          <Card
            header={<h2>Latest topics</h2>}
            content={<div className="threads">
              {latestThreads.map((thread: Thread) => (
                <ThreadPreviewItem key={`latest-thread-${thread.id}`} {...thread} iconStats={true} />
              ))}
            </div>}
            options={{ noPadding: true, divided: { top: true, bottom: false } }}
          />

          <Card
            header={<h2>Welcome at our forum!</h2>}
            content={<>Lorem ipsum dolor sit amet consectetur adipisicing elit. Corrupti, omnis sit rerum facere magnam illum, officiis odio beatae neque illo voluptatibus? Iste, minima assumenda porro explicabo neque atque! Sequi.</>}
            options={{ divided: { top: true, bottom: false } }}
          />

          <Card
            header={<h2>Latest Replies</h2>}
            content={<div className="messages">
              {latestMessages.map((message: Message) => (
                <MessagePreviewItem key={`latest-message-${message.id}`} {...message} />
              ))}
            </div>}
            options={{ noPadding: true, divided: { top: true, bottom: false } }}
          />
        </div>
      </main>
      <footer>test</footer>
    </>

  )
}

export default App
