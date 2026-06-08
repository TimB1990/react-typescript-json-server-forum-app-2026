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

  const nextPage = currentPage < totalPages ? currentPage + 1 : currentPage;

  return (
    <nav aria-label="pagination">
      {pageNumbers.map(num => (
        <Link
          key={num}
          to={`/${entity}/${slug}/page/${num}`}
          className={currentPage === num ? "active" : ""}
          style={{
            padding: '4px 8px',
            margin: '0 2px',
            backgroundColor: (currentPage === num ? "grey" : "transparent"),
            color: (currentPage === num ? "white" : "grey"),
            textDecoration: 'none',
            borderRadius: '4px'
          }}
        >
          {num}
        </Link>
      ))}
      &nbsp;
      <Link to={`/${entity}/${slug}/page/${nextPage}`}>
        NEXT
      </Link>
    </nav>
  )
};
