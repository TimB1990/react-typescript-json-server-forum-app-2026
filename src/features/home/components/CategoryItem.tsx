import { useEffect } from 'react'
import { ThreadStore, useThreadStore } from '../../../store';
import { ThreadPreviewItem } from './ThreadPreviewItem';
import type { Category } from '../../../common/types/categories';
import type { Thread } from '../../../common/types/threads';
import { useError } from '../../../context/ErrorContext';
import { Link } from 'react-router-dom';

export const CategoryItem = (props: Category) => {
    const { id, name, slug, description, messages, image } = props;

    // Pull the specific slices of state for this category ID
    const { threadsByCategory, loading, error } = useThreadStore();

    const threads = threadsByCategory[id] || [];
    const isLoading = loading[id] || false;

    const { setError } = useError();

    useEffect(() => {
        ThreadStore.fetch(id, 5);
    }, [id]);

    if (error !== null) {
        setError(error)
    }

    return (
        <div className='category'>
            {error && <p className='error'>{error}</p>}
            <Link className="item-link" to={`/categories/${slug}`}>
                <div className='info'>
                    <div className="image-container">
                        <img src={image} alt="" />
                    </div>
                    <div className='info-text'>
                        <h3>{name}</h3>
                        <p>{description}</p>
                        <p>{messages} messages</p>
                    </div>
                </div>
            </Link>
            <div className='threads'>
                {isLoading && threads.length === 0 ? (
                    <p>Loading...</p>
                ) : (
                    threads.map((thread: Thread) => (
                        <ThreadPreviewItem key={`thread-${thread.id}`} {...thread} showAuthorInfo='last' />
                    ))
                )}
            </div>
        </div>
    );
};
