import { useEffect } from 'react'
import { useLoaderData } from 'react-router-dom'
import type { ThreadLoaderResult } from '../../loaders/threadLoader'
import { MessageStore, RepliesStore, useMessageStore } from '../../store'
import { useError } from '../../context/ErrorContext'
import { Card } from '../../common/components/ui/cards/Card'
import { ImageCardItem } from '../../common/components/ui/cards/ImageCardItem'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faQuoteLeft } from '@fortawesome/free-solid-svg-icons'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import type { Message } from '../../common/types/message'
import { Paginator } from '../../common/components/ui/paginator/Paginator'
import { MessageParent } from '../../common/components/ui/blockquotes/MessageParent'
import { useLocation } from 'react-router-dom'

export const ThreadPage = () => {
  const { hash } = useLocation();
  const { pagination, thread } = useLoaderData() as ThreadLoaderResult
  const { messagesByThread, loading, error } = useMessageStore();
  const { setError } = useError();

  useEffect(() => {
    MessageStore.fetch(thread.id, pagination.limit, pagination.current)
  }, [thread.id, pagination.current])

  useEffect(() => {
    if (error !== null) {
      setError(error);
    }
  }, [error, setError]);

  const messages = messagesByThread[thread.id] || [];
  const isActuallyLoading = loading[thread.id] || messages.length === 0;

  useEffect(() => {
    if (hash && messages.length > 0) {
      // Remove the '#' from the hash to get the ID
      const id = hash.replace('#', '');
      const element = document.getElementById(id);

      if (element) {
        // Delay slightly to ensure layout has settled
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [hash, messages]); // Trigger when hash changes OR when messages finally load

  // A small helper component
  const MessageItem = (msg: Message) => {

    const localParentMessageObject = messages.find(m => m.id === msg.parentId);

    return (<div id={`message-${msg.id}`}>
      <ImageCardItem
        image={msg.messageBy.avatar}
        aside={
          <div style={{ marginTop: '1.2em' }}>
            <p style={{ textAlign: 'center' }}>{msg.messageBy.author}</p>
            <p style={{ textAlign: 'center' }}>member</p>
          </div>
        }
        main={
          <div className="message-entry-post">
            <p>{msg.postedAt}</p>
            {msg.parentId !== null ? (
              <MessageParent
                threadId={thread.id}
                threadSlug={thread.slug}
                parentId={msg.parentId}
                localParent={localParentMessageObject}
              />
            ) : ''}
            <p>{msg.content}</p>
          </div>
        }
        meta={
          <div className='message-entry-footer'>
            <menu>
              <li>
                <button><FontAwesomeIcon icon={faPlus} /></button>
              </li>
              <li>
                <button><FontAwesomeIcon icon={faQuoteLeft} /><span>Reply</span></button>
              </li>
            </menu>
          </div>
        }
      />
    </div>)
  };

  return (
    <div className="layout">
      <div className="container full-width">

        {pagination.total > 1 && <Paginator
          entity={'threads'}
          totalPages={pagination.total}
          currentPage={pagination.current}
        />}

        {isActuallyLoading && messages.length === 0 ? (
          <p>Loading...</p>
        ) : (<>
          <Card
            header={<h2>{thread.title}</h2>}
            content={<MessageItem {...messages[0]} />}
            options={{ divided: { top: false, bottom: false } }}
          />
          {messages.slice(1).map((msg, index) => (
            <Card
              key={msg.id || index} // Always provide a unique key
              content={<MessageItem {...msg} />}
              options={{ divided: { top: false, bottom: false } }}
            />
          ))}
        </>)
        }
        {pagination.total > 1 && <Paginator
          entity={'threads'}
          totalPages={pagination.total}
          currentPage={pagination.current}
        />}
      </div>
    </div>
  )
}
