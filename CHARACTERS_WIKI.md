# Shape Arena Character Wiki

This wiki documents all characters in Shape Arena, including their abilities, cooldowns, mechanics, and visual themes.

---

## 💎 Diamond (Kappa) → Marksman / Light

**Theme**: Perfect aim  
**Identity**: "Skill ceiling monster"

### Abilities

#### Skill 1: Reflect
- **Cooldown**: 130 frames (~2.2 seconds)
- **Effect**: True prediction strike with higher scaling
- **Mechanics**:
  - Looks 15 frames ahead of target's movement (increased from 8)
  - Applies force of 14 in predicted direction (40% higher than before)
  - Grants prediction boost (3x) for 90 frames
  - Requires a target to activate

#### Skill 2: Sharp
- **Cooldown**: 90 frames (~1.5 seconds)
- **Effect**: Chain strike that can chain up to 2 times
- **Mechanics**:
  - Initial strike toward target or random direction if no target
  - Chain count starts at 1, max chains = 2
  - On collision damage, automatically seeks new target within 200px range
  - Each chain strike applies damage and curve force to next target
  - Chain targets are tracked to prevent re-striking same enemy
  - Grants chain strike effect for 60 frames

#### Ultimate: Prism
- **Cooldown**: 300 frames (~5 seconds)
- **Effect**: Auto-aim correction for 3 seconds
- **Mechanics**:
  - Enables auto-aim correction for 180 frames (3 seconds)
  - Grants maximum prediction boost (4x) for 180 frames
  - Increases velocity cap to 25 for 180 frames
  - Enables chain strike capability for 180 frames
  - All bonuses stack for maximum precision

### Visual Weapon: Prism Cannon
- **Description**: Sharp crystal projecting forward with targeting lines
- **Visuals**:
  - Sharp crystal shape projecting from the diamond
  - Multiple targeting lines that point toward enemies
  - During ultimate: multiple refracted beams in different colors (cyan, magenta, yellow, green)
  - Beams have animated length and pulsing effects
- **Theme**: Precision = visible geometry

### Visual Effects
- **Reflect**: Cyan targeting lines and spark effects
- **Sharp**: Chain strike with connecting lines between targets
- **Prism**: Refracted beams with multiple colors during ultimate

---

## 🌙 Crescent (Lambda) → Mage / Light

**Theme**: Flow controller  
**Identity**: "Elegant control"

### Abilities

#### Skill 1: Slice
- **Cooldown**: 105 frames (~1.75 seconds)
- **Effect**: Leaves curved trail that damages enemies
- **Mechanics**:
  - Applies curve angle of 0.4 radians to movement
  - Speed multiplier of 1.8x
  - Creates curved trail at current position
  - Trail lasts 60 frames (1 second)
  - Trail deals 8 damage to enemies within 30px
  - Applies curve force to enemies hit by trail
  - Trail visual fades over time

#### Skill 2: Moon
- **Cooldown**: 100 frames (~1.67 seconds)
- **Effect**: Timed parry mechanic
- **Mechanics**:
  - Activates parry window for 30 frames (0.5 seconds)
  - Grants 80% damage reduction during parry
  - If hit during parry window:
    - Reflects damage back to attacker
    - No damage taken by parrier
    - Triggers parry success visual effect
  - Requires precise timing to use effectively

#### Ultimate: Eclipse
- **Cooldown**: 300 frames (~5 seconds)
- **Effect**: Creates orbital curved zone
- **Mechanics**:
  - Creates orbital zone with 150px radius
  - Zone lasts 180 frames (3 seconds)
  - Zone follows the crescent as it moves
  - Enemies in zone experience:
    - Orbital curve force (perpendicular to center)
    - Slight pull toward center
    - Continuous movement manipulation
  - Grants curve force (0.12) and speed boost (15) for 180 frames

### Visual Weapon: Curved Orbital Elements
- **Description**: Flow controller with orbiting elements
- **Visuals**:
  - 3 orbiting elements around the crescent
  - Each orbital element has a curved trail behind it
  - Parry shield indicator with rotating segments during Moon ability
  - Orbital zone visualization with curved flow lines during Eclipse ultimate
- **Theme**: Elegant control through curved movements

### Visual Effects
- **Slice**: Curved trail rendered as quadratic bezier curves
- **Moon**: Parry shield with rotating white and blue segments
- **Eclipse**: Orbital zone with glowing rim and animated flow lines

---

## 🔶 Dodecahedron (Mu) → Adaptive (Hybrid) / Neutral

**Theme**: Counterplay specialist  
**Identity**: "I adapt… but not instantly, and not perfectly"

### Cycle System

**Core Rule**: Adaptation uses a Cycle System, not instant switching

- **Forms**: Aggression → Mobility → Precision → (repeat)
- Each form lasts 120 frames (2 seconds) automatically
- Using Adapt skill skips to the next form instantly
- Form lock prevents cycling for 90 frames (1.5 seconds) after Face ability
- Perfect Adaptation (ultimate) pauses the cycle entirely

### Abilities

#### Basic Attack: Form Strike (Adaptive Poly-Core)
- **Cooldown**: 25 frames (~0.4 seconds)
- **Effect**: Form-specific basic attack
- **Mechanics**:
  - Attack changes based on current form:
    - **Aggression (Spike Jab)**: Short forward stab with high knockback (8), 8 damage, bonus +5 damage if moving fast
    - **Mobility (Blade Dash)**: Small forward slice + micro dash (2), 3 damage, great for repositioning
    - **Precision (Prism Shot)**: Thin straight projectile, 5 damage, scales with prediction (+3 if predictionBoost active), low knockback (2)
  - Requires movement to activate

#### Skill 1: Adapt
- **Cooldown**: 150 frames (~2.5 seconds)
- **Effect**: Instantly switch to next form with Perfect Adapt Bonus
- **Mechanics**:
  - Skips to next form in cycle (unless form is locked)
  - Can still use during formLockDelay period (20 frames after Face)
  - Resets form timer to full duration
  - Smooth form transition: dampens velocity by 30% before switching
  - Perfect Adapt Bonus for skillful switching:
    - **Switching to Aggression near enemy (<150px)**: +20% extra impact (2.4x mass, +50% speed burst)
    - **Switching to Mobility while moving fast (>7 speed)**: Extra dash burst (+3 velocity)
    - **Switching to Precision while targeting**: Auto-aim assist for 30 frames
  - Grants form-specific bonus for 90 frames (1.5 seconds):
    - **Aggression**: +2.0x mass multiplier (+2.4x with Perfect Adapt), +30% speed burst (+50% with Perfect Adapt)
    - **Mobility**: +speedBoost 20, drag reduction (0.5)
    - **Precision**: +predictionBoost 2 (+3 with Perfect Adapt)
  - Becomes a skill expression tool, not a panic button

#### Skill 2: Face
- **Cooldown**: 126 frames (~2.1 seconds)
- **Effect**: Convert missing HP into power with Delayed Lock
- **Mechanics**:
  - Power multiplier based on missing HP: Math.max(1.2, 1 + (missingHP * 0.8))
  - Minimum 1.2x power guaranteed, up to 1.8x at 0% HP
  - Form-specific power scaling for 90 frames:
    - **Aggression**: Mass multiplier (1.8x * powerMultiplier), +20% speed
    - **Mobility**: Speed boost (15 * powerMultiplier), drag reduction (0.4)
    - **Precision**: Prediction boost (1.5 * powerMultiplier)
  - Delayed Lock: 20 frames (0.33s) to still Adapt before form locks
  - Locks current form for 90 frames (1.5 seconds) after delay
  - Cannot cycle during lock period - wrong form commitment is punishable
  - Risk-reward mechanic: higher HP = higher power but locked into form

#### Ultimate: Transform
- **Cooldown**: 300 frames (~5 seconds)
- **Effect**: Perfect Adaptation Window + Adaptive Attacks
- **Mechanics**:
  - Perfect Adaptation Window lasts 180 frames (3 seconds)
  - Gains all bonuses simultaneously:
    - +1.5x mass multiplier
    - +speedBoost 15
    - +predictionBoost 2
  - Adaptive Attacks: Every basic attack cycles form automatically
    - Hit 1 → Aggression (Spike Jab)
    - Hit 2 → Mobility (Blade Dash)
    - Hit 3 → Precision (Prism Shot)
    - Repeats cycle
  - Form cycle pauses during the window
  - After window ends:
    - Adaptation fatigue: slowed by 30% for 60 frames (1 second)
    - Form cycle resumes
  - Power spike + adaptive cycling = insane damage potential

### Visual Weapon: Adaptive Poly-Core

**Base Form**:
- Floating multi-faced geometric core (hexagonal)
- Each face glows faintly
- Small fragments orbit around it
- Looks neutral and "unfinished" by default

**Form-Based Weapon Shifts**:

- **Aggression Form (Spike Array)**:
  - Faces extend into sharp spikes/blades
  - Orbiting fragments become projectile shards
  - 8 animated spikes that pulse
  - Visual feel: dangerous, explosive, offensive
  - Color: Red/orange (#ff6600)

- **Mobility Form (Blade Stream)**:
  - Core stretches into spinning aerodynamic shape
  - Fragments trail behind like afterimages
  - Elongated during movement
  - Visual feel: fast, fluid, hard to track
  - Color: Blue (#00aaff)

- **Precision Form (Edge Prism)**:
  - Core becomes clean, sharp, symmetrical
  - Faces align into pointed targeting shape
  - Thin laser-like lines when aiming at target
  - Visual feel: focused, calculated, surgical
  - Color: White/gold (#ffdd00)

**Skill Visuals**:

- **During Adapt**: Weapon rapidly reshapes (folding geometry)
  - Quick flash matching new form color
  - White flash effect

- **During Face**: Core cracks open slightly
  - Energy leaks out depending on HP
  - Low HP = more unstable glow (red)
  - High HP = stable glow (green)
  - Shows "risk = power"

- **During Transform**: All forms overlap
  - Splits into multiple rotating layers
  - Spikes + stream + prism all visible
  - Looks like a perfect geometric machine
  - Fully "unlocked" state

- **After Transform**: Visual fatigue
  - Weapon collapses into unstable gray core
  - Shows adaptation has ended

### Visual Effects
- **Form Lock Indicator**: Rotating segments around the dodecahedron
- **Color-coded forms**: Red/orange (Aggression), Blue (Mobility), White/gold (Precision)
- **Cycle Timer**: Form changes every 2 seconds automatically

---

## ⚪ Circle (Alpha) → Tank / Neutral

**Theme**: Gravity control
**Identity**: "The anchor"

### Abilities

#### Skill 1: Dash
- **Cooldown**: 120 frames (~2 seconds)
- **Effect**: Momentum burst in current direction
- **Mechanics**:
  - Multiplies current velocity by 2.0x
  - Grants momentum boost for 30 frames
  - Requires movement to activate

#### Skill 2: Spin
- **Cooldown**: 90 frames (~1.5 seconds)
- **Effect**: Locks onto target with prediction
- **Mechanics**:
  - Redirects velocity toward target at 1.3x speed
  - Grants prediction boost (1x) for 45 frames
  - Requires a target to activate

#### Ultimate: Gravity Ring Trap
- **Cooldown**: 300 frames (~5 seconds)
- **Effect**: Controlled orbit zone that pulls and traps enemies
- **Mechanics**:
  - Creates gravity ring trap with 250px range
  - Lasts 180 frames (3 seconds)
  - Pulls enemies toward the center
  - Traps enemies in orbital patterns

### Visual Weapon: Gravity Anchor
- **Description**: Heavy orb with gravitational waves
- **Visuals**:
  - Pulsing gravitational waves emanating from the circle
  - Gravity ring visualization during ultimate
- **Theme**: Heavy, anchoring presence

---

## 🔺 Triangle (Beta) → Assassin / Neutral

**Theme**: Execute specialist
**Identity**: "The finisher"

### Abilities

#### Skill 1: Pierce
- **Cooldown**: 150 frames (~2.5 seconds)
- **Effect**: High-speed execute bonus
- **Mechanics**:
  - Boosts velocity toward target at 1.3x speed
  - Execute threshold: speed > 10 for bonus damage
  - Higher speed = more damage on hit
  - Requires a target to activate

#### Skill 2: Charge
- **Cooldown**: 100 frames (~1.67 seconds)
- **Effect**: Afterimage trail for fake direction bait
- **Mechanics**:
  - Applies perpendicular force to current movement
  - Creates afterimage trail for 90 frames (1.5 seconds)
  - Trail confuses enemy targeting
  - Requires movement to activate

#### Ultimate: Spike
- **Cooldown**: 300 frames (~5 seconds)
- **Effect**: All-in burst with velocity uncap
- **Mechanics**:
  - Removes velocity cap for 120 frames (2 seconds)
  - Enables unlimited speed buildup
  - High risk, high reward burst potential

### Visual Weapon: Piercing Blade
- **Description**: Sharp triangular blade with afterimages
- **Visuals**:
  - Afterimage trails during Charge ability
  - Sharp piercing visual during Pierce
- **Theme**: Fast, deceptive, finishing

---

## 🟦 Square (Gamma) → Tank / Neutral

**Theme**: Defensive fortress
**Identity**: "The wall"

### Abilities

#### Basic Attack: Shield Bash
- **Cooldown**: 30 frames (~0.5 seconds)
- **Effect**: Cone knockback attack
- **Mechanics**:
  - Creates cone knockback in movement direction
  - Cone angle: 60 degrees
  - Range: 80 pixels
  - Knockback force: 6
  - Requires movement to activate

#### Skill 1: Shield
- **Cooldown**: 150 frames (~2.5 seconds)
- **Effect**: 50% damage reduction + mini shockwaves
- **Mechanics**:
  - Grants damage reduction (0.5) for 120 frames (2 seconds)
  - Reduces all incoming damage by 50%
  - Adds shieldShockwaves effect for 120 frames
  - Basic attacks create mini shockwaves during effect
  - Passive defensive ability

#### Skill 2: Slam
- **Cooldown**: 120 frames (~2 seconds)
- **Effect**: Slam shockwave + wall empower
- **Mechanics**:
  - Activates slam shockwave for 60 frames (1 second)
  - When speed drops significantly, triggers knockback
  - Knockback range: 150px
  - Damage scales with speed at time of slam
  - If slam hits near a wall, empowers next construct
  - Wall empower: +50% damage and +50% duration on next construct

#### Skill 3: Spike Wall
- **Cooldown**: N/A (Disabled)
- **Effect**: Manual spike wall placement disabled
- **Mechanics**:
  - This skill slot is now unused for Square
  - Spike walls only spawn via Quake Pulse ultimate
  - When Quake Pulse pushes enemies into corners, it auto-spawns spike walls

#### Ultimate: Quake Pulse
- **Cooldown**: 300 frames (~5 seconds)
- **Effect**: Area knockback pulse pushing enemies toward walls + auto-spawns spike walls on corner push
- **Mechanics**:
  - Emits quake pulse for 180 frames (3 seconds)
  - Pulse triggers every 30 frames (0.5 seconds)
  - Knockback range: 200px
  - Pushes enemies toward their nearest wall with 15 knockback force
  - If an enemy is pushed into a corner (within 80px of two walls):
    - Auto-spawns spike wall on the wall the enemy is closest to
    - Spike wall duration: 240 frames (4 seconds)
    - Construct cooldown: 180 frames
    - Visual feedback with red triangle particles
  - Combines continuous area control with automatic trap setup
  - Forces enemies into spike walls if active

### Visual Weapon: Fortress Shield
- **Description**: Heavy shield with shockwave effects
- **Visuals**:
  - Shield barrier during Shield ability
  - Shockwave rings during Slam and Quake Pulse
  - Spike wall construct visualization on arena walls
  - Fortress mode with corner fortifications during ultimate
- **Theme**: Defensive, immovable, area control

---

## 🔵 Oval (Delta) → Speedster / Neutral

**Theme**: Velocity manipulation
**Identity**: "The blur"

### Abilities

#### Skill 1: Speed
- **Cooldown**: 120 frames (~2 seconds)
- **Effect**: Exceed normal speed caps briefly
- **Mechanics**:
  - Multiplies current velocity by 1.8x
  - Removes velocity cap for 90 frames (1.5 seconds)
  - Enables speed beyond normal limits
  - Requires movement to activate

#### Skill 2: Drift
- **Cooldown**: 100 frames (~1.67 seconds)
- **Effect**: Invisibility during lateral movement
- **Mechanics**:
  - Applies perpendicular force to current movement
  - Grants invisibility for 60 frames (1 second)
  - Harder to target while invisible
  - Requires movement to activate

#### Ultimate: Phase
- **Cooldown**: 300 frames (~5 seconds)
- **Effect**: Ghost trail that damages enemies
- **Mechanics**:
  - Creates ghost trail for 180 frames (3 seconds)
  - Trail deals 0.5 damage per frame to enemies in range
  - Trail range: 80px
  - Speed boost of 1.5x on activation

### Visual Weapon: Velocity Blur
- **Description**: Elongated shape with motion blur
- **Visuals**:
  - Motion blur effects during high speed
  - Ghost trail during Phase ultimate
  - Fading effect during Drift invisibility
- **Theme**: Fast, elusive, hard to track

---

## ⬡ Hexagon (Epsilon) → Support / Neutral

**Theme**: Protective field
**Identity**: "The guardian"

### Abilities

#### Basic Attack: Orbit Strike
- **Cooldown**: 25 frames (~0.4 seconds)
- **Effect**: Orbital projectile with slow
- **Mechanics**:
  - Fires orbital projectile from around the hexagon
  - Projectile radius: 40 pixels from center
  - Applies slow (0.3) to enemies hit for 30 frames
  - Reduces enemy speed by 30%
  - Low damage but consistent pressure

#### Skill 1: Orbit
- **Cooldown**: 130 frames (~2.17 seconds)
- **Effect**: Precision strike with slow + slow field trail
- **Mechanics**:
  - Boosts velocity toward target at 1.5x speed
  - Applies slow (0.5) to target for 90 frames (1.5 seconds)
  - Reduces enemy speed by 50%
  - Leaves slow field trail for 40 frames
  - Slow field trail slows enemies in the path
  - Requires a target to activate

#### Skill 2: Hex
- **Cooldown**: 110 frames (~1.83 seconds)
- **Effect**: Shield conversion + pulse burst on break
- **Mechanics**:
  - Converts 50% of incoming damage to shield
  - Shield conversion lasts 120 frames (2 seconds)
  - Absorbs damage that would be taken
  - Adds shieldPulseBurst effect for 120 frames
  - When shield breaks, emits pulse burst damaging nearby enemies
  - Pulse burst range: 100px, damage: 10
  - Passive defensive ability

#### Skill 3: Slime Field
- **Cooldown**: 150 frames (~2.5 seconds)
- **Effect**: Creates slowing construct on the ground
- **Mechanics**:
  - Creates slime field at current position
  - Field radius: 120 pixels
  - Duration: 180 frames (3 seconds)
  - Enemies in field are slowed by 40%
  - Enemies in field have acceleration reduced by 30%
  - Max 1 construct at a time
  - Construct cooldown: 150 frames after duration ends

#### Ultimate: Burst
- **Cooldown**: 300 frames (~5 seconds)
- **Effect**: Protective field + construct buff + regen
- **Mechanics**:
  - Grants knockback resistance (0.7) for 180 frames (3 seconds)
  - Reduces knockback by 70%
  - Slows self to 30% speed during effect
  - Adds burstField effect for 180 frames
  - BurstField grants minor regen (0.5 HP/frame) to allies
  - BurstField further slows enemies in slime field
  - If Slime Field is active, doubles its duration
  - Defensive positioning tool

### Visual Weapon: Protective Core
- **Description**: Hexagonal shield with field effects
- **Visuals**:
  - Protective field visualization during Burst
  - Shield barrier during Hex ability
  - Slow field trail during Orbit
  - Slime field construct on ground
  - Pulse burst effect when shield breaks
- **Theme**: Protective, supportive, defensive

---

## 🌀 Spiral (Zeta) → Chaos / Neutral

**Theme**: Unpredictable movement
**Identity**: "The wild card"

### Abilities

#### Skill 1: Vortex
- **Cooldown**: 90 frames (~1.5 seconds)
- **Effect**: Creates pull at impact point, applies Unstable Mark
- **Mechanics**:
  - Applies random directional force (8) to self
  - Adds chaos spin effect for 30 frames
  - Vortex pull effect lasts 60 frames with force of 5
  - Applies Unstable Mark to nearby enemies (150px range)
  - Unstable Mark causes erratic enemy movement for 40 frames

#### Skill 2: Curve
- **Cooldown**: 130 frames (~2.17 seconds)
- **Effect**: Double blink + Chaos Residue
- **Mechanics**:
  - First blink: 40px in current direction
  - Second blink: 30px in random offset direction
  - Unpredictable positioning
  - Leaves Chaos Residue trail for 60 frames
  - Chaos Residue distorts movement of enemies inside the residue area
  - Requires movement to activate

#### Skill 3: Summon Wraith
- **Cooldown**: 150 frames (~2.5 seconds)
- **Effect**: Consumes 1 Soul to summon a Wraith
- **Mechanics**:
  - Requires 1 Soul to activate
  - Max 2 Wraiths active at once
  - Wraith HP: 25, damage multiplier: 0.85
  - Wraith lifetime: 120 frames (2 seconds)
  - Wraith attack cooldown: 30 frames
  - Wraith speed: 6 (7.2 inside Tornado)
  - Wraiths automatically seek and attack enemies

#### Ultimate: Tornado
- **Cooldown**: 300 frames (~5 seconds)
- **Effect**: Chaos zone + auto wraith summoning
- **Mechanics**:
  - Creates chaos zone with 120px range
  - Zone follows the spiral as it moves
  - Applies chaos force (3) to enemies in zone
  - Lasts 180 frames (3 seconds)
  - Speed boost of 25 during effect
  - Auto-consumes souls to summon wraiths (max 2 active)
  - Wraiths inside tornado gain +20% speed

### Soul System (Passive)
- **Max Souls**: 2
- **Passive Gain**: Gain 1 soul every 180 frames (3 seconds) if at 0 souls
- **Soul Drops**: Enemies with Unstable Mark drop souls on death
- **Soul Collection**: Spiral collects souls by passing near them
- **Soul Lifetime**: 180 frames (3 seconds)

### Visual Weapon: Chaos Spinner
- **Description**: Rotating flail weapon with chaotic trails
- **Visuals**:
  - Rotating flail connected by chain
  - Soul count indicator (small orbs around body)
  - Wraiths appear as purple glowing entities
  - Soul drops as purple glowing orbs
  - Stable outer boundary + controlled rotating inner rings during Tornado
- **Theme**: Unpredictable, chaotic, disorienting

---

## 🔷 Rhombus (Eta) → Tank / Neutral

**Theme**: Gravity control
**Identity**: "The magnet"

### Abilities

#### Skill 1: Heavy
- **Cooldown**: 140 frames (~2.33 seconds)
- **Effect**: Stronger pull with slow
- **Mechanics**:
  - Grants attraction effect with 250px range
  - Pulls enemies toward the rhombus
  - Applies gravity slow (0.4) to pulled enemies
  - Effects last 120 frames (2 seconds)

#### Skill 2: Boost
- **Cooldown**: 95 frames (~1.58 seconds)
- **Effect**: Speed boost toward pulled enemies
- **Mechanics**:
  - Multiplies current velocity by 1.6x
  - Additional boost toward nearest enemy
  - Gravity attraction boost toward target
  - Requires movement to activate

#### Ultimate: Impact
- **Cooldown**: 300 frames (~5 seconds)
- **Effect**: Converts attraction into slam detonation
- **Mechanics**:
  - Creates gravity slam with 150px range
  - Deals 15 damage on slam
  - Applies 12 knockback on impact
  - Speed boost of 1.8x on activation
  - Lasts 120 frames (2 seconds)

### Visual Weapon: Gravity Magnet
- **Description**: Rhombus with gravitational pull lines
- **Visuals**:
  - Attraction lines toward enemies
  - Slam detonation effect during Impact
  - Gravity slow visual on pulled enemies
- **Theme**: Attractive, controlling, heavy impact

---

## ⭐ Star (Theta) → DPS / Neutral

**Theme**: Explosive damage
**Identity**: "The burst"

### Abilities

#### Skill 1: Burst
- **Cooldown**: 110 frames (~1.83 seconds)
- **Effect**: Stacking speed burst
- **Mechanics**:
  - Gains speed stacks on successful hits
  - Each stack adds 15% bonus to Burst
  - Multiplies velocity by 2.0x + stack bonus
  - Consumes all stacks on use
  - Max stacks tracked for balance

#### Skill 2: Beam
- **Cooldown**: 115 frames (~1.92 seconds)
- **Effect**: Impact crater (temporary slow zone)
- **Mechanics**:
  - Boosts velocity by 10 in current direction
  - Creates impact crater at location
  - Crater radius: 80px
  - Applies slow (0.5) to enemies in crater
  - Crater lasts 180 frames (3 seconds)

#### Ultimate: Nova
- **Cooldown**: 300 frames (~5 seconds)
- **Effect**: Explosive knockback pulses
- **Mechanics**:
  - Multiplies velocity by 2.5x
  - Creates explosive pulses for 180 frames (3 seconds)
  - Pulse range: 150px
  - Knockback: 8 per pulse
  - Pulse interval: 30 frames (0.5 seconds)
  - Speed boost of 25 for 120 frames
  - Mass multiplier of 1.5 for 120 frames

### Visual Weapon: Radiant Gauntlets
- **Description**: Glowing gauntlets with explosive effects
- **Visuals**:
  - Explosive burst effects during Burst
  - Impact crater visualization during Beam
  - Nova explosion rings during ultimate
- **Theme**: Explosive, high damage, burst-oriented

---

## ❤️ Heart (Iota) → Healer / Light

**Theme**: Support and survival
**Identity**: "The lifeline"

### Abilities

#### Skill 1: Heal
- **Cooldown**: 95 frames (~1.58 seconds)
- **Effect**: Heals and cleanses debuffs
- **Mechanics**:
  - Heals 20 HP (up to max HP)
  - Removes all negative effects (debuffs):
    - Slow
    - Chaos spin
    - Gravity slow
    - Vortex pull
    - Chaos zone
  - Purification effect

#### Skill 2: Pulse
- **Cooldown**: 100 frames (~1.67 seconds)
- **Effect**: Reflects small knockback
- **Mechanics**:
  - Activates knockback reflection for 120 frames (2 seconds)
  - Reflects 70% of knockback back to attacker
  - Grants knockback resistance (0.7)
  - Defensive positioning tool

#### Ultimate: Love
- **Cooldown**: 300 frames (~5 seconds)
- **Effect**: Temporary invulnerability with healing
- **Mechanics**:
  - Invulnerability frames: 90 (1.5 seconds)
  - Heals 25 HP on activation
  - Regeneration: 0.8 HP per frame for 180 frames (3 seconds)
  - Speed boost of 15 for 180 frames
  - Complete damage immunity during invulnerability

### Visual Weapon: Pulse Core
- **Description**: Glowing heart with rhythmic pulses
- **Visuals**:
  - Rhythmic pulse effects
  - Healing glow during Heal ability
  - Knockback reflection rings during Pulse
  - Invulnerability shield during Love ultimate
- **Theme**: Supportive, healing, protective

---

## Character Comparison

| Character | Class | Theme | Playstyle | Skill Ceiling |
|-----------|-------|-------|-----------|---------------|
| Circle | Tank / Neutral | Gravity control | Anchor and trapping | Medium |
| Triangle | Assassin / Neutral | Execute specialist | High-speed finishing | High |
| Square | Tank / Neutral | Defensive fortress | Immovable wall | Medium |
| Oval | Speedster / Neutral | Velocity manipulation | Fast and elusive | High |
| Hexagon | Support / Neutral | Protective field | Team protection | Medium |
| Spiral | Chaos / Neutral | Unpredictable movement | Disorienting and random | High |
| Rhombus | Tank / Neutral | Gravity control | Attraction and control | Medium |
| Star | DPS / Neutral | Explosive damage | Burst-oriented damage | High |
| Heart | Healer / Light | Support and survival | Healing and protection | Medium |
| Diamond | Marksman / Light | Perfect aim | Precision strikes with prediction | Very High |
| Crescent | Mage / Light | Flow controller | Curved movement and timing | High |
| Dodecahedron | Adaptive / Neutral | Counterplay specialist | Form cycling and adaptation | High |

## Cooldown Summary

| Character | Skill 1 | Skill 2 | Skill 3 | Ultimate |
|-----------|---------|---------|---------|----------|
| Circle | 120 frames (~2s) | 90 frames (~1.5s) | N/A | 300 frames (~5s) |
| Triangle | 150 frames (~2.5s) | 100 frames (~1.67s) | N/A | 300 frames (~5s) |
| Square | 150 frames (~2.5s) | 120 frames (~2s) | 150 frames (~2.5s) | 300 frames (~5s) |
| Oval | 120 frames (~2s) | 100 frames (~1.67s) | N/A | 300 frames (~5s) |
| Hexagon | 130 frames (~2.17s) | 110 frames (~1.83s) | 150 frames (~2.5s) | 300 frames (~5s) |
| Spiral | 90 frames (~1.5s) | 130 frames (~2.17s) | 150 frames (~2.5s) | 300 frames (~5s) |
| Rhombus | 140 frames (~2.33s) | 95 frames (~1.58s) | N/A | 300 frames (~5s) |
| Star | 110 frames (~1.83s) | 115 frames (~1.92s) | N/A | 300 frames (~5s) |
| Heart | 95 frames (~1.58s) | 100 frames (~1.67s) | N/A | 300 frames (~5s) |
| Diamond | 130 frames (~2.2s) | 90 frames (~1.5s) | N/A | 300 frames (~5s) |
| Crescent | 105 frames (~1.75s) | 100 frames (~1.67s) | N/A | 300 frames (~5s) |
| Dodecahedron | 150 frames (~2.5s) | 126 frames (~2.1s) | N/A | 300 frames (~5s) |

## AI System

The AI is personality-driven, with each fighter having unique behavioral traits that influence their decision-making. The AI operates through physics-based forces rather than scripted movements.

### Personality Stats

Each fighter has 8 personality stats (range 1-10):

#### Aggression
- **Higher values:** More likely to pursue targets aggressively
- **Effect:** Increases pursuit strength when not near walls
- **Used in:** Movement decisions, skill usage frequency

#### Mobility
- **Higher values:** Better at avoiding walls and maintaining speed
- **Effect:** Increases wall avoidance strength, affects skill conditions
- **Used in:** Wall avoidance, skill activation conditions

#### Precision
- **Higher values:** Better at predicting enemy movement
- **Effect:** Adds target prediction to movement (aims where enemy will be)
- **Used in:** Movement targeting, skill activation conditions

#### Chaos
- **Higher values:** More random and unpredictable movement
- **Effect:** Adds random offsets to movement direction
- **Used in:** Movement decisions, skill usage frequency

#### Greed
- **Higher values:** Prefers close-range engagements
- **Effect:** Increases pursuit strength, affects skill conditions
- **Used in:** Movement decisions, skill activation conditions

#### Fear
- **Higher values:** More likely to retreat at low HP
- **Effect:** Triggers retreat behavior when HP drops below threshold
- **Used in:** Low HP movement decisions, skill activation conditions

#### Revenge
- **Higher values:** Prioritizes attacking the last fighter that hit them
- **Effect:** Reduces effective distance to last attacker
- **Used in:** Target selection

#### SkillDiscipline
- **Higher values:** Fewer random movement mistakes, better ultimate timing
- **Effect:** Reduces random impulses, increases ultimate usage chance
- **Used in:** Movement mistakes, ultimate activation

### Base Personalities

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

### AI Decision Making

#### Target Selection
- Finds nearest alive fighter
- **Revenge modifier:** If revenge > 5, reduces effective distance to last attacker by up to 10%
- Updates every frame

#### Movement System

**Wall Avoidance**
- Detects when within 80px of arena walls
- Applies avoidance force to move away from walls
- Strength: 0.5 base, modified by mobility

**Fear-Based Retreat**
- Triggers when HP < (fear / 10) * maxHp
- Only activates if fear > 3
- Retreats away from target with strength based on HP deficit

**Pursuit Behavior**
- When not retreating and not near walls:
  - **Pursuit strength:** 0.4 base + aggression bonus + greed bonus
  - **Target prediction:** If precision > 5, aims where target will be
  - **Chaos offset:** Adds random direction variation based on chaos stat

**SkillDiscipline Mistakes**
- If skillDiscipline < 5, random chance of movement error
- Error chance: (5 - skillDiscipline) / 100 per frame
- Adds random velocity impulse when triggered

### Wall-Bounce System

Fighters must hit a wall before dealing damage again after colliding with another fighter. This creates a rhythm of combat: bounce → attack → bounce.

#### Mechanics
- **After hitting a fighter:** The attacker is flagged as needing a wall bounce (`needsWallBounce = true`)
- **Cannot deal damage:** While flagged, the fighter cannot damage other fighters
- **Wall bounce required:** Hitting any arena wall clears the flag (`needsWallBounce = false`)
- **Visual feedback:** A flash effect and particle burst indicate when a fighter is ready to deal damage again

#### Bounce State System

Each fighter tracks their bounce state with three possible values:

**NONE**
- Default state after spawn or after dealing damage
- Cannot deal damage
- Moves toward walls intentionally to enable attacks
- Skill usage reduced by ~50%

**PLANNED**
- Triggered when hitting a wall from own movement
- Can deal damage immediately
- Increased aggression (1.5x pursuit strength)
- Increased skill usage chance
- Main combat window for attacks

**FORCED**
- Triggered when hitting a wall from external force (collision knockback)
- 15-25 frame delay before attacking
- Stabilization movement (velocity reduction + center correction)
- Skill usage blocked during delay
- Prevents chaotic spam hits

#### Reset Rules
- Bounce state resets to NONE after dealing damage
- Bounce state also resets to NONE after 60 frames (1 second)
- Forces the cycle: bounce → attack → reset → bounce

#### Personality Modifiers

**Precision**
- Improves pre-bounce adjustment accuracy
- Fighters with high precision aim better when approaching walls

**Chaos**
- Adds randomness ONLY during PLANNED bounce
- Makes attacks less predictable after intentional wall bounces

**SkillDiscipline**
- Reduces attacking during forced bounce delay
- Undisciplined fighters may still try to attack during stabilization

**Aggression**
- 20% pursuit strength bonus when >7
- High aggression fighters ignore bad bounces more often

#### Pre-Bounce Adjustment
- When near a wall, fighters slightly adjust movement toward target direction
- Adjustment strength scaled by mobility + precision
- Creates intentional rebounds and fewer "useless bounces"

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

### Shape-Specific Behavioral Biases

Each shape has unique movement patterns that complement their personality:

**Circle**
- Enhanced wall avoidance (0.3 strength)
- Prefers using walls for bounces

**Triangle**
- Disengages after close-range hits (dist < 100, speed > 5)
- Hit-and-run playstyle

**Square**
- Resists wall avoidance (moves toward corners)
- Corner pressure tactics

**Oval**
- Maintains minimum speed (boosts if speed < 6)
- Constant movement

**Hexagon**
- Defensive spacing (retreats when dist < 120)
- Zone control

**Spiral**
- Random direction changes (5% chance per frame)
- Unpredictable movement

**Rhombus**
- Engages at long range (pursues when dist > 150)
- Bait-and-counter tactics

**Star**
- Relentless pursuit (always adds pursuit force)
- Aggressive pressure

**Heart**
- Evasive at low HP (retreats when HP < 60)
- Survival focus

**Diamond**
- Predictive interception (aims at predicted position)
- Counter-attack focus

**Crescent**
- Curved movement patterns (constant curve force)
- Arc-based attacks

**Dodecahedron**
- Adaptive aggression (increases aggression when HP < 50)
- Mid-fight adjustment

### Effect Integration

**predictionBoost**
- Doubles prediction factor for targeting
- Makes AI aim more accurately at moving targets

**chaosSpin**
- Adds random rotational forces to movement
- Increases unpredictability

**velocityCap**
- Limits maximum speed
- Prevents over-speeding, maintains control

**curveForce**
- Adds continuous curved trajectory
- Creates arc-based movement patterns

**adaptiveStats**
- Enables temporary stat boosts
- Allows mid-fight personality adjustment

### Physics Integration

All AI decisions result in physics changes:
- **Pursuit:** Adds velocity toward target
- **Retreat:** Adds velocity away from target
- **Wall Avoidance:** Adds velocity away from walls
- **Chaos:** Adds random velocity offsets
- **Prediction:** Adjusts target position based on enemy velocity

The AI never directly sets position - it only applies forces that the physics system processes, ensuring natural and emergent behavior.

---

## Game Mechanics Reference

### Common Effects

- **Prediction Boost**: Improves targeting accuracy by multiplying prediction calculations
- **Speed Boost**: Increases maximum velocity and acceleration
- **Mass Multiplier**: Increases effective mass for collision calculations
- **Damage Reduction**: Reduces incoming damage by percentage
- **Drag Reduction**: Reduces friction/velocity decay
- **Curve Force**: Applies perpendicular force to create curved movement

### Collision Mechanics

- **Chain Strike**: Automatically redirects to new targets within range after hitting
- **Parry**: Reflects damage back to attacker if timed correctly
- **Orbital Force**: Applies perpendicular force to create orbital patterns
- **Curve Trail**: Creates damaging path that persists over time

### Frame Timing

- 60 frames = 1 second
- All cooldowns and durations are measured in frames
- Update loop runs at 60 FPS

---

*Last Updated: April 30, 2026*
