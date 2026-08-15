import { ImageCardItem } from '../../../common/components/ui/cards/ImageCardItem';
import type { Message } from '../../../common/types/message'
import { Link } from 'react-router-dom';
import parse from 'html-react-parser'

export const MessagePreviewItem = (props: Message) => {

    const { messageBy, threadInfo, content, postedAt } = props;

    return (
        <Link to='' className='item-link'>
            <ImageCardItem
                image={messageBy.avatar}
                main={
                    <>
                        <p><strong>{threadInfo?.title}</strong></p>
                        <p className='message-content'>{parse(content)}</p>
                    </>
                }
                meta={
                    <p>
                        By {messageBy.author} - {postedAt}
                    </p>
                }
                options={{
                    thumbImage: true,
                    imageShape: "circle"
                }}
            />
        </Link>

    )
}
