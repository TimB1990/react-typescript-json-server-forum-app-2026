import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faQuoteLeft, faShare } from '@fortawesome/free-solid-svg-icons'
import type { Message } from '../../../types/message';
import { RepliesStore, MessageStore } from '../../../../store';
import { useEffect, useState } from 'react';

interface Props {
    threadId: number;
    threadSlug: string | undefined;
    parentId: number;
    localParent?: Message;
}

export const MessageParent = ({ threadId, threadSlug, parentId, localParent }: Props) => {
    // define the missing state
    const [atPage, setAtPage] = useState<number | null>(null);
    const [resolvedParent, setResolvedParent] = useState<Message | undefined>(localParent);

    useEffect(() => {

        const updateFromStore = async () => {
            const state = RepliesStore.getState();
            const threadReplies = state.repliesByThread[threadId] ?? []
            const reply = threadReplies.find(r => r.messageId === parentId)

            if (reply?.atPage) {
                setAtPage(reply.atPage)
            }

            if(!localParent){
                const msg = await MessageStore.getMessageById(parentId, threadId)
                if (msg) setResolvedParent(msg);
            }
        }

        // Check on mount
        updateFromStore();

        // subscribe to store so if 'atPage' changes from null to 5, component renders automatically
        const unsubscribe = RepliesStore.subscribe(updateFromStore)

        return () => {
            unsubscribe(); // Cleanup on unmount
        } 

    }, [threadId, parentId])

    // construct the dynamic URL, Default to page 1 if we don't know the page yet, or use a loading slug
    const pageNumber = atPage || 1;
    const parentUrl = `/threads/${threadSlug}/page/${pageNumber}#message-${parentId}`;

    // Use resolvedParent if localParent is missing
    const displayMessage = localParent || resolvedParent;

    return (
        <blockquote className="message-quote" cite={parentUrl}>
            <p>
                <span className="quote-meta-left">
                    <FontAwesomeIcon icon={faQuoteLeft} />
                    {/* Use localParent (the preview) if we have it */}
                    On {displayMessage?.postedAt || '...'}, {displayMessage?.messageBy?.author || 'Member'} said:
                </span>
                <a href={parentUrl}>
                    <FontAwesomeIcon icon={faShare} className="quote-share-icon" title="Jump to message" />
                </a>
            </p>
            <div className="quote-body">
                {displayMessage?.content || (
                    <span style={{ fontStyle: 'italic', color: '#888' }}>
                        {atPage ? `Message on page ${atPage}...` : 'Locating parent message...'}
                    </span>
                )}
            </div>
        </blockquote>
    )
}
