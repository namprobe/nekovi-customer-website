import { env } from "@/src/core/config/env"

export interface GHNProvince {
  ProvinceID: number
  ProvinceName: string
}

export interface GHNDistrict {
  DistrictID: number
  DistrictName: string
  ProvinceID: number
}

export interface GHNWard {
  WardCode: string
  WardName: string
  DistrictID: number
}

interface GHNResponse<T> {
  code: number
  message: string
  data: T
}

async function requestGHN<T>(path: string, options?: RequestInit): Promise<T> {
  if (!env.GHN_TOKEN) {
    throw new Error("GHN token is not configured")
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`

  const response = await fetch(`${env.GHN_BASE_URL}${normalizedPath}`, {
    method: options?.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      Token: env.GHN_TOKEN,
      ...options?.headers,
    },
    body: options?.body,
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`GHN request failed: ${response.statusText}`)
  }

  const payload = (await response.json()) as GHNResponse<T>
  if (payload.code !== 200 || !payload.data) {
    throw new Error(payload.message || "GHN request failed")
  }

  return payload.data
}

export const ghnAddressService = {
  getProvinces: () => requestGHN<GHNProvince[]>("master-data/province"),
  getDistricts: (provinceId: number) =>
    requestGHN<GHNDistrict[]>("master-data/district", {
      method: "POST",
      body: JSON.stringify({ province_id: provinceId }),
    }),
  getWards: (districtId: number) =>
    requestGHN<GHNWard[]>("master-data/ward?district_id", {
      method: "POST",
      body: JSON.stringify({ district_id: districtId }),
    }),
}

