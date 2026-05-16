import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/rfps")({
  component: () => <Navigate to="/proposals" />,
});
