import { defineCommand, runMain } from "citty"
import { countCMD } from "./commands/count.ts";
import { benchmarkCMD } from "./commands/benchmark.ts";


const subCommands = {
  count: countCMD,
  benchmark: benchmarkCMD
}

const main = defineCommand({
    meta: {
      name: "ASM Instruction Counter",
      version: "0.0.1",
      description: "Dead simple benchmarking tool for assembly instructions",
    },
    subCommands
  });
  
runMain(main);



