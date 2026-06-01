import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faQuoteLeft, faShare } from '@fortawesome/free-solid-svg-icons'
import type { Message } from '../../../types/message';

export const MessageParent = (props: { parentUrl: string, messageObject: Message | undefined }) => {

    const { parentUrl, messageObject } = props;

    return (
        <blockquote className="message-quote" cite={parentUrl}>
            <p>
                <span className="quote-meta-left">
                    <FontAwesomeIcon icon={faQuoteLeft} />
                    On {messageObject?.postedAt}, {messageObject?.messageBy.author} said:
                </span>
                <FontAwesomeIcon icon={faShare} className="quote-share-icon" />
            </p>
            <div className="quote-body">
                {messageObject?.content}
            </div>
        </blockquote>
    )
}
