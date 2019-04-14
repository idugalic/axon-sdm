import { editModes, GitHubRepoRef, guid } from "@atomist/automation-client";
import {
    AutoCodeInspection,
    Autofix,
    AutofixRegistration,
    goals,
    hasFile,
    not,
    onAnyPush,
    PushImpact,
    SoftwareDeliveryMachine,
    SoftwareDeliveryMachineConfiguration,
    whenPushSatisfies,
} from "@atomist/sdm";
import {
    createSoftwareDeliveryMachine,
    gitHubGoalStatus,
    goalState,
    isInLocalMode,
} from "@atomist/sdm-core";
import { Build } from "@atomist/sdm-pack-build";
import { singleIssuePerCategoryManaging } from "@atomist/sdm-pack-issue";
import { codeMetrics } from "@atomist/sdm-pack-sloc";
import {
    HasSpringBootApplicationClass,
    HasSpringBootPom,
    IsMaven,
    ListBranchDeploys,
    mavenBuilder,
    MavenDefaultOptions,
    MavenPerBranchDeployment,
    SpringProjectCreationParameterDefinitions,
    SpringProjectCreationParameters,
    springSupport,
} from "@atomist/sdm-pack-spring";
import axios from "axios";
import {
    AddAxonAMQPMavenDependenciesTransform,
    ExcludeAxonServerConnectorTransform,
    SetAxonCoreVersionTransform,
    VersionParameters,
} from "../axon/transform/axonTransforms";
import {
    SerializerParameters,
    SetSerializerInApplicationProperies,
    SpringBootGeneratorTransform,
} from "../axon/transform/springBootTransforms";

export function machine(
    configuration: SoftwareDeliveryMachineConfiguration,
): SoftwareDeliveryMachine {

    const sdm: SoftwareDeliveryMachine = createSoftwareDeliveryMachine(
        {
            name: "Axon software delivery machine",
            configuration,
        });

    const autofix = new Autofix()
        .with(AddLicenseFile);

    const inspect = new AutoCodeInspection();

    const checkGoals = goals("checks")
        .plan(autofix)
        .plan(inspect, new PushImpact()).after(autofix);

    const buildGoals = goals("build")
        .plan(new Build().with({...MavenDefaultOptions, builder: mavenBuilder()}))
        .after(autofix);

    const deployGoals = goals("deploy")
        .plan(new MavenPerBranchDeployment()).after(buildGoals);

    sdm.withPushRules(
        onAnyPush().setGoals(checkGoals),
        whenPushSatisfies(IsMaven).setGoals(buildGoals),
        whenPushSatisfies(HasSpringBootPom, HasSpringBootApplicationClass, IsMaven).setGoals(deployGoals),
    );
    // Spring Extension pack offering: https://github.com/atomist/sdm-pack-spring/blob/master/lib/spring.ts
    sdm.addExtensionPacks(
        springSupport({
            inspectGoal: inspect,
            autofixGoal: autofix,
            review: {
                cloudNative: false, // true: ImportIoFileReviewer, ImportDotStarReviewer, HardcodedPropertyReviewer, ...
                springStyle: true, // true: OldSpringBootVersionReviewer, UnnecessaryComponentScanReviewer, ...
            },
            autofix: {
                springStyle: true, // true: UnnecessaryComponentScanAutofix, FixAutowiredOnSoleConstructors
            },
            reviewListeners: isInLocalMode() ? [] : [
                singleIssuePerCategoryManaging("axon"),
            ],
        }),
        codeMetrics(),
        goalState(),
        gitHubGoalStatus(),
    );

    sdm.addGeneratorCommand<SpringProjectCreationParameters>({
        name: "create axon-java-spring",
        intent: ["create axon-java-spring", "create axon"],
        description: "Create a new Java, Spring Boot, Axon project",
        parameters: SpringProjectCreationParameterDefinitions,
        startingPoint: GitHubRepoRef.from({owner: "idugalic", repo: "axon-java-spring-maven-seed", branch: "master"}),
        transform: SpringBootGeneratorTransform,
    });

    sdm.addGeneratorCommand<SpringProjectCreationParameters>({
        name: "create axon-java-spring-with-structure",
        intent: ["create axon-java-spring-with-structure", "create axon+"],
        description: "Create a new Java, Spring Boot, Axon project with structure",
        parameters: SpringProjectCreationParameterDefinitions,
        startingPoint: GitHubRepoRef.from({
            owner: "idugalic",
            repo: "axon-java-spring-maven-seed",
            branch: "with-structure",
        }),
        transform: SpringBootGeneratorTransform,
    });

    sdm.addGeneratorCommand<SpringProjectCreationParameters>({
        name: "create axon-kotlin-spring",
        intent: ["create axon-kotlin-spring", "create axon-kotlin"],
        description: "Create a new Kotlin, Spring Boot, Axon project",
        parameters: SpringProjectCreationParameterDefinitions,
        startingPoint: GitHubRepoRef.from({owner: "idugalic", repo: "axon-kotlin-spring-maven-seed", branch: "master"}),
        transform: SpringBootGeneratorTransform,
    });

    sdm.addGeneratorCommand<SpringProjectCreationParameters>({
        name: "create axon-kotlin-spring-with-structure",
        intent: ["create axon-kotlin-spring-with-structure", "create axon-kotlin+"],
        description: "Create a new Kotlin, Spring Boot, Axon project with structure",
        parameters: SpringProjectCreationParameterDefinitions,
        startingPoint: GitHubRepoRef.from({
            owner: "idugalic",
            repo: "axon-kotlin-spring-maven-seed",
            branch: "with-structure",
        }),
        transform: SpringBootGeneratorTransform,
    });

    sdm.addCodeTransformCommand<VersionParameters>({
        name: "set axon-version",
        intent: "set axon-version",
        description: `Set Axon core dependency versions`,
        paramsMaker: VersionParameters,
        transform: SetAxonCoreVersionTransform,
        transformPresentation: ci => new editModes.PullRequest(
            `set-axon-version-${ci.parameters.version}-${guid()}`,
            `Set Axon version to ${ci.parameters.version}`,
        ),
    });

    sdm.addCodeTransformCommand({
        name: "exclude axon-server-connector",
        intent: "exclude axon-server-connector",
        description: `Exclude Axon Server connector`,
        transform: ExcludeAxonServerConnectorTransform,
        transformPresentation: ci => new editModes.PullRequest(
            `exclude-axon-server-connector-${guid()}`,
            `Exclude Axon Server Connector`,
        ),
    });

    sdm.addCodeTransformCommand({
        name: "add amqp",
        intent: "add amqp",
        description: `Add Axon AMQP dependencies to Spring Boot project`,
        paramsMaker: VersionParameters,
        transform: AddAxonAMQPMavenDependenciesTransform,
        transformPresentation: ci => new editModes.PullRequest(
            `add-amqp-dependencies-${guid()}`,
            `Add AMQP dependencies`,
        ),
    });

    sdm.addCodeTransformCommand({
        name: "set serializer",
        intent: "set serializer",
        description: `Set desired Serializer for Axon Spring Boot project`,
        paramsMaker: SerializerParameters,
        transform: SetSerializerInApplicationProperies,
        transformPresentation: ci => new editModes.PullRequest(
            `set-serializer-${ci.parameters.serializer}-${guid()}`,
            `Set serializer to ${ci.parameters.serializer}`,
        ),
    });

    sdm.addCommand(ListBranchDeploys);

    return sdm;
}

export const LicenseFilename = "LICENSE";

export const AddLicenseFile: AutofixRegistration = {
    name: "License Fix",
    pushTest: not(hasFile(LicenseFilename)),
    transform: async p => {
        const license = await axios.get("https://www.apache.org/licenses/LICENSE-2.0.txt");
        return p.addFile(LicenseFilename, license.data);
    },
};
