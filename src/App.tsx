import { useEffect, useState } from 'react'
import './App.css'
import { CategoriesList } from './common/components/CategoriesList'
import { useGroupStore, GroupStore, ThreadStore, useThreadStore } from './store'
import { type Group } from './common/types/group'
import { GroupItem } from './common/components/GroupItem'
import { type Thread } from './common/types/threads'
import { ThreadPreviewItem } from './common/components/ThreadPreviewItem'

// font awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRightToBracket, faUserPlus } from '@fortawesome/free-solid-svg-icons';

function App() {

  const { groups, loading, error } = useGroupStore();
  const { threadsByCategory: threads } = useThreadStore();

  const latestThreads = threads?.["all"] || [];


  useEffect(() => {
    GroupStore.fetch()
    ThreadStore.fetch(null, 3)
  }, [])

  return (
    <main>
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

      <div className="container">
        <div className="card">
          <div className="card-header">
            <div className="card-header-info">
              <h1>Talk with us!</h1>
              <h3>Lorem ipsum dolor sit amet consectetur adipisicing elit. Sit, odio. Aspernatur, saepe eum animi in hic fugit ullam maxime quam earum.</h3>
            </div>
          </div>
          <div className="card-footer">
            <button className='btn-default orange'>
              <FontAwesomeIcon icon={faUserPlus} aria-hidden="true" />
              <span>Sign Up</span>
            </button>
            <button className='btn-default'>
              <FontAwesomeIcon icon={faArrowRightToBracket} aria-hidden="true" />
              <span>Sign in</span>
            </button>
          </div>
        </div>
        <div className="card">
          <div className="card-header border">
            <h2>Latest topics</h2>
          </div>
          <div className="threads">
            {latestThreads.map((thread: Thread) => (
              <ThreadPreviewItem key={`latest-thread-${thread.id}`} {...thread} />
            ))
            }
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <div className="card-header-info">
              <h1>Welcome at our forum!</h1>
              <h3>Lorem ipsum dolor sit amet consectetur adipisicing elit. Corrupti, omnis sit rerum facere magnam illum, officiis odio beatae neque illo voluptatibus? Iste, minima assumenda porro explicabo neque atque! Sequi</h3>
            </div>
          </div>
        </div>
        <div className="card">
          Latest replies:
        </div>
      </div>
    </main>


  )
}

export default App
