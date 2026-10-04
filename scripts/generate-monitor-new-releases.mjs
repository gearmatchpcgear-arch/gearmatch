/**
 * monitor-new-releases-raw.json → lib/monitor-new-releases.ts (pg1 #1–#50)
 */
import { readFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { buildGadgetsFromRaw, writeMonitorTs } from "./monitor-new-releases-generate-lib.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")

const USER_OVERRIDES = {
  B0GCDF8QLB: {
    name: "kksmart 16型 モバイルモニター",
    brand: "kksmart",
    tagline: "16インチ 2.5K(2560×1600) 144Hz IPS・100% sRGB・Switch2/PS5/PC対応",
    resolution: "2560 x 1600 (WQXGA)",
    refreshRate: "144 Hz",
    panel: "IPS",
    connection: "USB Type-C / Mini HDMI",
    monitorFilterTags: ["res-wqhd", "refresh-144-plus", "port-hdmi", "port-usb-c"],
  },
  B0GYR9BBB9: {
    name: "InnoView 18.5型 モバイルモニター",
    brand: "InnoView",
    resolution: "2560 x 1440 (QHD)",
    refreshRate: "120 Hz",
    panel: "IPS",
    connection: "USB Type-C / Mini HDMI",
  },
  B0GSV8QLRC: {
    name: "Upperizon 14型 モバイルモニター",
    brand: "Upperizon",
    resolution: "2560 x 1600 (WQXGA)",
    refreshRate: "120 Hz",
    panel: "IPS",
    connection: "USB Type-C / Mini HDMI",
    monitorFilterTags: ["res-wqhd", "refresh-100", "port-hdmi", "port-usb-c"],
  },
  B0GYFC8Q78: {
    name: "Upperizon 14型 モバイルモニター",
    brand: "Upperizon",
    resolution: "2560 x 1600 (WQXGA)",
    refreshRate: "120 Hz",
    panel: "IPS",
    connection: "USB Type-C / Mini HDMI",
    monitorFilterTags: ["res-wqhd", "refresh-100", "port-hdmi", "port-usb-c"],
  },
  B0H6WS2CP1: {
    name: "Acer Nitro 16型 モバイルモニター",
    brand: "Acer",
    resolution: "1920 x 1200 (WUXGA)",
    refreshRate: "144 Hz",
    panel: "IPS 非光沢",
    connection: "USB Type-C / Mini HDMI",
  },
  B0H6WSMXBL: {
    name: "Acer 14型 モバイルモニター",
    brand: "Acer",
    resolution: "1920 x 1200 (WUXGA)",
    refreshRate: "60 Hz",
    panel: "IPS 非光沢",
    connection: "USB Type-C / Mini HDMI",
  },
  B0GR4Q6FL4: {
    name: "S3425DW",
    brand: "Dell",
    tagline: "34インチ 曲面 WQHD VA・USB Type-C・1800R",
    resolution: "2560 x 1440 (QHD)",
    refreshRate: "100 Hz",
    panel: "VA 非光沢",
    connection: "USB Type-C / HDMI / DisplayPort",
    monitorFilterTags: ["size-315-plus", "res-wqhd", "port-hdmi", "port-dp", "port-usb-c"],
  },
  B0H3RH1Y2H: {
    name: "34U640B-BAJP",
    brand: "LG",
    tagline: "34インチ UWQHD 144Hz・USB-C PD 65W・sRGB 99%",
    resolution: "3440 x 1440 (UWQHD)",
    refreshRate: "144 Hz",
    panel: "IPS",
    connection: "USB Type-C (PD 65W) / HDMI / DisplayPort",
    monitorFilterTags: [
      "size-315-plus",
      "res-uwqhd",
      "refresh-144-plus",
      "port-hdmi",
      "port-dp",
      "port-usb-c",
      "port-usb-c-pd",
    ],
  },
  B0H6HL2CL2: {
    name: "AW3426DW",
    brand: "Dell",
    tagline: "34インチ 曲面 QD-OLED WQHD 240Hz Alienware",
    resolution: "3440 x 1440 (UWQHD)",
    refreshRate: "240 Hz",
    panel: "QD-OLED",
    connection: "HDMI / DisplayPort",
    monitorFilterTags: ["size-315-plus", "res-uwqhd", "refresh-240-plus", "port-hdmi", "port-dp"],
  },
  B0GXFY2N8C: {
    name: "CRUA 28型 4K+ モニター",
    brand: "CRUA",
    resolution: "3840 x 2560 (4K+)",
    refreshRate: "60 Hz",
    panel: "IPS",
    connection: "USB Type-C / HDMI / DisplayPort",
    monitorFilterTags: ["size-27", "res-4k", "refresh-60", "port-hdmi", "port-dp", "port-usb-c"],
  },
  B0H29BM2PR: {
    name: "JN-i27G120U",
    brand: "JAPANNEXT",
    tagline: "27インチ 4K IPS 120Hz/1ms ゲーミングモニター",
    resolution: "3840 x 2160 (4K UHD)",
    refreshRate: "120 Hz",
    panel: "IPS",
    connection: "HDMI / DisplayPort",
    monitorFilterTags: ["size-27", "res-4k", "refresh-100", "port-hdmi", "port-dp"],
  },
}

const { monitors } = JSON.parse(
  readFileSync(join(__dirname, "monitor-new-releases-raw.json"), "utf8"),
)

const page1 = monitors.filter((m) => m.amazonRank <= 50)
const gadgets = buildGadgetsFromRaw(page1, USER_OVERRIDES, "mon-nr")

writeMonitorTs(
  join(ROOT, "lib", "monitor-new-releases.ts"),
  "monitorNewReleases",
  "/** Amazon.co.jp ディスプレイ新着 1ページ目（2151982051 pg=1）#1–#50。 */",
  gadgets,
)
console.log(`Wrote ${gadgets.length} monitors to lib/monitor-new-releases.ts`)
