export interface Injectables {
  data: string,
  imports: string,
  output: string,
  input: string,
  logger: string
}


export const injectASM = (asm: string, instructions: string[], injectables: Injectables, options?: Record<string, any>) => {
  const lines = asm.split("\n").map((line) => line.trim())

  //inject logger after all lines that contain the instruction
  const indexesWithInstruction = lines.map((line, i) =>
    instructions.some((instruction) => line.includes(instruction)) ? {
      lineIndex: i,
      instructionIndex: instructions.findIndex((instruction) => line.includes(instruction))
    } : {
      lineIndex: null,
      instructionIndex: null
    }
  ).filter(i => i !== null)

  let indexShift = 0
  indexesWithInstruction.forEach(({ lineIndex, instructionIndex }) => {
    if (lineIndex === null) return
    lines.splice(lineIndex + indexShift, 0, injectables.logger.replaceAll("ASM_INSTRUCTION_COUNTER", "ASM_INSTRUCTION_COUNTER_" + instructionIndex))
    indexShift++
  })

  const hasData = lines.map(line => line.toLowerCase())
    .some((line) => line.startsWith(".data"))

  //add .data before .code
  if (!hasData) {
    const codeIndex = lines.findIndex((line) => line.toLowerCase().startsWith(".code"))
    lines.splice(codeIndex, 0, ".data")
  }

  //inject data
  const data = Array.from(new Set(instructions.map((_instruction, i) => injectables.data.replaceAll("ASM_INSTRUCTION_COUNTER", `ASM_INSTRUCTION_COUNTER_${i}`)).join("\n").trim().split("\n"))).join("\n")
  const dataIndex = lines.findIndex((line) => line.toLowerCase().startsWith(".data"))
  lines.splice(dataIndex + 1, 0, data)

  //inject imports at top
  lines.splice(0, 0, injectables.imports)

  //inject input after main proc
  if (options && options["INPUT_SIZE_BYTES"]) {
    const mainIndex = lines.findIndex((line) => line.includes("main proc"))
    lines.splice(mainIndex + 1, 0, injectables.input.replaceAll("{{INPUT_SIZE_BYTES}}", options["INPUT_SIZE_BYTES"]))
  }

  //inject output before call ExitProcess
  const outputIndex = lines.findIndex((line) => line.includes("call exitProcess"))
  lines.splice(outputIndex - 2, 0, instructions.map((_instruction, i) => injectables.output.replaceAll("ASM_INSTRUCTION_COUNTER", `ASM_INSTRUCTION_COUNTER_${i}`)).join("\n"))

  return lines.join("\n")

}