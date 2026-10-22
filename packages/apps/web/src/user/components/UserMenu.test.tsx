import { afterEach, describe, expect, it, vi } from "vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"

vi.stubEnv("VITE_API_URL", "http://localhost:3000")

const { UserMenu } = await import("./UserMenu")

async function openMenuAs(role: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity } },
  })
  queryClient.setQueryData(["auth", "user"], {
    user: { email: "jan@example.com", role, sub: "1" },
  })
  const router = createRouter({
    history: createMemoryHistory(),
    routeTree: createRootRoute({ component: UserMenu }),
  })
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
  fireEvent.keyDown(
    await screen.findByRole("button", { name: "Menu użytkownika" }),
    { key: "Enter" },
  )
}

describe("UserMenu", () => {
  afterEach(cleanup)

  it("shows an admin their role and user management", async () => {
    await openMenuAs("ADMIN")

    expect(screen.getByText("Administrator")).toBeInTheDocument()
    expect(
      screen.getByRole("menuitem", { name: "Zarządzaj użytkownikami" }),
    ).toBeInTheDocument()
  })

  it("hides user management from an employee", async () => {
    await openMenuAs("USER")

    expect(screen.getByText("Pracownik")).toBeInTheDocument()
    expect(
      screen.queryByRole("menuitem", { name: "Zarządzaj użytkownikami" }),
    ).not.toBeInTheDocument()
  })
})
