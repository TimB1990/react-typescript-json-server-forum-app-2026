import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useLoaderData, useLocation, useNavigate, useRevalidator } from 'react-router-dom'
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
import parse from 'html-react-parser'
import type { Thread } from '../../common/types/threads'

// Define MessageItem OUTSIDE ThreadPage
interface MessageItemProps {
  msg: Message;
  thread: Thread;
  selectedQuoteIds: number[];
  messages: Message[];
  onToggleQuote: (id: number) => void;
  onSingleQuote: (id: number) => void;
}

const MessageItem = ({
  msg,
  thread,
  selectedQuoteIds,
  messages,
  onToggleQuote,
  onSingleQuote,
}: MessageItemProps) => {
  const localParentMessageObject = messages.find((m) => m.id === msg.parentId);
  const isSelected = selectedQuoteIds.includes(msg.id);

  // Fallback check to safely parse HTML string
  const rawContent = msg?.content ?? '';

  return (
    <div id={`message-${msg.id}`}>
      <ImageCardItem
        image={msg.messageBy?.avatar}
        aside={
          <AuthorInfo
            author={msg.messageBy?.author}
            totalUserMessageCount={msg.messageBy?.totalUserMessageCount}
          />
        }
        main={
          <div className="message-entry-post">
            <p>{msg.postedAt}</p>
            <p>ID: {msg.id}</p>
            {msg.parentId &&
              (Array.isArray(msg.parentId) ? msg.parentId : [msg.parentId]).map((id) => (
                <MessageParent
                  key={id}
                  threadId={thread.id}
                  threadSlug={thread.slug}
                  parentId={id}
                  localParent={localParentMessageObject}
                />
              ))}

            {/* Parse safely or render empty fallback */}
            {rawContent ? parse(String(rawContent)) : null}
          </div>
        }
        meta={
          <div className="message-entry-footer">
            <menu>
              <li>
                <button
                  title={isSelected ? 'Remove from multi-quote' : 'Add to multi-quote'}
                  onClick={() => onToggleQuote(msg.id)}
                  style={{ backgroundColor: isSelected ? 'rgba(255,165,0,0.3)' : undefined }}
                >
                  <FontAwesomeIcon icon={!isSelected ? faPlus : faCheck} />
                </button>
              </li>
              <li>
                <button onClick={() => onSingleQuote(msg.id)}>
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

export const ThreadPage = () => {
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  
  const { hash } = useLocation();
  const { pagination, thread } = useLoaderData() as ThreadLoaderResult
  const { messagesByThread, loading, error } = useMessageStore();
  const { setError } = useError();
  const [editorContent, setEditorContent] = useState<string>('');

  const lastPage = pagination.total || 1;


  // initialize selectedQuoteIds from sessionStorage
  const [selectedQuoteIds, setSelectedQuoteIds] = useState<(number)[]>(() => {
    try {
      const saved = sessionStorage.getItem(`quotes_thread_${thread.id}`)
      return saved ? JSON.parse(saved) : [];
    } catch {
      return []
    }
  });

  // persist selected quote ids, triggered on when selectedQuoteIds changes or thread id changes
  useEffect(() => {
    if (selectedQuoteIds.length > 0) {
      sessionStorage.setItem(`quotes_thread_${thread.id}`, JSON.stringify(selectedQuoteIds))
    } else {
      sessionStorage.removeItem(`quotes_thread_${thread.id}`)
    }
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

  // triggered when editorContent changes
  useEffect(() => {

    if (!editorContent) return;

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


  // Helper function to build HTML string for an array of message IDs
  const getQuotesHtml = async (messageIds: number[]): Promise<string> => {
    let combinedQuotes = '';
    for (const id of messageIds) {
      let targetMsg = messages.find(m => m.id === id);

      // If the message is on another page, fetch it
      if (!targetMsg) {
        targetMsg = await MessageStore.getMessageById(id, thread.id);
      }

      if (targetMsg) {
        combinedQuotes += buildQuoteHtml(targetMsg);
      }
    }
    return combinedQuotes;
  };

  // Helper to format quote HTML structure for the editor
  const buildQuoteHtml = (msg: Message): string => {
    // Construct the target jump URL for this message
    const parentUrl = `/threads/${thread.slug}/page/${pagination.current}#message-${msg.id}`;

    return renderToStaticMarkup(
      <BlockQuote
        messageId={msg.id}
        url={parentUrl} // Pass the URL
        postedAt={msg.postedAt}
        author={msg.messageBy?.author}
        content={msg.content}
        editor={false} // Allow renderToStaticMarkup to output the <a href="..."> jump link
      />
    ) + '<p><br></p>';
  };

  // Toggle multi-quote selection
  const handleMultiQuoteToggle = (messageId: number): void => {
    setSelectedQuoteIds(prev =>
      prev.includes(messageId)
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
  };

  // Single quote handler: Inserts directly without touching selectedQuoteIds
  const handleSingleQuoteInsert = async (messageId: number): Promise<void> => {
    const quoteHtml = await getQuotesHtml([messageId]);
    setEditorContent(prev => prev + quoteHtml);
    fallbackNotLoggedin();
  };

  // Multi-quote handler: Inserts queued messages and clears selection
  const handleMultiQuoteInsert = async (messageIds: number[]): Promise<void> => {
    const quoteHtml = await getQuotesHtml(messageIds);
    setEditorContent(prev => prev + quoteHtml);
    setSelectedQuoteIds([]); // Clear selection (hides floating toolbar & cleans sessionStorage)
    fallbackNotLoggedin();
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
            {messages[0] && (
              <Card
                header={<h2>{thread.title}</h2>}
                content={
                  <MessageItem
                    msg={messages[0]}
                    thread={thread}
                    selectedQuoteIds={selectedQuoteIds}
                    messages={messages}
                    onToggleQuote={handleMultiQuoteToggle}
                    onSingleQuote={handleSingleQuoteInsert}
                  />
                }
                options={{ divided: { top: false, bottom: false } }}
              />
            )}
            {messages.slice(1).map((msg, index) => (
              <Card
                key={msg.id || index}
                content={<MessageItem
                  msg={msg}
                  thread={thread}
                  selectedQuoteIds={selectedQuoteIds}
                  messages={messages}
                  onToggleQuote={handleMultiQuoteToggle}
                  onSingleQuote={handleSingleQuoteInsert}
                />}
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
                <FontAwesomeIcon onClick={() => setSelectedQuoteIds([])} icon={faXmark} />
              </button>
              {/* <button onClick={() => sessionStorage.clear()}>Clear session (DEBUG)</button> */}
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
        threadId={thread.id}
        categoryId={thread.categoryId as number}
        ref={editorRef}
        flash={isFlashing}
        editorContent={editorContent}
        setEditorContent={setEditorContent}
        onSuccess={(createdMessageId: number) => {
          setSelectedQuoteIds([]);
          revalidator.revalidate();
          navigate(`/threads/${thread.slug}/page/${lastPage}#message-${createdMessageId}`);
        }}
        onError={(error: string) => { console.error(error); }}
      />
    </div>
  )
}