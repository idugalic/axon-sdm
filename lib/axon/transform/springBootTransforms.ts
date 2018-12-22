import { projectUtils, NoParameters, Parameters, Parameter } from "@atomist/automation-client";
import {
    CodeTransform,
    CodeTransformOrTransforms,
} from "@atomist/sdm";
import { SpringProjectCreationParameters, TransformSeedToCustomProject, parseProperties } from "@atomist/sdm-pack-spring";
import { ReplaceReadmeTitle } from "./axonTransforms";

export const SpringBootProperiesOrYMLFiles = "**/{*.yml,*.properties}"

/**
 * Replace the 'demo' placeholder in the seeds application.properties or application.yml with the project name
 */
export const SetProjectNameInApplicationYmlOrProperies: CodeTransform<SpringProjectCreationParameters> =
    async (p, ci) => {
        return projectUtils.doWithFiles(p, SpringBootProperiesOrYMLFiles, f =>
            f.replaceAll("demo", ci.parameters.target.repoRef.repo));
    };

@Parameters()
export class SerializerParameters {
    @Parameter({
        displayName: "Desired serializer",
        description: "The desired serializer across these repos",
        pattern: /(default|xstream|java|jackson)/,
        validInput: "Possible values: default, xstream, java, and jackson",
        required: true,
    })
    serializer: string;
}

/**
 * Set the desired serializer in application.properties
 */
export const SetSerializerInApplicationProperies: CodeTransform<SerializerParameters> =
    async (p, ci) => {
        const properties = await parseProperties(p, "src/main/resources/application.properties");
        await properties.addProperty({
            key: "axon.serializer.general",
            value: "jackson",
            comment: "Sets event, command and query serializers to Jackson. Possible values for these keys are: `default`, `xstream`, `java`, and `jackson`",
        });
    };

/**
 * Default transformation to turn a Spring Boot seed project into a custom project
 * @type {(CodeTransform<SpringProjectCreationParameters> | CodeTransform)[]}
 */
export const SpringBootGeneratorTransform: CodeTransformOrTransforms<SpringProjectCreationParameters> = [
    ReplaceReadmeTitle,
    SetProjectNameInApplicationYmlOrProperies,
    TransformSeedToCustomProject,
];
