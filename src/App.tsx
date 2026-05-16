import { useEffect, useState } from 'react'
import './App.css'
import { CategoriesList } from './common/components/CategoriesList'
import { useGroupStore, GroupStore } from './store'
import { type Group } from './common/types/group'
import { GroupItem } from './common/components/GroupItem'

function App() {

  const { groups, loading, error } = useGroupStore();

  useEffect(() => {
    GroupStore.fetch()
  }, [])

  return (
    <>
      <div className="container">
        {error && <p className='error'>{error}</p>}
        {loading && groups.length === 0 ? (
          <p>Loading...</p>
        ) : (
          groups.map((group: Group) => (
            <GroupItem key={`group-${group.id}`} {...group}>
              <CategoriesList {...group} />    
            </GroupItem>
          ))
        )}
      </div>
    </>

  )
}

export default App
