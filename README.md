# Software Delivery Machine for Axon projects

The SDM framework enables you to control your delivery process in code. Think of it as an API for your software delivery. See this [introduction][atomist-doc] for more information on the concept of a Software Delivery Machine and how to create and develop on an SDM.

[Axon][axon] is an end-to-end development and infrastructure platform for smoothly evolving Event-Driven microservices focused on CQRS and Event Sourcing.

This SDM is build on top of the [official Atomist Spring Boot SDM](https://github.com/atomist/sdm-pack-spring), it can:

 - run goals in respond to a commit.
   - run your tests in the background
   - deploy locally or in the cloud, and be sure that you’re doing manual testing on committed code
   - apply autofixes directly in your repository
   - check code inspections and tell you when you’ve violated them
 - execute commands
   - [generate new Axon projects](#generators) from seeds
   - [perform transforms](#code-transforms) on existing Axon project (repository), or on many repositories at once
   - do inspections on one or many Axon projects (repositories)

## Table of Contents
- [Software Delivery Machine for Axon projects](#software-delivery-machine-for-axon-projects)
  - [Table of Contents](#table-of-contents)
  - [Getting Started - local mode](#getting-started---local-mode)
    - [Clone this repo to:](#clone-this-repo-to)
    - [Install the Atomist command-line utility](#install-the-atomist-command-line-utility)
    - [Start your local SDM](#start-your-local-sdm)
    - [See messages from SDM](#see-messages-from-sdm)
    - [Using the SDM](#using-the-sdm)
      - [Generators](#generators)
        - [Create new Axon (java, maven, spring boot) project](#create-new-axon-java-maven-spring-boot-project)
        - [Create new Axon (java, maven, spring boot) project with structure](#create-new-axon-java-maven-spring-boot-project-with-structure)
        - [Create new Axon (kotlin, maven, spring boot) project](#create-new-axon-kotlin-maven-spring-boot-project)
        - [Create new Axon (kotlin, maven, spring boot) project with structure](#create-new-axon-kotlin-maven-spring-boot-project-with-structure)
      - [Code transforms](#code-transforms)
        - [Set Axon version (maven)](#set-axon-version-maven)
        - [Exclude Axon Server Connector (maven)](#exclude-axon-server-connector-maven)
        - [Add Spring (Boot) AMQP dependencies (maven, spring boot)](#add-spring-boot-amqp-dependencies-maven-spring-boot)
        - [Set desired Serializer (maven, spring boot)](#set-desired-serializer-maven-spring-boot)
        - [Other code transforms](#other-code-transforms)
  - [Getting Started - team mode](#getting-started---team-mode)
  - [Deploying your SDM](#deploying-your-sdm)
    - [Running in Docker](#running-in-docker)
  - [Debugging an SDM](#debugging-an-sdm)

## Getting Started - local mode

When you run this SDM in local mode, it operates in the privacy of your laptop. 

### Clone this repo to:

```
~/atomist/projects/<owner>/axon-sdm
```
Note: `<owner>` is your Github owner, e.g: idugalic


### Install the Atomist command-line utility

```
$ npm install -g @atomist/cli
```
> Note:  Make sure that you have `node` and `npm` available.

### Start your local SDM

Install the project dependencies using NPM, compile the TypeScript, and start your SDM in local mode:
```
$ cd ~/atomist/projects/<owner>/axon-sdm
$ atomist start --local
```

### See messages from SDM

In order to see messages from events (not interspersed with logs), activate a message listener in another terminal:
```
atomist feed
```

### Using the SDM

List all `skills` (commands that you can use to transfrom your project) of the SDM:
```
$ atomist s
```

#### Generators

##### Create new Axon (java, maven, spring boot) project
```
$ atomist create axon-java-spring
```
Creates new project under `~/atomist/projects/<owner>/` folder by using `https://github.com/idugalic/axon-java-spring-maven-seed` as a seed.

Newly created project is an Axon application written in Java that uses [Axon Server][axon-server]

 - as an event store, and
 - to dispatch messages (commands, events and queries)

##### Create new Axon (java, maven, spring boot) project with structure
```
$ atomist axon-java-spring-with-structure
```
Creates new project under `~/atomist/projects/<owner>/` folder by using `https://github.com/idugalic/axon-java-spring-maven-seed/tree/with-structure` (branch `with-structure`) as a seed.

Newly created project is an Axon application written in Java that uses [Axon Server][axon-server].

 - as an event store, and
 - to dispatch messages (commands, events and queries)

> Basic package structure is included (command, query, api, ...).
> Architecture test included. It checks if the classes in `command` and `query` packages are package private. This enables loose coupling and high cohesion.

##### Create new Axon (kotlin, maven, spring boot) project
```
$ atomist create axon-kotlin-spring
```
Creates new project under `~/atomist/projects/<owner>/` folder by using `https://github.com/idugalic/axon-kotlin-spring-maven-seed` as a seed.

Newly created project is an Axon application written in Kotlin that uses [Axon Server][axon-server]

 - as an event store, and
 - to dispatch messages (commands, events and queries)
 
##### Create new Axon (kotlin, maven, spring boot) project with structure
```
$ atomist create axon-kotlin-spring-with-structure
```
Creates new project under `~/atomist/projects/<owner>/` folder by using `https://github.com/idugalic/axon-kotlin-spring-maven-seed/tree/with-structure` (branch `with-structure`) as a seed.

Newly created project is an Axon application written in Kotlin that uses [Axon Server][axon-server]

 - as an event store, and
 - to dispatch messages (commands, events and queries)
 
> Basic package structure is included (command, query, api, ...).
> Architecture test included. It checks if the classes in `command` and `query` packages are acessible from this pages only. This enables loose coupling and high cohesion.

#### Code transforms

##### Set Axon version (maven)
```
$ atomist set axon-version
```
Sets all maven Axon dependencies with the group (`org.axonframework`) to a new desired version.

The change will be introduced within specific branch `axon-upgrade-<new-version>`.

##### Exclude Axon Server Connector (maven)
```
$ atomist exclude axon-server-connector
```
Excludes transitive maven Axon dependency `axon-server-connector` from `axon-spring-boot-starter`.

The change will be introduced within specific branch `exclude-axon-server-connector`.

##### Add Spring (Boot) AMQP dependencies (maven, spring boot)
```
$ atomist add amqp
```
Adds maven dependencies required for Spring Boot AMQP integration:  `axon-amqp-spring-boot-starter` and `spring-boot-starter-amqp`

The change will be introduced within specific branch `add-amqp-dependencies`.

##### Set desired Serializer (maven, spring boot)
```
$ atomist set serializer
```
Sets desired Serializer for Axon Spring Boot project. Possible values are `default`, `xstream`, `java`, and `jackson`

The change will be introduced within specific branch `set-serializer-<desired serializer>`.


##### Other code transforms

This SDM is built on top of the Spring SDM, so you can use other code transfroms that are available by Spring SDM:
```
$ atomist try to upgrade Spring Boot
```
```
$ atomist add Maven dependency 
```
```
$ atomist add spring boot starter
```
```
$ atomist add spring boot actuator
```
```
$ atomist list branch deploys
```

## Getting Started - team mode

[In team mode](https://docs.atomist.com/developer/team/), your SDM connects to the Atomist service.


## Deploying your SDM

You can run Software Delivery Machines (SDMs) in many different environments, ranging from your laptop or data center to Platform-as-a-Service offerings like Heroku and Pivotal Cloud Foundry.

Atomist also supports running SDMs as Docker containers. This allows you to operate them in Kubernetes clusters or Google Container Engine, for example.

This [document](https://docs.atomist.com/developer/sdm-deploy/) explains various ways to run SDMs.

### Running in Docker

With the `Dockerfile` in place, you can start the Docker build:
```
$ npm run build 
$ docker build . -t axon-sdm
```
Running the Docker container locally:
```
$ docker run -d -e ATOMIST_CONFIG='{"workspaceIds": ["YOUR_WORSPACE_IDs"],"apiKey":"YOUR_API_KEY"}' --name my-axon-sdm axon-sdm
```
> In Docker, the SDM will only run in team mode.
> 
> On the [web interface](https://app.atomist.com), you can find the Workspace ID on the settings page (click the gear), and your API Key by clicking on your username in the upper right.

## Debugging an SDM

You can debug your SDM on your laptop.

Instead of `atomist start` at the command line, start it up in a debugger. In [VSCode](https://code.visualstudio.com/docs/editor/debugging), the debug configuration looks like:

```
{
  "type": "node",
  "request": "launch",
  "name": "Launch SDM",
  "program": "${workspaceFolder}/node_modules/@atomist/automation-client/bin/start.js",
  "env": {
      "ATOMIST_MODE": ""
  },
}
```
If you want the SDM to run in local mode, put “local” in the ATOMIST_MODE environment variable (eg. `"ATOMIST_MODE": "local"`).

---

[axon-server]: https://download.axoniq.io/axonserver/AxonServer.zip
[axon]: https://axoniq.io/
[atomist-doc]: https://docs.atomist.com/ (Atomist Documentation)
