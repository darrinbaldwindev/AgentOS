# GitHub Project Provisioning

**Status:** Architecture requirement
**Date:** 2026-08-27

## Purpose

AgentOS should not force every project into the AgentOS repository. AgentOS is the platform/control repository; independent projects should normally have independent repositories when their lifecycle, codebase, permissions, deployment or ownership warrants separation.

## Repository roles

### AgentOS repository

Contains the AgentOS platform itself:

- core runtime
- AgentOS Overseer
- shared protocols
- provider/model registry
- external-agent integrations
- Skill-Agent framework
- entitlement/policy framework
- shared platform documentation

### Project repositories

Independent projects may contain:

- project-specific code
- project documentation
- project continuity state
- tests and deployment configuration
- project-specific agents/skills
- project-specific integrations

## Provisioning decision

AgentOS should evaluate a new project before deciding where its artefacts belong.

Prefer a new repository when:

- the project has an independent product/lifecycle;
- it requires separate access permissions;
- it has its own deployment/release cycle;
- it contains substantial project-specific code;
- it may be transferred or handed to another owner/team;
- isolation improves security or maintainability.

Keep work in the AgentOS repository when it is a core AgentOS platform capability, shared infrastructure, protocol, registry, or common framework component.

## Desired workflow

**Detect project → classify → choose repository strategy → provision repository if required → initialise standard project structure → register repository with AgentOS → assign project authority/agents → begin lifecycle management.**

## Project Registry

AgentOS should maintain a registry of managed projects containing at minimum:

- project identifier
- project name
- repository
- owner
- purpose
- lifecycle status
- primary project agent
- AgentOS relationship
- tier/entitlement context where applicable
- last activity
- health state
- dependencies
- provisioning status

## Provisioning implementation

The GitHub integration must eventually expose a safe repository-provisioning capability to AgentOS. It should support, subject to authenticated GitHub permissions:

1. repository-name validation;
2. duplicate/repository-existence checks;
3. repository creation;
4. default branch initialisation;
5. standard AgentOS project scaffold;
6. initial README and continuity/agent files;
7. Project Registry registration;
8. assignment of appropriate agents/Overseer relationship;
9. protection/permission configuration where available;
10. audit logging.

Repository creation should be an explicit privileged capability. AgentOS must not create repositories merely because a task happens to involve code. A clear project boundary and provisioning decision are required.

## Current capability note

The current connected GitHub tooling available to the AgentOS development environment provides repository discovery and repository content/branch operations, but repository creation is not currently exposed as a direct operation. Therefore this document defines the target AgentOS capability rather than claiming that autonomous repository creation is already implemented.

## Design principle

**One AgentOS platform repository does not mean one repository for every project managed by AgentOS.**

AgentOS should be capable of managing a portfolio of independently versioned projects while maintaining a central platform/control plane.
