import { afterEach, describe, expect, it, vi } from "vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"

vi.stubEnv("VITE_API_URL", "http://localhost:3000")
vi.mock("../hooks/useLogoutUser", () => ({
  useLogoutUser: () => ({ mutate: vi.fn() }),
}))

const { UserMenu } = await import("./UserMenu")

function openMenuAs(role: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity } },
  })
  queryClient.setQueryData(["auth", "user"], {
    user: { email: "jan@example.com", role, sub: "1" },
  })
  render(
    <QueryClientProvider client={queryClient}>
      <UserMenu />
    </QueryClientProvider>,
  )
  fireEvent.keyDown(screen.getByRole("button", { name: "Menu użytkownika" }), {
    key: "Enter",
  })
}

describe("UserMenu", () => {
  afterEach(cleanup)

  it("shows an admin their role and user management", () => {
    openMenuAs("ADMIN")

    expect(screen.getByText("Administrator")).toBeInTheDocument()
    expect(
      screen.getByRole("menuitem", { name: "Zarządzaj użytkownikami" }),
    ).toBeInTheDocument()
  })

  it("hides user management from an employee", () => {
    openMenuAs("USER")

    expect(screen.getByText("Pracownik")).toBeInTheDocument()
    expect(
      screen.queryByRole("menuitem", { name: "Zarządzaj użytkownikami" }),
    ).not.toBeInTheDocument()
  })
})
