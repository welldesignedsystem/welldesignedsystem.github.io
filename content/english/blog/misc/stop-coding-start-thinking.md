+++
date = '2024-08-08T00:00:00+10:00'
draft = false
title = 'Stop Coding. Start Thinking.'
tags = ['Engineering Mindset', 'Career Growth', 'Learning', 'Thinking']
summary = 'Coding is the instrument. Thinking is the composition. And thinking starts before you write a single line.'
+++

## Choose the work worth mastering

- Say you own a company and you're deciding whether to open a staff cafeteria. Do you personally learn to run a commercial kitchen or do you hire a caterer and spend your hours perfecting your business?
- Unclaimed territory may make you uncomfortable and company wants us to be master of everything, but ideal combination is you are the best at a few and average at others. 
- You could, in theory, get world-class at almost anything. The constraint is that mastery is expensive — in hours, in attention, in the years it takes before a skill starts compounding — and you only get to spend that budget a few times in a career. Choosing your focus area isn't modesty. It's capital allocation.
- You could make Messi a world-class programmer, in theory. Every hour spent on the wrong thing is many times more time wasted on what's not important away from the time whats important. So be smart in what you choose to excel in.

## 2. Learn the rules well enough to break them

- Once you know what you're mastering, the next decision is how you're allowed to think about it. Not every domain gets the same rules.
- Some domains are non-negotiable, and you follow them exactly, no creative interpretation required: traffic laws, timesheets, your company's security policy. These rules exist to keep a large, uncoordinated group of people safe and functioning together. You don't get "big think" moments in this category. You just comply.
- Your craft is different. In your focus area, the rules you inherit — design patterns, "best practices," the conventional way a problem is solved — aren't laws. They're the current best guess of everyone who came before you, and your job is to understand *why* they exist well enough to know when they stop applying.
- There's a name for this progression, and it comes from Japanese Martial Arts they call it: **Shu-Ha-Ri**.
  - **Shu** — you follow the rule exactly, without deviation, until it's second nature. A karate student throws the same basic punch thousands of times before ever being trusted to modify it. Bruce Lee said - I fear not the man who has practiced 10,000 kicks once, but I fear the man who has practiced one kick 10,000 times.
  - **Ha** — you understand *why* the rule exists, and you start breaking it deliberately, in the specific situations where you understand the tradeoff better than the rule's original author did.
  - **Ri** — you've internalized the principle so completely that you've built your own form. You're no longer following the rule or breaking it. You *are* the rule now, for your context.
- This is a more precise way to describe what a good engineer does with the 23 classic design patterns: not memorize them as scripture, but implement each one from scratch, in your own words, until you can see exactly where it helps and exactly where it's a straitjacket for the problem you actually have.
- Newtonian physics worked well for two centuries but Einstein understood Newtonian Physics so well that he questioned Newton's assumptions that time and space are absolute something everyone else treated as too obvious to interrogate — and got special relativity out of it. That's the move. Not rebellion for its own sake. A precisely targeted question aimed at the one load-bearing assumption nobody else thought to check.
- You can run the same exercise on a framework instead of a physical law. Take Spring: don't just learn its API surface, dissect it layer by layer like an onion. Start with how HTTP actually works, the Richardson Maturity Model, what a servlet is, what JEE was trying to solve, why Spring emerged as a reaction to it, why single-page applications later emerged as a reaction to *that*. Question every layer. Frameworks are written by thinkers, for doers — and the doers who eventually become thinkers are the ones who refused to stop at "it works."

## 3. Think like your adversary
- There's a second kind of unconventional thinking that gets confused with Ha-breaking-rules, but it's actually a different skill: **adversarial modeling** — deliberately simulating the mind of whoever you're up against, rather than reasoning from your own perspective.
- A criminal investigator doesn't solve a case by following procedure alone. At some point they have to think *as* the person they're chasing — where would I hide, what would I panic about, what mistake would I make. An ethical hacker doesn't find the vulnerability by following the developer's intended path through the system. They find it by asking what they'd do if their job was to break it, not build it.
- Software design lives inside this same skill more often than we admit. Threat-model your own system as if you were trying to compromise it. When you're negotiating a technical decision with another team, model their incentives, not just your argument. When you're debugging a subtle race condition, stop asking "what did I intend this code to do" and start asking "what does this code actually let happen, including the paths I never intended." The bug is usually hiding in that gap.
- Rule-breaking (Ha) is about questioning inherited assumptions in your own reasoning. Adversarial modeling is about temporarily *becoming* a different reasoning process altogether. Both are unconventional. They are not the same tool.

## 4. Steal patterns from other worlds — and let them build your intuition
- Once you've got both of those moves, the next multiplier is refusing to let your reference library stop at software.
  - **Nature** solved distributed systems, load balancing, and fault tolerance millions of years before we did — ant colonies routing foraging paths, immune systems handling unknown threats without central coordination, mycelial networks passing signals with no single point of failure.
  - **Geopolitics** solved the problem of keeping independent actors from destructively encroaching on each other. Balance-of-power logic — clear spheres of influence, buffer zones, proportional response to provocation — is the same logic behind bounded contexts in domain-driven design: each service sovereignly owns its data, nothing reaches across the boundary uninvited, and when that boundary gets violated carelessly, you get exactly what geopolitics predicts — coupling, escalation, a mess that's expensive to unwind.
  - **Military decision-making under chaos** solved the problem of acting correctly with incomplete information and no time to deliberate. Air Force strategist John Boyd's OODA loop — Observe, Orient, Decide, Act, repeated in a tight cycle — is close to a direct blueprint for incident response. The team that cycles through that loop fastest, not the team with the most complete dashboard, usually wins the incident.
- Here's the part worth taking seriously rather than treating as a soft skill: this kind of cross-domain practice isn't just "creative inspiration." It's how real intuition gets built, and there's solid research behind the mechanism.
- Psychologist Gary Klein spent years studying how fireground commanders make life-or-death calls with no time to weigh options. What he found became the Recognition-Primed Decision model: in over 80% of the decisions he studied, experienced commanders didn't compare multiple options at all. They recognized the situation as a variant of something they'd seen before and moved straight to a plausible course of action, refining it as new information came in. Intuition, in Klein's model, isn't a mystical shortcut — it's compressed pattern recognition built from a large enough library of prior situations.
- Chess research shows almost exactly the same mechanism from a different angle. Adriaan de Groot's classic studies, later extended by Chase and Simon, found that grandmasters aren't running deeper brute-force calculation than weaker players — when shown a real game position for a few seconds, they could reconstruct over 90% of the pieces from memory, while weaker players managed roughly half. But show them a board with pieces placed *randomly*, with no real game logic behind it, and the grandmaster's advantage nearly disappears. Their edge isn't memory. It's that years of real games gave them tens of thousands of recognizable "chunks" — patterns that let them see the shape of a position at a glance instead of calculating it piece by piece.
- That's the actual payoff of studying nature, geopolitics, chess, and military strategy alongside your engineering work: you're not collecting metaphors, you're building the same kind of pattern library that let those fireground commanders and grandmasters act correctly without stopping to calculate. The wider the set of domains you've genuinely studied, the more "shapes" you can recognize the first time your own system starts looking like one of them.

## Know your wiring 

- Different people are built for different kinds of thinking, and the science behind it is more specific than "some people like parties and some don't."
- The difference sits in brain chemistry, not confidence. 
- Research tracing back to Cornell's Depue and Collins argues that the brain's dopamine-driven reward system — the drive toward novelty, stimulation, and social reward — is simply more reactive in extroverts. Extroverts are less sensitive to dopamine, so they need more of it — more talking, more movement, more people — to get the same payoff. 
- Introverts run more on a quieter chemical that rewards depth, focus, and reflection instead of stimulation. 
- I have seen few instances where some say they are an introvert as if a trend, but the same person uses that to indicate that a person is not social as if its bad.
- According to me Neither is right or wrong wiring for an engineer. In fact both traits have their strength and weakness and a right combination can work wonders. 
- They're just tuned for different modes: one for generating and spreading ideas fast, one for going deep on a single hard problem until it cracks open.
- Here's the twist most personality content skips: most people aren't at either extreme. Wharton researcher Adam Grant tested this directly with 340 outbound sales reps, expecting extroverts to win — the natural assumption for a job built on talking to strangers. Instead, people in the middle of the introvert-extrovert spectrum — ambiverts — outsold both extremes and generally considered most successful because they were flexible enough to talk when it helped and listen when it mattered more. Most of us live in that middle zone whether we've ever named it or not
- Whatever your mix, the honest move isn't to declare a winner between the two styles — it's to notice that most workplaces default to rewarding the extroverted half by design (louder voices get noticed faster in a meeting), which isn't the same as that half being objectively more correct. A good leader corrects for that default deliberately: building a team with both the people who go wide fast and the people who go deep slow, because the second group without the first never gets their work seen, and the first group without the second never has anything worth spreading.
- If you lean deep-focus, the practical move is to pair, not to fight your wiring. Find people who are genuinely good-faith about spreading an idea, and let them carry it into the rooms where you'd rather not be the one talking. I learned this one the hard way — spend long enough attached to the wrong person for that role, someone who takes the credit instead of carrying the idea honestly, and you'll burn far more time re-establishing who actually did the work than you ever saved by staying quiet. Choose that partnership as deliberately as you chose your focus area in step one.

## 5. Turn your biggest fear into your biggest strength
- Now this is intoxicating and addictive. if you hate public speaking make it your biggest strength. embrace the fear - again the fear you think you must work on. Constantly be in the lookout for one.
- If there's a specific thing you're avoiding — the brown-bag talk you keep dodging, the design review where you go quiet — that avoidance is information, not a verdict on your ability.

Two different situations get treated the same way, and they shouldn't be:

- Something you're afraid of but *care about mastering* — that's worth deliberately confronting, precisely because the fear is proportional to how much room there is to grow. Time invested compounds here in a way it rarely does anywhere else, because you're the only one showing up consistently to an area everyone else avoids.
- Something someone else says you're bad at, in an area you never chose to master — that's just noise. You don't owe every critique your attention. You only owe that to the fear sitting inside the focus area you already chose in step one.
- And once you've picked where to fight, protect the ground you've won. Praise from people outside your focus area is nice and forgettable. A real challenge inside your focus area is the thing worth taking seriously — sit with it, work it, don't wave it off. That's also where you leave other people's territory alone. Don't go picking a fight with the security engineer or the DBA over their domain if you don't have to. The world is an ecosystem, not a solo campaign — you don't need to be the expert in every room, just the undeniable one in yours.

## The realization

Every one of these is really the same instruction, worn six different ways: stop assuming the default setting — the ladder everyone climbs, the rules everyone inherits, your own personality, the domain boundaries around "software" — is the correct one just because it's the one you were handed. Decide what's worth mastering. Learn the rules well enough to know exactly where they bend. Borrow patterns from anywhere they've already been solved. Use your fear as a compass instead of a stop sign. And know precisely which kind of mind you're operating, so you can stop apologizing for it and start deploying it.

Coding got you in the room. Thinking is what decides what you build once you're there.
