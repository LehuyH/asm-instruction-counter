import { spawnSync } from "child_process";
import { consola } from "consola";
import { defineCommand } from "citty";
import { getPipelineInfo } from "../lib/pipelines.ts";
import { bigEndianByteToHex, hexToDecimal } from "../lib/memoryUtils.ts";
import { injectASM } from "../lib/asmUtils.ts";
import { datasets } from "../lib/datasetGen.ts";
import { promptChoice, prompt } from "../lib/cliUtils.ts";

export const benchmarkCMD = defineCommand({
    meta: {
        name: "benchmark",
        description: "Count the number of times an instruction is executed when running a dataset"
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
        },
        dataset: {
            type: "string",
            description: `The dataset to use. Available datasets: ${Object.keys(datasets).join(", ")}`
        },
        "byte-size": {
            type: "string",
            description: "The byte size of each item in the dataset: Must be 1, 2, 4, 8",
        },
        n: {
            type: "string",
            description: "The starting size of the dataset",
        },
        average: {
            type: "string",
            description: "The number of times to run the benchmark per N size (default 1)"
        },
        "no-step": {
            type: "boolean",
            description: "If true, will not prompt for step and end values"
        },
        step: {
            type: "string",
            description: "The step size of the dataset"
        },
        end: {
            type: "string",
            description: "The ending size of the dataset"
        }
       
    },
    async run({ args }: { args: { source?: string; pipeline?: string; instructions?: string; dataset?: string; n?: string; "byte-size"?: string, step?: string, end?: string, "no-step"?: boolean, average?:string } }) {
        const pipelines = await getPipelineInfo();

        if(!args.average) args.average = "1";

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

        if (!args.dataset) {
            args.dataset = await promptChoice("Please select a dataset", Object.keys(datasets).map((key) => ({ label: key, value: key }))) as string;
        }

        if (!args.n) {
            args.n = await prompt("Please type the starting size (N=) of the dataset", (input) => {
                if (isNaN(parseInt(input))) return "Please type a number";
            }) as string;
        }

        if (!args["byte-size"]) {
            args["byte-size"] = await promptChoice("Please select the byte size of each item in the dataset", [
                {
                    label: "byte",
                    value: "1"
                }, {
                    label: "word",
                    value: "2"
                }, {
                    label: "dword",
                    value: "4"
                }, {
                    label: "qword",
                    value: "8"
                }
            ]) as string;
        }

       //If doing multiple N integers, ensure both step and end are defined
       let promptStep = false;
       if(!args.step && !args.end && !args["no-step"]) {
            const isConfirmed = await promptChoice("Do you want to benchmark multiple N sizes? (Y/N)", [
                {
                    label: "Yes",
                    value: "Y"
                }, {
                    label: "No",
                    value: "N"
                }
            ]) as string;

            if(isConfirmed === "Y") {
                promptStep = true;
            }
         }
         

            
        if ((args.step && !args.end) || (promptStep && !args.step)) {
            args.end = await prompt("Please type the ending size (N) of the dataset", (input) => {
                if (isNaN(parseInt(input))) return "Please type a number";
            }) as string;
        }
        
        if ((args.end && !args.step) || (promptStep && !args.end)) {
            args.step = await prompt("Please type the step size of N", (input) => {
                if (isNaN(parseInt(input))) return "Please type a number";
            }) as string;
        }

        const byteSize = (((args.end) ? parseInt(args.end) : parseInt(args.n)) + 1) * parseInt(args["byte-size"]);

        const newAsm = injectASM(asm, instructions, pipeline.injectables, {
            "INPUT_SIZE_BYTES":byteSize
        });

        await Bun.write(`${pipelineFolder}/main.asm`, newAsm);
        process.chdir(pipelineFolder);
        consola.start("Assembling...")
        const assemble = spawnSync(`./${pipeline.assemble.split(" ")[0]}`, pipeline.assemble.split(" ").slice(1), {
            stdio: "pipe"
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

        const benchmarkResults = {} as Record<string, Record<string, number>>;
        let currentN = parseInt(args.n);
        let endN = parseInt(args.end as string) || currentN;

        while(currentN <= endN) {
            consola.start(`Executing with N=${currentN}...`)
            for(let i = 0; i < parseInt(args.average as string); i++) {
                const dataset = await datasets[args.dataset](currentN, parseInt(args["byte-size"]) as 1 | 2 | 4 | 8);
                
                const command = spawnSync("./main.exe", {
                    stdio: "pipe",
                    input: dataset
                });

                const bytes = Uint8Array.from(command.stdout);
                instructions.forEach((instruction, i) => {
                    const byte = bytes.slice(i * 8, i * 8 + 8);
                    const result = {
                        byte,
                        hex: bigEndianByteToHex(byte),
                        decimal: hexToDecimal(bigEndianByteToHex(byte))
                    }
                    if (!benchmarkResults[instruction]) benchmarkResults[instruction] = {};
                    if(!benchmarkResults[instruction][`N=${currentN}`]) benchmarkResults[instruction][`N=${currentN}`] = 0;
                    benchmarkResults[instruction][`N=${currentN}`] += result.decimal;
                })
            }


            currentN += parseInt(args.step as string);
        }

        //Apply average
        Object.keys(benchmarkResults).forEach((instruction) => {
            Object.keys(benchmarkResults[instruction]).forEach((key) => {
                benchmarkResults[instruction][key] = benchmarkResults[instruction][key] / parseInt(args.average as string);
            })
        })

    

        consola.success("All benchmarks complete!")

        consola.box("Benchmark Results")
        consola.info("Input Dataset: " + args.dataset)
        consola.info("How many times each instruction was executed?")

        //Compute total
        const totalRow: Record<string, number> = Object.values(benchmarkResults).reduce((acc, val) => {
            Object.keys(val).forEach((key) => {
                if (!acc[key]) acc[key] = 0;
                acc[key] += val[key];
            });
            return acc;
        }, {})

        console.table({
            ...benchmarkResults,
            TOTAL: totalRow
        });

        //Generate quick chart 
        const chart = {
            type: "line",
            data:{
                labels: Object.keys(benchmarkResults[instructions[0]]),
                datasets: instructions.map((instruction) => {
                    return {
                        label: instruction,
                        data: Object.values(benchmarkResults[instruction]),
                        fill: false,
                        borderDash: [5, 5],
                    }
                })
            }
        }

        Bun.write("chart.json", JSON.stringify(chart, null, 2));

        const endpoint = "https://quickchart.io/chart"
        await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                width: 600,
                height: 400,
                backgroundColor: "white",
                format: "png",
                chart
            })
        }).then((res:Response) => res.blob()).then((blob) => {
            Bun.write("chart.png", blob);
        }).finally(() => {
            process.exit(0);
        })
    }
    


});

