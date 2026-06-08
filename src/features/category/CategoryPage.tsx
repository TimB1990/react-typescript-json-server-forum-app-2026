import { useLoaderData } from 'react-router-dom'
import type { CategoryLoaderResult } from '../../loaders/categoryLoader';
import { Card } from '../../common/components/ui/cards/Card';
import { ThreadStore, useThreadStore } from '../../store';
import { useError } from '../../context/ErrorContext';
import { useEffect } from 'react';
import { ThreadPreviewItem } from '../home/components/ThreadPreviewItem';
import { Paginator } from '../../common/components/ui/paginator/Paginator';

export const CategoryPage = () => {

  const { pagination, category } = useLoaderData() as CategoryLoaderResult;
  const { threadsByCategory, loading, error } = useThreadStore();
  const { setError } = useError();

  useEffect(() => {
    ThreadStore.fetch(category.id, pagination.limit, pagination.current);
  }, [category.id, pagination.current]); // pagination.current is the key trigger

  useEffect(() => {
    if (error !== null) {
      setError(error);
    }
  }, [error, setError]);

  const threads = threadsByCategory[category.id] || [];
  const isActuallyLoading = loading[category.id] || threads.length === 0;

  return (
    <div className="layout">
      <div className='container full-width'>
        <Card
          header={<h1>{category.name}</h1>}
          content={
            <div style={{padding: 'clamp(1em, 2vw, 1.25em'}}>{category.description}</div>
          }
        />

        <Card
          header={<Paginator 
            entity={'categories'} 
            totalPages={pagination.total} 
            currentPage={pagination.current} 
          />}

          content={isActuallyLoading ? (
            <p>Loading...</p>
          ) : (
            threads.map((thread) => (
              <ThreadPreviewItem 
                key={`${thread.id}-p${pagination.current}`}
                {...thread} 
                iconStats={false} 
                showLatest={true} 
                showAuthorInfo='first' 
              />
            ))
          )}
          options={{noPadding: true}}
        />
      </div>
    </div>
  )
}
