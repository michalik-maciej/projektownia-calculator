import { type GenericSchema } from "valibot"

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

export const apiType = <T>() => "" as unknown as T

type QueryParams = Record<string, unknown>

export class ApiError extends Error {
  name = "ApiError" as const
  status: number
  statusText: string
  method: HttpMethod
  url: string
  bodyText?: string

  constructor(args: {
    status: number
    statusText: string
    method: HttpMethod
    url: string
    bodyText?: string
  }) {
    super(
      `HTTP ${args.status} ${args.statusText}${args.bodyText ? `: ${args.bodyText}` : ""}`,
    )
    this.status = args.status
    this.statusText = args.statusText
    this.method = args.method
    this.url = args.url
    this.bodyText = args.bodyText
  }
}

export function isNotFound(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404
}

export function isUnauthorized(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401
}

type ApiContract<
  TPath extends string,
  TData,
  TQuery extends QueryParams | undefined,
  TResponse,
> = {
  method: HttpMethod
  path: TPath
  response?: GenericSchema<unknown, TResponse>
  data?: TData
  query?: TQuery
}

type Simplify<T> = { [K in keyof T]: T[K] } & {}

type ParamsFromUrl<TPath extends string> =
  TPath extends `${string}:${infer Param}/${infer Rest}`
    ? { [K in Param | keyof ParamsFromUrl<Rest>]: string }
    : TPath extends `${string}:${infer Param}`
      ? { [K in Param]: string }
      : object

type Input<
  TPath extends string,
  TData,
  TQuery extends QueryParams | undefined,
> = Simplify<
  (keyof ParamsFromUrl<TPath> extends never
    ? object
    : {
        params: ParamsFromUrl<TPath>
      }) &
    (TData extends undefined
      ? object
      : {
          data: TData
        }) &
    (TQuery extends undefined
      ? object
      : {
          query: TQuery
        })
>

function insertParamsIntoPath({
  path,
  params,
}: {
  path: string
  params: Record<string, string>
}) {
  let result = path

  for (const [key, value] of Object.entries(params)) {
    result = result.replaceAll(`:${key}`, encodeURIComponent(value))
  }

  return result
}

function withQuery(url: string, query: QueryParams) {
  const base =
    typeof window !== "undefined" && window.location
      ? window.location.origin
      : "http://localhost"

  const urlObj =
    url.startsWith("http://") || url.startsWith("https://")
      ? new URL(url)
      : new URL(url, base)

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue

    if (Array.isArray(value)) {
      urlObj.searchParams.delete(key)
      for (const item of value) {
        if (item === undefined || item === null) continue
        urlObj.searchParams.append(key, String(item))
      }
      continue
    }

    urlObj.searchParams.set(key, String(value))
  }

  return urlObj.toString()
}

export function createApiMethod<
  TPath extends string,
  TData = undefined,
  TQuery extends QueryParams | undefined = undefined,
  TOutput = unknown,
>(
  contract: ApiContract<TPath, TData, TQuery, TOutput>,
): keyof Input<TPath, TData, TQuery> extends never
  ? (input?: never) => Promise<TOutput>
  : (input: Input<TPath, TData, TQuery>) => Promise<TOutput> {
  return async (
    input: Input<TPath, TData, TQuery> = {} as Input<TPath, TData, TQuery>,
  ): Promise<TOutput> => {
    const body =
      input && typeof input === "object" && "data" in input
        ? JSON.stringify((input as { data: unknown }).data)
        : undefined

    const pathParams =
      input && typeof input === "object" && "params" in input
        ? ((input as { params: Record<string, string> }).params ?? undefined)
        : undefined

    const queryParams =
      input && typeof input === "object" && "query" in input
        ? ((input as { query: QueryParams }).query ?? undefined)
        : undefined

    const url = pathParams
      ? insertParamsIntoPath({ path: contract.path, params: pathParams })
      : contract.path

    const finalUrl = queryParams ? withQuery(url, queryParams) : url

    const res = await fetch(finalUrl, {
      method: contract.method,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body,
    })

    if (!res.ok) {
      throw new ApiError({
        status: res.status,
        statusText: res.statusText,
        method: contract.method,
        url: finalUrl,
        bodyText: await res.text(),
      })
    }

    if (res.status === 204) {
      return null as TOutput
    }

    return res.json()
  }
}
