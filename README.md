# Software Delivery Machine for Axon projects

The SDM framework enables you to control your delivery process in code. Think of it as an API for your software delivery. See this [introduction][atomist-doc] for more information on the concept of a Software Delivery Machine and how to create and develop on an SDM.

[Axon][axon] is an end-to-end development and infrastructure platform for smoothly evolving Event-Driven microservices focused on CQRS and Event Sourcing.

## Getting Started - local

When you run this SDM in local mode, it operates in the privacy of your laptop. This SDM can:

 - run goals in respond to a commit.
 - the SDM can run your tests in the background
 - deploy locally, and be sure that you’re doing manual testing on committed code
 - apply autofixes directly in your repository
 - check code inspections and tell you when you’ve violated them
 - execute commands
 - generate new projects
 - perform transforms on one repository or on many repositories
 - do inspections on one or many repositories

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
 
#### Code transforms

##### Set Axon version (maven)
```
$ atomist set axon-version
```
Sets maven Axon core dependencies (`org.axonframework`) to a new desired version.

The change will be introduced within specific branch `axon-upgrade-<new-version>`.

##### Exclude Axon Server Connector (maven)
```
$ atomist exclude axon-server-connector
```
Excludes transitive maven Axon dependency `axon-server-connector` from `axon-spring-boot-starter`.

The change will be introduced within specific branch `exclude-axon-server-connector`.

##### Add Spring AMQP  (maven)
```
$ atomist add amqp
```
Adds maven dependencies required for Spring AMQP integration:  `axon-amqp-spring-boot-starter` and `spring-boot-starter-amqp`

The change will be introduced within specific branch `add-amqp-dependencies`.


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

---
Created by [Ivan Dugalic][idugalic]

[idugalic]: http://idugalic.pro
[axon-server]: https://download.axoniq.io/axonserver/AxonServer.zip
[axon]: https://axoniq.io/
[atomist-doc]: https://docs.atomist.com/ (Atomist Documentation)
