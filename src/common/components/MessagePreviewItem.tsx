import React from 'react'
import type { Message } from '../types/message'

export const MessagePreviewItem = (props: Message) => {

    const {messageBy, threadInfo, content, postedAt } = props;
    
  return (
    <div>
        <div className="image-container">
            <img src={messageBy.avatar} alt="" />
        </div>
        <div>
            <h2>{threadInfo?.title}</h2>
            <p>{content}</p>
            <p>By {messageBy.author}, - posted: {postedAt}</p>
        </div>
    </div>
  )
}
