import { useLoaderData } from 'react-router-dom'
import type { CategoryLoaderResult } from '../../loaders/categoryLoader';
import { Card } from '../../common/components/ui/cards/Card';
import { Paginator } from '../../common/components/ui/paginator/paginator';

export const CategoryPage = () => {

  const data = useLoaderData() as CategoryLoaderResult

  const { pagination, category, threads } = data;

  return (
    <div className="layout">
      <div className='container full-width'>
        <Card
          header={<h1>{category.name}</h1>}
          content={
            <p>{category.description}</p>
          }
        />

        <Card
          header={<Paginator entity={'categories'} totalPages={pagination.total} currentPage={pagination.current} />}
          content={'test'}
        />
      </div>

      {threads.data.map((thread) => (<div>{JSON.stringify(thread)}</div>))}
    </div>
  )
}
