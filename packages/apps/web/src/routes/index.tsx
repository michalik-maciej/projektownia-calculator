import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/")({
  loader: () => {
    throw redirect({ to: "/offer" })
  },
  component: Outlet,
})
