import readline from "node:readline"
import {InvalidArgumentError} from "@commander-js/extra-typings"
import {z} from "zod/v4"
import {logger} from "./logger.ts"

export const optionalBoolParser = (arg: string): boolean | undefined => {
  const TRUTHY_VALUES = ["true", "1", "on"]
  const FALSY_VALUES = ["false", "0", "off", ""]

  if (TRUTHY_VALUES.includes(arg.toLowerCase())) {
    return true
  }
  if (FALSY_VALUES.includes(arg.toLowerCase())) {
    return false
  }

  if (!arg) {
    return undefined
  }

  throw new InvalidArgumentError(
    `'${arg}' is not a valid boolean parameter. Valid truthy values are: ${TRUTHY_VALUES.map(
      (it) => JSON.stringify(it),
    ).join(", ")}; falsy values are: ${FALSY_VALUES.map((it) =>
      JSON.stringify(it),
    ).join(", ")}`,
  )
}

export const boolParser = (arg: string): boolean => {
  const result = optionalBoolParser(arg)

  if (result === undefined) {
    throw new InvalidArgumentError(`'${arg}' is not a valid boolean parameter.`)
  }

  return result
}

export const remoteSpecRequestHeadersParser = (arg: string) => {
  return z
    .preprocess(
      (str) =>
        z
          .string()
          .transform((it) => JSON.parse(it))
          .parse(str),
      z.record(
        z.string(),
        z.preprocess(
          (it) => (!it || Array.isArray(it) ? it : [it]),
          z.array(
            z.object({
              name: z.string(),
              value: z.string(),
            }),
          ),
        ),
      ),
    )
    .parse(arg)
}

export async function promptContinue(
  question: string,
  defaultValue?: "yes" | "no",
): Promise<void> {
  const answer = await prompt(`${question} (yes/no) `, defaultValue)
  if (answer === "yes") {
    return
  }

  throw new Error("user aborted")
}

async function prompt(
  question: string,
  defaultValue?: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (defaultValue && !process.stdout.isTTY) {
      logger.info(
        `${question} answering '${defaultValue}' as running non-interactively`,
      )
      return resolve(defaultValue)
    }

    try {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      })

      rl.question(question, (answer) => {
        rl.close()
        resolve(answer)
      })
    } catch (err) {
      reject(err)
    }
  })
}
