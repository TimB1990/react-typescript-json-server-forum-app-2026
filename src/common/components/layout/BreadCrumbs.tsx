import { Link, useMatches, type UIMatch } from "react-router-dom";
import type { Thread } from "../../types/threads";
import type { RouteHandle } from "../../types/general";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faHome } from "@fortawesome/free-solid-svg-icons";

interface CrumbItem {
  label: string,
  pathname: string;
}

export const BreadCrumbs = () => {

  const matches = useMatches() as UIMatch<Thread, RouteHandle>[]

  const crumbs: CrumbItem[] = matches
    .filter((match) => Boolean(match.handle?.breadcrumb))
    .map((match) => {
      const { breadcrumb } = match.handle;
      const label = typeof breadcrumb === "function"
        ? breadcrumb(match.loaderData)
        : breadcrumb;

      return {
        label,
        pathname: match.pathname
      }
    })

  if (crumbs.length === 0) return null;

  return (
    <div className="breadcrumbs-container">
      <nav aria-label="breadcrumb" style={{ padding: "10px 0" }}>
        <ol style={{ display: "flex", listStyle: "none", gap: "8px", padding: 0, margin: 0 }}>
          {crumbs.map((crumb, index) => {

            const isLast = index === crumbs.length - 1;
            const isHome = crumb.label === "Forum";

            return (
              <li key={crumb.pathname} style={{ display: "flex", alignItems: "center" }}>
                {isLast ? (
                  <span aria-current="page" style={{ fontWeight: "bold", color: "#ccc" }}>
                    {isHome ? <FontAwesomeIcon icon={faHome}/> : ""} {crumb.label}
                  </span>
                ) : (
                  <>
                    <Link to={crumb.pathname} style={{ textDecoration: "none" }}>
                      {isHome ? <FontAwesomeIcon icon={faHome}/> : ""} {crumb.label} <FontAwesomeIcon style={{fontSize: "0.85em"}} icon={faChevronRight} />
                    </Link>
                    <span style={{ margin: "0 8px", color: "#fff" }}>/</span>
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  )
}
