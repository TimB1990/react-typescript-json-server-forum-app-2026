import { faQuoteLeft, faShare } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'

interface QuoteProps {
    messageId: number,
    url?: string
    postedAt?: string
    author?: string
    content?: string
    pageRef?: number | null
    editor: boolean
}

export const BlockQuote: React.FC<QuoteProps> = ({ editor = false, messageId, postedAt, author, content, pageRef, url = null }) => {
    return (
        <blockquote className="message-quote" data-quote-id={messageId} cite={url || ''}>
            <p>
                <span className="quote-meta-left">
                    <FontAwesomeIcon icon={faQuoteLeft} />
                    {/* Use localParent (the preview) if we have it */}
                    On {postedAt || '...'}, {author || 'Member'} said:
                </span>
                {url && !editor && (<a href={url}>
                    <FontAwesomeIcon icon={faShare} className="quote-share-icon" title="Jump to message" />
                </a>)}
            </p>
            <div className="quote-body">
                {content || (
                    <span style={{ fontStyle: 'italic', color: '#888' }}>
                        {pageRef ? `Message on page ${pageRef}...` : 'Locating parent message...'}
                    </span>
                )}
            </div>
        </blockquote>
    )
}
