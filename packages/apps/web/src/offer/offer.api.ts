import * as v from "valibot"

import {
  OfferInput,
  OfferOutput,
  OfferOutputSchema,
  OfferSummarySchema,
  SavedOfferSchema,
} from "@/schemas/Offer.schema"

import {
  apiType,
  createApiMethod,
  isNotFound,
  isUnauthorized,
} from "../core/createMethod.api"

const OfferListSchema = v.array(OfferSummarySchema)

const apiUrl = import.meta.env.VITE_API_URL
if (!apiUrl) {
  throw new Error("Missing VITE_API_URL")
}

export const offerApi = {
  list: createApiMethod({
    method: "GET",
    path: `${apiUrl}/offers`,
    response: OfferListSchema,
  }),
  details: createApiMethod({
    method: "GET",
    path: `${apiUrl}/offers/:id`,
    response: SavedOfferSchema,
  }),
  create: createApiMethod({
    method: "POST",
    path: `${apiUrl}/offers`,
    response: SavedOfferSchema,
    data: apiType<OfferInput>(),
  }),
  update: createApiMethod({
    method: "PUT",
    path: `${apiUrl}/offers/:id`,
    response: SavedOfferSchema,
    data: apiType<OfferInput>(),
  }),
  delete: createApiMethod({
    method: "DELETE",
    path: `${apiUrl}/offers/:id`,
    response: v.null(),
  }),
  preview: createApiMethod({
    method: "POST",
    path: `${apiUrl}/offers/preview`,
    response: OfferOutputSchema,
    data: apiType<OfferInput>(),
  }),
}

export const offerMutationKeys = {
  autoSave: ["offer", "autoSave"] as const,
}

export const offerQueries = {
  list: () => ({
    queryKey: ["offer", "list"] as const,
    queryFn: () => offerApi.list(),
  }),
  details: (id: string) => ({
    queryKey: ["offer", "details", id] as const,
    queryFn: () => offerApi.details({ params: { id } }),
    retry: (failureCount: number, error: Error) =>
      !isNotFound(error) && !isUnauthorized(error) && failureCount < 3,
  }),
  preview: (draft: OfferInput | null) => ({
    queryKey: ["offer", "preview", draft] as const,
    queryFn: () => offerApi.preview({ data: draft! }),
    enabled: !!draft?.layouts.length,
    placeholderData: (previous: OfferOutput | undefined) => previous,
  }),
}
