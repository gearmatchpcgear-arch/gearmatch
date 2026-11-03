export function csvCell(value: unknown): string {
  if (value === null || value === undefined) return ""
  const text = String(value)
  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

export function csvRow(values: unknown[]): string {
  return values.map(csvCell).join(",")
}
