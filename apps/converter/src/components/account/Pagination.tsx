import React, { useEffect } from "react";

import { Button } from "@mantle/ui";

import { useKeyPress } from "@hooks/useKeyPress";

export default function Pagination({
  page,
  setPage,
  pages,
}: {
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  pages: number;
}) {
  // control page navigation with left/right arrow keys
  const leftPress = useKeyPress("ArrowLeft");
  const rightPress = useKeyPress("ArrowRight");

  useEffect(
    () => {
      if (leftPress) {
        setPage(Math.max(0, page - 1));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [leftPress]
  );

  useEffect(
    () => {
      if (rightPress) {
        setPage(Math.min(pages - 1, page + 1));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rightPress]
  );

  return (
    <div className="text-center pt-5">
      <Button
        type="button"
        variant="ghost"
        disabled={page === 0}
        onClick={() => setPage(Math.max(page - 1, 0))}
      >
        {"<"}
      </Button>{" "}
      {!pages ? 0 : page + 1} of {pages}
      <Button
        type="button"
        variant="ghost"
        disabled={page === pages - 1}
        onClick={() => setPage(Math.min(page + 1, pages - 1))}
      >
        {">"}
      </Button>
    </div>
  );
}
