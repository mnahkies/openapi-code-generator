import readline from "readline"

export async function promptContinue(question: string): Promise<void> {
  const answer = await prompt(question + " (yes/no) ")
  if (answer === "yes") {
    return
  }

  throw new Error("user aborted")
}

export async function prompt(question: string): Promise<string> {
  return new Promise((resolve, reject) => {
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
