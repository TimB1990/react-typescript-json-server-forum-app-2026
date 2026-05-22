import React from 'react'
import { useLoaderData, useParams } from 'react-router-dom'
import type { CategoryLoaderResult } from '../../loaders/categoryLoader';
import { Card } from '../../common/components/ui/cards/Card';

type CategoryRouteParams = {
  slug: string;
}

export const CategoryPage = () => {

  const { slug } = useParams<CategoryRouteParams>();
  const { category } = useLoaderData() as CategoryLoaderResult

  return (
    <div className="layout">
      <div className='container'>
        <Card
          content={<>
            <h1>{category.name}</h1>
            <p>{category.description}</p>
          </>}
        />
      </div>
    </div>
  )
}
