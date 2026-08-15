import type { Message } from '../../../common/types/message';
import type { Thread } from '../../../common/types/threads';
import { ImageCardItem } from '../../../common/components/ui/cards/ImageCardItem';
import { AuthorInfo } from './AuthorInfo';
import { useAuth } from '../../../context/AuthContext';
import { MessageParent } from '../../../common/components/ui/blockquotes/MessageParent';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import parse from 'html-react-parser'
import { faCheck, faPlus, faQuoteLeft, faTrash } from '@fortawesome/free-solid-svg-icons';
import { MessageStore } from '../../../store';

// Define MessageItem OUTSIDE ThreadPage
interface MessageItemProps {
    msg: Message;
    thread: Thread;
    selectedQuoteIds: number[];
    messages: Message[];
    onToggleQuote: (id: number) => void;
    onSingleQuote: (id: number) => void;
    onError: (msg: string) => void; // <-- Add this
}

const handleDelete = async (
  messageId: number,
  threadId: number,
  onError: (msg: string) => void

) => {
  const success = await MessageStore.delete(messageId, threadId);

  if (!success) {
    // Retrieve store error or set a default fallback message
    const storeError = MessageStore.getState().error;
    onError(storeError || `Failed to delete message ${messageId}`);
  }
};

export const MessageItem = ({
  msg,
  thread,
  selectedQuoteIds,
  messages,
  onToggleQuote,
  onSingleQuote,
  onError
}: MessageItemProps) => {

  const { user } = useAuth();
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {msg.postedAt}

              {/* MAKE SURE THIS BECOMES ADMIN ONLY! */}
              {user && (
                <span className="trash"><FontAwesomeIcon onClick={async () => await handleDelete(msg.id, msg.threadId, onError)} icon={faTrash} /></span>
              )}
            </div>
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
