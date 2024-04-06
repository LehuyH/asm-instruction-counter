import { consola } from "consola";
import { spawnSync } from "child_process";
import { promptChoice, prompt } from "../lib/cliUtils.ts";
import { defineCommand } from "citty";
import { getPipelineInfo } from "../lib/pipelines.ts";
import { bigEndianByteToHex, hexToDecimal } from "../lib/memoryUtils.ts";
import { injectASM } from "../lib/asmUtils.ts";

export const countCMD = defineCommand({
  meta: {
    name: "count",
    description: "Count the number of times an instruction is executed"
  },
  args: {
    source: {
      type: "string",
      description: "The path to the source asm file",
    },
    pipeline: {
      type: "string",
      description: "The build pipeline to use"
    },
    instructions: {
      type: "string",
      description: "The instructions to count",
    }
  },
  async run({ args }: { args: { source?: string; pipeline?: string; instructions?: string } }) {
    const pipelines = await getPipelineInfo();

    if (!args.source) {
      args.source = await prompt("Please type the path to the source asm file", (input) => {
        if (input.length === 0) return "Please type a path"
      }) as string;
    }

    const asm = await (await Bun.file(args.source)).text();

    if (!args.pipeline) {
      args.pipeline = await promptChoice("Please select a pipeline", Object.keys(pipelines).map((key) => ({ label: key, value: key }))) as string;
    }

    if (!args.instructions) {
      args.instructions = await prompt("Please type the instruction to count", (input) => {
        if (input.length === 0) return "Please type an instruction"
      }) as string;
    }

    //@ts-expect-error args._ is a workaround for multiple args
    const instructions = [args.instructions].concat(args._)

    const pipeline = pipelines[args.pipeline];
    const pipelineFolder = `./pipelines/${args.pipeline}`;

    const newAsm = injectASM(asm, instructions, pipeline.injectables);

    await Bun.write(`${pipelineFolder}/main.asm`, newAsm);
    process.chdir(pipelineFolder);

    consola.start("Assembling...")
    const assemble = spawnSync(`./${pipeline.assemble.split(" ")[0]}`, pipeline.assemble.split(" ").slice(1), {
      stdio: "pipe",

    });


    if (assemble.status !== 0) {
      consola.error("Assemble failed with error:\n", new TextDecoder().decode(assemble.stderr));
      process.exit(1);
    }

    consola.success("Assemble complete")



    consola.start("Linking...")
    const link = spawnSync(`./${pipeline.link.split(" ")[0]}`, pipeline.link.split(" ").slice(1), {
      stdio: "pipe",
    });

    if (link.status !== 0) {
      console.log(pipeline.link.split(" ").slice(1))
      consola.info("stdout", new TextDecoder().decode(link.stdout));
      consola.error("Link failed with error:\n", new TextDecoder().decode(link.stderr));
      process.exit(1);
    }
    consola.success("Link complete")


    consola.start("Executing...")
    const command = spawnSync("./main.exe", {
      stdio: "pipe",
    });
    const bytes = Uint8Array.from(command.stdout);
    consola.success("Execution complete")

    consola.box("Count Results")
    consola.info("How many times was each instruction was executed?");
    const benchmarkResults = {} as Record<string, number>;

    instructions.forEach((instruction, i) => {
      const byte = bytes.slice(i * 8, i * 8 + 8);
      const result = {
        byte,
        hex: bigEndianByteToHex(byte),
        decimal: hexToDecimal(bigEndianByteToHex(byte))
      }
      benchmarkResults[instruction] = result.decimal;
    })

    const benchmarkResultsSorted = Object.fromEntries(Object.entries(benchmarkResults).sort((a, b) => b[1] - a[1]))
    const total = Object.values(benchmarkResults).reduce((a, b) => a + b, 0);
    console.table(benchmarkResultsSorted);
    console.log("TOTAL: ", total)
    process.exit(0);


  }
});

