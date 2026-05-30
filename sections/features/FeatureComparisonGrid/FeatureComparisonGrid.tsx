export type FeatureComparisonGridProduct = {
  name: string
  highlighted?: boolean
  values: (boolean | string)[]
}

export type FeatureComparisonGridProps = {
  heading?: string
  features: string[]
  products: FeatureComparisonGridProduct[]
}

export function FeatureComparisonGrid({
  heading,
  features,
  products,
}: FeatureComparisonGridProps) {
  return (
    <section className="px-6 py-16">
      {heading ? (
        <h2 className="mx-auto mb-8 max-w-3xl text-center text-3xl font-bold text-foreground">
          {heading}
        </h2>
      ) : null}
      <div className="mx-auto max-w-5xl overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="p-3 text-left text-xs font-bold uppercase text-muted-foreground" />
              {products.map((p, i) => (
                <th
                  key={i}
                  className={`p-3 text-center text-sm font-bold ${
                    p.highlighted
                      ? 'rounded-t-lg bg-primary/10 text-primary'
                      : 'text-foreground'
                  }`}
                >
                  {p.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features.map((f, fi) => (
              <tr key={fi} className="border-t border-border">
                <td className="p-3 text-sm font-medium text-foreground">{f}</td>
                {products.map((p, pi) => {
                  const v = p.values[fi]
                  return (
                    <td
                      key={pi}
                      className={`p-3 text-center text-sm ${
                        p.highlighted ? 'bg-primary/5' : ''
                      }`}
                    >
                      {typeof v === 'boolean' ? (
                        v ? (
                          <span className="text-success-fg">✓</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )
                      ) : (
                        <span className="font-mono text-foreground">{v}</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
