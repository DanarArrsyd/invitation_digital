"use client";

import { Button } from "@/components/ui/button";

export function DeleteWishButton() {
  return (
    <Button
      type="submit"
      variant="destructive"
      size="sm"
      onClick={(e) => {
        if (!window.confirm("Hapus ucapan ini secara permanen?")) {
          e.preventDefault();
        }
      }}
    >
      Delete
    </Button>
  );
}
