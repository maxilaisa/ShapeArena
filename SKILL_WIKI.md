# ShapeArena Skill Wiki

This wiki documents all fighter skills and their mechanics. All skills are physics-based and work through velocity changes, mass modifications, and temporary effects.

---

## Circle (Alpha) - "The Momentum Sniper"

**Theme:** I control space with speed

**Personality:** High mobility, balanced aggression

### Weapon: Orbit Blades (Dual Rings)
- **Visual:** Two glowing green rings spinning around the body (6 orbiting blade orbs total)
- **Normal State:** 3 green orbs per ring orbit at different speeds
- **During Dash:** Orbs stretch into arcs aligned with movement direction (like slicing wind)
- **During Ultimate:** Multiple purple orbit layers appear (Gravity Ring Trap effect)
- **Feel:** Cutting space itself with speed

### Skill 1: Dash
- **Cooldown:** 2.0 seconds (120 frames)
- **Effect:** Multiplies current velocity by 1.5x to 2.5x based on current speed
- **Bonus:** Grants `momentumBoost` effect for 0.5 seconds (30 frames)
- **Best Use:** When already moving fast to maximize the multiplier (rewards momentum)
- **Identity:** "Speed is my weapon"

### Skill 2: Spin
- **Cooldown:** 1.5 seconds (90 frames)
- **Effect:** When near arena walls (within 100px), converts wall bounce into targeted ricochet
- **Bonus:** Locks onto nearest enemy briefly with `predictionBoost` for 0.75 seconds (45 frames)
- **Mechanic:** Bounces toward target at 1.3x speed instead of random reflection
- **Best Use:** Near walls to redirect attacks at enemies
- **Identity:** "I never miss"

### Ultimate: Gravity Ring Trap
- **Charge Required:** 10 hits
- **Cooldown:** 3.0 seconds (180 frames)
- **Effect:** Creates controlled orbit zone (250px range) for 3 seconds (180 frames)
- **Mechanic:** Pulls enemies toward center and applies orbital force (spins them around)
- **Visual:** Multiple orbit layers (3 spinning rings) with purple glow
- **Best Use:** Zone control and trapping enemies in your space
- **Identity:** "This is my arena"

---

## Triangle (Beta) - "The Assassin Diver"

**Theme:** All-in burst, high risk

**Personality:** High aggression and mobility

### Weapon: Piercing Lance (Energy Spear)
- **Visual:** Long, sharp forward-pointing spear with purple/magenta energy
- **Normal State:** Spear points in movement direction, dark purple shaft with magenta tip
- **During Pierce:** Spear extends dramatically (3.5x length) with brighter glow
- **During Charge:** Leaves dark streak trails behind movement
- **Feel:** Like a missile with a blade

### Skill 1: Pierce
- **Cooldown:** 2.5 seconds (150 frames)
- **Effect:** Rushes directly toward target with force 12 (18 at high speed)
- **Execute Bonus:** At speed > 10, gains 50% more force and `executeBoost` for 1 second
- **Best Use:** When already moving fast for maximum burst damage
- **Identity:** "High speed = high damage"

### Skill 2: Charge
- **Cooldown:** 1.7 seconds (100 frames)
- **Effect:** Adds perpendicular velocity boost of 8 (sideways dodge)
- **Bonus:** Leaves afterimage trail for 1.5 seconds (fake direction bait)
- **Mechanic:** Creates fake position copies to confuse enemies
- **Best Use:** When moving fast to create unpredictable movement and misdirection
- **Identity:** "You never know where I'll be"

### Ultimate: Spike
- **Charge Required:** 10 hits
- **Cooldown:** 2.0 seconds (120 frames)
- **Effect:** Removes velocity cap temporarily for 2 seconds
- **Mechanic:** Ignores all speed limits, allows unlimited velocity (all-in burst)
- **Risk:** High speed makes you harder to control
- **Best Use:** When you need maximum speed for a finishing blow
- **Identity:** "No limits, no mercy"

---

## Square (Gamma) - "The Juggernaut"

**Theme:** You don't move me—I move YOU

**Personality:** High precision, low mobility

### Weapon: Impact Core (Heavy Hammer Field)
- **Visual:** No traditional weapon—has a floating mass block/aura around the square
- **Normal State:** Pulsing purple aura with dense inner core
- **During Slam:** Visible shockwave plates appear when moving fast
- **During Ultimate:** Looks like a moving fortress with corner fortifications
- **Feel:** The body is the weapon

### Skill 1: Shield
- **Cooldown:** 2.5 seconds (150 frames)
- **Effect:** Grants `damageReduction` of 50% for 2 seconds (120 frames)
- **Mechanic:** Reduces incoming damage by half while active
- **Visual:** Blue protective aura around the square
- **Best Use:** When expecting to take damage from collisions
- **Identity:** "You can't hurt me"

### Skill 2: Slam
- **Cooldown:** 2.0 seconds (120 frames)
- **Effect:** Grants `slamShockwave` for 1 second (60 frames)
- **Mechanic:** When speed drops below 2, creates shockwave that knocks back nearby fighters (150px range)
- **Visual:** Charging indicator when moving fast, shockwave particles on stop
- **Best Use:** Build up speed then stop to create area knockback
- **Identity:** "I control the space around me"

### Ultimate: Quake
- **Charge Required:** 10 hits
- **Cooldown:** 3.0 seconds (180 frames)
- **Effect:** Grants `quakePulse` for 3 seconds (180 frames)
- **Mechanic:** Area knockback pulse every 0.5 seconds (30 frames) in 200px range
- **Visual:** Fortress aura with corner fortifications, pulsing ring effects
- **Best Use:** Zone control and keeping enemies away
- **Identity:** "This is my fortress"

---

## 🟣 Oval (Delta) - "Marksman / Dark"

**Theme:** Untouchable speed demon

**Identity:** "You can't hit what you can't track"

**Weapon:** Phase Blades (Twin Curved Knives)
- Thin, curved blades that flicker in and out
- Leave ghost trails when moving fast
- During Phase: weapons lag behind like echoes

### Skill 1: Speed
- **Cooldown:** 2.0 seconds (120 frames)
- **Effect:** Multiplies velocity by 1.8x
- **Bonus:** Grants `velocityUncap` for 1.5 seconds (90 frames) - exceeds normal speed caps
- **Best Use:** Break speed limits for brief bursts of unmatched mobility

### Skill 2: Drift
- **Cooldown:** 1.7 seconds (100 frames)
- **Effect:** Adds perpendicular drift force of 6
- **Bonus:** Grants `invisibility` for 1 second (60 frames) - becomes transparent
- **Best Use:** Evasive sidestepping while becoming harder to track

### Ultimate: Phase
- **Charge Required:** 10 hits
- **Cooldown:** 3.0 seconds (180 frames)
- **Effect:** Grants `ghostTrail` for 3 seconds
- **Bonus:** Speed boost of 1.5x, leaves damaging ghost echoes behind
- **Mechanic:** Enemies within 80px of the trail take 0.5 damage per frame
- **Best Use:** Create a damaging path while moving at high speed

---

## ⬡ Hexagon (Epsilon) - "Support (Self) / Light"

**Theme:** Tactical controller

**Identity:** "I outplay, not overpower"

**Weapon:** Hex Drones (Floating Nodes)
- 3-6 small orbiting hex shards
- Align and fire/strike precisely
- Glow brighter when predictionBoost is active

### Skill 1: Orbit
- **Cooldown:** 2.2 seconds (130 frames)
- **Effect:** Precision strike toward target with force 8
- **Bonus:** Grants `predictionBoost` for 1 second (60 frames)
- **Mechanic:** Applies `slow` (50% speed reduction) to target for 1.5 seconds (90 frames)
- **Best Use:** Accurate targeting while hindering enemy mobility

### Skill 2: Hex
- **Cooldown:** 1.8 seconds (110 frames)
- **Effect:** Grants `shieldConversion` for 2 seconds (120 frames)
- **Mechanic:** Converts 50% of damage taken into temporary shield HP
- **Best Use:** Defensive stance to absorb and convert incoming damage

### Ultimate: Burst
- **Charge Required:** 10 hits
- **Cooldown:** 3.0 seconds (180 frames)
- **Effect:** Grants `knockbackResistance` for 3 seconds (180 frames)
- **Mechanic:** Reduces knockback force by 70%
- **Bonus:** Slows to 30% speed
- **Best Use:** Near-immovable defensive position against aggressive fighters

---

## 🌀 Spiral (Zeta) - "Mage / Dark"

**Theme:** Chaos controller

**Identity:** "Unpredictability IS the strategy"

**Weapon:** Chaos Orb
- A swirling unstable sphere
- Random spikes or tendrils extend from it
- During ultimate: becomes a mini tornado core

### Skill 1: Vortex
- **Cooldown:** 1.5 seconds (90 frames)
- **Effect:** Random direction burst with force 8
- **Bonus:** Grants `chaosSpin` for 0.5 seconds (30 frames)
- **Mechanic:** Pulls enemies within 150px toward a random direction (force 5) for 1 second (60 frames)
- **Best Use:** Disrupt enemy positioning while escaping

### Skill 2: Curve
- **Cooldown:** 2.2 seconds (130 frames)
- **Effect:** Multi-blink (2 small teleports)
- **Mechanic:** First blink 50 units forward, second blink 30 units in random offset direction
- **Best Use:** Unpredictable repositioning to confuse enemies

### Ultimate: Tornado
- **Charge Required:** 10 hits
- **Cooldown:** 3.0 seconds (180 frames)
- **Effect:** Creates moving chaos zone that follows you
- **Mechanic:** Applies random chaotic force (3) to enemies within 120px range
- **Bonus:** Grants `speedBoost` of 25 for 3 seconds
- **Best Use:** Create chaos while moving at high speed

---

## 🔷 Rhombus (Eta) - "Mage / Dark"

**Theme:** Gravity manipulator

**Identity:** "Come to me… and regret it"

**Weapon:** Gravity Chain
- A chain or tether extending outward
- Visibly pulls enemies in
- Becomes thicker/heavier during ultimate

### Skill 1: Heavy
- **Cooldown:** 2.3 seconds (140 frames)
- **Effect:** Creates stronger attraction field with 250px range
- **Mechanic:** Applies 40% slow to pulled enemies for 1 second (60 frames)
- **Duration:** 2 seconds (120 frames)
- **Best Use:** Pull and slow nearby fighters simultaneously

### Skill 2: Boost
- **Cooldown:** 1.6 seconds (95 frames)
- **Effect:** Speed boost of 1.6x
- **Mechanic:** Gains bonus speed (force 6) toward nearest enemy
- **Best Use:** Accelerate toward pulled enemies for impact

### Ultimate: Impact
- **Charge Required:** 10 hits
- **Cooldown:** 2.0 seconds (120 frames)
- **Effect:** Converts attraction into slam detonation
- **Mechanic:** Deals 15 damage and applies 12 knockback to enemies within 150px
- **Bonus:** Speed boost of 1.8x
- **Best Use:** Detonate on pulled enemies for massive damage

---

## Star (Theta) - "The Aggressor"

**Personality:** Maximum aggression, minimum fear

### Skill 1: Burst
- **Cooldown:** 1.8 seconds (110 frames)
- **Effect:** Speed boost of 2.5x
- **Best Use:** Maximum forward burst

### Skill 2: Beam
- **Cooldown:** 1.9 seconds (115 frames)
- **Effect:** Downward velocity boost of 8
- **Bonus:** Grants `massMultiplier` of 4x for 0.75 seconds (45 frames)
- **Best Use:** Heavy downward slam

### Ultimate: Nova
- **Charge Required:** 10 hits
- **Cooldown:** 2.0 seconds (120 frames)
- **Effect:** Speed boost of 3.0x
- **Bonus:** Grants `speedBoost` of 30 for 2 seconds
- **Bonus:** Grants `massMultiplier` of 2x for 2 seconds
- **Best Use:** Maximum speed with decent mass

---

## Heart (Iota) - "The Survivor"

**Personality:** High fear, low aggression

### Skill 1: Heal
- **Cooldown:** 1.6 seconds (95 frames)
- **Effect:** Sets velocity to 6 in current direction (rhythmic movement)
- **Best Use:** Consistent, controlled movement

### Skill 2: Pulse
- **Cooldown:** 1.7 seconds (100 frames)
- **Effect:** Grants `massMultiplier` of 2x for 1.25 seconds (75 frames)
- **Best Use:** Defensive mass increase

### Ultimate: Love
- **Charge Required:** 10 hits
- **Cooldown:** 3.0 seconds (180 frames)
- **Effect:** Heals 30 HP immediately
- **Bonus:** Grants `regeneration` of 0.5 HP/sec for 3 seconds
- **Bonus:** Grants `speedBoost` of 20 for 3 seconds
- **Best Use:** Emergency healing with speed

---

## Diamond (Kappa) - "The Precision"

**Personality:** Maximum precision, balanced stats

### Skill 1: Reflect
- **Cooldown:** 2.0 seconds (120 frames)
- **Effect:** Predictive strike - aims where target will be in 8 frames
- **Force:** 10
- **Best Use:** Against moving targets

### Skill 2: Sharp
- **Cooldown:** 1.5 seconds (90 frames)
- **Effect:** Random direction change (±0.75 radians)
- **Best Use:** Unpredictable angle changes

### Ultimate: Prism
- **Charge Required:** 10 hits
- **Cooldown:** 2.5 seconds (150 frames)
- **Effect:** Grants `predictionBoost` of 2 for 2.5 seconds
- **Bonus:** Grants `velocityCap` of 20 for 2.5 seconds
- **Best Use:** Perfect aim with speed control

---

## Crescent (Lambda) - "The Curved"

**Personality:** Balanced stats, curved movement

### Skill 1: Slice
- **Cooldown:** 1.8 seconds (105 frames)
- **Effect:** Curves path by 0.3 radians
- **Bonus:** Speed boost of 1.5x
- **Bonus:** Grants `curveForce` for 0.67 seconds (40 frames)
- **Best Use:** Curved attacks to avoid head-on collisions

### Skill 2: Moon
- **Cooldown:** 1.7 seconds (100 frames)
- **Effect:** Oscillating mass multiplier (1.0x to 2.0x)
- **Duration:** 1 second (60 frames)
- **Best Use:** Timing-based mass variation

### Ultimate: Eclipse
- **Charge Required:** 10 hits
- **Cooldown:** 2.5 seconds (150 frames)
- **Effect:** Speed boost of 2.0x
- **Bonus:** Grants `curveForce` of 0.1 for 2.5 seconds
- **Bonus:** Grants `speedBoost` of 20 for 2.5 seconds
- **Best Use:** Fast curved movement

---

## Dodecahedron (Mu) - "The Adaptive"

**Personality:** Balanced stats, adaptable

### Skill 1: Adapt
- **Cooldown:** 2.5 seconds (150 frames)
- **Effect:** Randomly boosts one stat (aggression, mobility, or precision) by 2
- **Bonus:** Grants `adaptiveStats` for 3 seconds (180 frames)
- **Best Use:** Mid-fight stat adjustment

### Skill 2: Face
- **Cooldown:** 2.1 seconds (125 frames)
- **Effect:** Grants `massMultiplier` of 1.8x for 1.33 seconds (80 frames)
- **Bonus:** Speed boost of 1.2x
- **Best Use:** Balanced mass and speed increase

### Ultimate: Transform
- **Charge Required:** 10 hits
- **Cooldown:** 3.3 seconds (200 frames)
- **Effect:** Boosts aggression, mobility, and precision by 3
- **Bonus:** Grants `massMultiplier` of 2x for 3.3 seconds
- **Bonus:** Grants `speedBoost` of 15 for 3.3 seconds
- **Bonus:** Grants `adaptiveStats` for 3.3 seconds
- **Best Use:** Complete stat transformation

---

## Effect Descriptions

### momentumBoost
- Enhances velocity maintenance
- Duration: 30 frames (0.5s)

### speedBoost
- Increases maximum velocity cap
- Values: 15-30

### massMultiplier
- Multiplies fighter mass for collision calculations
- Values: 1.5x to 8x
- Higher mass = more knockback dealt, less received

### predictionBoost
- Improves AI targeting accuracy
- Predicts enemy movement
- Values: 1-2

### chaosSpin
- Adds random rotational forces
- Values: 2-4

### attraction
- Pulls nearby fighters toward user
- Range: 200px

### phaseShift
- Allows passing through fighters without collision
- Duration: 120 frames (2s)

### regeneration
- Heals HP over time
- Value: 0.5 HP/sec

### velocityCap
- Limits maximum speed
- Values: 15-20

### curveForce
- Adds continuous curved trajectory
- Values: 0.05-0.1

### adaptiveStats
- Enables temporary stat boosts
- Duration: 180-200 frames (3-3.3s)

### orbitalForce
- Creates gravitational field around fighter
- Value: 0.8

---

## Ultimate Charge System

- **Charge Required:** 10 charges to use ultimate
- **Charge Sources:**
  - Light hit (damage ≤5): +1 charge
  - Clean hit (damage >5): +2 charges
  - Wall combo (speed >8): +3 charges
  - Counter hit (damage >10): +4 charges
- **Charge Awarded To:** Randomly determined between collision participants

---

## Wall-Bounce System

After dealing damage to another fighter, you must bounce off a wall before dealing damage again. This prevents infinite damage chains and encourages strategic positioning.

- **Visual Indicator:** Pulsing grey dashed ring when wall-bounce is needed
- **Reset:** Wall collision clears the requirement with green flash and particles
- **Panel Indicator:** Yellow warning text on status panel when wall-bounce is required

---

# AI System

The AI is personality-driven, with each fighter having unique behavioral traits that influence their decision-making. The AI operates through physics-based forces rather than scripted movements.

## Personality Stats

Each fighter has 8 personality stats (range 1-10):

### Aggression
- **Higher values:** More likely to pursue targets aggressively
- **Effect:** Increases pursuit strength when not near walls
- **Used in:** Movement decisions, skill usage frequency

### Mobility
- **Higher values:** Better at avoiding walls and maintaining speed
- **Effect:** Increases wall avoidance strength, affects skill conditions
- **Used in:** Wall avoidance, skill activation conditions

### Precision
- **Higher values:** Better at predicting enemy movement
- **Effect:** Adds target prediction to movement (aims where enemy will be)
- **Used in:** Movement targeting, skill activation conditions

### Chaos
- **Higher values:** More random and unpredictable movement
- **Effect:** Adds random offsets to movement direction
- **Used in:** Movement decisions, skill usage frequency

### Greed
- **Higher values:** Prefers close-range engagements
- **Effect:** Increases pursuit strength, affects skill conditions
- **Used in:** Movement decisions, skill activation conditions

### Fear
- **Higher values:** More likely to retreat at low HP
- **Effect:** Triggers retreat behavior when HP drops below threshold
- **Used in:** Low HP movement decisions, skill activation conditions

### Revenge
- **Higher values:** Prioritizes attacking the last fighter that hit them
- **Effect:** Reduces effective distance to last attacker
- **Used in:** Target selection

### SkillDiscipline
- **Higher values:** Fewer random movement mistakes, better ultimate timing
- **Effect:** Reduces random impulses, increases ultimate usage chance
- **Used in:** Movement mistakes, ultimate activation

## Base Personalities

Each shape has fixed base personality stats with ±5% random variation per match:

| Shape | Aggression | Mobility | Precision | Chaos | Greed | Fear | Revenge | SkillDiscipline |
|-------|-----------|----------|-----------|-------|-------|------|---------|----------------|
| Circle | 7 | 8 | 6 | 5 | 6 | 3 | 5 | 7 |
| Triangle | 8 | 9 | 7 | 4 | 7 | 2 | 6 | 8 |
| Square | 5 | 4 | 8 | 2 | 4 | 5 | 7 | 9 |
| Oval | 6 | 10 | 5 | 4 | 5 | 4 | 4 | 6 |
| Hexagon | 4 | 5 | 9 | 3 | 3 | 6 | 8 | 8 |
| Spiral | 5 | 7 | 4 | 9 | 5 | 4 | 5 | 5 |
| Rhombus | 6 | 6 | 7 | 6 | 8 | 3 | 9 | 7 |
| Star | 10 | 7 | 5 | 7 | 9 | 1 | 7 | 6 |
| Heart | 3 | 8 | 6 | 3 | 2 | 8 | 4 | 7 |
| Diamond | 7 | 6 | 10 | 2 | 6 | 4 | 6 | 8 |
| Crescent | 6 | 8 | 6 | 5 | 5 | 5 | 5 | 6 |
| Dodecahedron | 6 | 6 | 7 | 4 | 5 | 5 | 5 | 10 |

## AI Decision Making

### Target Selection
- Finds nearest alive fighter
- **Revenge modifier:** If revenge > 5, reduces effective distance to last attacker by up to 10%
- Updates every frame

### Movement System

#### Wall Avoidance
- Detects when within 80px of arena walls
- Applies avoidance force to move away from walls
- Strength: 0.5 base, modified by mobility

#### Fear-Based Retreat
- Triggers when HP < (fear / 10) * maxHp
- Only activates if fear > 3
- Retreats away from target with strength based on HP deficit

#### Pursuit Behavior
- When not retreating and not near walls:
  - **Pursuit strength:** 0.4 base + aggression bonus + greed bonus
  - **Target prediction:** If precision > 5, aims where target will be
  - **Chaos offset:** Adds random direction variation based on chaos stat

#### SkillDiscipline Mistakes
- If skillDiscipline < 5, random chance of movement error
- Error chance: (5 - skillDiscipline) / 100 per frame
- Adds random velocity impulse when triggered

### Skill Usage

#### Base Activation Chance
- **Skill 1 & 2:** 2% base chance per frame
- **Modified by chaos:** +0.5% per chaos point
- **Ultimate:** 1% base chance per frame
- **Modified by skillDiscipline:** +0.05% per skillDiscipline point

#### Skill 1 Conditions
Each shape has specific conditions for Skill 1:
- **Circle:** Use when speed > 5 (modified by mobility)
- **Triangle:** Use when target distance > 150 (modified by greed)
- **Square:** Use randomly (50% * aggression chance)
- **Oval:** Use when speed < 8
- **Hexagon:** Use when target distance < 80
- **Spiral:** Use randomly (3% chance)
- **Rhombus:** Use when target distance > 120
- **Star:** Use when target distance < 200
- **Heart:** Use when HP < 50
- **Diamond:** Use when target distance > 100
- **Crescent:** Use randomly (2.5% chance)
- **Dodecahedron:** Use randomly (1.5% chance)

#### Skill 2 Conditions
Each shape has specific conditions for Skill 2:
- **Circle:** Always available (wall-dependent effect)
- **Triangle:** Use when target distance < 100 (modified by greed)
- **Square:** Use when speed > 6 (modified by fear)
- **Oval, Hexagon, Spiral, Rhombus, Star, Heart, Diamond, Crescent, Dodecahedron:** Always available

#### Ultimate Conditions
- Requires 10 charge
- Cooldown must be 0
- Activation based on skillDiscipline
- Higher skillDiscipline = more reliable ultimate usage

## Shape-Specific Behavioral Biases

Each shape has unique movement patterns that complement their personality:

### Circle
- Enhanced wall avoidance (0.3 strength)
- Prefers using walls for bounces

### Triangle
- Disengages after close-range hits (dist < 100, speed > 5)
- Hit-and-run playstyle

### Square
- Resists wall avoidance (moves toward corners)
- Corner pressure tactics

### Oval
- Maintains minimum speed (boosts if speed < 6)
- Constant movement

### Hexagon
- Defensive spacing (retreats when dist < 120)
- Zone control

### Spiral
- Random direction changes (5% chance per frame)
- Unpredictable movement

### Rhombus
- Engages at long range (pursues when dist > 150)
- Bait-and-counter tactics

### Star
- Relentless pursuit (always adds pursuit force)
- Aggressive pressure

### Heart
- Evasive at low HP (retreats when HP < 60)
- Survival focus

### Diamond
- Predictive interception (aims at predicted position)
- Counter-attack focus

### Crescent
- Curved movement patterns (constant curve force)
- Arc-based attacks

### Dodecahedron
- Adaptive aggression (increases aggression when HP < 50)
- Mid-fight adjustment

## Effect Integration

### predictionBoost
- Doubles prediction factor for targeting
- Makes AI aim more accurately at moving targets

### chaosSpin
- Adds random rotational forces to movement
- Increases unpredictability

### velocityCap
- Limits maximum speed
- Prevents over-speeding, maintains control

### curveForce
- Adds continuous curved trajectory
- Creates arc-based movement patterns

### adaptiveStats
- Enables temporary stat boosts
- Allows mid-fight personality adjustment

## Physics Integration

All AI decisions result in physics changes:
- **Pursuit:** Adds velocity toward target
- **Retreat:** Adds velocity away from target
- **Wall Avoidance:** Adds velocity away from walls
- **Chaos:** Adds random velocity offsets
- **Prediction:** Adjusts target position based on enemy velocity

The AI never directly sets position - it only applies forces that the physics system processes, ensuring natural and emergent behavior.
