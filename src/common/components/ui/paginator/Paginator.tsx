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
    <nav className="pagination" aria-label="pagination">
      {pageNumbers.map(num => (
        <Link
          key={num}
          to={`/${entity}/${slug}/page/${num}`}
          className={currentPage === num ? "active" : ""}
        >
          {num}
        </Link>
      ))}
      &nbsp;
      <Link to={`/${entity}/${slug}/page/${nextPage}`}>
        next
      </Link>
    </nav>
  )
};
