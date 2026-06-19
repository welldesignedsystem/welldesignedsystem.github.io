+++
date = '2022-01-01T12:44:47+10:00'
draft = false
title = 'Laws and Principles'
tags = ['Laws']
summary = "A curated reference of scientific, engineering and organizational laws and principles that shape software, systems and team behavior."
+++

This collection is my way of cultivating out-of-the-box thinking through Feynman's **cross-domain analogy generation** — connecting ideas across physics, biology, engineering and organisational behaviour to build mental models that transfer.

---

## Laws

### Physics & Natural Science Laws Applied to Software

- **Zeroth Law of Thermodynamics** – If two systems are in thermal equilibrium with a third, they are in equilibrium with each other; service health must be measured relative to a consistent baseline, not in isolation.
- **First Law of Thermodynamics (Conservation of Energy)** – Energy cannot be created or destroyed, only transformed; computational resources are finite and must be allocated efficiently.
- **Second Law of Thermodynamics (Entropy)** – In isolated systems, entropy always increases over time; software systems naturally tend toward disorder and complexity without deliberate maintenance.
- **Third Law of Thermodynamics** – As temperature approaches absolute zero, the entropy of a perfect crystal approaches zero; as system load approaches zero, complexity approaches its irreducible minimum — there is always a base level of necessary complexity.
- **Newton's First Law (Inertia)** – Objects at rest stay at rest; established codebases resist change and changing systems require sustained effort.
- **Newton's Third Law** – For every action, there is an equal and opposite reaction; every feature addition has consequences elsewhere in the system.
- **Conservation of Mass** – Matter cannot be created or destroyed; technical debt accumulates and must eventually be addressed somewhere in the system.
- **Chaos Theory/Butterfly Effect** – Small changes in initial conditions can lead to vastly different outcomes; minor code changes can have unexpected system-wide effects.
- **Le Chatelier's Principle** – Systems under stress will shift to counteract that stress; software systems develop workarounds and compensating mechanisms when under load.
- **Ohm's Law (V = IR)** – Voltage equals current times resistance; system performance equals throughput divided by bottlenecks.
- **Heisenberg's Uncertainty Principle** – You cannot precisely measure both position and momentum simultaneously; observing a system changes its behavior (monitoring overhead, debugging effects).
- **Law of Conservation of Complexity** – Complexity cannot be destroyed, only moved; simplifying one part of a system often increases complexity elsewhere.

---

### Biological & Evolutionary Principles

- **Natural Selection** – Systems that adapt to their environment survive; software that doesn't evolve becomes obsolete.
- **Survival of the Fittest** – The most adaptable solutions, not necessarily the strongest, survive in changing environments.
- **Symbiosis** – Different components can benefit from working together; microservices and APIs create mutual dependencies.
- **Genetic Drift** – Random changes accumulate over time; codebases diverge from original design through incremental changes.
- **Punctuated Equilibrium** – Evolution occurs in bursts separated by stable periods; software development cycles between rapid change and stability.
- **Homeostasis** – Living systems maintain stable internal conditions despite external changes; robust software maintains consistent behavior despite varying loads.
- **Sexual Selection** – Features evolve not for survival but for attractiveness; software features are sometimes added for marketing appeal rather than utility.

---

### Mathematical & Logical Principles

- **Gödel's Incompleteness Theorems** – In any sufficiently complex formal system, there are true statements that cannot be proven within the system; complete specification of complex software is impossible.
- **Halting Problem** – You cannot determine if an arbitrary program will halt; perfect static analysis tools are theoretically impossible.
- **No Free Lunch Theorem** – No optimization algorithm performs better than random search across all possible problems; there is no universally best solution.
- **Pigeonhole Principle** – If you have more items than containers, at least one container must contain more than one item; system constraints create inevitable conflicts.
- **Central Limit Theorem** – Large samples tend toward normal distribution; aggregate system behaviors become predictable even when individual components are chaotic.

---

### General Engineering & Design Principles

- **Murphy's Law** – "Anything that can go wrong will go wrong." → Build for resilience and failure recovery.
- **Finagle's Law** – Anything that can go wrong, will—at the worst possible time.
- **Gall's Law** – Complex systems that work evolve from simple systems that work.
- **Occam's Razor** – Prefer the simplest solution that meets the requirements.
- **KISS Principle** – "Keep It Simple, Stupid." Avoid unnecessary complexity.
- **YAGNI** – "You Aren't Gonna Need It." Don't implement features until they are actually needed.
- **DRY Principle** – "Don't Repeat Yourself." Centralize logic to avoid duplication.
- **Law of the Instrument (Maslow’s Hammer)** – "If all you have is a hammer, everything looks like a nail."
- **Second-System Effect** – The second system an engineer designs is the most dangerous, as they tend to over-engineer it.
- **Chesterton's Fence** – Don’t remove something unless you understand why it was put there.

---

### Time, Effort and Estimation

- **Hofstadter's Law** – "It always takes longer than you expect, even when you take into account Hofstadter's Law."
- **Parkinson's Law** – "Work expands to fill the time available for its completion."
- **Brooks's Law** – "Adding manpower to a late software project makes it later." (From _The Mythical Man-Month_)
- **Ninety-Ninety Rule** – The first 90% of the code accounts for the first 90% of the development time; the remaining 10% accounts for the other 90%.
- **Pareto Principle (80/20 Rule)** – 80% of the effects come from 20% of the causes.
- **Student Syndrome** – Work on a task will not begin in earnest until just before the deadline.
- **Planning Fallacy** – People underestimate time, cost and risk while overestimating benefits.
- **Law of Diminishing Returns** – Each additional unit of effort provides less benefit than the previous one.
- **Streetlight Effect** – People search where it’s easiest, not where the truth is.

---

### People, Teams and Communication

- **Conway's Law** – System design mirrors the communication structure of the organization.
- **Peter Principle** – People rise to their level of incompetence.
- **Linus's Law** – "Given enough eyeballs, all bugs are shallow." (Open-source development insight)
- **Law of Triviality (Bike-shedding)** – People spend disproportionate time on trivial issues.
- **Dunning-Kruger Effect** – People with low ability at a task overestimate their competence.
- **Hanlon's Razor** – "Never attribute to malice that which is adequately explained by stupidity."
- **Cunningham's Law** – "The best way to get the right answer on the Internet is not to ask a question, but to post the wrong answer."
- **Law of Conservation of Familiarity** – People tend to use tools/processes they already know, even if suboptimal.
- **Dunbar's Number** – Humans can maintain stable relationships with about 150 people.

---

### Code Quality & Maintainability

- **Law of Demeter** – Talk only to your immediate collaborators; avoid unnecessary coupling.
- **Hyrum's Law** – With enough users, all observable behaviors of your system will be relied upon, intentional or not.
- **LeBlanc's Law** – "Later equals never."
- **Zawinski's Law** – Every program expands until it can read email; those that cannot are replaced by ones that can.
- **Wirth's Law** – Software is getting slower more rapidly than hardware is becoming faster.
- **Atwood's Law** – Any application that can be written in JavaScript, will eventually be written in JavaScript.
- **Greenspun's Tenth Rule** – Any sufficiently complicated C or Fortran program contains an ad-hoc, buggy, slow Lisp implementation.
- **Bentley's Rule** – More computing sins are committed in the name of efficiency than for any other single reason.
- **Kernighan's Law** – Debugging is twice as hard as writing code. If you write code as cleverly as possible, you’re not smart enough to debug it.
- **Spolsky's Law of Leaky Abstractions** – All non-trivial abstractions are, to some degree, leaky.
- **Schröder’s Law of Software Evolution** – Software that works is always considered "legacy."

---

### Performance & Optimization

- **Amdahl's Law** – The overall speedup is limited by the fraction of code that can’t be parallelized.
- **Gustafson's Law** – Scaling data size enables greater parallelism.
- **Little's Law** – Average items in a system = arrival rate × average wait time.
- **Metcalfe's Law** – Value of a network grows proportional to the square of the number of users.
- **Reed's Law** – Network utility can scale exponentially with the number of groups.
- **Moore's Law** – Transistors on a microchip double about every two years.
- **Universal Scalability Law** – Throughput is limited by contention and coherence delays.
- **Jeff Dean’s Numbers** – Latency numbers every programmer should know.

---

### Software Architecture & Systems

- **CAP Theorem** – Distributed systems can have at most two of: Consistency, Availability, Partition Tolerance.
- **ACID Properties** – Database transactions should be Atomic, Consistent, Isolated, Durable.
- **BASE Properties** – Basically Available, Soft state, Eventual consistency.
- **Fallacies of Distributed Computing** – Network is reliable, latency is zero, bandwidth is infinite, etc.
- **Conway’s Game of Life Principle** – Simple rules can lead to complex emergent behaviors.

---

### Information Theory & Communication

- **Shannon's Theorem** – There is a fundamental limit to lossless data compression; information has inherent complexity that cannot be reduced indefinitely.
- **Nyquist-Shannon Sampling Theorem** – To accurately represent a signal, you must sample at twice the highest frequency; monitoring systems need sufficient granularity.
- **Channel Capacity** – Every communication channel has a maximum data rate; network and API throughput have theoretical limits.
- **Error Correction Principles** – Redundancy is necessary to detect and correct errors; fault-tolerant systems require overhead.
- **Signal-to-Noise Ratio** – Useful information must exceed background interference; code signal must be stronger than complexity noise.

---

### Testing & Quality Assurance

- **Pesticide Paradox** – Repeated testing with the same methods stops finding new bugs.
- **Heisenbug** – A bug that disappears or alters behavior when observed.
- **Bohrbug** – A bug with consistent, repeatable behavior.
- **Mandelbug** – A bug with complex, chaotic, or obscure causes.
- **Schroedinbug** – A bug that manifests only once someone realizes the code shouldn’t work.

---

### User Experience & Design

- **Miller's Law** – People can hold ~7 ± 2 items in working memory.
- **Hick's Law** – Decision time increases with the number of choices.
- **Fitts's Law** – Time to acquire a target depends on its size and distance.
- **Jakob's Law** – Users spend most time on other sites; they want yours to work the same way.
- **Tesler's Law (Conservation of Complexity)** – Every system has irreducible complexity; it must live somewhere.
- **Zipf’s Law (Web/UX)** – Frequency of usage follows a power-law distribution.

---

### Reliability, Risk and Entropy

- **Law of Entropy in Software** – Software tends to become more complex and chaotic unless actively refactored.
- **Sod's Law** – A variant of Murphy’s Law, emphasizing bad timing.
- **Normal Accident Theory (Perrow)** – In complex, tightly coupled systems, accidents are inevitable.
- **Schneier's Law** – Anyone can create an encryption algorithm they cannot break; that doesn’t make it secure.
- **Murphy’s Corollary** – Left to themselves, things go from bad to worse.
- **Law of Unintended Consequences** – Every action has outcomes you didn’t anticipate.

---

### Organizational & Process Laws

- **Goodhart's Law** – "When a measure becomes a target, it ceases to be a good measure."
- **Campbell's Law** – Indicators used for decision-making are prone to corruption.
- **Putt's Law** – Tech is dominated by those who understand but can’t manage and those who manage but don’t understand.
- **Dilbert Principle** – Companies promote incompetent employees to management to remove them from the workflow.
- **Sturgeon’s Law** – "90% of everything is crap."

---

### Miscellaneous & Cultural Laws

- **Betteridge's Law of Headlines** – Any headline ending in a question mark can be answered "no."
- **Godwin's Law** – As online discussions grow, the probability of a Nazi comparison approaches 1.
- **Poe's Law** – Without clear indicators of intent, it’s hard to distinguish parody from extremism.
- **Rule of Least Power** – Use the least powerful language that solves the problem.
- **Cipolla's Laws of Stupidity** – Four categories of human behavior: helpless, intelligent, bandit, stupid.
- **Lindy’s Law** – The longer something has existed, the longer it is likely to continue existing.

---

### Interaction, Communication & Protocol Laws

- **Postel’s Law (Robustness Principle)** – "Be conservative in what you send, liberal in what you accept."  
  → In practice: APIs should strictly define outputs but be tolerant to varied inputs.
- **Clark’s Law of Protocols** – A protocol is only as strong as its weakest implementation.
- **Saltzer’s End-to-End Principle** – Functions in a system should be implemented at the highest layer where they can be correctly and completely implemented.
- **Fallacies of Distributed Computing** – Assumptions that networks are reliable, latency is zero, bandwidth is infinite, etc.
- **Law of Leaky Abstractions (Spolsky’s Law)** – All non-trivial abstractions, to some degree, leak details.
- **Robustness-Resilience Tradeoff** – Overly robust systems can become brittle if they don’t evolve; resilience means graceful degradation.

---

## Chanakya Neeti - Principles with Meanings

"The world is the home of the strong, the weak have no place in it. Therefore, become strong and make your own place in this world."\* - Chanakya

- **Principle 1:** A person should not be too honest. Straight trees are cut first and honest people are screwed first.
- **Principle 2:** Before you start some work, always ask yourself three questions - Why am I doing it, What the results might be and Will I be successful. Only when you think deeply and find satisfactory answers to these questions, go ahead.
- **Principle 3:** As soon as the fear approaches near, attack and destroy it.
- **Principle 4:** The world's biggest power is the youth and beauty of a woman.
- **Principle 5:** Learn from the mistakes of others... you can't live long enough to make them all yourselves.
- **Principle 6:** A person's test is done at the time of money, crisis, woman and power.
- **Principle 7:** Education is the best friend. An educated person is respected everywhere. Education beats the beauty and the youth.
- **Principle 8:** Books are as useful to a stupid person as a mirror is useful to a blind person.
- **Principle 9:** Treat your kid like a darling for the first five years. For the next five years, scold them. By the time they turn sixteen, treat them like a friend. Your grown up children are your best friends.
- **Principle 10**: The biggest guru-mantra is: never share your secrets with anybody. It will destroy you.
- **Principle 11**: There is some self-interest behind every friendship. There is no friendship without self-interests. This is a bitter truth.
- **Principle 12**: Even if a snake is not poisonous, it should pretend to be venomous.
- **Principle 13**: The king who is situated anywhere immediately on the circumference of the conqueror's territory is termed the enemy.
- **Principle 14**: Once you start working on something, don't be afraid of failure and don't abandon it. People who work sincerely are the happiest.
- **Principle 15**: The fragrance of flowers spreads only in the direction of the wind. But the goodness of a person spreads in all directions.
- **Principle 16**: God is not present in idols. Your feelings are your god. The soul is your temple.
- **Principle 17**: A man is great by deeds, not by birth.
- **Principle 18**: Never make friends with people who are above or below you in status. Such friendships will never give you any happiness.
- **Principle 19**: Treat your kid like a darling for the first five years. For the next five years, scold them. By the time they turn sixteen, treat them like a friend.
- **Principle 20**: Time perfects all living beings as well as kills them; it alone is awake when all others are asleep. Time is insurmountable.
- **Principle 21**: The life of an uneducated man is as useless as the tail of a dog which neither covers its rear end, nor protects it from the bites of insects.
- **Principle 22**: Skills are called hidden treasure as they save like a mother in foreign country, give fame like a king and happiness like a wife.
- **Principle 23**: There are three gems upon this earth; food, water and pleasing words. Fools consider pieces of rocks as gems.
- **Principle 24**: Do not be very upright in your dealings as you would see by going to the forest that straight trees are cut down while crooked ones are left standing.
- **Principle 25**: Whoever imposes severe punishment becomes repulsive to the people; whoever awards mild punishment becomes contemptible. But whoever imposes punishment as deserved becomes respectable.

---
