# 🍜 Pixel Diner: The Dining Philosophers Problem

An 8‑bit, playable explainer of the classic OS synchronization problem. You feed philosophers by hand, watch a deadlock happen, then pick a strategy that fixes it.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # engine unit tests (Vitest)
npm run build    # production build (fully static)
```

## Screens

| Route | What you do |
|---|---|
| `/` | Title screen, a live "attract mode" table, and the level map with ⭐ progress |
| `/play/1` **Two Sticks Rule** | **Play**: tap philosophers to grab chopsticks and feed all 5. You find out for yourself that neighbours can't eat together, and that you can deadlock the table yourself. |
| `/play/2` **Everyone Grabs Left** | **Watch**: the naive rule deadlocks in seconds. You get a red wait‑for cycle, skulls, and the 4 Coffman conditions. |
| `/play/3` **Fix the Dinner** | **Choose**: pick a power‑up (Waiter / Numbered Sticks / trap card) and survive the dinner rush |
| `/sandbox` | Free lab: strategy, 3–8 philosophers, speed, step mode, 🔔 dinner bell, 🔨 preempt, live stats |
| `/concepts` | One‑screen cheat sheet: game ↔ OS mapping, Coffman conditions, pseudocode |

## OS concept mapping

| Game | OS |
|---|---|
| 🧔 Philosopher | Process / thread |
| 🥢 Chopstick | Resource guarded by a mutex |
| 🍜 Eating | Critical section (needs both resources) |
| 😤 Hunger bar | Waiting time |
| 💀 Skull | Starvation |
| 🔒 + red arrows | Deadlock (a cycle in the wait‑for graph) |

### Strategies implemented

| Strategy | Rule | Breaks | Deadlock‑free |
|---|---|---|---|
| 😐 Grab Left First | `wait(left); wait(right)` | nothing | ❌ |
| 🔢 Numbered Sticks (resource ordering) | grab the lower‑numbered stick first | Circular Wait | ✅ |
| 🧑‍🍳 The Waiter (semaphore = N−1) | at most N−1 may try to eat | Hold & Wait | ✅ |
| 🔨 Preempt (Sandbox, recovery) | force one deadlocked philosopher to drop its sticks | No Preemption | n/a (recovery) |

## Architecture

The simulation is a **pure, framework‑free engine**. React only renders its state and sends it actions.

```
src/
  engine/           pure TypeScript, deterministic (seeded RNG), unit-tested
    simulation.ts   createSim / tick / manualToggle / ringBell / preempt
    strategies/     naive · hierarchy · waiter (each just defines acquisition order + waiter flag)
    deadlock.ts     wait-for graph + cycle detection
  hooks/            useSimulation (clock, speed, sound), useProgress (localStorage stars)
  components/
    table/          SVG pixel-art table, philosophers, chopsticks, wait-for arrows
    hud/            controls, stats, banners, Coffman badges, strategy cards, narrator
    levels/         Level1 (manual) · Level2 (watch) · Level3 (choose)
  content/          level + concept data (all copy lives here)
  app/              Next.js App Router pages
```

- **One tick:** each philosopher moves through `thinking → hungry → eating`. A hungry philosopher picks up **at most one chopstick per tick**, so the "holding one, waiting for the other" moment (hold‑and‑wait) is visible on screen.
- **Deadlock detection:** each hungry philosopher waits on at most one holder, so the wait‑for graph is a functional graph. Following its edges finds any cycle in O(N).
- **No backend, no database.** Sound comes from WebAudio square waves, and all art is inline SVG.

Tech: Next.js 15 · TypeScript · Tailwind CSS v4 · framer‑motion · Vitest.
