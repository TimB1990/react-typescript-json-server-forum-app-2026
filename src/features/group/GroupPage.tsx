import { Link, useLoaderData } from "react-router-dom"
import { type GroupLoaderResult } from "../../loaders/groupLoader"
import { Card } from "../../common/components/ui/cards/Card"
import { useCategoryStore, CategoryStore, useThreadStore, ThreadStore } from "../../store"
import { useEffect } from "react"
import { useError } from "../../context/ErrorContext"
import { ImageCardItem } from "../../common/components/ui/cards/ImageCardItem"
import { Statistic } from "../home/components/Statistic"
import dayjs from "dayjs" // Added dayjs for timestamps

export const GroupPage = () => {
  const { group } = useLoaderData() as GroupLoaderResult
  if (!group) {
    return <p>Group not found.</p>
  }

  const groupId = group.id;
  const { setError } = useError();

  // subscribe to the state
  const { categoriesByGroup, loading: categoriesLoading, error } = useCategoryStore();
  const { threadsByCategory, loading: threadsLoading, totalCount: totalThreads } = useThreadStore();

  const categories = categoriesByGroup[groupId] || [];
  const isCategoriesLoading = categoriesLoading?.[groupId] || false;

  useEffect(() => {
    CategoryStore.fetch(groupId)

    if (error !== null) {
      setError(error)
    }

  }, [groupId, error, setError])

  // Dependent Fetching: trigger thread fetching once categories are available
  useEffect(() => {
    if (categories.length > 0) {
      categories.forEach((category) => {
        ThreadStore.fetch(category.id, 1)
      })
    }
  }, [categories])

  if (isCategoriesLoading && categories.length === 0) return <p>Loading...</p>

  return (
    <div className="layout">
      <div className="container full-width">
        <Card
          header={<h1>{group.title}</h1>}
          content={
            <div style={{ padding: 'clamp(1em, 2vw, 1.25em' }}>{group.description}</div>
          }
        />

        <Card
          header={<h2>Categories</h2>}
          content={
            categories.map((category) => {
              // Extract the single latest thread for this specific category from our store
              const categoryThreads = threadsByCategory[category.id] || [];
              const latestThread = categoryThreads[0]; // limit=1 guarantees index 0 is our latest
              const isThreadLoading = threadsLoading?.[category.id];

              return (
                <Link
                  to={`/categories/${category.slug}`}
                  className="group-category-item"
                  key={`category-item-${category.id}`}
                >
                  {/* Left: Category info */}
                  <div style={{ flex: 2 }}>
                    <ImageCardItem
                      image={`../${category.image}`}
                      main={
                        <div>
                          <p style={{fontWeight: "bold"}} className='inline-link'>{category.name}</p>
                          <p>{category.description}</p>
                        </div>
                      }
                      options={{ contentDirection: "horizontal", thumbImage: true, imageShape: "square", applyBorder: false }}
                    />
                  </div>

                  {/* Middle: Total Messages for this specific latest thread */}
                  <div style={{ flex: 1 }}>
                    {isThreadLoading ? (
                      <p>...</p>
                    ) : (
                      // change hardcoded test 10
                      <Statistic
                        value={latestThread ? category.messages : 0}
                        subject="messages"
                      />
                    )}
                  </div>
                  {/* Right: Latest Thread Title and Author */}
                  <div style={{ flex: 2 }}>
                    {isThreadLoading ? (
                      <p>Loading latest thread...</p>
                    ) : latestThread ? (
                      <ImageCardItem
                        image={latestThread.lastMessageBy?.avatar}
                        main={
                          <div>
                            <p style={{ margin: '2px 0' }}>
                              <Link className="inline-link" to={`/threads/${latestThread.slug}`}>
                                {latestThread.title}
                              </Link>
                            </p>
                            <p style={{ fontSize: '0.75rem', color: '#888', margin: 0 }}>
                              By {latestThread.lastMessageBy?.author || "Unknown"} • {latestThread.lastMessageBy?.postedAt}
                            </p>
                          </div>
                        }
                        options={{ contentDirection: "horizontal", thumbImage: true, imageShape: "circle", applyBorder: false }}
                      />
                    ) : (
                      <p style={{ fontSize: '0.85rem', color: '#999' }}>No threads yet</p>
                    )}
                  </div>
                </Link>

              )
            })
          }
          options={{ divided: { top: true, bottom: false } }}
        />
      </div>
    </div>
  )
}
