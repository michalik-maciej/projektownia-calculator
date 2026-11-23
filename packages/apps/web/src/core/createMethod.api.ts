import { type GenericSchema } from "valibot"

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE"

export const apiType = <T>() => "" as unknown as T

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

export function isConflict(error: unknown): boolean {
  return error instanceof ApiError && error.status === 409
}

export function isUnauthorized(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401
}

type ApiContract<TPath extends string, TData, TResponse> = {
  method: HttpMethod
  path: TPath
  response?: GenericSchema<unknown, TResponse>
  data?: TData
}

type Simplify<T> = { [K in keyof T]: T[K] } & {}

type ParamsFromUrl<TPath extends string> =
  TPath extends `${string}:${infer Param}/${infer Rest}`
    ? { [K in Param | keyof ParamsFromUrl<Rest>]: string }
    : TPath extends `${string}:${infer Param}`
      ? { [K in Param]: string }
      : object

type Input<TPath extends string, TData> = Simplify<
  (keyof ParamsFromUrl<TPath> extends never
    ? object
    : {
        params: ParamsFromUrl<TPath>
      }) &
    (TData extends undefined
      ? object
      : {
          data: TData
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

function toJsonBody(data: unknown) {
  return data === undefined ? undefined : JSON.stringify(data)
}

export function createApiMethod<
  TPath extends string,
  TData = undefined,
  TOutput = unknown,
>(
  contract: ApiContract<TPath, TData, TOutput>,
): keyof Input<TPath, TData> extends never
  ? (input?: never) => Promise<TOutput>
  : (input: Input<TPath, TData>) => Promise<TOutput> {
  return async (
    input: Input<TPath, TData> = {} as Input<TPath, TData>,
  ): Promise<TOutput> => {
    const data =
      input && typeof input === "object" && "data" in input
        ? (input as { data: unknown }).data
        : undefined
    const isFile = data instanceof Blob
    const body = isFile ? data : toJsonBody(data)

    const pathParams =
      input && typeof input === "object" && "params" in input
        ? ((input as { params: Record<string, string> }).params ?? undefined)
        : undefined

    const url = pathParams
      ? insertParamsIntoPath({ path: contract.path, params: pathParams })
      : contract.path

    const res = await fetch(url, {
      method: contract.method,
      credentials: "include",
      headers: {
        "Content-Type": isFile ? data.type : "application/json",
        Accept: "application/json",
      },
      body,
    })

    if (!res.ok) {
      throw new ApiError({
        status: res.status,
        statusText: res.statusText,
        method: contract.method,
        url,
        bodyText: await res.text(),
      })
    }

    if (res.status === 204) {
      return null as TOutput
    }

    return res.json()
  }
}
