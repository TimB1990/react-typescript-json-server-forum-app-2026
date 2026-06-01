import { useEffect } from 'react'
import { useLoaderData } from 'react-router-dom'
import type { ThreadLoaderResult } from '../../loaders/threadLoader'
import { MessageStore, useMessageStore } from '../../store'
import { useError } from '../../context/ErrorContext'
import { Card } from '../../common/components/ui/cards/Card'
import { ImageCardItem } from '../../common/components/ui/cards/ImageCardItem'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faQuoteLeft } from '@fortawesome/free-solid-svg-icons'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import type { Message } from '../../common/types/message'
import { Paginator } from '../../common/components/ui/paginator/Paginator'
import { MessageParent } from '../../common/components/ui/blockquotes/MessageParent'

export const ThreadPage = () => {

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

  // if (!isActuallyLoading) console.log('messages: ', messages)

  console.log('messages: ', messages)

  // A small helper component
  const MessageItem = (msg: Message) => {

    const parentMessageObject = messages.find(m => m.id === msg.parentId);

    return (<ImageCardItem
      image={msg.messageBy.avatar}
      aside={
        <div style={{ marginTop: '1.2em' }}>
          <p style={{ textAlign: 'center' }}>{msg.messageBy.author}</p>
          <p style={{ textAlign: 'center' }}>member</p>
        </div>
      }
      main={
        <div className="message-entry-post">
          {msg.parentId !== null && parentMessageObject !== undefined ? (
            <MessageParent
              parentUrl={`https://localhost:5001/messages/${msg.parentId}`}
              messageObject={parentMessageObject}
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
    />)
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
