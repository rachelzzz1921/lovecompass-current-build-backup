import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/run")({
  beforeLoad: () => {
    throw redirect({
      to: "/tests/$id/run",
      params: { id: "self" },
    });
  },
});