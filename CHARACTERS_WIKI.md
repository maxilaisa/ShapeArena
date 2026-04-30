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

## Character Comparison

| Character | Class | Theme | Playstyle | Skill Ceiling |
|-----------|-------|-------|-----------|---------------|
| Diamond | Marksman / Light | Perfect aim | Precision strikes with prediction | Very High |
| Crescent | Mage / Light | Flow controller | Curved movement and timing | High |
| Dodecahedron | Adaptive / Neutral | Counterplay specialist | Form cycling and adaptation | High |

## Cooldown Summary

| Character | Skill 1 | Skill 2 | Ultimate |
|-----------|---------|---------|----------|
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
