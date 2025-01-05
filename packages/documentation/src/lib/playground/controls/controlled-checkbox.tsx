import React from "react"
import {type UseControllerProps, useController} from "react-hook-form"

export function ControlledCheckbox<
  Inputs extends Record<string, string | boolean>,
>(props: {label: string} & UseControllerProps<Inputs>) {
  const {field} = useController(props)

  return (
    <>
      <label htmlFor={field.name}>{props.label}</label>
      <input
        id={field.name}
        type={"checkbox"}
        checked={field.value as boolean}
        onChange={field.onChange}
      />
    </>
  )
}
