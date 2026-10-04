import { extractAmazonRatingAndReviews, fetchAmazonProductHtml } from "./amazon-review-meta.mjs"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const asin = process.argv[2] ?? "B09DSRLKBT"

async function main() {
  const html = await fetchAmazonProductHtml(asin)
  const parsed = extractAmazonRatingAndReviews(html, asin)
  console.log("ASIN:", asin)
  console.log("Parsed:", parsed)

  const title = html.match(/id="productTitle"[^>]*>\s*([^<]+)/)?.[1]?.trim()
  console.log("Title:", title)

  const aggregate = html.match(
    /"aggregateRating"\s*:\s*\{[^}]*"ratingValue"\s*:\s*"?([\d.]+)"?[^}]*"reviewCount"\s*:\s*"?([\d,]+)"?/,
  )
  if (aggregate) {
    console.log("aggregateRating:", { rating: aggregate[1], reviews: aggregate[2] })
  }

  const star = html.match(/5つ星のうち([\d.]+)/)
  const reviewText = html.match(/acrCustomerReviewText[^>]*>\s*\(?([\d,]+)\)?/)
  console.log("JP star:", star?.[1], "review text:", reviewText?.[1])
}

main().catch(console.error)
