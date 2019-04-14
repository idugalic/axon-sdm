import { astUtils, NoParameters, Parameter, Parameters, projectUtils } from "@atomist/automation-client";
import { CodeTransform, CodeTransformOrTransforms } from "@atomist/sdm";
import { addDependencyTransform, SpringProjectCreationParameters } from "@atomist/sdm-pack-spring";
import { XmldocFileParser } from "../../xml/XmldocFileParser";

const AxonDefaultGroup = "org.axonframework";
const SpringDefaultGroup = "org.springframework.boot";

/**
 * Add Axon dependency function (CodeTransform)
 *
 * @param artifact
 * @param version
 * @param group
 */
function addAxonMavenDependencyTransform(artifact: string, version: string, group: string = AxonDefaultGroup): CodeTransform {
    return addDependencyTransform({artifact, group, version});
}

/**
 * Add Spring dependency function (CodeTransform)
 *
 * @param artifact
 * @param group
 */
function addSpringMavenDependencyTransform(artifact: string, group: string = SpringDefaultGroup): CodeTransform {
    return addDependencyTransform({artifact, group, version: undefined});
}

/**
 * Change the title block in README file
 *
 * @param params
 */
function titleBlock(params: SpringProjectCreationParameters): string {
    return `# ${params.description}`;
}

/**
 * Add Axon Spring AMQP spring boot starter
 */
const AddAxonSpringBootStarterAMQPMavenDependencyTransform: CodeTransform<VersionParameters> =
    async (p, ci) =>
        addAxonMavenDependencyTransform("axon-amqp-spring-boot-starter", ci.parameters.version, "org.axonframework.extensions.amqp")(p, ci);

/**
 * Add Spring AMQP spring boot starter
 */
const AddSpringBootStarterAMQPMavenDependencyTransform: CodeTransform<NoParameters> =
    async (p, ci) => addSpringMavenDependencyTransform("spring-boot-starter-amqp")(p, ci);

@Parameters()
export class VersionParameters {
    @Parameter({
        displayName: "Desired  version",
        description: "The desired version across these repos",
        pattern: /^.+$/,
        validInput: "Semantic version",
        required: true,
    })
    public version: string;
}

/**
 * Update the readme - code transform
 */
export const ReplaceReadmeTitle: CodeTransform<SpringProjectCreationParameters> =
    async (p, ci) => {
        return projectUtils.doWithFiles(p, "README.md", async readMe => {
            await readMe.replace(/^#[\s\S]*?## /, titleBlock(ci.parameters));
        });
    };

/**
 * Set new version of Axon core (org.axonframework) libraries (maven) - code transform
 */
export const SetAxonCoreVersionTransform: CodeTransform<VersionParameters> =
    async (p, ci) => {
        return astUtils.doWithAllMatches(p, new XmldocFileParser(),
            "**/pom.xml",
            "//dependencies/dependency[/groupId[@innerValue='org.axonframework']]/version",
            n => {
                n.$value = `<version>` + ci.parameters.version + `</version>`;
            });
    };
/**
 * Excludes Axon Server Connector (maven) - code transform
 */
export const ExcludeAxonServerConnectorTransform: CodeTransform<NoParameters> =
    async (p, ci) => {
        return astUtils.doWithAllMatches(p, new XmldocFileParser(),
            "**/pom.xml",
            "//dependencies/dependency[/artifactId[@innerValue='axon-spring-boot-starter']]/artifactId",
            n => {
                n.$value =
                    `<artifactId>axon-spring-boot-starter</artifactId>
                <exclusions>
                    <exclusion>
                        <groupId>org.axonframework</groupId>
                        <artifactId>axon-server-connector</artifactId>
                    </exclusion>
                </exclusions>`;
            });
    };

/**
 * Add AMQP integration by composing multiple code transforms  - code transform
 */
export const AddAxonAMQPMavenDependenciesTransform: CodeTransformOrTransforms<VersionParameters> = [
    AddAxonSpringBootStarterAMQPMavenDependencyTransform,
    AddSpringBootStarterAMQPMavenDependencyTransform,
];
