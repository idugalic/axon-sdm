import { projectUtils } from "@atomist/automation-client";
import {
    CodeTransform,
    CodeTransformOrTransforms,
} from "@atomist/sdm";
import { SpringProjectCreationParameters, TransformSeedToCustomProject, ReplaceReadmeTitle } from "@atomist/sdm-pack-spring";


/**
 * Replace the ${PROJECT_NAME} placeholder in the seed with the project name
 */
export const SetProjectNameInApplicationYml: CodeTransform<SpringProjectCreationParameters> =
    async (p, ci) => {
        return projectUtils.doWithFiles(p, "src/main/resources/application.yml", f =>
            f.replace(/demo/, name(ci.parameters)));
    };

function name(params: SpringProjectCreationParameters): string {
    return `${params.target.repoRef.repo}`;
}

/**
 * Default transformation to turn a Axon Spring Boot seed project into a custom project
 * @type {(CodeTransform<SpringProjectCreationParameters> | CodeTransform)[]}
 */
export const AxonSpringBootGeneratorTransform: CodeTransformOrTransforms<SpringProjectCreationParameters> = [
    ReplaceReadmeTitle,
    SetProjectNameInApplicationYml,
    TransformSeedToCustomProject,
];
