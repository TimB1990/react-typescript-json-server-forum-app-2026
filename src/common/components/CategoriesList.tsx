import { useEffect } from 'react'
import { useCategoryStore, CategoryStore } from '../../store'
import { CategoryItem } from './CategoryItem';
import type { Category } from '../types/categories';
import type { Group } from '../types/group';

export const CategoriesList = (props :Group) => {

  const groupId = props.id;

  // subscribe to the state
  const { categoriesByGroup, loading, error } = useCategoryStore();

  const categories = categoriesByGroup[groupId] || [];
  const isLoading = loading?.[groupId] || false;

  // rerender only if groupId changes
  useEffect(() => {
    CategoryStore.fetch(groupId)
  }, [groupId])

  if (loading && categories.length === 0) return <p>Loading...</p>

  return (
    <>
      {error && <p className='error'>{error}</p>}
      {isLoading && categories.length === 0 ? (
        <p>Loading...</p>
      ) : (
        categories.map((category: Category) => (
          <CategoryItem key={`category-${category.id}`} {...category} />
        ))
      )}

    </>
  )
}