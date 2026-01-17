# Orchestration Rules

1. Every project starts with Orchestrator Agent
2. Orchestrator runs in Claude throughout
3. Other agents only run when Orchestrator hands off
4. User must switch models manually (Orchestrator tells them when)
5. No phase proceeds until gates pass
6. Orchestrator provides exact prompts for each phase
7. Status tracked in project-status.json

Usage:
Start every project with:
Start project. You are the Orchestrator Agent.
Read /agents/orchestrator.md and /rules/orchestration-rules.md.
Guide me through the entire build.
