import { useEffect } from 'react'
import { useCategoryStore, CategoryStore } from '../../../store'
import { CategoryItem } from './CategoryItem';
import type { Category } from '../../../common/types/categories';
import type { Group } from '../../../common/types/group';
import { useError } from '../../../context/ErrorContext';

export const CategoriesList = (props: Group) => {

  const groupId = props.id;
  const { setError } = useError();

  // subscribe to the state
  const { categoriesByGroup, loading, error } = useCategoryStore();

  const categories = categoriesByGroup[groupId] || [];
  const isLoading = loading?.[groupId] || false;

  // rerender only if groupId changes
  useEffect(() => {
    CategoryStore.fetch(groupId)

    if (error !== null) {
      setError(error)
    }

  }, [groupId, error, setError])


  if (loading && categories.length === 0) return <p>Loading...</p>

  return (
    <>
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