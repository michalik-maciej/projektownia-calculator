import { useQuery } from "@tanstack/react-query"
import { useSearch } from "@tanstack/react-router"

import { isNotFound } from "../../core/createMethod.api"
import { offerQueries } from "../offer.api"

const OFFER_REFRESH_MS = 5000

export function useOffer({ keepFresh = false }: { keepFresh?: boolean } = {}) {
  const { offerId } = useSearch({ strict: false })

  const {
    data: offer,
    error,
    isFetching,
  } = useQuery({
    ...offerQueries.details(offerId ?? ""),
    enabled: !!offerId,
    refetchInterval: keepFresh ? OFFER_REFRESH_MS : false,
  })

  return { isFetching, isMissing: isNotFound(error), offer, offerId }
}
