import { ParametersObject, CodeTransform } from "@atomist/sdm";
import { XmldocFileParser } from "../../xml/XmldocFileParser";
import { astUtils } from "@atomist/automation-client";
import { getParseTreeNode } from "typescript";
import { DefaultTreeNodeReplacer } from "@atomist/tree-path/lib/TreeNode";

export interface UpgradeAxonCoreLibrariesVersionParameters {
    desiredAxonCoreVersion: string;
}

export const DesiredAxonCoreVersion = "4.0.3";

export const UpgradeAxonCoreLibrariesVersionParameterDefinitions: ParametersObject = {
    desiredAxonCoreVersion: {
        displayName: "Desired Axon Spring Boot starter version",
        description: "The desired Axon Spring Boot starter version across these repos",
        pattern: /^.+$/,
        validInput: "Semantic version",
        required: true,
        defaultValue: DesiredAxonCoreVersion,
    },
}

/**
 * Set new version of Axon core (org.axonframework) libraries (maven)
 */
export const SetAxonCoreVersionTransform: CodeTransform<UpgradeAxonCoreLibrariesVersionParameters> =
    async (p, ci) => {
        return astUtils.doWithAllMatches(p, new XmldocFileParser(),
            "**/pom.xml",
            "//dependencies/dependency[/groupId[@innerValue='org.axonframework']]/version",
            n => {
                n.$value = `<version>`+ci.parameters.desiredAxonCoreVersion+`</version>`;
            });
    };
/**
 * Excludes Axon Server Connector (maven)
 */
export const ExcludeAxonServerConnectorTransform: CodeTransform<UpgradeAxonCoreLibrariesVersionParameters> =
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
