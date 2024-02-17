import readline from "readline"
import {logger} from "./logger"

export async function promptContinue(
  question: string,
  defaultValue?: "yes" | "no",
): Promise<void> {
  const answer = await prompt(question + " (yes/no) ", defaultValue)
  if (answer === "yes") {
    return
  }

  throw new Error("user aborted")
}

export async function prompt(
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
