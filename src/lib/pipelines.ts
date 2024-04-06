import { readdirSync } from "node:fs"
import type { Injectables } from "./asmUtils.ts";

interface PipelineInfo {
    assemble: string;
    link: string;
    injectables: Injectables;
}

export const getPipelineInfo = async (path='./pipelines') => {
    const pipelineFolders = readdirSync(path);
    const pipelineInfo = {} as Record<string, PipelineInfo>;
    //Attempt to read pipeline.json from each folder
    for (const folder of pipelineFolders) {
        const pipelineInfoPath = `${path}/${folder}/pipeline.json`;
        try {
            const file = Bun.file(pipelineInfoPath);
            const info = await file.json() as PipelineInfo;
            pipelineInfo[folder] = info;
        } catch (e) {
            throw new Error(`Error reading pipeline info from ${pipelineInfoPath}: ${e}`);
        }
    }

    return pipelineInfo;
}
    