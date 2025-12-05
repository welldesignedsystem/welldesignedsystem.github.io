+++
date = '2025-12-06T12:44:47+10:00'
draft = false
title = 'Roadmap - Operational Research & Optimization'
tags = ['Operational Research', 'Optimization', 'OR', 'Mathematical Optimization', 'Roadmap']
summary = "Comprehensive roadmap to mastering Operational Research and Optimization, from foundational mathematics to expert-level production systems."
+++

---

## Overview

This roadmap is designed for **Engineers and Analysts** who need to build production-ready optimization systems. Focus is on practical implementation, modeling, and deploying optimization solutions at scale.

**Target:** Master OR + Optimization + Production engineering skills
**Goal:** Production proficiency in optimization
**Outcome:** Deploy and maintain robust optimization systems solving real-world problems

---

## Phases

### Phase 0: Prerequisites

#### Mathematical Foundations

| Topic | Details | Deliverable |
|-------|---------|-------------|
| What is optimization? | Definition, types, real-world examples; Practice: Identify 10 optimization problems in daily life | Optimization problem taxonomy |
| Linear algebra basics | Vectors, matrices, linear combinations; Practice: Matrix operations, vector arithmetic | 5 solved matrix problems |
| Equations & inequalities | Linear equations, systems, graphing; Practice: Graph lines, find intersections | 3-4 constraint graphs by hand |
| Functions | Domain/range, linear functions, objective functions; Practice: Write objective functions | 5 objective function examples |
| Feasible regions | Solution spaces, vertices, boundaries; Practice: Draw feasible regions | Hand-drawn feasible regions |
| Optimization intuition | Max vs min, constraints, trade-offs; Practice: Toy problems with 2 variables | Graphical solutions by hand |

**Learning Resources:**
- Khan Academy: Linear Algebra
- 3Blue1Brown: Essence of Linear Algebra
- College algebra textbook

---

#### Python & Data Skills

| Topic | Details | Deliverable |
|-------|---------|-------------|
| Python essentials | Data types, functions, loops, classes | 10 Python scripts |
| NumPy basics | Array operations, indexing, broadcasting | Numerical computation tasks |
| Pandas fundamentals | DataFrames, filtering, aggregation | 3 data manipulation notebooks |
| Visualization | Matplotlib, Seaborn for plotting | 10 different plot types |
| Data cleaning | Missing values, outliers, type conversion | Clean 3 messy datasets |
| File I/O | Reading/writing CSV, Excel, JSON | Data pipeline scripts |

**Tools Setup:**
- Python 3.9+, Jupyter Lab
- Virtual environments (venv/conda)
- Git for version control

---

### Phase 1: Foundations

#### Linear Programming (LP) Basics

| Topic | Details | Deliverable |
|-------|---------|-------------|
| LP definition | Standard form, decision variables, objective, constraints; Practice: Identify components in problems | Component analysis for 3 problems |
| Formulation Part 1 | Translate word problems to math; Practice: Production planning | 2 simple problem formulations |
| Formulation Part 2 | More examples: diet, blending, allocation; Practice: Formulation patterns | 3 different problem types |
| PuLP introduction | Syntax, variables, constraints; Practice: PuLP tutorial | 2 working PuLP examples |
| First implementation | Build production planner; Practice: Code from scratch | Working production optimizer |
| Solution interpretation | Reading output, shadow prices, sensitivity; Practice: Analyze solutions | Solution interpretation doc |
| LP patterns | Common formulation patterns; Practice: Recognize patterns | Pattern recognition guide |

**Key Libraries:**
- PuLP for modeling
- SciPy for solving
- OR-Tools (Google)

---

#### Graphical Method & Understanding

| Topic | Details | Deliverable |
|-------|---------|-------------|
| Graphical LP | 2D problems, feasible region, corner points; Practice: Hand graphing | Hand-drawn feasible regions |
| Sensitivity analysis | Coefficient changes, range of optimality; Practice: Modify and observe | Sensitivity report |
| Duality | Primal vs dual, economic interpretation; Practice: Formulate duals | Dual formulation and analysis |
| Excel Solver basics | Setup, solve, interpret; Practice: Excel tutorial | 3 problems solved in Excel |
| Advanced Excel | Sensitivity reports, scenario manager; Practice: Excel features | Comprehensive Excel report |
| Real-world LPs | Case studies: diet, finance, operations; Practice: Analyze cases | Case study analysis |
| Feasibility analysis | When solutions exist/don't exist; Practice: Identify infeasibility | Feasibility checker |

---

#### Simplex Method

| Topic | Details | Deliverable |
|-------|---------|-------------|
| Simplex introduction | Tableau, basic feasible solutions; Practice: Convert to tableau | Simplex tableaux for 3 problems |
| Pivoting operations | Pivot element, row operations; Practice: Perform pivoting | Step-by-step pivoting |
| Optimality conditions | Recognizing optimal solutions; Practice: Analyze tableaux | Optimality analysis |
| Dual simplex | When to use, differences from primal; Practice: Dual simplex | Primal and dual solutions |
| Sensitivity in simplex | Real-time changes handling; Practice: Modify tableau | Sensitivity via simplex |
| Computational complexity | Understanding simplex performance; Practice: Large problems | Performance analysis |
| Big-M method | Handling artificial variables; Practice: Big-M problems | Big-M implementation |

---

#### Integer Programming (IP)

| Topic | Details | Deliverable |
|-------|---------|-------------|
| IP vs LP | Key differences, when to use IP; Practice: Identify IP needs | IP problem identification |
| Binary variables | 0-1 variables, yes/no decisions; Practice: Binary formulations | Binary variable models |
| General integer variables | Integer constraints; Practice: IP formulations | 3 IP models |
| Branch-and-bound | IP solution algorithm; Practice: Manual B&B | Branch-and-bound tree |
| Cutting planes | Strengthening formulations; Practice: Add cuts | Improved formulations |
| IP modeling tricks | Logical constraints, if-then; Practice: Advanced IP | Complex IP models |
| Real-world IPs | Facility location, capital budgeting; Practice: Case studies | IP case analysis |

**Phase 1 Checkpoint:** Can you formulate and solve basic LP/IP problems? Can you interpret solutions and sensitivity?

---

### Phase 2: Core Techniques

#### Mixed-Integer Programming (MIP)

| Topic | Details | Deliverable |
|-------|---------|-------------|
| MIP formulation | Combining continuous and integer; Practice: MIP problems | 5 MIP formulations |
| Advanced binary tricks | Logical constraints, disjunctions; Practice: Complex logic | Logical constraint library |
| Linearization | Converting nonlinear to linear; Practice: Linearization techniques | Linearization examples |
| Valid inequalities | Strengthening formulations; Practice: Add inequalities | Strengthened models |
| Symmetry breaking | Reducing solution space; Practice: Break symmetries | Symmetry-breaking constraints |
| Presolve techniques | Simplifying before solving; Practice: Presolve | Presolve analysis |
| Solver configuration | Tuning Gurobi, CPLEX; Practice: Parameter tuning | Tuned solver configs |

**MIP Solvers:**
- Gurobi (commercial, academic license)
- CPLEX (commercial, academic license)
- CBC (open-source)
- SCIP (open-source)

---

#### Network Optimization

| Topic | Details | Deliverable |
|-------|---------|-------------|
| Network flow problems | Max flow, min cost flow; Practice: Network problems | Network flow models |
| Shortest path | Dijkstra, Bellman-Ford; Practice: Implement algorithms | Shortest path solver |
| Max flow algorithms | Ford-Fulkerson, Edmonds-Karp; Practice: Max flow implementation | Max flow implementation |
| Min cost flow | Network simplex; Practice: Transportation problems | Min cost flow solver |
| Multi-commodity flows | Multiple flow types; Practice: Multi-commodity | Multi-commodity model |
| Network design | Capacity expansion, facility location; Practice: Network design | Network design model |
| Real networks | Transportation, telecommunications; Practice: Real cases | Network case studies |

---

#### Dynamic Programming (DP)

| Topic | Details | Deliverable |
|-------|---------|-------------|
| DP fundamentals | Overlapping subproblems, optimal substructure; Practice: Identify DP | DP problem recognition |
| Top-down vs bottom-up | Memoization vs tabulation; Practice: Both approaches | Fibonacci both ways |
| Classic DP problems | Knapsack, LCS, matrix chain; Practice: Classic problems | Classic DP solutions |
| DP with graphs | Shortest paths, TSP; Practice: Graph DP | Graph DP implementations |
| DP for scheduling | Resource allocation, sequencing; Practice: Scheduling DP | Scheduling models |
| Advanced DP | Bitmasking, state compression; Practice: Complex DP | Advanced DP problems |
| DP approximations | When exact DP is too expensive; Practice: Approximations | Approximate DP methods |

---

#### Constraint Programming (CP)

| Topic | Details | Deliverable |
|-------|---------|-------------|
| CP fundamentals | Variables, domains, constraints; Practice: CSP modeling | CSP models |
| Backtracking | Systematic search; Practice: N-Queens | Backtracking implementation |
| Constraint propagation | Arc consistency, domain reduction; Practice: Propagation | Propagation algorithms |
| Global constraints | All-different, cardinality; Practice: Global constraints | Global constraint models |
| CP vs MIP | When to use which; Practice: Compare approaches | Approach comparison |
| OR-Tools CP-SAT | Google's CP solver; Practice: CP-SAT problems | CP-SAT implementations |
| Scheduling with CP | Job shop, RCPSP; Practice: Scheduling | CP scheduling models |

**CP Tools:**
- OR-Tools CP-SAT
- MiniZinc
- Google OR-Tools
- IBM CP Optimizer

---

#### Heuristics & Metaheuristics

| Topic | Details | Deliverable |
|-------|---------|-------------|
| Why heuristics? | When exact methods fail; Practice: Identify opportunities | Heuristic selection guide |
| Constructive heuristics | Greedy, nearest neighbor; Practice: Build solutions | Constructive algorithms |
| Local search | Neighborhood, moves; Practice: Local search | Local search implementation |
| Simulated annealing | Temperature, acceptance; Practice: SA for TSP | Simulated annealing solver |
| Tabu search | Tabu list, aspiration; Practice: Tabu search | Tabu search implementation |
| Genetic algorithms | Selection, crossover, mutation; Practice: GA implementation | Genetic algorithm |
| Comparing metaheuristics | Performance on benchmarks; Practice: Benchmark suite | Metaheuristic comparison |

---

**Phase 2 Checkpoint:** Can you model complex problems with discrete decisions? Can you choose the right technique for different problem types?

---

### Phase 3: Advanced Methods

#### Nonlinear Programming (NLP)

| Topic | Details | Deliverable |
|-------|---------|-------------|
| NLP fundamentals | Convex vs non-convex; Practice: NLP formulations | NLP model examples |
| Gradient methods | Steepest descent, conjugate gradient; Practice: Gradient descent | Gradient solver |
| Newton methods | Second-order optimization; Practice: Newton's method | Newton implementation |
| KKT conditions | Optimality conditions; Practice: Verify KKT | KKT analysis |
| Convex optimization | CVX, CVXPY; Practice: Convex problems | Convex optimization models |
| Sequential quadratic programming | SQP algorithms; Practice: SQP problems | SQP implementation |
| Global optimization | Branch-and-bound for NLP; Practice: Global methods | Global NLP solver |

**NLP Tools:**
- IPOPT (open-source)
- CVXPY for convex
- SciPy optimize
- Pyomo for general NLP

---

#### Stochastic Optimization

| Topic | Details | Deliverable |
|-------|---------|-------------|
| Uncertainty in OR | Random variables, scenarios; Practice: Model uncertainty | Stochastic models |
| Two-stage stochastic programming | Here-and-now, wait-and-see; Practice: Two-stage | Two-stage formulations |
| Chance constraints | Probabilistic constraints; Practice: Chance-constrained | Chance-constrained models |
| Sample average approximation | Scenario-based approach; Practice: SAA implementation | SAA solver |
| Stochastic dynamic programming | Bellman equations; Practice: Stochastic DP | Stochastic DP models |
| Robust optimization | Worst-case optimization; Practice: Robust formulations | Robust optimization models |
| Real applications | Inventory, finance, energy; Practice: Stochastic cases | Stochastic case studies |

---

#### Multi-Objective Optimization

| Topic | Details | Deliverable |
|-------|---------|-------------|
| Pareto optimality | Non-dominated solutions; Practice: Find Pareto front | Pareto front visualization |
| Weighted sum method | Scalarization; Practice: Weighted objectives | Weighted sum solver |
| ε-constraint method | Constrain objectives; Practice: ε-constraint | Multi-objective solver |
| Goal programming | Deviation minimization; Practice: Goal programming | Goal programming models |
| NSGA-II | Multi-objective GA; Practice: NSGA-II | NSGA-II implementation |
| Decision making | Selecting from Pareto front; Practice: Decision analysis | Decision framework |
| Real MOO problems | Sustainability, engineering; Practice: MOO cases | MOO case studies |

---

#### Large-Scale Optimization

| Topic | Details | Deliverable |
|-------|---------|-------------|
| Decomposition methods | Benders, Dantzig-Wolfe; Practice: Decomposition | Decomposition implementations |
| Column generation | Pricing problem, master problem; Practice: Column gen | Column generation solver |
| Lagrangian relaxation | Dual bounds; Practice: Lagrangian | Lagrangian implementation |
| Parallel optimization | Distributed solving; Practice: Parallel methods | Parallel solver |
| Exploiting structure | Block structure, sparsity; Practice: Structured problems | Structure exploitation |
| Memory management | Handling huge models; Practice: Memory optimization | Memory-efficient models |
| Incremental solving | Warm starts, re-optimization; Practice: Incremental | Incremental solver |

---

#### Machine Learning for OR

| Topic | Details | Deliverable |
|-------|---------|-------------|
| ML + OR overview | Predict-then-optimize; Practice: Integration | Integrated ML-OR pipeline |
| Learning to optimize | ML predicts parameters; Practice: Parameter prediction | ML parameter predictor |
| Reinforcement learning | RL for combinatorial; Practice: RL optimizer | RL-based solver |
| Neural networks for OR | Graph neural networks; Practice: GNN for optimization | GNN optimizer |
| Hyperparameter tuning | Optimizing ML models; Practice: Bayesian optimization | HPO framework |
| Fairness in optimization | Fairness constraints; Practice: Fair optimization | Fair optimization models |
| ML-assisted heuristics | Learning heuristics; Practice: Learned heuristics | ML-enhanced heuristics |

---

**Phase 3 Checkpoint:** Can you handle nonlinearity, uncertainty, and large-scale problems? Can you integrate ML with OR?

---

### Phase 4: Production Engineering

#### Optimization System Architecture

| Topic | Details | Deliverable |
|-------|---------|-------------|
| System design | Architecture for OR systems; Practice: Design document | Architecture diagram |
| API design | RESTful optimization APIs; Practice: FastAPI service | Optimization API |
| Model management | Version control for models; Practice: Model versioning | Model registry |
| Data pipelines | Input data processing; Practice: Data pipeline | Data pipeline implementation |
| Result storage | Storing and retrieving solutions; Practice: Result database | Solution storage system |
| Scalability patterns | Horizontal scaling; Practice: Scalable architecture | Scaling plan |
| Microservices | Decomposed OR services; Practice: Microservices | Microservice architecture |

**Architecture Stack:**
- FastAPI for APIs
- PostgreSQL for data
- Redis for caching
- Docker for containers
- Kubernetes for orchestration

---

#### Solver Integration & Deployment

| Topic | Details | Deliverable |
|-------|---------|-------------|
| Solver APIs | Gurobi, CPLEX, OR-Tools APIs; Practice: Solver integration | Solver wrappers |
| License management | Commercial solver licenses; Practice: License server | License management |
| Model serialization | Save/load models; Practice: Model persistence | Serialization system |
| Containerization | Docker for OR apps; Practice: Dockerfile | Dockerized solver |
| Cloud deployment | AWS, Azure, GCP; Practice: Cloud deployment | Cloud-deployed solver |
| Serverless optimization | Lambda functions; Practice: Serverless OR | Serverless optimizer |
| Performance tuning | Solver parameters; Practice: Parameter optimization | Tuned configurations |

---

#### Monitoring & Observability

| Topic | Details | Deliverable |
|-------|---------|-------------|
| Solver monitoring | Track solve time, iterations; Practice: Monitoring setup | Monitoring dashboard |
| Solution quality | Optimality gap, bounds; Practice: Quality metrics | Quality monitoring |
| Performance metrics | Response time, throughput; Practice: Performance tracking | Performance dashboard |
| Alerting system | Threshold alerts; Practice: Alert system | Alert notifications |
| Logging strategy | Structured logging; Practice: Logging implementation | Logging framework |
| Observability tools | Prometheus, Grafana; Practice: Observability stack | Full observability setup |
| Cost tracking | Solver API costs; Practice: Cost monitoring | Cost dashboard |

---

#### Testing & Validation

| Topic | Details | Deliverable |
|-------|---------|-------------|
| Unit testing | Test model components; Practice: Test suite | Unit tests |
| Model validation | Verify correctness; Practice: Validation suite | Model validation tests |
| Benchmark problems | Standard test problems; Practice: Benchmark suite | Benchmark results |
| Solution verification | Check feasibility, optimality; Practice: Verification | Verification system |
| Regression testing | Ensure consistency; Practice: Regression tests | Regression test suite |
| Stress testing | Large-scale problems; Practice: Stress tests | Stress test results |
| CI/CD for OR | Automated testing; Practice: CI/CD pipeline | CI/CD setup |

---

#### Documentation & Maintenance

| Topic | Details | Deliverable |
|-------|---------|-------------|
| Model documentation | Document formulations; Practice: Model docs | Model documentation |
| API documentation | Document endpoints; Practice: API docs | API documentation |
| User guides | How to use system; Practice: User guide | User documentation |
| Runbooks | Operational procedures; Practice: Runbooks | Operational runbooks |
| Troubleshooting guides | Common issues; Practice: Troubleshooting | Troubleshooting guide |
| Version management | Track model versions; Practice: Versioning system | Version control |
| Knowledge base | Centralized knowledge; Practice: Knowledge base | Internal knowledge base |

---

**Phase 4 Checkpoint:** Can you deploy production-ready optimization systems? Can you monitor, maintain, and scale them?

---

### Phase 5: Specialized Applications

#### Logistics & Transportation

| Topic | Details | Deliverable |
|-------|---------|-------------|
| Vehicle routing | CVRP, VRPTW; Practice: VRP solver | VRP implementation |
| Last-mile delivery | Drone delivery, crowd-sourcing; Practice: Last-mile optimizer | Last-mile system |
| Warehouse optimization | Layout, picking, slotting; Practice: Warehouse optimizer | Warehouse system |
| Inventory management | EOQ, (s,S) policies; Practice: Inventory optimizer | Inventory system |
| Supply chain networks | Multi-echelon, network design; Practice: Supply chain model | Supply chain optimizer |
| Route optimization | Real-time routing; Practice: Dynamic routing | Dynamic routing system |
| Capstone | Complete logistics platform; Practice: End-to-end system | Production logistics platform |

**Use Cases:**
- Amazon delivery routing
- FedEx network optimization
- Warehouse automation
- Supply chain planning

---

#### Scheduling & Workforce

| Topic | Details | Deliverable |
|-------|---------|-------------|
| Workforce scheduling | Shift scheduling, coverage; Practice: Workforce scheduler | Workforce system |
| Project scheduling | RCPSP, critical path; Practice: Project scheduler | Project scheduling system |
| Maintenance scheduling | Preventive maintenance; Practice: Maintenance scheduler | Maintenance system |
| Exam timetabling | Course scheduling; Practice: Timetable generator | Timetabling system |
| Job shop scheduling | Machine scheduling; Practice: Job shop scheduler | Job shop system |
| Resource allocation | Multi-resource scheduling; Practice: Resource allocator | Resource allocation system |
| Capstone | Universal scheduling platform; Practice: Multi-domain scheduler | Production scheduling platform |

**Use Cases:**
- Hospital staff scheduling
- University timetabling
- Manufacturing scheduling
- Airline crew scheduling

---

#### Finance & Portfolio

| Topic | Details | Deliverable |
|-------|---------|-------------|
| Portfolio optimization | Markowitz, risk management; Practice: Portfolio optimizer | Portfolio system |
| Trading optimization | Execution, market making; Practice: Trading optimizer | Trading system |
| Risk management | VaR, CVaR optimization; Practice: Risk optimizer | Risk management system |
| Asset-liability management | ALM models; Practice: ALM optimizer | ALM system |
| Credit scoring | Optimization in credit; Practice: Credit model | Credit scoring system |
| Option pricing | Optimization methods; Practice: Option pricer | Option pricing system |
| Capstone | Quantitative trading platform; Practice: Trading system | Production trading platform |

**Use Cases:**
- Portfolio management
- Algorithmic trading
- Risk analytics
- Wealth management

---

#### Energy & Sustainability

| Topic | Details | Deliverable |
|-------|---------|-------------|
| Power grid optimization | Unit commitment, dispatch; Practice: Grid optimizer | Grid optimization system |
| Renewable integration | Solar, wind optimization; Practice: Renewable optimizer | Renewable system |
| EV charging | Charging station placement; Practice: EV optimizer | EV charging system |
| Carbon optimization | Emissions reduction; Practice: Carbon optimizer | Carbon system |
| Energy trading | Power markets; Practice: Trading optimizer | Energy trading system |
| Smart grid | Demand response; Practice: Smart grid optimizer | Smart grid system |
| Capstone | Integrated energy platform; Practice: Energy management system | Production energy platform |

**Use Cases:**
- Power utility optimization
- Renewable energy planning
- EV infrastructure
- Carbon footprint reduction

---

#### Healthcare Operations

| Topic | Details | Deliverable |
|-------|---------|-------------|
| Hospital bed management | Admission scheduling; Practice: Bed optimizer | Bed management system |
| Operating room scheduling | OR scheduling; Practice: OR scheduler | OR scheduling system |
| Emergency room optimization | Patient flow; Practice: ER optimizer | ER optimization system |
| Staff scheduling | Nurse rostering; Practice: Staff scheduler | Staff scheduling system |
| Appointment scheduling | Patient appointments; Practice: Appointment system | Appointment scheduler |
| Supply chain | Medical inventory; Practice: Healthcare supply chain | Supply chain system |
| Capstone | Healthcare operations platform; Practice: Hospital optimizer | Production healthcare platform |

**Use Cases:**
- Hospital resource management
- Healthcare supply chain
- Patient flow optimization
- Capacity planning

---

### Phase 6: Expert Topics

#### Advanced Theory

| Topic | Details | Deliverable |
|-------|---------|-------------|
| Polyhedral theory | Valid inequalities, facets; Practice: Theoretical analysis | Polyhedral analysis |
| Computational complexity | P vs NP, approximation; Practice: Complexity analysis | Complexity study |
| Approximation algorithms | Performance guarantees; Practice: Approximation algorithms | Approximation implementations |
| Randomized algorithms | Probabilistic methods; Practice: Randomized optimization | Randomized algorithms |
| Game theory | Nash equilibrium, optimization; Practice: Game-theoretic models | Game theory applications |
| Auction design | Mechanism design; Practice: Auction optimizer | Auction system |
| Research frontiers | Latest OR research; Practice: Paper implementation | Research implementation |

---

#### Optimization Research

| Topic | Details | Deliverable |
|-------|---------|-------------|
| Literature review | Survey OR papers; Practice: Comprehensive review | Literature survey |
| Problem formulation | Novel formulations; Practice: New models | Research formulations |
| Algorithm design | New algorithms; Practice: Algorithm development | Novel algorithm |
| Computational study | Benchmark testing; Practice: Experiments | Computational results |
| Paper writing | Research paper; Practice: Write paper | Draft research paper |
| Conference submission | Submit to conference; Practice: Submission | Conference paper |
| Research presentation | Present findings; Practice: Presentation | Research presentation |

---

## Practical Implementation Guide

### Essential Tools & Stack

**Core Optimization Libraries:**
```
# Python Modeling
pulp              # LP/IP modeling
pyomo             # General optimization modeling
gurobipy          # Gurobi Python API
docplex           # CPLEX Python API
ortools           # Google OR-Tools

# Scientific Computing
numpy, scipy
pandas            # Data manipulation
networkx          # Network problems
```

**Solvers:**
```
# Open-Source
COIN-OR CBC        # LP/MIP
GLPK              # LP/MIP
SCIP              # MIP
HiGHS             # LP/MIP

# Commercial (Academic License)
Gurobi            # Best MIP solver
CPLEX             # IBM solver
FICO Xpress       # Alternative commercial

# Specialized
OR-Tools CP-SAT   # Constraint programming
IPOPT             # Nonlinear programming
```

**Infrastructure:**
```
Docker            # Containerization
FastAPI           # REST APIs
PostgreSQL        # Data storage
Redis             # Caching
Celery            # Task queues
```

**Development:**
```
Git, GitHub
pytest            # Testing
black, flake8     # Code quality
Jupyter           # Notebooks
```

### Key Engineering Principles

1. **Model First, Optimize Later**: Get the formulation right before worrying about speed
2. **Start Simple**: Begin with basic LP, add complexity as needed
3. **Validate Everything**: Always verify solutions are correct and feasible
4. **Version Models**: Track formulation changes like code
5. **Document Formulations**: Mathematical models need clear documentation
6. **Test on Small Instances**: Debug on tiny problems first
7. **Benchmark**: Know your solver's performance characteristics

### Problem Formulation Checklist

**Before Coding:**
- [ ] Clearly defined objective (what to optimize)
- [ ] All decision variables identified
- [ ] All constraints listed
- [ ] Data requirements specified
- [ ] Expected solution structure understood

**Model Validation:**
- [ ] Manually solvable small instance works
- [ ] All constraints enforced
- [ ] Solution makes business sense
- [ ] Edge cases handled
- [ ] Infeasibility diagnosed

### Performance Targets

**Solving Time:**
- Small LP (< 1000 vars): < 1 second
- Medium LP (< 100K vars): < 10 seconds
- Small MIP (< 1000 vars): < 60 seconds
- Medium MIP (< 10K vars): < 300 seconds

**Solution Quality:**
- LP: Optimal (exact)
- MIP: < 1% optimality gap (typically)
- Heuristics: Problem-dependent

**API Performance:**
- Model build: < 1 second
- API response: < 5 seconds (including solve)
- Batch processing: > 100 problems/hour

**System Reliability:**
- API uptime: > 99.5%
- Solution feasibility: 100%
- Graceful handling of infeasibility

---

## Next Steps After Completion

### Continue Learning:
1. **Research Papers**: Latest optimization research (Mathematical Programming, INFORMS journals)
2. **Conferences**: INFORMS, EURO, MIP workshop
3. **Open Source**: Contribute to COIN-OR, OR-Tools, PuLP
4. **Advanced Courses**: Convex optimization, stochastic programming
5. **Domain Expertise**: Specialize in industry vertical

### Career Paths:
- **Operations Research Analyst**
- **Optimization Engineer**
- **Supply Chain Analyst**
- **Data Scientist (OR focus)**
- **Management Science Consultant**
- **Quantitative Analyst (Finance)**
- **OR Researcher**

### Certifications & Credentials:
- INFORMS CAP (Certified Analytics Professional)
- APICS certifications (Supply Chain)
- CFA (for finance applications)

---

## Resources

**Books:**

*Beginner:*
- "Model Building in Mathematical Programming" by H.P. Williams
- "Introduction to Operations Research" by Hillier & Lieberman
- "Optimization in Operations Research" by Rardin

*Intermediate:*
- "Integer Programming" by Wolsey
- "Network Flows" by Ahuja, Magnanti, Orlin
- "Convex Optimization" by Boyd & Vandenberghe

*Advanced:*
- "Integer and Combinatorial Optimization" by Nemhauser & Wolsey
- "Nonlinear Programming" by Bertsekas
- "Stochastic Programming" by Birge & Louveaux

**Online Resources:**
- MIT OpenCourseWare: Operations Research courses
- Coursera: Discrete Optimization (Melbourne)
- OR-Tools Documentation & Examples
- Gurobi/CPLEX Tutorials & Webinars
- INFORMS Resources

**Communities:**
- INFORMS (Institute for Operations Research)
- OR-Exchange (Q&A forum)
- OR Reddit communities
- LinkedIn OR groups
- Twitter #ORResearch #OptimizationProblems

**Practice Problems:**
- MIPLIB (MIP benchmark library)
- Coursera Discrete Optimization assignments
- Project Euler (algorithmic)
- LeetCode (algorithms)
- Kaggle optimization competitions

**Software Documentation:**
- Gurobi Documentation & Examples
- CPLEX Documentation
- OR-Tools Guides
- PuLP Documentation
- Pyomo Documentation

---

## Common Problem Types Quick Reference

| Problem Type | Formulation | Solver | Difficulty |
|--------------|-------------|--------|------------|
| Production Planning | LP | Any LP solver | Easy |
| Blending/Diet | LP | Any LP solver | Easy |
| Transportation | Network LP | Network simplex | Easy |
| Assignment | LP/IP | Hungarian or MIP | Easy |
| Knapsack | IP | MIP solver | Medium |
| Bin Packing | IP | MIP solver | Medium |
| Facility Location | IP | MIP solver | Medium |
| Vehicle Routing | IP | MIP + heuristics | Hard |
| Scheduling | CP or MIP | CP-SAT or MIP | Hard |
| Portfolio Optimization | QP or SOCP | CVXPY | Medium |
| TSP | IP | MIP + heuristics | Hard |

---

## Industry-Specific Applications

### Retail & E-commerce:
- Inventory optimization
- Price optimization
- Assortment planning
- Markdown optimization
- Warehouse slotting

### Manufacturing:
- Production scheduling
- Capacity planning
- Maintenance scheduling
- Supply chain optimization
- Quality control

### Transportation & Logistics:
- Route optimization
- Fleet management
- Network design
- Warehouse operations
- Last-mile delivery

### Finance:
- Portfolio optimization
- Risk management
- Trading strategies
- Credit scoring
- Asset allocation

### Healthcare:
- Staff scheduling
- Operating room scheduling
- Bed management
- Appointment scheduling
- Supply chain

### Energy:
- Power generation scheduling
- Grid optimization
- Renewable integration
- Trading strategies
- Demand response

### Telecommunications:
- Network design
- Capacity planning
- Routing optimization
- Spectrum allocation
- Tower placement

---

## Success Metrics

**Technical Proficiency:**
- Formulate 90% of business problems correctly
- Select appropriate solution method for any problem
- Debug infeasible models efficiently
- Tune solvers for 2-5x speedup
- Scale to 100K+ variable problems

**Production Skills:**
- Deploy optimization APIs with 99.5% uptime
- Handle 1000+ optimization requests/day
- Integrate with existing business systems
- Document models and solutions clearly
- Maintain and update production systems

**Business Impact:**
- Demonstrate clear ROI from optimization
- Communicate results to non-technical stakeholders
- Identify new optimization opportunities
- Quantify cost savings / revenue increase
- Build trust with business users