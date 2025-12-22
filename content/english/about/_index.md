---
title: "About us"
meta_title: "About"
description: "this is meta description"
image: "/images/us.png"
draft: false
---

We are partners in the journey of life and learning. This forum is our notebook: a shared space where we capture experiments, surface patterns we’ve discovered and record both what worked and what didn’t.
Learning together means holding two things at once: curiosity and care. We ask questions openly, try ideas quickly and write down the results so we (and others) can come back, reproduce and build on them. Sometimes a small experiment becomes a reliable technique; sometimes a failed attempt teaches us something more valuable than success. Both belong in this space.

This site is intentionally informal and iterative — a living notebook that grows with every experiment. Entries are written for humans who want clear explanations, real examples and honest reflection. We prefer substance over polish: clear thinking and reproducible notes come first; shiny presentation comes later.
We invite participation. If something here helps you, use it—and tell us how you adapted it. If something is unclear or incomplete, open an issue, suggest an edit, or reach out. Contributions accelerate everyone's learning and help turn personal notes into shared knowledge.

Thanks for joining us on this journey. Together we’ll learn, document and improve — one step at a time.

{{< plantuml >}}
@startuml
start
:Read user input;
if (Valid input?) then (yes)
  :Process data;
else (no)
  :Show error;
endif
:Display result;
stop
@enduml
{{< /plantuml >}}

{{< plantuml >}}
@startmindmap
'https://plantuml.com/mindmap-diagram

caption figure 1
title My super title

* Autogen
** Properties
*** frameworks
**** Autogen Current Version 0.75
***** Complete rewrite of the core
**** AG2
***** Branched off Autogen
*** Async foundation
*** Layered design
**** Core
***** Offers Event driven programming
**** Agent Chat API
** frameworks

@endmindmap
{{< /plantuml >}}

{{< plantuml >}}
@startuml
class Car {
  - brand: String
  - model: String
  + start()
  + stop()
}

class Engine {
  - horsepower: int
  + run()
}

Car "1" *-- "1" Engine
@enduml
{{< /plantuml >}}


{{< plantuml >}}
@startuml
left to right direction
actor User
rectangle System {
  User --> (Login)
  User --> (Browse Products)
  User --> (Add to Cart)
  User --> (Checkout)
}
@enduml
{{< /plantuml >}}


{{< plantuml >}}
@startuml
Bob -> Alice : hello
@enduml
{{< /plantuml >}}
