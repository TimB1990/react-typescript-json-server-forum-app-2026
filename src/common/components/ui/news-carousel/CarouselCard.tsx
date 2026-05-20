import React from 'react'
import type { Article } from '../../../types/article';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faMessage } from '@fortawesome/free-solid-svg-icons';


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
          <div className="carousel-card-meta">
            <p>{article.author} - {article.meta.date}</p>
            <div className="carousel-article-stats">
              <p><FontAwesomeIcon icon={faEye} /> {article.meta.views}</p>
              <p><FontAwesomeIcon icon={faMessage} /> {article.meta.comments}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
