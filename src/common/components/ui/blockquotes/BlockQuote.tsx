import { faQuoteLeft, faShare } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import parse from 'html-react-parser'

interface QuoteProps {
    messageId: number,
    url?: string
    postedAt?: string
    author?: string
    content: string
    pageRef?: number | null
    editor: boolean
}

export const BlockQuote: React.FC<QuoteProps> = ({ 
  editor = false, 
  messageId, 
  postedAt, 
  author, 
  content, 
  pageRef, 
  url = null 
}) => {
  return (
    <blockquote className="message-quote" data-quote-id={messageId} cite={url || ''}>
      <p>
        <span className="quote-meta-left">
          <FontAwesomeIcon icon={faQuoteLeft} />
          On {postedAt || '...'}, {author || 'Member'} said:
        </span>
        
        {/* Render share link if URL is provided */}
        {url && (
          <a href={url}>
            <FontAwesomeIcon icon={faShare} className="quote-share-icon" title="Jump to message" />
          </a>
        )}
      </p>
      <div className="quote-body">
        {parse(content)}
      </div>
    </blockquote>
  );
};
