# ASM Instruction Counter 📈 

A platform-agnostic tool to count the number of instructions run by an assembly program.

## Why Use asm-instruction-counter?

 
-  **Plug and Play**: asm-instruction-counter is a platform agnostic tool that can be used with any assembly program and build pipeline.

- **Benchmarking**: Define a benchmarking strategy for your assembly program and measure the number of instructions ran with zero modifications required to your assembly program.

- **Common Datasets**: asm-instruction-counter provides a utility to generate common datasets for testing and benchmarking such as `random`, `needleInHaystack`, and `ordered`.

- **100% Configurable**: Create custom-build pipelines and configurations to suit your needs.
  

## 🛠️ Installation
Download a pre-built binary from the [releases](https://github.com/LehuyH/asm-instruction-counter/releases) page


To build from source, clone the repository and run the following commands:

```bash
bun build ./src/index.ts --compile --outfile asm-counter.exe
```

To use the `bun` command, you must have the [Bun](https://bun.sh/) CLI installed.

## 🚀 Usage

```bash
asm-counter.exe <command> [options] 
```

### COMMANDS

| Command   | Description                                                  |
|-----------|--------------------------------------------------------------|
| count     | Count the number of times an instruction is executed          |
| benchmark | Count the number of times an instruction is executed when running a dataset |

Use `asm-counter.exe <command> --help` for more information about a command.

## 🧰 Build Pipelines
To use asm-instruction-counter with your assembly program, you must define a build pipeline. A build pipeline is a series of steps that are executed to build, run and prepare the assembly program for counting instructions.

By default, asm-instruction-counter scans the `./pipelines` directory for build pipelines.

Each folder in the `./pipelines` directory represents a build pipeline. The folder name is the name of the build pipeline.

Each pipeline must have a `pipelines.json` file that defines the steps in the pipeline.

The schema for the `pipelines.json` file is as follows:
```json
{
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "properties": {
        "assemble": {
            "type": "string"
        },
        "link": {
            "type": "string"
        },
        "injectables": {
            "type": "object",
            "properties": {
                "data": {
                    "type": "string"
                },
                "imports": {
                    "type": "string"
                },
                "input": {
                    "type": "string"
                },
                "output": {
                    "type": "string"
                },
                "logger": {
                    "type": "string"
                }
            },
            "required": ["data", "imports", "input", "output", "logger"]
        }
    },
    "required": ["assemble", "link", "injectables"]
}
```

Releases ship with an example `masm_x64` pipeline that can be used as a reference.

## 📜 License

asm-instruction-counter is licensed under the [MIT License](LICENSE).
