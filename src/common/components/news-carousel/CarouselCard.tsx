import React from 'react'
import type { Article } from '../../types/article';


export const CarouselCard = (article: Article) => {

  const cardStyle = {
    backgroundImage: `url(${article.image})`
  }

  return (
    <div className='carousel-card' style={cardStyle}>
      <div className="carousel-card-overlay">
        <div className="carousel-card-tags">
          {article.tags.map((tag, index) => (
            <span key={`article-tag-${index}`} className="tag-badge" style={{ backgroundColor: tag.color }}>
              {tag.name}
            </span>
          ))}
        </div>
        <div className="carousel-card-content">
          <h3 className="carousel-card-title">{article.title}</h3>
          <p className="carousel-card-meta">{article.author} - at: {article.meta.date}</p>
        </div>
      </div>
    </div>
  )
}
