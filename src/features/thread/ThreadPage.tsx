import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useLoaderData, useLocation } from 'react-router-dom'
import type { ThreadLoaderResult } from '../../loaders/threadLoader'
import { MessageStore, useMessageStore } from '../../store'
import { useError } from '../../context/ErrorContext'
import { Card } from '../../common/components/ui/cards/Card'
import { ImageCardItem } from '../../common/components/ui/cards/ImageCardItem'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faQuoteLeft, faPlus, faCheck } from '@fortawesome/free-solid-svg-icons'
import type { Message } from '../../common/types/message'
import { Paginator } from '../../common/components/ui/paginator/Paginator'
import { MessageParent } from '../../common/components/ui/blockquotes/MessageParent'
import { AuthorInfo } from './components/AuthorInfo'
import { ForumPostForm } from './components/ForumPostForm'
import { faComments, faXmark } from '@fortawesome/free-solid-svg-icons'
import { BlockQuote } from '../../common/components/ui/blockquotes/BlockQuote'
import { renderToStaticMarkup } from 'react-dom/server'

export const ThreadPage = () => {
  const { hash } = useLocation();
  const { pagination, thread } = useLoaderData() as ThreadLoaderResult
  const { messagesByThread, loading, error } = useMessageStore();
  const { setError } = useError();

  const [editorContent, setEditorContent] = useState<string>('');

  // initialize selectedQuoteIds from sessionStorage
  const [selectedQuoteIds, setSelectedQuoteIds] = useState<(number)[]>(() => {
    try {
      const saved = sessionStorage.getItem(`quotes_thread_${thread.id}`)
      return saved ? JSON.parse(saved) : [];
    } catch {
      return []
    }
  });

  // persist selected quote ids
  useEffect(() => {
    sessionStorage.setItem(`quotes_thread_${thread.id}`, JSON.stringify(selectedQuoteIds))
  }, [selectedQuoteIds, thread.id])

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
      const id = hash.replace('#', '');
      const element = document.getElementById(id);

      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [hash, messages]);

  useEffect(() => {
    if(!editorContent){
      if(selectedQuoteIds.length > 0){
        emptyQuoteSelection()
      }

      return;
    }

    // parse editor HTML string to query blockquotes
    const parser = new DOMParser();
    const doc = parser.parseFromString(editorContent, 'text/html')
    const quoteElements = doc.querySelectorAll('[data-quote-id]')
    const activeIdsInEditor = Array.from(quoteElements).map(el => Number(el.getAttribute('data-quote-id'))).filter(id => !isNaN(id))

    // check if any tracked quote Ids were removed from the HTML
    const remainingTrackedIds = selectedQuoteIds.filter(id => activeIdsInEditor.includes(id))

    if (remainingTrackedIds.length !== selectedQuoteIds.length) {
    setSelectedQuoteIds(remainingTrackedIds);
  }
  }, [editorContent])

  const editorRef = useRef<HTMLDivElement>(null)
  const [isFlashing, setIsFlashing] = useState(false)

  const fallbackNotLoggedin = (): void => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth',
    });

    const handleScrollEnd = () => {
      setIsFlashing(true);
      window.removeEventListener('scrollend', handleScrollEnd);

      setTimeout(() => {
        setIsFlashing(false);
      }, 1200);
    };

    window.addEventListener('scrollend', handleScrollEnd, { once: true });
  };

  // Helper to format quote HTML structure
  const buildQuoteHtml = (msg: Message): string => {
    return renderToStaticMarkup(<BlockQuote
      messageId={msg.id}
      postedAt={msg.postedAt}
      author={msg.messageBy.author}
      content={msg.content}
    />) + '<p><br></p>'; // Add an empty paragraph after the blockquote so the cursor can sit below it
  };

  // Single quote handler
  const handleSingleQuote = (messageId: string | number): void => {
    const targetMsg = messages.find(m => m.id === messageId);
    if (!targetMsg) return;
    setEditorContent(prev => prev + buildQuoteHtml(targetMsg));
    fallbackNotLoggedin();
  };

  // Toggle multi-quote selection
  const handleMultiQuoteToggle = (messageId: number): void => {
    setSelectedQuoteIds(prev =>
      prev.includes(messageId)
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
  };

  // Multi-quote handler (inserts all queued messages at once)
  const handleMultiQuoteInsert = async (messageIds: (number)[]): Promise<void> => {
    let combinedQuotes = '';
    for (const id of messageIds) {
      let targetMsg = messages.find(m => m.id === id);

      // If the message is on another page, fetch it from store/API
      if (!targetMsg) {
        targetMsg = await MessageStore.getMessageById(id, thread.id)
      }

      if (targetMsg) {
        combinedQuotes += buildQuoteHtml(targetMsg);
      }
    }

    setEditorContent(prev => prev + combinedQuotes);
    emptyQuoteSelection();
    fallbackNotLoggedin();
  };

  // helper to empty quotes
  const emptyQuoteSelection = () => {
    setSelectedQuoteIds([])
    sessionStorage.removeItem(`quotes_thread_${thread.id}`)
  }

  // A small helper component
  const MessageItem = (msg: Message) => {
    const localParentMessageObject = messages.find(m => m.id === msg.parentId);
    const isSelected = selectedQuoteIds.includes(msg.id);

    return (
      <div id={`message-${msg.id}`}>
        <ImageCardItem
          image={msg.messageBy.avatar}
          aside={
            <AuthorInfo author={msg.messageBy.author} totalUserMessageCount={msg.messageBy.totalUserMessageCount} />
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
                  <button
                    title={isSelected ? "Remove from multi-quote" : "Add to multi-quote"}
                    onClick={() => handleMultiQuoteToggle(msg.id)}
                    style={{ backgroundColor: isSelected ? 'rgba(255,165,0,0.3)' : undefined }}
                  >
                    <FontAwesomeIcon icon={!isSelected ? faPlus : faCheck} />
                  </button>
                </li>
                <li>
                  <button onClick={() => handleSingleQuote(msg.id)}>
                    <FontAwesomeIcon icon={faQuoteLeft} />
                    <span>Quote</span>
                  </button>
                </li>
              </menu>
            </div>
          }
        />
      </div>
    );
  };

  return (
    <div className="layout">
      <div className="container full-width">
        {pagination.total > 1 && (
          <Paginator
            entity={'threads'}
            totalPages={pagination.total}
            currentPage={pagination.current}
          />
        )}

        {isActuallyLoading && messages.length === 0 ? (
          <p>Loading...</p>
        ) : (
          <>
            <Card
              header={<h2>{thread.title}</h2>}
              content={<MessageItem {...messages[0]} />}
              options={{ divided: { top: false, bottom: false } }}
            />
            {messages.slice(1).map((msg, index) => (
              <Card
                key={msg.id || index}
                content={<MessageItem {...msg} />}
                options={{ divided: { top: false, bottom: false } }}
              />
            ))}
          </>
        )}

        {/* Floating Multi-Quote Trigger Bar */}
        {selectedQuoteIds.length > 0 && (
          <div className="sticky-container" style={{ margin: '1em 0', textAlign: 'right' }}>
            <div className="quote-buttons">
              <button
                onClick={() => handleMultiQuoteInsert(selectedQuoteIds)}
              >
                <div className="quote-button__withIcon">
                  <FontAwesomeIcon icon={faComments} style={{ color: '#b9b9bb' }} />
                  Quote {selectedQuoteIds.length} {'post' + (selectedQuoteIds.length > 1 ? 's' : '')}
                </div>
              </button>
              <button className="quote-button__close">
                <FontAwesomeIcon onClick={() => emptyQuoteSelection()} icon={faXmark} />
              </button>
            </div>
          </div>
        )}

        {pagination.total > 1 && (
          <Paginator
            entity={'threads'}
            totalPages={pagination.total}
            currentPage={pagination.current}
          />
        )}
      </div>

      {/* text editor */}
      <ForumPostForm
        ref={editorRef}
        flash={isFlashing}
        editorContent={editorContent}
        setEditorContent={setEditorContent}
      />
    </div>
  )
}