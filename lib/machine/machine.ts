import { GitHubRepoRef, editModes, guid } from "@atomist/automation-client";
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
import { Build, makeBuildAware } from "@atomist/sdm-pack-build";
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
import { UpgradeAxonCoreLibrariesVersionParameters, UpgradeAxonCoreLibrariesVersionParameterDefinitions, SetAxonCoreVersionTransform } from "../axon/transform/axonTransforms";
import { SpringBootGeneratorTransform } from "../axon/transform/springBootTransforms";


export function machine(
    configuration: SoftwareDeliveryMachineConfiguration,
): SoftwareDeliveryMachine {

    const sdm: SoftwareDeliveryMachine = createSoftwareDeliveryMachine(
        {
            name: "Spring software delivery machine",
            configuration,
        });

    const autofix = new Autofix().with(AddLicenseFile);
    const inspect = new AutoCodeInspection();

    const checkGoals = goals("checks")
        .plan(autofix)
        .plan(inspect, new PushImpact()).after(autofix);

    const buildGoals = goals("build")
        .plan(new Build().with({ ...MavenDefaultOptions, builder: mavenBuilder() }))
        .after(autofix);

    const deployGoals = goals("deploy")
        .plan(new MavenPerBranchDeployment()).after(buildGoals);

    sdm.withPushRules(
        onAnyPush().setGoals(checkGoals),
        whenPushSatisfies(IsMaven).setGoals(buildGoals),
        whenPushSatisfies(HasSpringBootPom, HasSpringBootApplicationClass, IsMaven).setGoals(deployGoals),
    );

    sdm.addExtensionPacks(
        springSupport({
            inspectGoal: inspect,
            autofixGoal: autofix,
            review: {
                cloudNative: true,
                springStyle: true,
            },
            autofix: {},
            reviewListeners: isInLocalMode() ? [] : [
                singleIssuePerCategoryManaging("sdm-pack-spring"),
            ],
        }),
        codeMetrics(),
        goalState(),
        gitHubGoalStatus(),
    );

    sdm.addGeneratorCommand<SpringProjectCreationParameters>({
        name: "create-axon-java-spring",
        intent: "create axon-java-spring",
        description: "Create a new Java, Spring Boot, Axon project",
        parameters: SpringProjectCreationParameterDefinitions,
        startingPoint: GitHubRepoRef.from({ owner: "idugalic", repo: "axon-java-spring-maven-seed", branch: "master" }),
        transform: SpringBootGeneratorTransform,
    });

    sdm.addGeneratorCommand<SpringProjectCreationParameters>({
        name: "create-axon-kotlin-spring",
        intent: "create axon-kotlin-spring",
        description: "Create a new Kotlin, Spring Boot, Axon project",
        parameters: SpringProjectCreationParameterDefinitions,
        startingPoint: GitHubRepoRef.from({ owner: "idugalic", repo: "axon-kotlin-spring-maven-seed", branch: "master" }),
        transform: SpringBootGeneratorTransform,
    });

    sdm.addCodeTransformCommand<UpgradeAxonCoreLibrariesVersionParameters>(makeBuildAware({
        name: "axon core-upgrade",
        intent: "upgrade axon-core",
        description: `Upgrade Axon core dependency versions`,
        parameters: UpgradeAxonCoreLibrariesVersionParameterDefinitions,
        transform: SetAxonCoreVersionTransform,
        transformPresentation: ci => new editModes.PullRequest(
            `axon-upgrade-${ci.parameters.desiredAxonCoreVersion}-${guid()}`,
            `Upgrade Axon core versions to ${ci.parameters.desiredAxonCoreVersion}`,
        ),
    }));

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
