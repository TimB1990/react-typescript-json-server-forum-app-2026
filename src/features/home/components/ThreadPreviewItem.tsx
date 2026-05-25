import React from 'react'
import type { Thread } from '../../../common/types/threads'
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment } from '@fortawesome/free-solid-svg-icons';
import { ImageCardItem } from '../../../common/components/ui/cards/ImageCardItem';

type ThreadPreviewItemProps = Thread & {
  showAuthorInfo: 'first' | 'last'
  tags?: React.ReactNode
  messages?: number;
  iconStats?: boolean;
}

export const ThreadPreviewItem = (props: ThreadPreviewItemProps) => {

  const { id, title, lastMessageBy, firstMessageBy, messages, iconStats, showAuthorInfo, tags } = props;

  const comments = messages !== undefined ? messages - 1 : 0;

  const slugify = (text: string) => {
    return text
      .toString()                           // Ensure it's a string
      .normalize('NFD')                     // Separate accents from letters
      .replace(/[\u0300-\u036f]/g, '')      // Remove the accent marks
      .toLowerCase()                        // Convert to lowercase
      .trim()                               // Remove whitespace from both ends
      .replace(/\s+/g, '-')                 // Replace spaces with -
      .replace(/[^\w-]+/g, '')              // Remove all non-word chars
      .replace(/--+/g, '-');                // Replace multiple - with single -
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    console.log(`Thread ${id}-${slugify(title)} clicked!`);
  }

  const displayMessage = showAuthorInfo === 'first' ? firstMessageBy : lastMessageBy;

  const metaContent = (
  <div className="meta-container">
    {iconStats ? (
      <p><FontAwesomeIcon icon={faComment} /> {comments}</p>
    ) : (
      <p>{comments} comments</p>
    )}
  </div>
);

  return (
    <Link to="" className='item-link' onClick={handleClick}>
      <ImageCardItem
        image={lastMessageBy.avatar}
        main={
          <>
            <div style={{ display: 'flex' }}>
              <p><strong>{title}</strong></p>
              <div style={{display: 'flex' }}>
                {tags}
              </div>
            </div>
            <p className='message-by'>
              {showAuthorInfo === 'first' ? 'By ' : 'Last message by'} 
              {displayMessage.author} - {displayMessage.postedAt}
            </p>
          </>
        }
        meta={metaContent}
        options={{
          contentDirection: "horizontal",
          thumbImage: true,
          imageShape: "circle",
          applyBorder: true
        }}
      />
    </Link>
  )
}
