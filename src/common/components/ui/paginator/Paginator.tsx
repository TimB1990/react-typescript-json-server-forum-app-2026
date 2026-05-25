import { Link, useParams } from "react-router-dom"

type PaginatorProps = {
  entity: 'categories' | 'threads'
  currentPage: number
  totalPages: number
}

export const Paginator = (props: PaginatorProps) => {
  const { entity, totalPages, currentPage } = props;
  const { slug } = useParams();

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav aria-label="Pagination">
      {pageNumbers.map(num => (
        <Link 
          key={num} 
          to={`/${entity}/${slug}/page/${num}`} 
          style={{ 
            padding: '4px 8px',
            margin: '0 2px',
            backgroundColor: (currentPage === num ? "grey" : "transparent"),
            color: (currentPage === num ? "white" : "black"),
            textDecoration: 'none',
            borderRadius: '4px'
          }}
        >
          {num}
        </Link>
      ))}

      {/* Only show NEXT if there's actually a next page */}
      {currentPage < totalPages && (
        <Link 
          to={`/${entity}/${slug}/page/${currentPage + 1}`}
          style={{ marginLeft: '10px' }}
        >
          NEXT »
        </Link>
      )}
    </nav>
  );
};
