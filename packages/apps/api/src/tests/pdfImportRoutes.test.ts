import jwt from "jsonwebtoken"
import request from "supertest"
import { describe, expect, it } from "vitest"

import { createApp } from "../app"

process.env.JWT_SECRET = "test-secret"
const secret = process.env.JWT_SECRET

const app = createApp()

function cookieFor(role: "ADMIN" | "DEMO" | "USER") {
  const token = jwt.sign(
    { sub: "77777777-7777-7777-7777-777777777777", email: "x@y.z", role },
    secret,
  )

  return `accessToken=${token}`
}

function pdfWith(content: string) {
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 400 400] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ]
  let pdf = "%PDF-1.4\n"
  const offsets = objects.map((object, index) => {
    const offset = pdf.length
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`
    return offset
  })
  const xref = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  pdf += offsets
    .map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`)
    .join("")
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`

  return Buffer.from(pdf, "latin1")
}

const wallRunDrawing = pdfWith(
  [
    "0 0.5 1 RG 1 w 100 100 m 100 300 l S",
    "BT /F1 7 Tf 1 0 0 1 102 200 Tm (\\(5\\)) Tj ET",
    "BT /F1 4.5 Tf 0 -1 1 0 90 250 Tm (100/37/210) Tj ET",
    "BT /F1 4.5 Tf 0 -1 1 0 84 250 Tm (6x37) Tj ET",
  ].join("\n"),
)

function importPdf(role: "ADMIN" | "DEMO" | "USER", body: Buffer) {
  return request(app)
    .post("/api/pdf-imports")
    .set("Cookie", cookieFor(role))
    .set("Content-Type", "application/pdf")
    .send(body)
}

describe("PDF import route", () => {
  it("refuses a request without a session", async () => {
    const res = await request(app)
      .post("/api/pdf-imports")
      .set("Content-Type", "application/pdf")
      .send(wallRunDrawing)

    expect(res.status).toBe(401)
  })

  it("refuses a demo account", async () => {
    const res = await importPdf("DEMO", wallRunDrawing)

    expect(res.status).toBe(403)
    expect(res.body).toEqual({ error: "Forbidden" })
  })

  it("refuses a file that is not a PDF", async () => {
    const res = await importPdf("USER", Buffer.from("not a drawing"))

    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: "Expected a PDF file" })
  })

  it("refuses a PDF it cannot read", async () => {
    const res = await importPdf("USER", Buffer.from("%PDF-1.4 truncated"))

    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: "Unreadable PDF" })
  })

  it("returns the runs read from the drawing, each left out of the offer", async () => {
    const res = await importPdf("USER", wallRunDrawing)

    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      layouts: [
        {
          backVariant: 1,
          depth: 37,
          hasBaseCover: true,
          height: 210,
          numberOfLayouts: 1,
          drawingRunNumber: 5,
          isExcludedFromOffer: true,
          shelfUnits: [
            {
              numberOfShelfUnits: 1,
              shelves: [{ depth: 37, numberOfShelves: 6 }],
              width: 100,
            },
          ],
        },
      ],
    })
  })
})
