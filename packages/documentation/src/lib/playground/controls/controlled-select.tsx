import {useEffect} from "react"
import {type UseControllerProps, useController} from "react-hook-form"

export function ControlledSelect<
  Inputs extends Record<string, string | boolean | undefined>,
>(props: {label: string; values: string[]} & UseControllerProps<Inputs>) {
  const {field} = useController(props)

  useEffect(() => {
    if (
      field.value !== props.values[0] &&
      props.values[0] &&
      !props.values.includes(field.value as string)
    ) {
      field.onChange({target: {value: props.values[0]}})
    }
  }, [field.value, field.onChange, props.values])

  return (
    <>
      <label htmlFor={field.name}>{props.label}</label>
      <select
        id={field.name}
        onChange={field.onChange}
        value={field.value as string}
      >
        {props.values.map((it) => (
          <option key={it} value={it}>
            {it || "(default)"}
          </option>
        ))}
      </select>
    </>
  )
}
