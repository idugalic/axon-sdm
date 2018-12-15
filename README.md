# Software Delivery Machine for Axon projects

The SDM framework enables you to control your delivery process in
code.  Think of it as an API for your software delivery.  See this
[introduction][atomist-doc] for more information on the concept of a
Software Delivery Machine and how to create and develop on an SDM.


## Getting Started - local

### Clone this repo to:

```
~/atomist/projects/<owner>/axon-sdm
```
Note: `<owner>` is your Github owner, e.g: idugalic


### Install the Atomist command-line utility

```
$ npm install -g @atomist/cli
```

### Start your local SDM

Install the project dependencies using NPM, compile the TypeScript, and start your SDM in local mode:
```
$ cd ~/atomist/projects/<owner>/axon-sdm
$ atomist start --local
```

### See messages from SDM events

In order to see messages from events (not interspersed with logs), activate a message listener in another terminal:
```
atomist feed
```

### Adding Projects

Further projects can be added under the expanded directory tree in two ways:

#### Configure Existing Projects
If you already have repositories cloned/copied under your `~/atomist/projects/<owner>/`, configure them to activate the local SDM on commit.

Add the Atomist git hook to the existing git projects within this directory structure by running the following command/s:
```
$ cd ~/atomist/projects/<owner>/<repo>
$ atomist add git hooks
```
#### 'atomist clone' Command
The easiest way to add an existing project to your SDM projects is: run the atomist clone command to clone a GitHub.com repository in the right place in the expanded tree and automatically install the git hooks:

`atomist clone https://github.com/<owner>/<repo>`

### Using the SDM

List all `skills` of the SDM:
```
$ atomist s
```

#### Generators

##### Create new Axon (Java, Spring Boot) project
```
$ atomist create axon-java-spring
```
Creates new project under `~/atomist/projects/<owner>/` folder by using `https://github.com/idugalic/axon-java-spring-maven-seed` as a seed.

Newly created project is an Axon application written in Java that uses [Axon Server][axon-server]

 - as an event store, and
 - to dispatch messages (commands, events and queries)

##### Create new Axon (Kotlin, Spring Boot) project
```
$ atomist create axon-kotlin-spring
```
Creates new project under `~/atomist/projects/<owner>/` folder by using `https://github.com/idugalic/axon-kotlin-spring-maven-seed` as a seed.

Newly created project is an Axon application written in Kotlin that uses [Axon Server][axon-server]

 - as an event store, and
 - to dispatch messages (commands, events and queries)

##### Upgrade Axon 
```
$ atomist upgrade axon-core
```
Upgrades Axon (maven) project core dependencies (`org.axonframework`) to a new desired version.

The change will be introduced within specific branch `axon-upgrade-${ci.parameters.desiredAxonCoreVersion}`. To mitigate unneeded unstable pull request creation, we wraped our code transform registration in the `makeBuildAware` function.

##### Upgrade Spring Boot version
```
$ atomist try to upgrade Spring Boot
```

##### Add Maven dependency 
```
$ atomist add Maven dependency 
```

##### Add Spring Boot starter
```
$ atomist add spring boot starter
```

##### Add Spring Boot actuator
```
$ atomist add spring boot actuator
```

##### List local deployments of repository across all branches
```
$ atomist list branch deploys
```
---
Created by [Ivan Dugalic][idugalic]

[idugalic]: http://idugalic.pro
[axon-server]: https://download.axoniq.io/axonserver/AxonServer.zip
[atomist-doc]: https://docs.atomist.com/ (Atomist Documentation)