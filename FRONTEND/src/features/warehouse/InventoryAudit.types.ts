export type AuditRow = {
  sku: string
  label: string
  category: string
  systemQty: number
  actualQty: number
}

export type AuditStats = {
  verified: number
  mismatches: number
  percent: number
}
