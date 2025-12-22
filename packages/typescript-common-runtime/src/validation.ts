export function isMatch(status: number, match: string) {
  return (
    (/^\d+$/.test(match) && String(status) === match) ||
    (/^\d[xX]{2}$/.test(match) && String(status)[0] === match[0])
  )
}

export function findMatchingSchema<Schema>(
  status: number,
  possibleResponses: [string, Schema][],
): Schema | undefined {
  for (const [match, schema] of possibleResponses) {
    if (isMatch(status, match)) {
      return schema
    }
  }
  return undefined
}
