import { CarouselCard } from './CarouselCard'
import { type Article } from '../../../types/article'

const articles: Article[] = []
const amount = 9;

for (let i = 1; i <= amount; i++) {
  articles.push({
    id: i,
    image: `https://picsum.photos/id/${i + 10}/250/275`,
    tags: [
      {
        name: "Tag",
        color: "blue"
      },
      {
        name: "Tag-2",
        color: "red"
      },
      {
        name: "Tag-3",
        color: "green"
      }
    ],
    author: "Somebody",
    meta: {
      date: `${i} may`,
      views: 100,
      comments: 15
    },
    title: `Article title ${i}`,
    content: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Similique, rem corrupti quas eum tempore officiis provident deleniti doloribus praesentium, ipsum dignissimos aut voluptatum sint natus. Quaerat nemo quae tenetur minima!"
  })
}

export const Carousel = () => {
  return (
    <>
      <div className="carousel-container">
        <div className="carousel-window">
          <div className="carousel-track">
            {articles.map((article, index) => (
              <CarouselCard key={`carousel-item-${index + 1}`} {...article} />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
