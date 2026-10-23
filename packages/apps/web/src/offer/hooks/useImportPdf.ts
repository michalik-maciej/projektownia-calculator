import { toast } from "sonner"
import { useMutation } from "@tanstack/react-query"

import { PdfImportOutput } from "@/schemas/PdfImport.schema"

import { ApiError } from "../../core/createMethod.api"
import { offerApi } from "../offer.api"

const PAYLOAD_TOO_LARGE = 413
const BAD_REQUEST = 400

export function useImportPdf(
  onImported: (layouts: PdfImportOutput["layouts"]) => void,
) {
  return useMutation({
    mutationFn: (file: File) =>
      offerApi.importPdf({
        data: new File([file], file.name, { type: "application/pdf" }),
      }),
    onSuccess: ({ layouts }) => {
      if (layouts.length === 0) {
        toast.error("Nie znaleziono w pliku żadnego ciągu.", {
          position: "top-center",
        })
        return
      }

      onImported(layouts)
      toast.success(
        `Dodano ciągi z PDF: ${layouts.length}. Włącz je do oferty przełącznikiem „Wliczaj do oferty”.`,
        {
          position: "top-center",
        },
      )
    },
    onError: (error) => {
      console.error("Importing the PDF failed:", error)
      toast.error(importErrorMessage(error), { position: "top-center" })
    },
  })
}

function importErrorMessage(error: Error) {
  if (!(error instanceof ApiError)) return "Nie udało się zaimportować pliku."
  if (error.status === PAYLOAD_TOO_LARGE) return "Plik jest za duży (do 5 MB)."
  if (error.status === BAD_REQUEST) return "Nie udało się odczytać pliku PDF."
  return "Nie udało się zaimportować pliku."
}
