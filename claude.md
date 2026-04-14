---
summary: Detailed enhancement to Claude.md for clarity and comprehensiveness.
---

# Quick Reference

| Topic                        | Description                               |
|------------------------------|-------------------------------------------|
| Model selection flowchart     | A flowchart for selecting models based on use case.
| Common API calls at a glance  | Overview of key API calls for quick reference.
| Feature availability by model  | Table of features available for each model tier.

# 15. MCP

## 15.5 GitHub Copilot Skills vs. Prompt Files

| Feature                      | Skills                                | Prompt Files                        |
|------------------------------|---------------------------------------|------------------------------------|
| Purpose                      | Enhance coding experience             | Store reusable prompts              |
| Access Method                | Through IDE integration               | Direct from GitHub Repo            |
| Flexibility                  | Adaptive to user input                | Static unless edited                |
| Learning Capability          | Learns from usage                     | No learning, predefined responses   |

# 19. Cost Optimization Strategies

- **When to use each model tier:** Understand the cost-effectiveness of using different tiers based on your application needs.
- **Prompt caching ROI:** Evaluate the return on investment for implementing caching mechanisms for prompts to reduce costs.
- **Batch API vs. real-time API:** An analysis of which API fits best for different scenarios for cost savings.
- **Token counting best practices:** Strategies to minimize token usage and achieve cost efficiency.

# 20. Common Pitfalls & Anti-Patterns

- **Over-prompting:** Avoid unnecessary prompts to save costs.
- **Ignoring context limits:** Understand and respect limits to prevent errors.
- **Forgetting to handle refusals gracefully:** Best practices for managing refusals without user friction.
- **Not streaming for user-facing apps:** Consideration for enhancing user experience with streamed responses.
- **Treating Claude like other LLMs:** Recognizing Claude's unique capabilities.

## Why Constitutional AI Differs from RLHF
Constitutional AI refers to a framework that integrates ethical constraints into AI decision-making processes, unlike Reinforcement Learning from Human Feedback (RLHF) which primarily relies on optimizing for rewards based on user interactions. Constitutional AI focuses on aligning AI behavior with specified principles, thus ensuring adherence to ethical standards beyond mere performance metrics.

