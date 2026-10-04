import {
  matchesKeyboardLayoutArrayJis,
  matchesKeyboardLayoutArrayKorean,
  matchesKeyboardLayoutArrayUs,
} from "../lib/keyboard-layout-array-filters.ts"

/** @type {import("../lib/gadgets.ts").Gadget} */
function mockKeyboard(overrides) {
  return {
    id: "kb-test",
    category: "keyboard",
    name: "",
    brand: "Test",
    tagline: "",
    price: 1000,
    rating: 4,
    reviews: 10,
    image: "",
    highlights: [],
    compat: [],
    specGroups: [],
    purchaseUrl: "https://example.com",
    ...overrides,
  }
}

const cases = [
  [
    mockKeyboard({ keyboardLayoutArray: "JIS日本語配列" }),
    { jis: true, us: false, korean: false },
  ],
  [
    mockKeyboard({ keyboardLayoutArray: "US英語配列" }),
    { jis: false, us: true, korean: false },
  ],
  [
    mockKeyboard({ keyboardLayoutArray: "韓国語配列" }),
    { jis: false, us: false, korean: true },
  ],
  [
    mockKeyboard({
      highlights: [{ label: "レイアウト", value: "60%（US配列）" }],
    }),
    { jis: false, us: true, korean: false },
  ],
  [
    mockKeyboard({ name: "Ewin ERGO キーボード JIS配列 左右分離型" }),
    { jis: true, us: false, korean: false },
  ],
  [
    mockKeyboard({ name: "英語US配列 ゲーミングキーボード" }),
    { jis: false, us: true, korean: false },
  ],
  [
    mockKeyboard({ name: "SENECESLI 韓国語キーボード", keyboardLayoutArray: "韓国語配列" }),
    { jis: false, us: false, korean: true },
  ],
]

let failed = 0
for (const [gadget, expected] of cases) {
  const actual = {
    jis: matchesKeyboardLayoutArrayJis(gadget),
    us: matchesKeyboardLayoutArrayUs(gadget),
    korean: matchesKeyboardLayoutArrayKorean(gadget),
  }
  if (
    actual.jis !== expected.jis ||
    actual.us !== expected.us ||
    actual.korean !== expected.korean
  ) {
    console.error("FAIL matcher case", { expected, actual, name: gadget.name })
    failed++
  }
}

if (failed > 0) {
  console.error(`${failed} verification(s) failed`)
  process.exit(1)
}

console.log("verify-keyboard-layout-array-filters: ok")
