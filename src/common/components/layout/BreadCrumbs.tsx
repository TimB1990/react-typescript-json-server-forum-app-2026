import { Link, useMatches, type UIMatch } from "react-router-dom";
import type { Thread } from "../../types/threads";
import type { RouteHandle } from "../../types/general";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faHome } from "@fortawesome/free-solid-svg-icons";

interface CrumbItem {
  label: string;
  pathname: string; // This will hold the specific path to link to
}

export const BreadCrumbs = () => {
  const matches = useMatches() as UIMatch<Thread, RouteHandle>[];

  // Initialize the array with your permanent Home link
  const crumbs: CrumbItem[] = [
    { label: "Forum", pathname: "/" }
  ];

  // Process any matching child route crumbs
  matches
    .filter((match) => Boolean(match.handle?.breadcrumb))
    .forEach((match) => {
      const { breadcrumb } = match.handle;

      if (typeof breadcrumb === "function") {
        const generatedCrumbs = breadcrumb(match.data ?? match.loaderData) as any[];

        generatedCrumbs.forEach((item) => {
          crumbs.push({
            label: item.label,
            pathname: item.path // Map the dynamic "path" safely to "pathname"
          });
        });
      } else {
        // Only push static string crumbs if they aren't the root "Forum" string 
        // to prevent rendering "Forum > Forum" on the homepage
        if (breadcrumb !== "Forum") {
          crumbs.push({
            label: breadcrumb,
            pathname: match.pathname
          });
        }
      }
    });

  return (
    <div className="breadcrumbs-container">
      <nav aria-label="breadcrumb" style={{ padding: "10px 0" }}>
        <ol style={{ display: "flex", listStyle: "none", gap: "8px", padding: 0, margin: 0 }}>
          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1;
            const isHome = index === 0; // The first item is always your Home link now

            return (
              <li key={`${crumb.pathname}-${index}`} style={{ display: "flex", alignItems: "center" }}>
                {isLast ? (
                  <span aria-current="page" style={{ fontWeight: "bold", color: "#ccc" }}>
                    {isHome ? <FontAwesomeIcon icon={faHome} /> : ""} {crumb.label}
                  </span>
                ) : (
                  <>
                    <Link to={crumb.pathname} style={{ textDecoration: "none" }}>
                      {isHome ? <FontAwesomeIcon icon={faHome} /> : ""} {crumb.label}
                    </Link>
                    <span style={{ margin: "0 8px", color: "#fff", display: "flex", alignItems: "center" }}>
                      <FontAwesomeIcon style={{ fontSize: "0.75em", color: "#888" }} icon={faChevronRight} />
                    </span>
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
};