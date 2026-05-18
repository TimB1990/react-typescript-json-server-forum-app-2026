import { useEffect } from 'react'
import { ThreadStore, useThreadStore } from '../../store';
import { ThreadPreviewItem } from './ThreadPreviewItem';
import type { Category } from '../types/categories';
import type { Thread } from '../types/threads';

export const CategoryItem = (props: Category) => {
    const { id, name, description, messages, image } = props;

    // Pull the specific slices of state for this category ID
    const { threadsByCategory, loading, error } = useThreadStore();
    
    const threads = threadsByCategory[id] || [];
    const isLoading = loading[id] || false;

    useEffect(() => {
        ThreadStore.fetch(id, 5);
    }, [id]); // Add id to dependency array

    return (
        <div className='category'>
            {error && <p className='error'>{error}</p>}
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
            <div className='threads'>
                {isLoading && threads.length === 0 ? (
                    <p>Loading...</p>
                ) : (
                    threads.map((thread: Thread) => (
                        <ThreadPreviewItem key={`thread-${thread.id}`} {...thread} />
                    ))
                )}
            </div>
        </div>
    );
};
