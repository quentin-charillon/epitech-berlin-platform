import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { getPage } from "../admin/mockData";
import { PageCanvas } from "../components/PageBlocksRenderer";

export const FOOTER_SLUG = "__footer__";

export default function CMSPage({ fallbackSlug = "" }) {
  const params = useParams();
  const slug = params["*"] || fallbackSlug;

  const [page, setPage] = useState(null);

  useEffect(() => {
    const loadPageData = async () => {
      if (!slug) {
        setPage(null);
        return;
      }
      const pageData = await getPage(slug);
      setPage(pageData);
    };

    loadPageData();
  }, [slug]);

  if (!slug) return <Navigate to="/home" replace />;

  if (slug === FOOTER_SLUG) return <Navigate to="/" replace />;

  if (!page) {
    return <h1 style={{ padding: 24, color: "white" }}>Not found</h1>;
  }

  return (
    <PageCanvas
      page={page}
      canvasHeightMin={900}
      canvasPaddingBottom={Number.isFinite(page.bottomPadding) ? page.bottomPadding : 0}
      fillViewport
    />
  );
}
