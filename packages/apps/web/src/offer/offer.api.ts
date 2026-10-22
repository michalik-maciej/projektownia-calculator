import * as v from "valibot"

import {
  OfferInput,
  OfferShares,
  OfferSharesSchema,
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
  shares: createApiMethod({
    method: "GET",
    path: `${apiUrl}/offers/:id/shares`,
    response: OfferSharesSchema,
  }),
  setShares: createApiMethod({
    method: "PUT",
    path: `${apiUrl}/offers/:id/shares`,
    response: OfferSharesSchema,
    data: apiType<OfferShares>(),
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
  shares: (id: string) => ({
    queryKey: ["offer", "shares", id] as const,
    queryFn: () => offerApi.shares({ params: { id } }),
  }),
}
