# AgentOS First Vertical Slice

The first user-facing execution path is now defined as:

1. AgentOS boots.
2. Continuity is checked.
3. Persistent Overseer is restored or created.
4. Overseer capability eligibility is verified.
5. Available models are enumerated.
6. User sends a message through the Overseer session.
7. Task pipeline creates a task with free-first routing preference.
8. Overseer router selects the best currently available model.
9. Execution is delegated to that model.
10. Result and routing metadata are persisted as an event.
11. The result returns through the same Overseer identity.

The worker model is deliberately not part of the user-facing identity. A later turn can use another model without creating a new agent or mission.

This is the minimum integration target before adding additional major abstractions.
