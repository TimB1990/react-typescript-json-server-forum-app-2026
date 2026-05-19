import React from 'react'
import type { Thread } from '../../../common/types/threads'
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment } from '@fortawesome/free-solid-svg-icons';

export const ThreadPreviewItem = (props: Thread) => {

  const { id, title, lastMessageBy, messages, iconStats } = props;

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

  return (
    <Link to="" className='item-link' onClick={handleClick}>
      <div className='thread-item'>
        <div className='info-container'>
          <div className='avatar-container small'>
            <img src={lastMessageBy.avatar} alt="" />
          </div>
          <div className='content'>
            <p><strong>{title}</strong></p>
            <p className='message-by'>
              <span>By {lastMessageBy.author} - {lastMessageBy.postedAt}</span>
            </p>
          </div>
        </div>
        <div className='count'>
          {iconStats ? (
            <>
              <FontAwesomeIcon icon={faComment} /> {comments}
            </>
          ) : (
            <span>{comments} comments</span>
          )}
        </div>
      </div>
    </Link>
  )
}
