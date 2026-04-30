# Shape Arena

A fast-paced 2D arena combat game where geometric shapes battle it out using unique abilities and mechanics.

## 🎮 How to Play

### Getting Started

1. Open the game in your web browser
2. Select 2 or more fighters from the selection screen
3. Click "START BATTLE" to begin
4. Watch the AI-controlled fighters battle until one remains

### Controls

The game is **AI-controlled** - you don't directly control the fighters. Instead, you:
- **Select fighters** from the character roster
- **Watch battles** unfold with unique abilities and mechanics
- **Refresh the page** to start a new battle

### Game Flow

1. **Selection Screen**: Choose which fighters will participate
2. **Ready**: Brief countdown before battle
3. **Fight**: Battle begins with fighters scattering
4. **Battle**: Fighters use abilities and fight until one remains
5. **KO**: Winner is announced
6. **Result**: Winner displayed - refresh to play again

## ⚔️ Combat System

### Core Mechanics

- **Movement**: Fighters move with physics-based velocity and friction
- **Collisions**: Fighters collide and deal damage based on mass and speed
- **Abilities**: Each fighter has 2 skills and 1 ultimate with unique effects
- **Cooldowns**: Abilities have cooldown periods before reuse
- **Ultimate Charge**: Ultimate abilities require 10 hits to charge

### Physics

- **Friction**: 0.96 (gradual velocity decay)
- **Elasticity**: 0.8 (bounciness of collisions)
- **Wall Bounce**: Fighters bounce off arena walls
- **Gravity**: Zero (top-down arena view)

### Damage System

- **Collision Damage**: Based on relative speed and mass
- **Knockback**: Fighters are pushed apart on collision
- **HP**: Each fighter has 100 HP by default
- **Death**: Fighter is eliminated when HP reaches 0

## 🧠 AI System

### Dynamic Awareness System

The AI uses a dynamic awareness system that adapts behavior based on the combat situation:

#### Combat Modes

- **Duel Mode** (1 enemy): Precise, distance-based, timing matters
- **Skirmish Mode** (FFA spread out): Opportunistic, pick targets, medium aggression
- **Chaos Mode** (2+ enemies nearby): Survival priority, AoE/escape, less commitment

#### Global Modifiers

| Mode | Aggression | Defensive | Skill Threshold |
|------|-----------|-----------|-----------------|
| Duel | 1.0x | 0.7x | 1.0x |
| Skirmish | 0.8x | 1.0x | 1.2x |
| Chaos | 0.6x | 1.3x | 1.5x |

### Personality System

Each fighter has unique personality stats that affect AI behavior:
- **Aggression**: How likely to engage in combat
- **Mobility**: Preference for movement and positioning
- **Precision**: Accuracy in targeting and timing
- **Chaos**: Tendency for unpredictable behavior
- **Greed**: Willingness to take risks for damage
- **Fear**: Tendency to retreat when low on HP
- **Revenge**: Aggression after taking damage
- **Skill Discipline**: How strategically abilities are used

## 🎨 Characters

The game features 12 unique characters, each with distinct abilities and playstyles:

### Original Characters

- **Circle (Alpha)** - Tank / Neutral - Gravity control
- **Triangle (Beta)** - Assassin / Neutral - Execute specialist
- **Square (Gamma)** - Tank / Neutral - Defensive fortress
- **Oval (Delta)** - Speedster / Neutral - Velocity manipulation
- **Hexagon (Epsilon)** - Support / Neutral - Protective field
- **Spiral (Zeta)** - Chaos / Neutral - Unpredictable movement
- **Rhombus (Eta)** - Tank / Neutral - Gravity control
- **Star (Theta)** - DPS / Neutral - Explosive damage
- **Heart (Iota)** - Healer / Light - Support and survival

### Revamped Characters

- **Diamond (Kappa)** - Marksman / Light - Perfect aim
- **Crescent (Lambda)** - Mage / Light - Flow controller
- **Dodecahedron (Mu)** - Adaptive / Neutral - Counterplay specialist

For detailed information about each character's abilities, cooldowns, and mechanics, see [CHARACTERS_WIKI.md](CHARACTERS_WIKI.md).

## 📊 Game Mechanics Reference

### Common Effects

- **Prediction Boost**: Improves targeting accuracy by multiplying prediction calculations
- **Speed Boost**: Increases maximum velocity and acceleration
- **Mass Multiplier**: Increases effective mass for collision calculations
- **Damage Reduction**: Reduces incoming damage by percentage
- **Drag Reduction**: Reduces friction/velocity decay
- **Curve Force**: Applies perpendicular force to create curved movement
- **Attraction**: Pulls enemies toward the fighter
- **Slow**: Reduces enemy movement speed
- **Knockback Resistance**: Reduces the effect of knockback

### Collision Mechanics

- **Chain Strike**: Automatically redirects to new targets within range after hitting
- **Parry**: Reflects damage back to attacker if timed correctly
- **Orbital Force**: Applies perpendicular force to create orbital patterns
- **Curve Trail**: Creates damaging path that persists over time
- **Gravity Slam**: Converts attraction into slam detonation

### Frame Timing

- 60 frames = 1 second
- All cooldowns and durations are measured in frames
- Update loop runs at 60 FPS

## 🛠️ Technical Details

### Arena

- **Size**: Dynamic based on screen size
- **Center**: Always centered on screen
- **Borders**: Glowing blue border with corner decorations
- **Grid**: Subtle grid overlay for visual reference

### Visual Effects

- **Particles**: Spawned on abilities and collisions
- **Screen Shake**: Occurs on heavy impacts and KOs
- **Hit Flash**: Visual feedback when fighters take damage
- **Motion Trails**: Some fighters leave visual trails
- **Glow Effects**: Active abilities have visual indicators

### UI Elements

- **Selection Screen**: Character cards with color coding
- **Status Panels**: Show HP, cooldowns, and ultimate charge
- **VS Display**: Shows current fighters in battle
- **Skill Indicators**: Show ability readiness with progress bars

## 📝 Development

### Running the Game

1. Install dependencies: `npm install`
2. Start the server: `npm start`
3. Open browser to: `http://localhost:3000`

### File Structure

- `public/main.js` - Main game logic
- `public/index.html` - HTML structure
- `server.js` - Node.js server
- `package.json` - Dependencies and scripts

### Key Systems

- **Fighter Class**: Handles movement, abilities, and AI
- **Particle System**: Visual effects
- **Collision System**: Physics and damage calculations
- **AI System**: Dynamic awareness and personality-based decisions
- **Render System**: Canvas-based drawing

## 🎯 Tips for Watching

- **Pay attention to cooldowns** - Watch when abilities become available
- **Notice personality differences** - Some fighters are more aggressive, others more defensive
- **Watch for ultimate charges** - Count hits to see when ultimates are ready
- **Observe combat modes** - AI behavior changes based on number of nearby enemies
- **Follow the action** - Status panels show HP and ability states in real-time

## 📚 Additional Documentation

- [CHARACTERS_WIKI.md](CHARACTERS_WIKI.md) - Detailed character abilities and mechanics

---

*Shape Arena - A geometric battle arena*
