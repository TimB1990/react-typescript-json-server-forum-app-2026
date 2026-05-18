import type { Message } from '../types/message'
import { Link } from 'react-router-dom';

export const MessagePreviewItem = (props: Message) => {

    const { messageBy, threadInfo, content, postedAt } = props;

    return (
        <Link to='' className='item-link'>
            <div className='message preview'>
                <div className="message-side">
                    <div className="avatar-container small">
                        <img src={messageBy.avatar} alt="" />
                    </div>
                </div>
                <div className='message-body'>
                    <p><strong>{threadInfo?.title}</strong></p>
                    <p className='message-content'>{content}</p>
                    <p className='message-by'>
                        <span>By {messageBy.author},</span>
                        <span style={{color: "rgb(115, 115, 115)"}}>{postedAt}</span>
                    </p>
                </div>
            </div>
        </Link>

    )
}
