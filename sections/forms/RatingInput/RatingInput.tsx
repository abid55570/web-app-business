export type RatingInputProps = {
  name: string
  label: string
  max?: number
  defaultValue?: number
}

export function RatingInput({
  name,
  label,
  max = 5,
  defaultValue,
}: RatingInputProps) {
  const stars = Array.from({ length: max }, (_, i) => max - i)
  return (
    <fieldset className="inline-block">
      <legend className="mb-1 text-sm font-semibold text-foreground">
        {label}
      </legend>
      <div
        className="flex flex-row-reverse items-center gap-1"
        role="radiogroup"
        aria-label={label}
      >
        {stars.map((n) => {
          const id = `${name}-${n}`
          return (
            <span key={n} className="contents">
              <input
                type="radio"
                id={id}
                name={name}
                value={n}
                defaultChecked={defaultValue === n}
                className="peer sr-only"
              />
              <label
                htmlFor={id}
                aria-label={`${n} star${n === 1 ? '' : 's'}`}
                className="cursor-pointer text-3xl text-muted-foreground/30 transition-colors hover:text-amber-400 peer-checked:text-amber-400 peer-checked:[&~label]:text-amber-400"
              >
                ★
              </label>
            </span>
          )
        })}
      </div>
    </fieldset>
  )
}
