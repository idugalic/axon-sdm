import { projectUtils } from "@atomist/automation-client";
import {
    CodeTransform,
    CodeTransformOrTransforms,
} from "@atomist/sdm";
import { SpringProjectCreationParameters, TransformSeedToCustomProject, ReplaceReadmeTitle } from "@atomist/sdm-pack-spring";

export const SpringBootProperiesFiles = "**/{*.yml,*.properties}"

/**
 * Replace the 'demo' placeholder in the seed with the project name
 */
export const SetProjectNameInApplicationYmlOrProperies: CodeTransform<SpringProjectCreationParameters> =
    async (p, ci) => {
        return projectUtils.doWithFiles(p, SpringBootProperiesFiles, f =>
            f.replaceAll("demo", ci.parameters.target.repoRef.repo));
    };

/**
 * Default transformation to turn a Axon Spring Boot seed project into a custom project
 * @type {(CodeTransform<SpringProjectCreationParameters> | CodeTransform)[]}
 */
export const AxonSpringBootGeneratorTransform: CodeTransformOrTransforms<SpringProjectCreationParameters> = [
    ReplaceReadmeTitle,
    SetProjectNameInApplicationYmlOrProperies,
    TransformSeedToCustomProject,
];
