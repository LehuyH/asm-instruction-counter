import readline from 'node:readline/promises';

export async function prompt(message: string, validator: (input: string) => string | undefined): Promise<string | undefined> {
  process.stdout.write(`\x1b[36m❯ ${message}: \x1b[0m\n`);
  const rl = readline.createInterface({
    input: process.stdin,
  })[Symbol.asyncIterator]();

  for await (const line of rl) {
    const error = validator(line.trim())
    if (error) {
      process.stdout.write(`\x1b[31m${error}\x1b[0m\n`);
      continue;
    }
    process.stdout.write(`\x1b[36m✔ ${line.trim()}\x1b[0m\n\n`);
    return line.trim()
  }
}

export async function promptChoice(prompt: string, choices: { label: string, value: string }[]): Promise<string | undefined> {
  process.stdout.write(`\x1b[36m❯ ${prompt} (type a number)\n\x1b[0m`);
  choices.forEach((choice, i) => {
    process.stdout.write(`  ${i + 1}. ${choice.label}\n`)
  })

  const rl = readline.createInterface({
    input: process.stdin,
  })[Symbol.asyncIterator]();

  for await (const line of rl) {
    const choice = choices[parseInt(line.trim()) - 1]
    if (!choice) {
      process.stdout.write(`\x1b[31mInvalid choice\x1b[0m\n`);
      continue;
    }
    process.stdout.write(`\x1b[36m✔ ${choice.label}\x1b[0m\n\n`);
    return choice.value
  }
}