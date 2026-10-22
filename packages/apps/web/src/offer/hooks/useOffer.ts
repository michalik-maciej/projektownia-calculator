import { useQuery } from "@tanstack/react-query"
import { useSearch } from "@tanstack/react-router"

import { isNotFound } from "../../core/createMethod.api"
import { offerQueries } from "../offer.api"

const OFFER_REFRESH_MS = 5000

export function useOffer() {
  const { offerId } = useSearch({ strict: false })

  const {
    data: offer,
    error,
    isFetching,
  } = useQuery({
    ...offerQueries.details(offerId ?? ""),
    enabled: !!offerId,
    refetchInterval: OFFER_REFRESH_MS,
  })

  return { isFetching, isMissing: isNotFound(error), offer, offerId }
}
