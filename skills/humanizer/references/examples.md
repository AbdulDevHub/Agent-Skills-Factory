# Examples

## 1. Edit mode: heavy slop

**Input:**
> Great question! Here is an essay on this topic. I hope this helps!
>
> AI-assisted coding serves as an enduring testament to the transformative potential of large language models, marking a pivotal moment in the evolution of software development. In today's rapidly evolving technological landscape, these groundbreaking tools—nestled at the intersection of research and practice—are reshaping how engineers ideate, iterate, and deliver, underscoring their vital role in modern workflows.
>
> At its core, the value proposition is clear: streamlining processes, enhancing collaboration, and fostering alignment. It's not just about autocomplete; it's about unlocking creativity at scale. The tool serves as a catalyst. The assistant functions as a partner. The system stands as a foundation for innovation.
>
> Industry observers have noted that adoption has accelerated from hobbyist experiments to enterprise-wide rollouts. Additionally, the ability to generate documentation, tests, and refactors showcases how AI can contribute to better outcomes, highlighting the intricate interplay between automation and human judgment.
>
> - 💡 **Speed:** Code generation is significantly faster, reducing friction and empowering developers.
> - 🚀 **Quality:** Output quality has been enhanced through improved training.
> - ✅ **Adoption:** Usage continues to grow, reflecting broader industry trends.
>
> While specific details are limited based on available information, it could potentially be argued that these tools might have some positive effect. In conclusion, the future looks bright. Let me know if you'd like me to expand on any section!

**Output:**
> AI coding assistants make you faster at the boring parts: config files, test scaffolding, repetitive refactors. They can also write documentation and tests.
>
> They're less useful for anything that needs judgment. A suggestion can compile, pass lint, and still miss the point, and the tool won't tell you. Adoption keeps growing anyway, from side projects to whole companies.
>
> Whether they help overall is hard to say. If you don't have tests, you can't tell when a suggestion is wrong.
>
> **What changed**
> - Cut the chatbot wrapper, the "future looks bright" ending, and the knowledge-limit hedge.
> - Replaced inflated claims ("testament", "pivotal moment", "evolving landscape") with what the tools actually do.
> - Removed the not-X-but-Y line, the catalyst/partner/foundation cycle, and -ing riders.
> - Turned the emoji bullet list into prose and removed the em dashes.
> - Dropped "industry observers" since no source was given.

Note what the output does not do: it adds no study, statistic, or named person that the input lacked.

## 2. Detect mode

**Input:** "Is this slop? *Here's the thing: most teams don't have a speed problem. They have a focus problem. The best part: fixing it is free. Let that sink in.*"

**Output:**
> - **Staged run-up (§4):** "Here's the thing:" → cut it, start with the claim.
> - **Not X but Y (§1):** "don't have a speed problem. They have a focus problem." → "Most teams lose time to switching between projects."
> - **Colon reveal (§4):** "The best part: fixing it is free." → plain sentence: "Fixing it costs nothing."
> - **Closer (§2):** "Let that sink in." → delete.
>
> Want me to edit it?

## 3. Edit mode: keep the voice

**Input:**
> ok so honestly I was skeptical about the new deploy setup. Like, really skeptical. But it cut our deploys from 40 min to 4 and nobody's paged me in two weeks. That's it. That's the whole review. Overall, it's a game changer for the team.

**Output:**
> ok so honestly I was skeptical about the new deploy setup. Like, really skeptical. But it cut our deploys from 40 min to 4 and nobody's paged me in two weeks.
>
> **What changed**
> - Cut "That's it. That's the whole review." and the "game changer" recap. The numbers already make the point.
> - Kept "honestly", "Like, really skeptical", and the lowercase opener. They're the writer's voice.
