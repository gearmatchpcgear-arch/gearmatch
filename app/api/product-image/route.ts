import { NextRequest, NextResponse } from "next/server"
import {
  isAllowedAmazonProductImageUrl,
  normalizeAmazonProductImageUrl,
} from "@/lib/amazon-product-image-proxy"

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("url")
  if (!raw) {
    return new NextResponse("Missing url", { status: 400 })
  }

  let target: string
  try {
    target = normalizeAmazonProductImageUrl(decodeURIComponent(raw))
  } catch {
    return new NextResponse("Invalid url", { status: 400 })
  }

  if (!isAllowedAmazonProductImageUrl(target)) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  const upstream = await fetch(target, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
    },
    next: { revalidate: 86400 },
  })

  if (!upstream.ok) {
    return new NextResponse("Upstream error", { status: upstream.status })
  }

  const contentType = upstream.headers.get("Content-Type") ?? "image/jpeg"
  const body = await upstream.arrayBuffer()

  return new NextResponse(body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  })
}
