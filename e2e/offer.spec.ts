import { expect, test } from "@playwright/test"

test("a visitor can open the demo, configure a run and see it priced", async ({
  page,
}) => {
  await page.goto("/")
  await page.getByRole("button", { name: "Demo" }).click()

  await expect(page).toHaveURL(/\/offer\?offerId=/)
  await expect(page.getByText("Wartość")).toBeVisible()

  const exampleOfferUrl = page.url()

  await page.getByRole("button", { name: "Nowa" }).click()
  await page.getByRole("button", { name: "Utwórz nową ofertę" }).click()
  await expect(page).toHaveURL(/offerId=/)
  await expect(page).not.toHaveURL(exampleOfferUrl)

  await page.getByRole("link", { name: "Konfigurator" }).click()
  await page.getByRole("button", { name: "Dodaj ciąg przyścienny" }).click()

  await expect(page.getByText(/ciąg regałów przyściennych/)).toBeVisible()

  await page.getByRole("link", { name: "Oferta", exact: true }).click()

  await expect(page.getByText("Wartość")).toBeVisible()
  await expect(page.getByText(/Po rabacie/)).toBeVisible()
  await expect(page.getByText(/\d+,\d{2}\szł/).first()).toBeVisible()
})

test("the catalogue is read only for the demo account", async ({ page }) => {
  await page.goto("/")
  await page.getByRole("button", { name: "Demo" }).click()
  await page.getByRole("link", { name: "Katalog części" }).click()

  await expect(
    page.getByText("Wersja demo: katalog tylko do odczytu"),
  ).toBeVisible()
  await expect(page.getByRole("link", { name: "Dodaj" })).toHaveCount(0)
})

test("an unknown address sends a signed-out visitor to the login page", async ({
  page,
}) => {
  await page.goto("/nie-ma-takiej-strony")

  await expect(page).toHaveURL(/\/login$/)
})

test("an unknown address gets a page instead of a blank screen", async ({
  page,
}) => {
  await page.goto("/")
  await page.getByRole("button", { name: "Demo" }).click()
  await expect(page).toHaveURL(/\/offer\?offerId=/)

  await page.goto("/nie-ma-takiej-strony")

  await expect(
    page.getByRole("heading", { name: "Nie ma takiej strony" }),
  ).toBeVisible()
})
