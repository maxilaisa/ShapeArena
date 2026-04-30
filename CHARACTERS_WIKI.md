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

#### Skill 1: Adapt
- **Cooldown**: 150 frames (~2.5 seconds)
- **Effect**: Instantly switch to next form with stronger bonus
- **Mechanics**:
  - Skips to next form in cycle (unless form is locked)
  - Resets form timer to full duration
  - Grants form-specific bonus for 90 frames (1.5 seconds):
    - **Aggression**: +2.0x mass multiplier, +30% speed burst
    - **Mobility**: +speedBoost 20, drag reduction (0.5)
    - **Precision**: +predictionBoost 2
  - Becomes a timing tool, not a "fix my problem" button

#### Skill 2: Face
- **Cooldown**: 126 frames (~2.1 seconds)
- **Effect**: Convert missing HP into power, but lock current form
- **Mechanics**:
  - Power multiplier based on missing HP: 1 + (missingHP * 0.8)
  - Up to 1.8x power at 0% HP
  - Form-specific power scaling for 90 frames:
    - **Aggression**: Mass multiplier (1.8x * powerMultiplier), +20% speed
    - **Mobility**: Speed boost (15 * powerMultiplier), drag reduction (0.4)
    - **Precision**: Prediction boost (1.5 * powerMultiplier)
  - Locks current form for 90 frames (1.5 seconds)
  - Cannot cycle during lock - wrong form commitment is punishable
  - Risk-reward mechanic: higher HP = higher power but locked into form

#### Ultimate: Transform
- **Cooldown**: 300 frames (~5 seconds)
- **Effect**: Perfect Adaptation Window
- **Mechanics**:
  - Perfect Adaptation Window lasts 180 frames (3 seconds)
  - Gains all bonuses simultaneously:
    - +1.5x mass multiplier
    - +speedBoost 15
    - +predictionBoost 2
  - Form cycle pauses during the window
  - After window ends:
    - Adaptation fatigue: slowed by 30% for 60 frames (1 second)
    - Form cycle resumes
  - Power spike + punish window = fair balance

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

#### Skill 1: Shield
- **Cooldown**: 150 frames (~2.5 seconds)
- **Effect**: 50% damage reduction
- **Mechanics**:
  - Grants damage reduction (0.5) for 120 frames (2 seconds)
  - Reduces all incoming damage by 50%
  - Passive defensive ability

#### Skill 2: Slam
- **Cooldown**: 120 frames (~2 seconds)
- **Effect**: Slam shockwave on collision
- **Mechanics**:
  - Activates slam shockwave for 60 frames (1 second)
  - When speed drops significantly, triggers knockback
  - Knockback range: 150px
  - Damage scales with speed at time of slam

#### Ultimate: Quake Pulse
- **Cooldown**: 300 frames (~5 seconds)
- **Effect**: Area knockback pulse every 0.5 seconds
- **Mechanics**:
  - Emits quake pulse for 180 frames (3 seconds)
  - Pulse triggers every 30 frames (0.5 seconds)
  - Knockback range: 200px
  - Continuous area control

### Visual Weapon: Fortress Shield
- **Description**: Heavy shield with shockwave effects
- **Visuals**:
  - Shield barrier during Shield ability
  - Shockwave rings during Slam and Quake Pulse
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

#### Skill 1: Orbit
- **Cooldown**: 130 frames (~2.17 seconds)
- **Effect**: Precision strike with slow
- **Mechanics**:
  - Boosts velocity toward target at 1.5x speed
  - Applies slow (0.5) to target for 90 frames (1.5 seconds)
  - Reduces enemy speed by 50%
  - Requires a target to activate

#### Skill 2: Hex
- **Cooldown**: 110 frames (~1.83 seconds)
- **Effect**: Shield conversion from damage
- **Mechanics**:
  - Converts 50% of incoming damage to shield
  - Shield conversion lasts 120 frames (2 seconds)
  - Absorbs damage that would be taken
  - Passive defensive ability

#### Ultimate: Burst
- **Cooldown**: 300 frames (~5 seconds)
- **Effect**: Protective field reducing knockback
- **Mechanics**:
  - Grants knockback resistance (0.7) for 180 frames (3 seconds)
  - Reduces knockback by 70%
  - Slows self to 30% speed during effect
  - Defensive positioning tool

### Visual Weapon: Protective Core
- **Description**: Hexagonal shield with field effects
- **Visuals**:
  - Protective field visualization during Burst
  - Shield barrier during Hex ability
  - Slow effect visual on enemies during Orbit
- **Theme**: Protective, supportive, defensive

---

## 🌀 Spiral (Zeta) → Chaos / Neutral

**Theme**: Unpredictable movement
**Identity**: "The wild card"

### Abilities

#### Skill 1: Vortex
- **Cooldown**: 90 frames (~1.5 seconds)
- **Effect**: Random directional pull
- **Mechanics**:
  - Applies random directional force
  - Pulls enemies slightly in random direction
  - Adds chaos spin effect for 30 frames
  - Vortex pull effect lasts 60 frames

#### Skill 2: Curve
- **Cooldown**: 130 frames (~2.17 seconds)
- **Effect**: Multi-blink (2 small teleports)
- **Mechanics**:
  - First blink: 40px in current direction
  - Second blink: 30px in random offset direction
  - Unpredictable positioning
  - Requires movement to activate

#### Ultimate: Tornado
- **Cooldown**: 300 frames (~5 seconds)
- **Effect**: Moving chaos zone that follows you
- **Mechanics**:
  - Creates chaos zone with 120px range
  - Zone follows the spiral as it moves
  - Applies chaos force (3) to enemies in zone
  - Lasts 180 frames (3 seconds)
  - Speed boost of 25 during effect

### Visual Weapon: Chaos Spinner
- **Description**: Spinning shape with chaotic trails
- **Visuals**:
  - Chaotic movement patterns
  - Tornado visualization during ultimate
  - Random directional indicators during Vortex
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

| Character | Skill 1 | Skill 2 | Ultimate |
|-----------|---------|---------|----------|
| Circle | 120 frames (~2s) | 90 frames (~1.5s) | 300 frames (~5s) |
| Triangle | 150 frames (~2.5s) | 100 frames (~1.67s) | 300 frames (~5s) |
| Square | 150 frames (~2.5s) | 120 frames (~2s) | 300 frames (~5s) |
| Oval | 120 frames (~2s) | 100 frames (~1.67s) | 300 frames (~5s) |
| Hexagon | 130 frames (~2.17s) | 110 frames (~1.83s) | 300 frames (~5s) |
| Spiral | 90 frames (~1.5s) | 130 frames (~2.17s) | 300 frames (~5s) |
| Rhombus | 140 frames (~2.33s) | 95 frames (~1.58s) | 300 frames (~5s) |
| Star | 110 frames (~1.83s) | 115 frames (~1.92s) | 300 frames (~5s) |
| Heart | 95 frames (~1.58s) | 100 frames (~1.67s) | 300 frames (~5s) |
| Diamond | 130 frames (~2.2s) | 90 frames (~1.5s) | 300 frames (~5s) |
| Crescent | 105 frames (~1.75s) | 100 frames (~1.67s) | 300 frames (~5s) |
| Dodecahedron | 150 frames (~2.5s) | 126 frames (~2.1s) | 300 frames (~5s) |

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
