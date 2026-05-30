export type ComparisonProduct = {
  name: string
  imageUrl?: string
  price: string
}

export type ComparisonRow = {
  attribute: string
  values: string[]
}

export type ComparisonMatrixProps = {
  products: ComparisonProduct[]
  rows: ComparisonRow[]
}

export function ComparisonMatrix({
  products,
  rows,
}: ComparisonMatrixProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-surface-sunken">
          <tr>
            <th scope="col" className="px-4 py-3 text-left font-semibold text-muted-foreground">
              Compare
            </th>
            {products.map((p, i) => (
              <th
                key={i}
                scope="col"
                className="px-4 py-3 text-center font-semibold text-foreground"
              >
                {p.imageUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={p.imageUrl}
                    alt=""
                    className="mx-auto mb-2 h-14 w-14 rounded-md object-cover"
                  />
                ) : null}
                <p>{p.name}</p>
                <p className="text-xs font-normal text-primary">{p.price}</p>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-surface-raised">
          {rows.map((r, i) => (
            <tr key={i}>
              <th
                scope="row"
                className="px-4 py-3 text-left font-medium text-foreground"
              >
                {r.attribute}
              </th>
              {r.values.map((v, j) => (
                <td
                  key={j}
                  className="px-4 py-3 text-center text-foreground"
                >
                  {v}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
