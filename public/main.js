// Shape Arena - Physics-Based Battle Simulator
// Designed for spectating, not playing

const canvas = document.createElement('canvas');
canvas.style.display = 'block';
canvas.style.width = '100vw';
canvas.style.height = '100vh';
document.body.appendChild(canvas);

const ctx = canvas.getContext('2d');

// Arena configuration
let ARENA_SIZE = 800;
const BORDER_WIDTH = 2;

// Calculate arena size based on screen
function updateArenaSize() {
  const minDimension = Math.min(window.innerWidth, window.innerHeight);
  ARENA_SIZE = Math.min(800, minDimension * 0.9);
}

// Resize canvas to fit arena
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  updateArenaSize();
}
resize();
updateArenaSize();
window.addEventListener('resize', resize);

// Intro animation state
let introState = 'selection'; // 'selection', 'ready', 'fight', 'battle', 'replay', 'ko'
let introTimer = 0;
const READY_DURATION = 60; // frames
const FIGHT_DURATION = 60; // frames (increased to ensure transition)

// Hit effects
let hitPauseTimer = 0;
const HIT_PAUSE_DURATION = 8; // frames of slow motion
let screenShake = { x: 0, y: 0, intensity: 0 };

// Replay system
const REPLAY_DURATION = 180; // 3 seconds at 60fps
let replayBuffer = [];
let replayIndex = 0;
let koTimer = 0;
const KO_PAUSE_DURATION = 120; // 2 seconds dramatic pause

// Physics constants
const FRICTION = 0.98;
const ELASTICITY = 0.8;
const GRAVITY = 0;
const MIN_SPEED = 4; // Minimum speed fighters should maintain
const DEFAULT_SPEED = 5; // Default target speed

// Fighter class
class Fighter {
  constructor(id, x, y, color, name, shapeType) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.vx = 0; // Start stationary
    this.vy = 0; // Start stationary
    this.radius = 35; // Fixed size for all shapes
    this.baseMass = this.radius * this.radius;
    this.mass = this.baseMass;
    this.color = color;
    this.name = name;
    this.shapeType = shapeType; // 'circle', 'triangle', 'square'
    this.hp = 100;
    this.maxHp = 100;
    this.target = null;
    this.ultimateCharge = 0;
    this.lastAttacker = null; // Track for revenge stat
    
    // Ability cooldowns (in frames)
    this.cooldowns = {
      skill1: 0,
      skill2: 0,
      ultimate: 0
    };
    
    // Active effects (temporary physics modifiers)
    this.activeEffects = [];
    
    // Visual effects
    this.trail = [];
    this.hitFlash = 0;
    this.abilityFlash = 0; // Flash when using ability
    
    // Initialize personality with match variation
    this.initPersonality();
  }
  
  initPersonality() {
    // Fixed base personalities per shape
    const basePersonalities = {
      circle: {
        aggression: 7, mobility: 8, precision: 6, chaos: 5,
        greed: 6, fear: 3, revenge: 5, skillDiscipline: 7
      },
      triangle: {
        aggression: 8, mobility: 9, precision: 7, chaos: 4,
        greed: 7, fear: 2, revenge: 6, skillDiscipline: 8
      },
      square: {
        aggression: 5, mobility: 4, precision: 8, chaos: 2,
        greed: 4, fear: 5, revenge: 7, skillDiscipline: 9
      },
      oval: {
        aggression: 6, mobility: 10, precision: 5, chaos: 4,
        greed: 5, fear: 4, revenge: 4, skillDiscipline: 6
      },
      hexagon: {
        aggression: 4, mobility: 5, precision: 9, chaos: 3,
        greed: 3, fear: 6, revenge: 8, skillDiscipline: 8
      },
      spiral: {
        aggression: 5, mobility: 7, precision: 4, chaos: 9,
        greed: 5, fear: 4, revenge: 5, skillDiscipline: 5
      },
      rhombus: {
        aggression: 6, mobility: 6, precision: 7, chaos: 6,
        greed: 8, fear: 3, revenge: 9, skillDiscipline: 7
      },
      star: {
        aggression: 10, mobility: 7, precision: 5, chaos: 7,
        greed: 9, fear: 1, revenge: 7, skillDiscipline: 6
      },
      heart: {
        aggression: 3, mobility: 8, precision: 6, chaos: 3,
        greed: 2, fear: 8, revenge: 4, skillDiscipline: 7
      },
      diamond: {
        aggression: 7, mobility: 6, precision: 10, chaos: 2,
        greed: 6, fear: 4, revenge: 6, skillDiscipline: 8
      },
      crescent: {
        aggression: 6, mobility: 8, precision: 6, chaos: 5,
        greed: 5, fear: 5, revenge: 5, skillDiscipline: 6
      },
      dodecahedron: {
        aggression: 6, mobility: 6, precision: 7, chaos: 4,
        greed: 5, fear: 5, revenge: 5, skillDiscipline: 10
      }
    };
    
    const base = basePersonalities[this.shapeType];
    
    // Apply ±5-10% variation
    this.personality = {};
    for (let stat in base) {
      const variation = 1 + (Math.random() * 0.1 - 0.05); // ±5%
      this.personality[stat] = Math.max(1, Math.min(10, Math.round(base[stat] * variation)));
    }
  }

  update(fighters) {
    // Update active effects (temporary physics modifiers)
    this.updateActiveEffects();
    
    // Decrease cooldowns
    if (this.cooldowns.skill1 > 0) this.cooldowns.skill1--;
    if (this.cooldowns.skill2 > 0) this.cooldowns.skill2--;
    if (this.cooldowns.ultimate > 0) this.cooldowns.ultimate--;
    
    // Decrease ability flash
    if (this.abilityFlash > 0) this.abilityFlash--;
    
    // Apply friction
    this.vx *= FRICTION;
    this.vy *= FRICTION;

    // Add trail when moving fast
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (speed > 3) {
      this.trail.push({ x: this.x, y: this.y, alpha: 0.5 });
    }
    
    // Remove old trail positions
    if (this.trail.length > 10) {
      this.trail.shift();
    }
    
    // Decrease hit flash
    if (this.hitFlash > 0) this.hitFlash--;

    // Maintain minimum speed
    if (speed < MIN_SPEED && speed > 0) {
      const boost = (MIN_SPEED - speed) * 0.1;
      this.vx += (this.vx / speed) * boost;
      this.vy += (this.vy / speed) * boost;
    } else if (speed === 0) {
      const angle = Math.random() * Math.PI * 2;
      this.vx = Math.cos(angle) * MIN_SPEED;
      this.vy = Math.sin(angle) * MIN_SPEED;
    }

    // Find nearest target (consider revenge stat)
    let nearestDist = Infinity;
    this.target = null;
    
    for (let fighter of fighters) {
      if (fighter === this) continue;
      const dx = fighter.x - this.x;
      const dy = fighter.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // Revenge: prioritize last attacker
      let effectiveDist = dist;
      if (this.personality.revenge > 5 && this.lastAttacker === fighter) {
        effectiveDist *= (1 - (this.personality.revenge - 5) / 20);
      }
      
      if (effectiveDist < nearestDist) {
        nearestDist = effectiveDist;
        this.target = fighter;
      }
    }

    // Arena bounds for wall avoidance
    const arenaLeft = (canvas.width - ARENA_SIZE) / 2;
    const arenaRight = (canvas.width + ARENA_SIZE) / 2;
    const arenaTop = (canvas.height - ARENA_SIZE) / 2;
    const arenaBottom = (canvas.height + ARENA_SIZE) / 2;
    const wallMargin = 80; // Distance to start avoiding walls

    // Wall avoidance force
    let avoidX = 0;
    let avoidY = 0;
    
    if (this.x - this.radius < arenaLeft + wallMargin) {
      avoidX += 1;
    }
    if (this.x + this.radius > arenaRight - wallMargin) {
      avoidX -= 1;
    }
    if (this.y - this.radius < arenaTop + wallMargin) {
      avoidY += 1;
    }
    if (this.y + this.radius > arenaBottom - wallMargin) {
      avoidY -= 1;
    }

    // AI decision: pursue or reposition
    if (this.target && this.target.hp > 0) {
      const dx = this.target.x - this.x;
      const dy = this.target.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // AI ability decisions
      this.makeAbilityDecision(dist, arenaLeft, arenaRight, arenaTop, arenaBottom);
      
      // Apply shape-specific behavioral biases
      this.applyShapeBias(dx, dy, dist, arenaLeft, arenaRight, arenaTop, arenaBottom, avoidX, avoidY);
      
      const p = this.personality;
      const hpPercent = this.hp / this.maxHp;
      const fearThreshold = p.fear / 10;
      
      // Fear: retreat at low HP
      if (hpPercent < fearThreshold && p.fear > 3) {
        // Move away from target
        const retreatStrength = 0.6 * (fearThreshold - hpPercent + 0.1);
        this.vx -= (dx / dist) * retreatStrength;
        this.vy -= (dy / dist) * retreatStrength;
      } else {
        // Greed: favor close engagements
        const greedBonus = p.greed / 10;
        const nearWall = avoidX !== 0 || avoidY !== 0;
        
        if (nearWall) {
          // Reposition away from walls (mobility increases effectiveness)
          const avoidStrength = 0.8 * (1 + p.mobility / 20);
          this.vx += avoidX * avoidStrength;
          this.vy += avoidY * avoidStrength;
        } else {
          // Pursue target using momentum (aggression increases strength)
          const pursueStrength = 0.4 * (1 + p.aggression / 20 + greedBonus * 0.3);
          
          // Precision: aim toward predicted enemy position
          let targetX = this.target.x;
          let targetY = this.target.y;
          
          // Check for predictionBoost effect
          const predictionBoostEffect = this.activeEffects.find(e => e.type === 'predictionBoost');
          const boostMultiplier = predictionBoostEffect ? predictionBoostEffect.value : 1;
          
          if (p.precision > 5 || predictionBoostEffect) {
            const predictionFactor = ((p.precision - 5) / 20) * boostMultiplier;
            targetX += this.target.vx * predictionFactor * 10;
            targetY += this.target.vy * predictionFactor * 10;
          }
          
          const predDx = targetX - this.x;
          const predDy = targetY - this.y;
          const predDist = Math.sqrt(predDx * predDx + predDy * predDy);
          
          if (predDist > 0) {
            // Chaos: add randomness to direction
            const chaosOffset = (Math.random() - 0.5) * (p.chaos / 10) * 0.5;
            this.vx += (predDx / predDist) * pursueStrength + chaosOffset;
            this.vy += (predDy / predDist) * pursueStrength + chaosOffset;
          }
        }
      }
      
      // SkillDiscipline: reduce random mistakes in movement
      if (p.skillDiscipline < 5 && Math.random() < (5 - p.skillDiscipline) / 100) {
        // Occasional random impulse (mistake)
        this.vx += (Math.random() - 0.5) * 2;
        this.vy += (Math.random() - 0.5) * 2;
      }
    } else {
      // No target - move toward center with wall avoidance
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const dx = centerX - this.x;
      const dy = centerY - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist > 0) {
        this.vx += (dx / dist) * 0.3;
        this.vy += (dy / dist) * 0.3;
      }
      
      // Apply wall avoidance
      const avoidStrength = 0.5;
      this.vx += avoidX * avoidStrength;
      this.vy += avoidY * avoidStrength;
    }

    // Update position
    this.x += this.vx;
    this.y += this.vy;

    // Boundary collision - enhanced bouncing
    const ricochetEffect = this.activeEffects.find(e => e.type === 'ricochet');
    const bounceMultiplier = ricochetEffect ? 2.0 : 1.2;
    
    if (this.x - this.radius < arenaLeft) {
      this.x = arenaLeft + this.radius;
      this.vx *= -bounceMultiplier;
      if (Math.abs(this.vx) < MIN_SPEED) {
        this.vx = this.vx > 0 ? MIN_SPEED : -MIN_SPEED;
      }
    }
    if (this.x + this.radius > arenaRight) {
      this.x = arenaRight - this.radius;
      this.vx *= -bounceMultiplier;
      if (Math.abs(this.vx) < MIN_SPEED) {
        this.vx = this.vx > 0 ? MIN_SPEED : -MIN_SPEED;
      }
    }
    if (this.y - this.radius < arenaTop) {
      this.y = arenaTop + this.radius;
      this.vy *= -bounceMultiplier;
      if (Math.abs(this.vy) < MIN_SPEED) {
        this.vy = this.vy > 0 ? MIN_SPEED : -MIN_SPEED;
      }
    }
    if (this.y + this.radius > arenaBottom) {
      this.y = arenaBottom - this.radius;
      this.vy *= -bounceMultiplier;
      if (Math.abs(this.vy) < MIN_SPEED) {
        this.vy = this.vy > 0 ? MIN_SPEED : -MIN_SPEED;
      }
    }

    // Cooldown
    if (this.attackCooldown > 0) this.attackCooldown--;
  }

  updateActiveEffects() {
    this.activeEffects = this.activeEffects.filter(effect => {
      effect.duration--;
      if (effect.type === 'massMultiplier') {
        this.mass = this.baseMass * effect.value;
      } else if (effect.type === 'velocityCap') {
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > effect.value) {
          const scale = effect.value / speed;
          this.vx *= scale;
          this.vy *= scale;
        }
      } else if (effect.type === 'orbitalForce') {
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > 0) {
          const angle = Math.atan2(this.vy, this.vx);
          const perpAngle = angle + Math.PI / 2;
          this.vx += Math.cos(perpAngle) * effect.value;
          this.vy += Math.sin(perpAngle) * effect.value;
        }
      } else if (effect.type === 'speedBoost') {
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > 0) {
          this.vx *= (1 + effect.value * 0.01);
          this.vy *= (1 + effect.value * 0.01);
        }
      } else if (effect.type === 'chaosSpin') {
        const angle = Math.random() * Math.PI * 2;
        this.vx += Math.cos(angle) * effect.value;
        this.vy += Math.sin(angle) * effect.value;
      } else if (effect.type === 'attraction') {
        // Applied in collision handling
      } else if (effect.type === 'phaseShift') {
        // Applied in collision handling
      } else if (effect.type === 'ricochet') {
        // Applied in wall collision
      } else if (effect.type === 'regeneration') {
        if (this.hp < this.maxHp) {
          this.hp = Math.min(this.maxHp, this.hp + effect.value);
        }
      } else if (effect.type === 'predictionBoost') {
        // Applied in AI movement
      } else if (effect.type === 'curveForce') {
        if (this.vx !== 0 || this.vy !== 0) {
          const angle = Math.atan2(this.vy, this.vx);
          const curveAngle = angle + effect.value;
          const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
          this.vx = Math.cos(curveAngle) * speed;
          this.vy = Math.sin(curveAngle) * speed;
        }
      } else if (effect.type === 'adaptiveStats') {
        // Temporary stat boost handled in personality
      }
      return effect.duration > 0;
    });
    if (!this.activeEffects.find(e => e.type === 'massMultiplier')) {
      this.mass = this.baseMass;
    }
  }

  addEffect(type, value, duration) {
    this.activeEffects.push({ type, value, duration });
    this.abilityFlash = 10;
  }

  useSkill1() {
    if (this.shapeType === 'circle') {
      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      if (speed > 0) {
        this.vx *= 1.8;
        this.vy *= 1.8;
        this.addEffect('momentumBoost', 1, 30);
      }
      this.cooldowns.skill1 = 120;
    } else if (this.shapeType === 'triangle') {
      if (this.target) {
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0) {
          this.vx += (dx / dist) * 12;
          this.vy += (dy / dist) * 12;
        }
      }
      this.cooldowns.skill1 = 150;
    } else if (this.shapeType === 'square') {
      this.vy += 10;
      this.addEffect('massMultiplier', 2, 30);
      this.cooldowns.skill1 = 120;
    } else if (this.shapeType === 'oval') {
      // Dash boost - amplify speed
      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      if (speed > 0) {
        this.vx *= 2.0;
        this.vy *= 2.0;
        this.addEffect('speedBoost', 15, 45);
      }
      this.cooldowns.skill1 = 100;
    } else if (this.shapeType === 'hexagon') {
      // Precision strike - aim toward target with force
      if (this.target) {
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0) {
          this.vx += (dx / dist) * 8;
          this.vy += (dy / dist) * 8;
          this.addEffect('predictionBoost', 1, 60);
        }
      }
      this.cooldowns.skill1 = 130;
    } else if (this.shapeType === 'spiral') {
      // Chaos spin - random rotation force
      const angle = Math.random() * Math.PI * 2;
      this.vx += Math.cos(angle) * 10;
      this.vy += Math.sin(angle) * 10;
      this.addEffect('chaosSpin', 2, 30);
      this.cooldowns.skill1 = 90;
    } else if (this.shapeType === 'rhombus') {
      // Lure - attract nearby fighters
      this.addEffect('attraction', 200, 120);
      this.cooldowns.skill1 = 140;
    } else if (this.shapeType === 'star') {
      // Star burst - explosive speed
      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      if (speed > 0) {
        this.vx *= 2.5;
        this.vy *= 2.5;
      }
      this.cooldowns.skill1 = 110;
    } else if (this.shapeType === 'heart') {
      // Heartbeat - rhythmic movement pattern
      const angle = Math.atan2(this.vy, this.vx);
      this.vx = Math.cos(angle) * 6;
      this.vy = Math.sin(angle) * 6;
      this.cooldowns.skill1 = 95;
    } else if (this.shapeType === 'diamond') {
      // Diamond cut - precise velocity adjustment
      if (this.target) {
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0) {
          const predX = this.target.x + this.target.vx * 8;
          const predY = this.target.y + this.target.vy * 8;
          const predDx = predX - this.x;
          const predDy = predY - this.y;
          const predDist = Math.sqrt(predDx * predDx + predDy * predDy);
          if (predDist > 0) {
            this.vx += (predDx / predDist) * 10;
            this.vy += (predDy / predDist) * 10;
          }
        }
      }
      this.cooldowns.skill1 = 120;
    } else if (this.shapeType === 'crescent') {
      // Crescent dash - curved acceleration
      if (this.vx !== 0 || this.vy !== 0) {
        const angle = Math.atan2(this.vy, this.vx);
        const curveAngle = angle + 0.3;
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        this.vx = Math.cos(curveAngle) * speed * 1.5;
        this.vy = Math.sin(curveAngle) * speed * 1.5;
        this.addEffect('curveForce', 0.05, 40);
      }
      this.cooldowns.skill1 = 105;
    } else if (this.shapeType === 'dodecahedron') {
      // Face shift - random small stat boost
      const stat = ['aggression', 'mobility', 'precision'][Math.floor(Math.random() * 3)];
      this.personality[stat] = Math.min(10, this.personality[stat] + 2);
      this.addEffect('adaptiveStats', 1, 180);
      this.cooldowns.skill1 = 150;
    }
  }

  useSkill2(arenaLeft, arenaRight, arenaTop, arenaBottom) {
    if (this.shapeType === 'circle') {
      const wallMargin = 100;
      const nearWall = this.x - this.radius < arenaLeft + wallMargin ||
                       this.x + this.radius > arenaRight - wallMargin ||
                       this.y - this.radius < arenaTop + wallMargin ||
                       this.y + this.radius > arenaBottom - wallMargin;
      if (nearWall) {
        this.vx *= -1.2;
        this.vy *= -1.2;
        this.vy += (Math.random() - 0.5) * 4;
      }
      this.cooldowns.skill2 = 90;
    } else if (this.shapeType === 'triangle') {
      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      if (speed > 0) {
        const angle = Math.atan2(this.vy, this.vx);
        const perpAngle = angle + Math.PI / 2;
        this.vx += Math.cos(perpAngle) * 8;
        this.vy += Math.sin(perpAngle) * 8;
      }
      this.cooldowns.skill2 = 100;
    } else if (this.shapeType === 'square') {
      this.vx *= 0.3;
      this.vy *= 0.3;
      this.addEffect('massMultiplier', 3, 60);
      this.cooldowns.skill2 = 120;
    } else if (this.shapeType === 'oval') {
      // Evasive drift - perpendicular force
      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      if (speed > 0) {
        const angle = Math.atan2(this.vy, this.vx);
        const driftAngle = angle + Math.PI / 2;
        this.vx += Math.cos(driftAngle) * 6;
        this.vy += Math.sin(driftAngle) * 6;
      }
      this.cooldowns.skill2 = 85;
    } else if (this.shapeType === 'hexagon') {
      // Defensive stance - mass increase
      this.addEffect('massMultiplier', 2.5, 90);
      this.cooldowns.skill2 = 110;
    } else if (this.shapeType === 'spiral') {
      // Warp - teleport short distance
      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      if (speed > 0) {
        const angle = Math.atan2(this.vy, this.vx);
        this.x += Math.cos(angle) * 50;
        this.y += Math.sin(angle) * 50;
      }
      this.cooldowns.skill2 = 130;
    } else if (this.shapeType === 'rhombus') {
      // Counter thrust - speed boost
      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      if (speed > 0) {
        this.vx *= 1.6;
        this.vy *= 1.6;
      }
      this.cooldowns.skill2 = 95;
    } else if (this.shapeType === 'star') {
      // Meteor - heavy mass slam
      this.addEffect('massMultiplier', 4, 45);
      this.vy += 8;
      this.cooldowns.skill2 = 115;
    } else if (this.shapeType === 'heart') {
      // Shield - temporary mass increase
      this.addEffect('massMultiplier', 2, 75);
      this.cooldowns.skill2 = 100;
    } else if (this.shapeType === 'diamond') {
      // Refract - sharp direction change
      if (this.vx !== 0 || this.vy !== 0) {
        const angle = Math.atan2(this.vy, this.vx);
        const newAngle = angle + (Math.random() - 0.5) * 1.5;
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        this.vx = Math.cos(newAngle) * speed;
        this.vy = Math.sin(newAngle) * speed;
      }
      this.cooldowns.skill2 = 90;
    } else if (this.shapeType === 'crescent') {
      // Moon phase - periodic mass change
      const phase = Math.sin(Date.now() / 500);
      this.addEffect('massMultiplier', 1.5 + phase * 0.5, 60);
      this.cooldowns.skill2 = 100;
    } else if (this.shapeType === 'dodecahedron') {
      // Geometric defense - balanced mass and speed
      this.addEffect('massMultiplier', 1.8, 80);
      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      if (speed > 0) {
        this.vx *= 1.2;
        this.vy *= 1.2;
      }
      this.cooldowns.skill2 = 125;
    }
  }

  useUltimate() {
    if (this.shapeType === 'circle') {
      this.addEffect('orbitalForce', 0.8, 90);
    } else if (this.shapeType === 'triangle') {
      this.addEffect('velocityCap', 15, 120);
    } else if (this.shapeType === 'square') {
      this.addEffect('massMultiplier', 5, 180);
      this.vx *= 0.5;
      this.vy *= 0.5;
    } else if (this.shapeType === 'oval') {
      // Phase shift - pass through fighters briefly
      this.addEffect('phaseShift', 1, 120);
      this.vx *= 1.5;
      this.vy *= 1.5;
    } else if (this.shapeType === 'hexagon') {
      // Perfect guard - temporary invincibility (mass boost)
      this.addEffect('massMultiplier', 8, 150);
      this.vx *= 0.3;
      this.vy *= 0.3;
    } else if (this.shapeType === 'spiral') {
      // Entropy field - random forces
      this.addEffect('chaosSpin', 4, 180);
      this.addEffect('speedBoost', 25, 180);
    } else if (this.shapeType === 'rhombus') {
      // Vengeance - bonus damage against last attacker
      this.addEffect('massMultiplier', 3, 120);
      this.vx *= 1.8;
      this.vy *= 1.8;
    } else if (this.shapeType === 'star') {
      // Supernova - massive speed boost
      this.vx *= 3.0;
      this.vy *= 3.0;
      this.addEffect('speedBoost', 30, 120);
      this.addEffect('massMultiplier', 2, 120);
    } else if (this.shapeType === 'heart') {
      // Survival - heal and speed at low HP
      this.hp = Math.min(this.maxHp, this.hp + 30);
      this.addEffect('regeneration', 0.5, 180);
      this.addEffect('speedBoost', 20, 180);
    } else if (this.shapeType === 'diamond') {
      // Perfect aim - track target precisely
      this.addEffect('predictionBoost', 2, 150);
      this.addEffect('velocityCap', 20, 150);
    } else if (this.shapeType === 'crescent') {
      // Eclipse - darkness + speed
      this.vx *= 2.0;
      this.vy *= 2.0;
      this.addEffect('curveForce', 0.1, 150);
      this.addEffect('speedBoost', 20, 150);
    } else if (this.shapeType === 'dodecahedron') {
      // Perfect form - all stats boosted
      this.personality.aggression = Math.min(10, this.personality.aggression + 3);
      this.personality.mobility = Math.min(10, this.personality.mobility + 3);
      this.personality.precision = Math.min(10, this.personality.precision + 3);
      this.addEffect('massMultiplier', 2, 200);
      this.addEffect('speedBoost', 15, 200);
      this.addEffect('adaptiveStats', 1, 200);
    }
    this.ultimateCharge = 0;
    this.cooldowns.ultimate = 300;
  }

  makeAbilityDecision(distToTarget, arenaLeft, arenaRight, arenaTop, arenaBottom) {
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    const p = this.personality;
    const chaosFactor = p.chaos / 10; // 0.1 to 1.0
    const rand = Math.random();
    
    // Base chance modified by chaos
    const baseChance = 0.02 * (1 + chaosFactor * 0.5);
    const ultimateChance = 0.01 * (1 + p.skillDiscipline / 20);
    
    // Use ultimate if available (chance influenced by skill discipline)
    if (this.ultimateCharge >= 10 && this.cooldowns.ultimate === 0 && rand < ultimateChance) {
      this.useUltimate();
      return;
    }
    
    // Skill 1 usage based on situation and personality
    if (this.cooldowns.skill1 === 0 && rand < baseChance) {
      const aggressionBonus = p.aggression / 10;
      
      if (this.shapeType === 'circle' && speed > 5 * (1 - p.mobility / 20)) {
        this.useSkill1();
      } else if (this.shapeType === 'triangle' && distToTarget > 150 * (1 - p.greed / 20)) {
        this.useSkill1();
      } else if (this.shapeType === 'square' && rand < 0.5 * aggressionBonus) {
        this.useSkill1();
      } else if (this.shapeType === 'oval' && speed < 8) {
        this.useSkill1();
      } else if (this.shapeType === 'hexagon' && distToTarget < 80) {
        this.useSkill1();
      } else if (this.shapeType === 'spiral' && rand < 0.03) {
        this.useSkill1();
      } else if (this.shapeType === 'rhombus' && distToTarget > 120) {
        this.useSkill1();
      } else if (this.shapeType === 'star' && distToTarget < 200) {
        this.useSkill1();
      } else if (this.shapeType === 'heart' && this.hp < 50) {
        this.useSkill1();
      } else if (this.shapeType === 'diamond' && distToTarget > 100) {
        this.useSkill1();
      } else if (this.shapeType === 'crescent' && rand < 0.025) {
        this.useSkill1();
      } else if (this.shapeType === 'dodecahedron' && rand < 0.015) {
        this.useSkill1();
      }
    }
    
    // Skill 2 usage based on situation and personality
    if (this.cooldowns.skill2 === 0 && rand < baseChance) {
      if (this.shapeType === 'circle') {
        this.useSkill2(arenaLeft, arenaRight, arenaTop, arenaBottom);
      } else if (this.shapeType === 'triangle' && distToTarget < 100 * (1 + p.greed / 10)) {
        this.useSkill2(arenaLeft, arenaRight, arenaTop, arenaBottom);
      } else if (this.shapeType === 'square' && speed > 6 * (1 - p.fear / 20)) {
        this.useSkill2(arenaLeft, arenaRight, arenaTop, arenaBottom);
      } else if (this.shapeType === 'oval') {
        this.useSkill2(arenaLeft, arenaRight, arenaTop, arenaBottom);
      } else if (this.shapeType === 'hexagon') {
        this.useSkill2(arenaLeft, arenaRight, arenaTop, arenaBottom);
      } else if (this.shapeType === 'spiral') {
        this.useSkill2(arenaLeft, arenaRight, arenaTop, arenaBottom);
      } else if (this.shapeType === 'rhombus') {
        this.useSkill2(arenaLeft, arenaRight, arenaTop, arenaBottom);
      } else if (this.shapeType === 'star') {
        this.useSkill2(arenaLeft, arenaRight, arenaTop, arenaBottom);
      } else if (this.shapeType === 'heart') {
        this.useSkill2(arenaLeft, arenaRight, arenaTop, arenaBottom);
      } else if (this.shapeType === 'diamond') {
        this.useSkill2(arenaLeft, arenaRight, arenaTop, arenaBottom);
      } else if (this.shapeType === 'crescent') {
        this.useSkill2(arenaLeft, arenaRight, arenaTop, arenaBottom);
      } else if (this.shapeType === 'dodecahedron') {
        this.useSkill2(arenaLeft, arenaRight, arenaTop, arenaBottom);
      }
    }
  }

  applyShapeBias(dx, dy, dist, arenaLeft, arenaRight, arenaTop, arenaBottom, avoidX, avoidY) {
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    
    switch (this.shapeType) {
      case 'circle':
        // Prefers momentum and wall usage
        if (avoidX !== 0 || avoidY !== 0) {
          this.vx += avoidX * 0.3;
          this.vy += avoidY * 0.3;
        }
        break;
        
      case 'triangle':
        // Burst engage then disengage
        if (dist < 100 && speed > 5) {
          this.vx -= dx / dist * 0.5;
          this.vy -= dy / dist * 0.5;
        }
        break;
        
      case 'square':
        // Corner pressure and retaliation
        if (avoidX !== 0 || avoidY !== 0) {
          this.vx -= avoidX * 0.2;
          this.vy -= avoidY * 0.2;
        }
        break;
        
      case 'oval':
        // Constant movement
        if (speed < 6) {
          const angle = Math.atan2(this.vy, this.vx);
          this.vx += Math.cos(angle) * 0.3;
          this.vy += Math.sin(angle) * 0.3;
        }
        break;
        
      case 'hexagon':
        // Defensive and reactive
        if (dist < 120) {
          this.vx -= dx / dist * 0.3;
          this.vy -= dy / dist * 0.3;
        }
        break;
        
      case 'spiral':
        // Controlled randomness
        if (Math.random() < 0.05) {
          const angle = Math.random() * Math.PI * 2;
          this.vx += Math.cos(angle) * 1.5;
          this.vy += Math.sin(angle) * 1.5;
        }
        break;
        
      case 'rhombus':
        // Bait and counter
        if (dist > 150) {
          this.vx += dx / dist * 0.2;
          this.vy += dy / dist * 0.2;
        }
        break;
        
      case 'star':
        // Relentless aggression
        this.vx += dx / dist * 0.3;
        this.vy += dy / dist * 0.3;
        break;
        
      case 'heart':
        // Evasive survival
        if (this.hp < 60) {
          this.vx -= dx / dist * 0.4;
          this.vy -= dy / dist * 0.4;
        }
        break;
        
      case 'diamond':
        // Predictive interception
        if (this.target) {
          const predX = this.target.x + this.target.vx * 5;
          const predY = this.target.y + this.target.vy * 5;
          const predDx = predX - this.x;
          const predDy = predY - this.y;
          const predDist = Math.sqrt(predDx * predDx + predDy * predDy);
          if (predDist > 0) {
            this.vx += (predDx / predDist) * 0.2;
            this.vy += (predDy / predDist) * 0.2;
          }
        }
        break;
        
      case 'crescent':
        // Curved movement patterns
        if (speed > 0) {
          const angle = Math.atan2(this.vy, this.vx);
          const curveAngle = angle + 0.1;
          this.vx += Math.cos(curveAngle) * 0.15;
          this.vy += Math.sin(curveAngle) * 0.15;
        }
        break;
        
      case 'dodecahedron':
        // Adaptive behavior mid-fight
        if (this.hp < 50) {
          this.personality.aggression = Math.min(10, this.personality.aggression + 0.01);
        }
        break;
    }
  }

  attack(target) {
    const damage = 2 + Math.random() * 5;
    target.hp -= damage;
    
    // Trigger hit flash on target
    target.hitFlash = 10;
    
    // Knockback
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const knockback = 8;
    
    target.vx += (dx / dist) * knockback;
    target.vy += (dy / dist) * knockback;
  }

  draw() {
    // Draw ability visual effects based on active effects
    for (const effect of this.activeEffects) {
      if (effect.type === 'speedBoost') {
        // Speed trail effect
        ctx.save();
        ctx.globalAlpha = 0.4;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(this.x - this.vx * 3, this.y - this.vy * 3);
        ctx.lineTo(this.x, this.y);
        ctx.stroke();
        ctx.restore();
      } else if (effect.type === 'chaosSpin') {
        // Chaos spiral effect
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = '#ff00ff';
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
          const angle = (Date.now() / 100) + (i * Math.PI * 2 / 3);
          const r = this.radius + 10 + i * 5;
          ctx.beginPath();
          ctx.arc(this.x, this.y, r, angle, angle + Math.PI);
          ctx.stroke();
        }
        ctx.restore();
      } else if (effect.type === 'attraction') {
        // Attraction field effect
        ctx.save();
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(this.x, this.y, effect.value, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (effect.type === 'phaseShift') {
        // Phase shift ghost effect
        ctx.save();
        ctx.globalAlpha = 0.3;
        this.drawShape(this.x + (Math.random() - 0.5) * 10, this.y + (Math.random() - 0.5) * 10, this.radius, this.color, 0.5);
        ctx.restore();
      } else if (effect.type === 'ricochet') {
        // Ricochet glow
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 4;
        this.drawShapeOutline(this.x, this.y, this.radius + 8, '#00ffff', 3);
        ctx.restore();
      } else if (effect.type === 'regeneration') {
        // Regeneration heal effect
        ctx.save();
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = '#00ff00';
        const healSize = this.radius + 5 + Math.sin(Date.now() / 100) * 3;
        ctx.beginPath();
        ctx.arc(this.x, this.y, healSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (effect.type === 'curveForce') {
        // Curve trail effect
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = '#ff8800';
        ctx.lineWidth = 2;
        const angle = Math.atan2(this.vy, this.vx);
        for (let i = 1; i <= 5; i++) {
          const trailAngle = angle - effect.value * i * 10;
          const trailX = this.x - Math.cos(trailAngle) * i * 8;
          const trailY = this.y - Math.sin(trailAngle) * i * 8;
          ctx.beginPath();
          ctx.arc(trailX, trailY, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      } else if (effect.type === 'adaptiveStats') {
        // Adaptive glow
        ctx.save();
        ctx.globalAlpha = 0.3;
        const hue = (Date.now() / 20) % 360;
        ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`;
        ctx.lineWidth = 3;
        this.drawShapeOutline(this.x, this.y, this.radius + 10, `hsl(${hue}, 100%, 50%)`, 3);
        ctx.restore();
      }
    }

    // Draw motion trail
    for (let i = 0; i < this.trail.length; i++) {
      const t = this.trail[i];
      const alpha = (i / this.trail.length) * 0.3;
      const size = this.radius * (i / this.trail.length);
      
      this.drawShape(t.x, t.y, size, this.color, alpha);
    }

    // Draw glow effect
    this.drawShape(this.x, this.y, this.radius + 5, this.color, 0.3);

    // Draw fighter body
    const bodyColor = this.hitFlash > 0 ? '#fff' : this.color;
    this.drawShape(this.x, this.y, this.radius, bodyColor, 1);

    // Draw white outline
    this.drawShapeOutline(this.x, this.y, this.radius, '#fff', 2);

    // Large HP number centered on fighter
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(Math.ceil(this.hp), this.x, this.y);
  }

  drawShape(x, y, size, color, alpha) {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    
    if (this.shapeType === 'circle') {
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.shapeType === 'triangle') {
      ctx.beginPath();
      ctx.moveTo(x, y - size);
      ctx.lineTo(x + size * 0.866, y + size * 0.5);
      ctx.lineTo(x - size * 0.866, y + size * 0.5);
      ctx.closePath();
      ctx.fill();
    } else if (this.shapeType === 'square') {
      ctx.fillRect(x - size, y - size, size * 2, size * 2);
    } else if (this.shapeType === 'oval') {
      ctx.beginPath();
      ctx.ellipse(x, y, size * 1.3, size * 0.8, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.shapeType === 'hexagon') {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const px = x + size * Math.cos(angle);
        const py = y + size * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    } else if (this.shapeType === 'spiral') {
      ctx.beginPath();
      for (let i = 0; i < 50; i++) {
        const angle = i * 0.3;
        const r = (i / 50) * size;
        const px = x + r * Math.cos(angle);
        const py = y + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y, size * 0.3, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.shapeType === 'rhombus') {
      ctx.beginPath();
      ctx.moveTo(x, y - size);
      ctx.lineTo(x + size * 0.7, y);
      ctx.lineTo(x, y + size);
      ctx.lineTo(x - size * 0.7, y);
      ctx.closePath();
      ctx.fill();
    } else if (this.shapeType === 'star') {
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const outerAngle = (Math.PI * 2 / 5) * i - Math.PI / 2;
        const innerAngle = outerAngle + Math.PI / 5;
        const outerX = x + size * Math.cos(outerAngle);
        const outerY = y + size * Math.sin(outerAngle);
        const innerX = x + size * 0.4 * Math.cos(innerAngle);
        const innerY = y + size * 0.4 * Math.sin(innerAngle);
        if (i === 0) ctx.moveTo(outerX, outerY);
        else ctx.lineTo(outerX, outerY);
        ctx.lineTo(innerX, innerY);
      }
      ctx.closePath();
      ctx.fill();
    } else if (this.shapeType === 'heart') {
      ctx.beginPath();
      ctx.moveTo(x, y + size * 0.3);
      ctx.bezierCurveTo(x - size, y - size * 0.5, x - size * 0.5, y - size, x, y - size * 0.3);
      ctx.bezierCurveTo(x + size * 0.5, y - size, x + size, y - size * 0.5, x, y + size * 0.3);
      ctx.fill();
    } else if (this.shapeType === 'diamond') {
      ctx.beginPath();
      ctx.moveTo(x, y - size);
      ctx.lineTo(x + size * 0.6, y - size * 0.3);
      ctx.lineTo(x + size * 0.6, y + size * 0.3);
      ctx.lineTo(x, y + size);
      ctx.lineTo(x - size * 0.6, y + size * 0.3);
      ctx.lineTo(x - size * 0.6, y - size * 0.3);
      ctx.closePath();
      ctx.fill();
    } else if (this.shapeType === 'crescent') {
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x + size * 0.4, y, size * 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
    } else if (this.shapeType === 'dodecahedron') {
      ctx.beginPath();
      for (let i = 0; i < 12; i++) {
        const angle = (Math.PI * 2 / 12) * i;
        const px = x + size * Math.cos(angle);
        const py = y + size * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    }
    
    ctx.globalAlpha = 1;
  }

  drawShapeOutline(x, y, size, color, lineWidth) {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    
    if (this.shapeType === 'circle') {
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.stroke();
    } else if (this.shapeType === 'triangle') {
      ctx.beginPath();
      ctx.moveTo(x, y - size);
      ctx.lineTo(x + size * 0.866, y + size * 0.5);
      ctx.lineTo(x - size * 0.866, y + size * 0.5);
      ctx.closePath();
      ctx.stroke();
    } else if (this.shapeType === 'square') {
      ctx.strokeRect(x - size, y - size, size * 2, size * 2);
    } else if (this.shapeType === 'oval') {
      ctx.beginPath();
      ctx.ellipse(x, y, size * 1.3, size * 0.8, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (this.shapeType === 'hexagon') {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const px = x + size * Math.cos(angle);
        const py = y + size * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    } else if (this.shapeType === 'spiral') {
      ctx.beginPath();
      for (let i = 0; i < 50; i++) {
        const angle = i * 0.3;
        const r = (i / 50) * size;
        const px = x + r * Math.cos(angle);
        const py = y + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    } else if (this.shapeType === 'rhombus') {
      ctx.beginPath();
      ctx.moveTo(x, y - size);
      ctx.lineTo(x + size * 0.7, y);
      ctx.lineTo(x, y + size);
      ctx.lineTo(x - size * 0.7, y);
      ctx.closePath();
      ctx.stroke();
    } else if (this.shapeType === 'star') {
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const outerAngle = (Math.PI * 2 / 5) * i - Math.PI / 2;
        const innerAngle = outerAngle + Math.PI / 5;
        const outerX = x + size * Math.cos(outerAngle);
        const outerY = y + size * Math.sin(outerAngle);
        const innerX = x + size * 0.4 * Math.cos(innerAngle);
        const innerY = y + size * 0.4 * Math.sin(innerAngle);
        if (i === 0) ctx.moveTo(outerX, outerY);
        else ctx.lineTo(outerX, outerY);
        ctx.lineTo(innerX, innerY);
      }
      ctx.closePath();
      ctx.stroke();
    } else if (this.shapeType === 'heart') {
      ctx.beginPath();
      ctx.moveTo(x, y + size * 0.3);
      ctx.bezierCurveTo(x - size, y - size * 0.5, x - size * 0.5, y - size, x, y - size * 0.3);
      ctx.bezierCurveTo(x + size * 0.5, y - size, x + size, y - size * 0.5, x, y + size * 0.3);
      ctx.stroke();
    } else if (this.shapeType === 'diamond') {
      ctx.beginPath();
      ctx.moveTo(x, y - size);
      ctx.lineTo(x + size * 0.6, y - size * 0.3);
      ctx.lineTo(x + size * 0.6, y + size * 0.3);
      ctx.lineTo(x, y + size);
      ctx.lineTo(x - size * 0.6, y + size * 0.3);
      ctx.lineTo(x - size * 0.6, y - size * 0.3);
      ctx.closePath();
      ctx.stroke();
    } else if (this.shapeType === 'crescent') {
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.stroke();
    } else if (this.shapeType === 'dodecahedron') {
      ctx.beginPath();
      for (let i = 0; i < 12; i++) {
        const angle = (Math.PI * 2 / 12) * i;
        const px = x + size * Math.cos(angle);
        const py = y + size * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }
}

// Collision detection and response
function handleCollisions(fighters) {
  // Handle attraction effects (Rhombus skill1)
  for (let i = 0; i < fighters.length; i++) {
    const f1 = fighters[i];
    const attractionEffect = f1.activeEffects.find(e => e.type === 'attraction');
    if (attractionEffect) {
      for (let j = 0; j < fighters.length; j++) {
        if (i === j) continue;
        const f2 = fighters[j];
        const dx = f1.x - f2.x;
        const dy = f1.y - f2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0 && dist < attractionEffect.value) {
          const force = 0.3 * (1 - dist / attractionEffect.value);
          f2.vx += (dx / dist) * force;
          f2.vy += (dy / dist) * force;
        }
      }
    }
  }

  for (let i = 0; i < fighters.length; i++) {
    for (let j = i + 1; j < fighters.length; j++) {
      const f1 = fighters[i];
      const f2 = fighters[j];
      
      // Check for phase shift (Oval ultimate - pass through)
      const f1PhaseShift = f1.activeEffects.find(e => e.type === 'phaseShift');
      const f2PhaseShift = f2.activeEffects.find(e => e.type === 'phaseShift');
      if (f1PhaseShift || f2PhaseShift) {
        // Skip collision response if either fighter is phased
        continue;
      }
      
      const dx = f2.x - f1.x;
      const dy = f2.y - f1.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minDist = f1.radius + f2.radius;
      
      if (dist < minDist) {
        // Collision response
        const nx = dx / dist;
        const ny = dy / dist;
        
        // Separate
        const overlap = minDist - dist;
        f1.x -= nx * overlap / 2;
        f1.y -= ny * overlap / 2;
        f2.x += nx * overlap / 2;
        f2.y += ny * overlap / 2;
        
        // Elastic collision
        const dvx = f1.vx - f2.vx;
        const dvy = f1.vy - f2.vy;
        const dvn = dvx * nx + dvy * ny;
        
        if (dvn > 0) {
          const m1 = f1.mass;
          const m2 = f2.mass;
          const restitution = 1.5; // High bounce to send fighters to walls
          
          const impulse = (2 * dvn) / (m1 + m2);
          
          f1.vx -= impulse * m2 * nx * restitution;
          f1.vy -= impulse * m2 * ny * restitution;
          f2.vx += impulse * m1 * nx * restitution;
          f2.vy += impulse * m1 * ny * restitution;
          
          // Damage on collision
          const collisionSpeed = Math.abs(dvn);
          if (collisionSpeed > 3) {
            const damage = Math.floor(collisionSpeed * 0.8) + Math.floor(Math.random() * 3);
            const luckRoll = Math.random();
            
            // Ultimate charge system
            let chargeAmount = 1; // light hit default
            if (damage > 5) chargeAmount = 2; // clean hit
            if (collisionSpeed > 8) chargeAmount = 3; // wall combo
            if (damage > 10) chargeAmount = 4; // counter hit
            
            // Award charge to the attacker
            if (luckRoll < 0.5) {
              f2.ultimateCharge = Math.min(f2.ultimateCharge + chargeAmount, 10);
              f1.lastAttacker = f2;
            } else {
              f1.ultimateCharge = Math.min(f1.ultimateCharge + chargeAmount, 10);
              f2.lastAttacker = f1;
            }
            
            // Check for near-KO (low HP before damage)
            const f1NearKO = f1.hp < 25;
            const f2NearKO = f2.hp < 25;
            
            // Trigger hit pause on heavy hits or near-KO
            if (damage > 15 || f1NearKO || f2NearKO) {
              hitPauseTimer = HIT_PAUSE_DURATION;
            }
            
            // Trigger screen shake on very heavy hits
            if (damage > 20) {
              screenShake.intensity = Math.min(damage / 5, 15);
              screenShake.x = (Math.random() - 0.5) * screenShake.intensity;
              screenShake.y = (Math.random() - 0.5) * screenShake.intensity;
            }
            
            if (luckRoll < 0.5) {
              f1.hp -= damage;
              f1.hitFlash = 15;
            } else {
              f2.hp -= damage;
              f2.hitFlash = 15;
            }
          }
        }
      }
    }
  }
}

// Create fighters
const fighters = [];
const fighterConfigs = [
  { id: 1, color: '#FF5733', name: 'Alpha', shapeType: 'circle' },
  { id: 2, color: '#33FF57', name: 'Beta', shapeType: 'triangle' },
  { id: 3, color: '#3357FF', name: 'Gamma', shapeType: 'square' },
  { id: 4, color: '#FF33A8', name: 'Delta', shapeType: 'oval' },
  { id: 5, color: '#33FFF5', name: 'Epsilon', shapeType: 'hexagon' },
  { id: 6, color: '#F5FF33', name: 'Zeta', shapeType: 'spiral' },
  { id: 7, color: '#FF8C33', name: 'Eta', shapeType: 'rhombus' },
  { id: 8, color: '#FF3333', name: 'Theta', shapeType: 'star' },
  { id: 9, color: '#FF33FF', name: 'Iota', shapeType: 'heart' },
  { id: 10, color: '#33FFFF', name: 'Kappa', shapeType: 'diamond' },
  { id: 11, color: '#8C33FF', name: 'Lambda', shapeType: 'crescent' },
  { id: 12, color: '#33FF8C', name: 'Mu', shapeType: 'dodecahedron' }
];

// Track selected fighters
const selectedFighters = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]); // All selected by default

function getArenaBounds() {
  const arenaLeft = (canvas.width - ARENA_SIZE) / 2;
  const arenaTop = (canvas.height - ARENA_SIZE) / 2;
  return { arenaLeft, arenaTop };
}

function spawnFighters() {
  fighters.length = 0; // Clear existing fighters
  replayBuffer = []; // Clear replay buffer
  
  const selectedConfigs = fighterConfigs.filter(c => selectedFighters.has(c.id));
  const { arenaLeft, arenaTop } = getArenaBounds();
  const centerX = arenaLeft + ARENA_SIZE / 2;
  const centerY = arenaTop + ARENA_SIZE / 2;
  
  // Arrange fighters in a circle formation
  const radius = ARENA_SIZE * 0.25;
  selectedConfigs.forEach((config, index) => {
    const angle = (index / selectedConfigs.length) * Math.PI * 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    fighters.push(new Fighter(config.id, x, y, config.color, config.name, config.shapeType));
  });
}

// Record game state for replay
function recordState() {
  const state = fighters.map(f => ({
    x: f.x,
    y: f.y,
    vx: f.vx,
    vy: f.vy,
    hp: f.hp,
    hitFlash: f.hitFlash,
    trail: [...f.trail]
  }));
  replayBuffer.push(state);
  if (replayBuffer.length > REPLAY_DURATION) {
    replayBuffer.shift();
  }
}

// Trigger KO sequence
function triggerKO(winner) {
  introState = 'ko';
  koTimer = 0;
  screenShake.intensity = 20; // Strong shake on KO
  screenShake.x = (Math.random() - 0.5) * screenShake.intensity;
  screenShake.y = (Math.random() - 0.5) * screenShake.intensity;
  window.koWinner = winner;
}

// UI elements for selection
const cardHitAreas = [];
const startButton = { x: 0, y: 0, width: 220, height: 54 };
const selectAllButton = { x: 0, y: 0, width: 140, height: 38 };

// Helper: draw a shape preview on canvas at (x,y) with given size and shapeType
function drawShapePreview(x, y, size, shapeType, color, alpha = 1) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  switch (shapeType) {
    case 'circle':
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'triangle':
      ctx.beginPath();
      ctx.moveTo(x, y - size);
      ctx.lineTo(x + size * 0.866, y + size * 0.5);
      ctx.lineTo(x - size * 0.866, y + size * 0.5);
      ctx.closePath();
      ctx.fill();
      break;
    case 'square':
      ctx.fillRect(x - size, y - size, size * 2, size * 2);
      break;
    case 'oval':
      ctx.beginPath();
      ctx.ellipse(x, y, size * 1.3, size * 0.8, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'hexagon':
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 6;
        const px = x + size * Math.cos(a);
        const py = y + size * Math.sin(a);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      break;
    case 'spiral':
      ctx.beginPath();
      for (let i = 0; i < 50; i++) {
        const a = i * 0.3;
        const r = (i / 50) * size;
        const px = x + r * Math.cos(a);
        const py = y + r * Math.sin(a);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y, size * 0.3, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'rhombus':
      ctx.beginPath();
      ctx.moveTo(x, y - size);
      ctx.lineTo(x + size * 0.7, y);
      ctx.lineTo(x, y + size);
      ctx.lineTo(x - size * 0.7, y);
      ctx.closePath();
      ctx.fill();
      break;
    case 'star':
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const oa = (Math.PI * 2 / 5) * i - Math.PI / 2;
        const ia = oa + Math.PI / 5;
        if (i === 0) ctx.moveTo(x + size * Math.cos(oa), y + size * Math.sin(oa));
        else ctx.lineTo(x + size * Math.cos(oa), y + size * Math.sin(oa));
        ctx.lineTo(x + size * 0.4 * Math.cos(ia), y + size * 0.4 * Math.sin(ia));
      }
      ctx.closePath();
      ctx.fill();
      break;
    case 'heart':
      ctx.beginPath();
      ctx.moveTo(x, y + size * 0.3);
      ctx.bezierCurveTo(x - size, y - size * 0.5, x - size * 0.5, y - size, x, y - size * 0.3);
      ctx.bezierCurveTo(x + size * 0.5, y - size, x + size, y - size * 0.5, x, y + size * 0.3);
      ctx.fill();
      break;
    case 'diamond':
      ctx.beginPath();
      ctx.moveTo(x, y - size);
      ctx.lineTo(x + size * 0.6, y - size * 0.3);
      ctx.lineTo(x + size * 0.6, y + size * 0.3);
      ctx.lineTo(x, y + size);
      ctx.lineTo(x - size * 0.6, y + size * 0.3);
      ctx.lineTo(x - size * 0.6, y - size * 0.3);
      ctx.closePath();
      ctx.fill();
      break;
    case 'crescent':
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x + size * 0.4, y, size * 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.globalAlpha = alpha;
      break;
    case 'dodecahedron':
      ctx.beginPath();
      for (let i = 0; i < 12; i++) {
        const a = (Math.PI * 2 / 12) * i;
        const px = x + size * Math.cos(a);
        const py = y + size * Math.sin(a);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      break;
  }
  ctx.globalAlpha = 1;
}

// Personality trait labels for stat bars
const TRAIT_LABELS = {
  aggression: 'ATK', mobility: 'SPD', precision: 'AIM',
  chaos: 'CHS', skillDiscipline: 'SKL', fear: 'DEF'
};
const SHOWN_TRAITS = ['aggression', 'mobility', 'precision', 'chaos', 'skillDiscipline', 'fear'];

// Personality base stats (mirrors initPersonality)
const basePersonalities = {
  circle:      { aggression:7,  mobility:8,  precision:6,  chaos:5, fear:3,  skillDiscipline:7 },
  triangle:    { aggression:8,  mobility:9,  precision:7,  chaos:4, fear:2,  skillDiscipline:8 },
  square:      { aggression:5,  mobility:4,  precision:8,  chaos:2, fear:5,  skillDiscipline:9 },
  oval:        { aggression:6,  mobility:10, precision:5,  chaos:4, fear:4,  skillDiscipline:6 },
  hexagon:     { aggression:4,  mobility:5,  precision:9,  chaos:3, fear:6,  skillDiscipline:8 },
  spiral:      { aggression:5,  mobility:7,  precision:4,  chaos:9, fear:4,  skillDiscipline:5 },
  rhombus:     { aggression:6,  mobility:6,  precision:7,  chaos:6, fear:3,  skillDiscipline:7 },
  star:        { aggression:10, mobility:7,  precision:5,  chaos:7, fear:1,  skillDiscipline:6 },
  heart:       { aggression:3,  mobility:8,  precision:6,  chaos:3, fear:8,  skillDiscipline:7 },
  diamond:     { aggression:7,  mobility:6,  precision:10, chaos:2, fear:4,  skillDiscipline:8 },
  crescent:    { aggression:6,  mobility:8,  precision:6,  chaos:5, fear:5,  skillDiscipline:6 },
  dodecahedron:{ aggression:6,  mobility:6,  precision:7,  chaos:4, fear:5,  skillDiscipline:10 }
};

function drawSelectionUI() {
  const W = canvas.width;
  const H = canvas.height;
  const cx = W / 2;

  // ── Background overlay ──────────────────────────────────────────────
  ctx.fillStyle = 'rgba(0,0,0,0.78)';
  ctx.fillRect(0, 0, W, H);

  // ── Title ────────────────────────────────────────────────────────────
  const titleH = Math.min(H * 0.08, 48);
  const titleY = Math.min(H * 0.06, 45);
  ctx.save();
  ctx.shadowColor = '#7ec8ff';
  ctx.shadowBlur = 18;
  ctx.fillStyle = '#fff';
  ctx.font = `bold ${titleH}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('SELECT FIGHTERS', cx, titleY);
  ctx.restore();

  // ── Layout maths ─────────────────────────────────────────────────────
  const isMobile = W < 600 || H > W * 1.5;
  const COLS = isMobile ? 3 : 4;
  const ROWS = isMobile ? 4 : 3;
  const padding = Math.min(W * 0.02, 15);
  const topOffset = titleY + titleH * 0.8;
  const bottomReserve = isMobile ? Math.min(H * 0.22, 160) : Math.min(H * 0.16, 100); // space for button row

  const gridW = W - padding * 2;
  const gridH = H - topOffset - bottomReserve - padding;
  const cardW = Math.floor(gridW / COLS);
  const cardH = Math.floor(gridH / ROWS);

  cardHitAreas.length = 0;

  fighterConfigs.forEach((config, index) => {
    const col = index % COLS;
    const row = Math.floor(index / COLS);

    const cx0 = padding + col * cardW + cardW / 2;
    const cy0 = topOffset + row * cardH + cardH / 2;
    const cardLeft = padding + col * cardW;
    const cardTop  = topOffset + row * cardH;
    const isSelected = selectedFighters.has(config.id);

    // Card background
    const borderAlpha = isSelected ? 1 : 0.3;
    const bgAlpha     = isSelected ? 0.18 : 0.06;

    ctx.save();
    ctx.globalAlpha = bgAlpha;
    ctx.fillStyle = config.color;
    roundRect(ctx, cardLeft + 4, cardTop + 4, cardW - 8, cardH - 8, 10);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = borderAlpha;
    ctx.strokeStyle = isSelected ? config.color : '#555';
    ctx.lineWidth = isSelected ? 2.5 : 1.5;
    roundRect(ctx, cardLeft + 4, cardTop + 4, cardW - 8, cardH - 8, 10);
    ctx.stroke();
    ctx.restore();

    // ── Shape preview ───────────────────────────────────────────────
    const shapeSize = Math.min(cardW, cardH) * 0.22;
    const shapeY = cy0 - cardH * 0.06;

    if (isSelected) {
      // glow ring
      ctx.save();
      ctx.globalAlpha = 0.25;
      ctx.fillStyle = config.color;
      ctx.beginPath();
      ctx.arc(cx0, shapeY, shapeSize + 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    drawShapePreview(cx0, shapeY, shapeSize, config.shapeType, isSelected ? config.color : '#777');

    // ── Name ────────────────────────────────────────────────────────
    const nameFontSize = Math.max(Math.min(cardW * 0.18, cardH * 0.18, 18), 11);
    ctx.fillStyle = isSelected ? '#fff' : '#888';
    ctx.font = `bold ${nameFontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(config.name.toUpperCase(), cx0, shapeY + shapeSize + nameFontSize * 1.1);

    // ── Stat bars ───────────────────────────────────────────────────
    const stats = basePersonalities[config.shapeType];
    const barAreaTop = shapeY + shapeSize + nameFontSize * 2.5;
    const barAreaH   = (cardTop + cardH - 8) - barAreaTop - 4;
    const barRowH    = barAreaH / SHOWN_TRAITS.length;
    const barLabelW  = Math.max(cardW * 0.13, 22);
    const barRight   = cardLeft + cardW - 10;
    const barLeft    = cardLeft + 10 + barLabelW;
    const barMaxW    = barRight - barLeft - 4;
    const barH       = Math.max(barRowH * 0.38, 3);

    if (barAreaH > 10) {
      SHOWN_TRAITS.forEach((trait, ti) => {
        const val = stats[trait] ?? 5;
        const by = barAreaTop + ti * barRowH + barRowH / 2;
        const fillW = (val / 10) * barMaxW;

        // Label
        const labelSize = Math.max(Math.min(barRowH * 0.52, cardW * 0.1, 10), 7);
        ctx.fillStyle = isSelected ? '#aaa' : '#555';
        ctx.font = `${labelSize}px Arial`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(TRAIT_LABELS[trait], cardLeft + 10 + barLabelW - 3, by);

        // Track
        ctx.fillStyle = isSelected ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)';
        roundRect(ctx, barLeft, by - barH / 2, barMaxW, barH, barH / 2);
        ctx.fill();

        // Fill
        if (fillW > 0) {
          ctx.fillStyle = isSelected ? config.color : '#444';
          ctx.globalAlpha = isSelected ? 0.85 : 0.4;
          roundRect(ctx, barLeft, by - barH / 2, fillW, barH, barH / 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      });
    }

    // ── Selected checkmark badge ─────────────────────────────────────
    if (isSelected) {
      const bx = cardLeft + cardW - 18;
      const by2 = cardTop + 16;
      const br = 9;
      ctx.fillStyle = config.color;
      ctx.beginPath();
      ctx.arc(bx, by2, br, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bx - 4.5, by2);
      ctx.lineTo(bx - 1.5, by2 + 3.5);
      ctx.lineTo(bx + 5, by2 - 4);
      ctx.stroke();
    }

    // Store hit area
    cardHitAreas.push({ x: cardLeft + 4, y: cardTop + 4, w: cardW - 8, h: cardH - 8, id: config.id });
  });

  // ── Bottom bar ───────────────────────────────────────────────────────
  const barY = H - bottomReserve + (bottomReserve - startButton.height) / 2;
  
  if (isMobile) {
    // Mobile: stack buttons vertically at bottom
    const buttonWidth = Math.min(W * 0.85, 220);
    const buttonHeight = 50;
    const buttonSpacing = 12;
    const totalButtonHeight = buttonHeight * 2 + buttonSpacing;
    const startY = H - totalButtonHeight - 20;
    
    // Select All / None toggle (top button)
    const allSelected = selectedFighters.size === fighterConfigs.length;
    selectAllButton.width = buttonWidth;
    selectAllButton.height = buttonHeight;
    selectAllButton.x = cx - buttonWidth / 2;
    selectAllButton.y = startY;
    ctx.fillStyle = allSelected ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.08)';
    roundRect(ctx, selectAllButton.x, selectAllButton.y, selectAllButton.width, selectAllButton.height, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 1.5;
    roundRect(ctx, selectAllButton.x, selectAllButton.y, selectAllButton.width, selectAllButton.height, 8);
    ctx.stroke();
    ctx.fillStyle = '#ddd';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(allSelected ? 'DESELECT ALL' : 'SELECT ALL', selectAllButton.x + selectAllButton.width / 2, selectAllButton.y + selectAllButton.height / 2);

    // Count badge above select all
    const countStr = `${selectedFighters.size} / ${fighterConfigs.length}`;
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    roundRect(ctx, cx - 35, startY - 30, 70, 24, 6);
    ctx.fill();
    ctx.fillStyle = '#ccc';
    ctx.font = 'bold 13px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(countStr, cx, startY - 18);

    // Start button (bottom button)
    startButton.width = buttonWidth;
    startButton.height = buttonHeight;
    startButton.x = cx - buttonWidth / 2;
    startButton.y = startY + buttonHeight + buttonSpacing;
    const canStart = selectedFighters.size >= 2;
    const btnGrad = ctx.createLinearGradient(startButton.x, startButton.y, startButton.x, startButton.y + startButton.height);
    if (canStart) {
      btnGrad.addColorStop(0, '#56d364');
      btnGrad.addColorStop(1, '#2ea043');
    } else {
      btnGrad.addColorStop(0, '#444');
      btnGrad.addColorStop(1, '#333');
    }
    ctx.fillStyle = btnGrad;
    roundRect(ctx, startButton.x, startButton.y, startButton.width, startButton.height, 10);
    ctx.fill();
    if (canStart) {
      ctx.save();
      ctx.shadowColor = '#56d364';
      ctx.shadowBlur = 12;
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 1.5;
      roundRect(ctx, startButton.x, startButton.y, startButton.width, startButton.height, 10);
      ctx.stroke();
      ctx.restore();
    }
    ctx.fillStyle = canStart ? '#fff' : '#666';
    ctx.font = `bold 16px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚔ START BATTLE', startButton.x + startButton.width / 2, startButton.y + startButton.height / 2);

    // Warning if too few selected
    if (!canStart) {
      ctx.fillStyle = '#ff6b6b';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('Select at least 2 fighters', cx, startButton.y + startButton.height + 6);
    }
  } else {
    // Desktop: horizontal layout
    const allSelected = selectedFighters.size === fighterConfigs.length;
    selectAllButton.x = cx - startButton.width / 2 - selectAllButton.width - 16;
    selectAllButton.y = barY;
    ctx.fillStyle = allSelected ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.08)';
    roundRect(ctx, selectAllButton.x, selectAllButton.y, selectAllButton.width, selectAllButton.height, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 1.5;
    roundRect(ctx, selectAllButton.x, selectAllButton.y, selectAllButton.width, selectAllButton.height, 8);
    ctx.stroke();
    ctx.fillStyle = '#ddd';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(allSelected ? 'DESELECT ALL' : 'SELECT ALL', selectAllButton.x + selectAllButton.width / 2, selectAllButton.y + selectAllButton.height / 2);

    // Count badge
    const countStr = `${selectedFighters.size} / ${fighterConfigs.length}`;
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    roundRect(ctx, cx - 38, barY + 4, 76, selectAllButton.height - 8, 6);
    ctx.fill();
    ctx.fillStyle = '#ccc';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(countStr, cx, barY + selectAllButton.height / 2);

    // Start button
    startButton.x = cx + 54;
    startButton.y = barY - (startButton.height - selectAllButton.height) / 2;
    const canStart = selectedFighters.size >= 2;
    const btnGrad = ctx.createLinearGradient(startButton.x, startButton.y, startButton.x, startButton.y + startButton.height);
    if (canStart) {
      btnGrad.addColorStop(0, '#56d364');
      btnGrad.addColorStop(1, '#2ea043');
    } else {
      btnGrad.addColorStop(0, '#444');
      btnGrad.addColorStop(1, '#333');
    }
    ctx.fillStyle = btnGrad;
    roundRect(ctx, startButton.x, startButton.y, startButton.width, startButton.height, 10);
    ctx.fill();
    if (canStart) {
      ctx.save();
      ctx.shadowColor = '#56d364';
      ctx.shadowBlur = 12;
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 1.5;
      roundRect(ctx, startButton.x, startButton.y, startButton.width, startButton.height, 10);
      ctx.stroke();
      ctx.restore();
    }
    ctx.fillStyle = canStart ? '#fff' : '#666';
    ctx.font = `bold 20px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚔  START BATTLE', startButton.x + startButton.width / 2, startButton.y + startButton.height / 2);

    // Warning if too few selected
    if (!canStart) {
      ctx.fillStyle = '#ff6b6b';
      ctx.font = '13px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('Select at least 2 fighters', cx, startButton.y + startButton.height + 6);
    }
  }
}

// Utility: rounded rectangle path
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// Handle mouse clicks
canvas.addEventListener('click', (e) => {
  if (introState !== 'selection') return;
  
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const mouseX = (e.clientX - rect.left) * scaleX;
  const mouseY = (e.clientY - rect.top) * scaleY;
  
  // Check fighter card clicks
  for (const card of cardHitAreas) {
    if (mouseX >= card.x && mouseX <= card.x + card.w &&
        mouseY >= card.y && mouseY <= card.y + card.h) {
      if (selectedFighters.has(card.id)) {
        selectedFighters.delete(card.id);
      } else {
        selectedFighters.add(card.id);
      }
      return;
    }
  }

  // Check Select All / Deselect All button
  if (mouseX >= selectAllButton.x && mouseX <= selectAllButton.x + selectAllButton.width &&
      mouseY >= selectAllButton.y && mouseY <= selectAllButton.y + selectAllButton.height) {
    if (selectedFighters.size === fighterConfigs.length) {
      selectedFighters.clear();
    } else {
      fighterConfigs.forEach(c => selectedFighters.add(c.id));
    }
    return;
  }
  
  // Check start button click
  if (mouseX >= startButton.x && mouseX <= startButton.x + startButton.width &&
      mouseY >= startButton.y && mouseY <= startButton.y + startButton.height) {
    if (selectedFighters.size >= 2) {
      spawnFighters();
      introState = 'ready';
      introTimer = 0;
    }
  }
});

// Game loop
function gameLoop() {
  // Apply screen shake
  ctx.save();
  if (screenShake.intensity > 0) {
    screenShake.x = (Math.random() - 0.5) * screenShake.intensity;
    screenShake.y = (Math.random() - 0.5) * screenShake.intensity;
    ctx.translate(screenShake.x, screenShake.y);
    screenShake.intensity *= 0.9;
    if (screenShake.intensity < 0.5) {
      screenShake.intensity = 0;
    }
  }

  // Clear canvas with deep space background
  const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  bgGrad.addColorStop(0, '#0a0a1a');
  bgGrad.addColorStop(1, '#05080f');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const { arenaLeft, arenaTop } = getArenaBounds();

  // --- Draw arena ---
  // Floor gradient
  const floorGrad = ctx.createRadialGradient(
    arenaLeft + ARENA_SIZE / 2, arenaTop + ARENA_SIZE / 2, 0,
    arenaLeft + ARENA_SIZE / 2, arenaTop + ARENA_SIZE / 2, ARENA_SIZE * 0.72
  );
  floorGrad.addColorStop(0, '#0d1117');
  floorGrad.addColorStop(1, '#050810');
  ctx.fillStyle = floorGrad;
  ctx.fillRect(arenaLeft, arenaTop, ARENA_SIZE, ARENA_SIZE);

  // Subtle grid lines
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 1;
  const gridStep = ARENA_SIZE / 10;
  for (let i = 1; i < 10; i++) {
    ctx.beginPath();
    ctx.moveTo(arenaLeft + i * gridStep, arenaTop);
    ctx.lineTo(arenaLeft + i * gridStep, arenaTop + ARENA_SIZE);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(arenaLeft, arenaTop + i * gridStep);
    ctx.lineTo(arenaLeft + ARENA_SIZE, arenaTop + i * gridStep);
    ctx.stroke();
  }

  // Center cross
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(arenaLeft + ARENA_SIZE / 2, arenaTop + 20);
  ctx.lineTo(arenaLeft + ARENA_SIZE / 2, arenaTop + ARENA_SIZE - 20);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(arenaLeft + 20, arenaTop + ARENA_SIZE / 2);
  ctx.lineTo(arenaLeft + ARENA_SIZE - 20, arenaTop + ARENA_SIZE / 2);
  ctx.stroke();

  // Center circle
  ctx.strokeStyle = 'rgba(255,255,255,0.07)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(arenaLeft + ARENA_SIZE / 2, arenaTop + ARENA_SIZE / 2, ARENA_SIZE * 0.2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Border glow (outer)
  ctx.save();
  ctx.shadowColor = 'rgba(100, 180, 255, 0.6)';
  ctx.shadowBlur = 18;
  ctx.strokeStyle = 'rgba(130, 200, 255, 0.85)';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(arenaLeft, arenaTop, ARENA_SIZE, ARENA_SIZE);
  ctx.restore();

  // Inner border
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 1;
  ctx.strokeRect(arenaLeft + 3, arenaTop + 3, ARENA_SIZE - 6, ARENA_SIZE - 6);

  // Corner decorations
  const cornerSize = 16;
  ctx.save();
  ctx.strokeStyle = 'rgba(130, 200, 255, 0.9)';
  ctx.lineWidth = 3;
  const corners = [
    [arenaLeft, arenaTop, 1, 1],
    [arenaLeft + ARENA_SIZE, arenaTop, -1, 1],
    [arenaLeft, arenaTop + ARENA_SIZE, 1, -1],
    [arenaLeft + ARENA_SIZE, arenaTop + ARENA_SIZE, -1, -1]
  ];
  for (const [cx2, cy2, sx, sy] of corners) {
    ctx.beginPath();
    ctx.moveTo(cx2 + sx * cornerSize, cy2);
    ctx.lineTo(cx2, cy2);
    ctx.lineTo(cx2, cy2 + sy * cornerSize);
    ctx.stroke();
  }
  ctx.restore();

  // Handle intro animation
  if (introState === 'selection') {
    drawSelectionUI();
  } else if (introState === 'ready') {
    introTimer++;
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 72px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('READY', canvas.width / 2, canvas.height / 2);
    
    if (introTimer >= READY_DURATION) {
      introState = 'fight';
      introTimer = 0;
    }
  } else if (introState === 'fight') {
    introTimer++;
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 72px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('FIGHT!', canvas.width / 2, canvas.height / 2);
    
    // Draw fighters during fight text
    for (let fighter of fighters) {
      if (fighter.hp > 0) {
        fighter.draw();
      }
    }
    
    if (introTimer >= FIGHT_DURATION) {
      introState = 'battle';
      // Give fighters random velocity when fight starts
      for (let fighter of fighters) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 3 + Math.random() * 3;
        fighter.vx = Math.cos(angle) * speed;
        fighter.vy = Math.sin(angle) * speed;
      }
    }
  } else if (introState === 'ko') {
    // KO dramatic pause
    koTimer++;
    
    // Draw fighters frozen
    for (let fighter of fighters) {
      if (fighter.hp > 0) {
        fighter.draw();
      }
    }
    
    // Draw FINISH! text
    ctx.fillStyle = '#ff4444';
    ctx.font = 'bold 96px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('FINISH!', canvas.width / 2, canvas.height / 2);
    
    // Draw winner name
    if (window.koWinner) {
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 48px Arial';
      ctx.fillText(`${window.koWinner.name} WINS!`, canvas.width / 2, canvas.height / 2 + 80);
    }
    
    // After KO pause, start replay
    if (koTimer >= KO_PAUSE_DURATION) {
      introState = 'replay';
      replayIndex = 0;
    }
  } else if (introState === 'replay') {
    // Replay mode
    if (replayIndex < replayBuffer.length) {
      const state = replayBuffer[replayIndex];
      
      // Restore and draw fighters from replay state
      for (let i = 0; i < fighters.length && i < state.length; i++) {
        fighters[i].x = state[i].x;
        fighters[i].y = state[i].y;
        fighters[i].hp = state[i].hp;
        fighters[i].hitFlash = state[i].hitFlash;
        fighters[i].trail = state[i].trail;
        fighters[i].draw();
      }
      
      // Draw REPLAY indicator
      ctx.fillStyle = '#ffff00';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('▶ REPLAY', arenaLeft + 10, arenaTop + 10);
      
      replayIndex++;
    } else {
      // Replay finished, show final screen
      const aliveFighters = fighters.filter(f => f.hp > 0);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      if (aliveFighters.length === 1) {
        ctx.fillText(`${aliveFighters[0].name} WINS!`, canvas.width / 2, canvas.height / 2);
      } else {
        ctx.fillText('DRAW!', canvas.width / 2, canvas.height / 2);
      }
      
      ctx.font = 'bold 24px Arial';
      ctx.fillText('Refresh to restart', canvas.width / 2, canvas.height / 2 + 50);
    }
  } else {
    // Battle mode
    const aliveFighters = fighters.filter(f => f.hp > 0);
    
    if (aliveFighters.length <= 1) {
      // Trigger KO sequence if not already triggered
      if (introState === 'battle' && aliveFighters.length === 1) {
        triggerKO(aliveFighters[0]);
      } else if (introState === 'battle') {
        // Draw state when no survivors
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('DRAW!', canvas.width / 2, canvas.height / 2);
        ctx.font = 'bold 24px Arial';
        ctx.fillText('Refresh to restart', canvas.width / 2, canvas.height / 2 + 50);
      }
    } else {
      // Record state for replay
      recordState();
      
      // Handle hit pause (slow motion)
      if (hitPauseTimer > 0) {
        hitPauseTimer--;
        // Only update positions slowly during hit pause
        if (hitPauseTimer % 2 === 0) {
          handleCollisions(fighters);
          for (let fighter of fighters) {
            if (fighter.hp > 0) {
              fighter.update(fighters);
            }
          }
        }
        // Still draw every frame
        for (let fighter of fighters) {
          if (fighter.hp > 0) {
            fighter.draw();
          }
        }
      } else {
        handleCollisions(fighters);
        
        for (let fighter of fighters) {
          if (fighter.hp > 0) {
            fighter.update(fighters);
            fighter.draw();
          }
        }
      }
    }
  }

  // Restore context (undo screen shake)
  ctx.restore();

  // Draw VS display at top
  drawVSDisplay();

  // Draw fighter status panels outside arena
  drawFighterStatusPanels();

  requestAnimationFrame(gameLoop);
}

function drawVSDisplay() {
  if (introState !== 'battle' && introState !== 'replay' && introState !== 'ko') return;
  
  const aliveFighters = fighters.filter(f => f.hp > 0);
  if (aliveFighters.length < 2) return;
  
  const { arenaLeft, arenaTop } = getArenaBounds();
  const isMobile = canvas.width < 600 || canvas.height > canvas.width * 1.5;
  
  ctx.save();
  ctx.fillStyle = '#fff';
  ctx.font = `bold ${isMobile ? 14 : 18}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  
  // Build VS string: "Alpha vs Beta vs Gamma..."
  const vsString = aliveFighters.map(f => f.name).join(' vs ');
  ctx.fillText(vsString, canvas.width / 2, arenaTop - 15);
  ctx.restore();
}

function drawFighterStatusPanels() {
  if (introState !== 'battle' && introState !== 'replay' && introState !== 'ko') return;
  
  const aliveFighters = fighters.filter(f => f.hp > 0);
  if (aliveFighters.length === 0) return;
  
  const { arenaLeft, arenaTop } = getArenaBounds();
  const arenaRight = arenaLeft + ARENA_SIZE;
  const arenaBottom = arenaTop + ARENA_SIZE;
  
  const isMobile = canvas.width < 600 || canvas.height > canvas.width * 1.5;

  // --- Layout: panels spread horizontally below the arena ---
  const totalPanelW = ARENA_SIZE;
  const panelSpacing = isMobile ? 6 : 10;
  const count = aliveFighters.length;
  const panelWidth = Math.min(
    isMobile ? 160 : 200,
    (totalPanelW - panelSpacing * (count - 1)) / count
  );
  // Height: name row + hp bar row + 3 skill rows
  const nameH    = isMobile ? 20 : 22;
  const hpH      = isMobile ? 10 : 12;
  const skillRowH = isMobile ? 18 : 20;
  const padV      = isMobile ? 8  : 10;
  const padH      = isMobile ? 8  : 10;
  const panelHeight = padV + nameH + 6 + hpH + 6 + skillRowH * 3 + padV;

  const startX = arenaLeft;
  const panelY = arenaBottom + (isMobile ? 12 : 18);

  aliveFighters.forEach((fighter, index) => {
    const panelX = startX + index * (panelWidth + panelSpacing);
    const skillNames = getSkillNames(fighter.shapeType);

    ctx.save();

    // --- Panel shadow ---
    ctx.shadowColor = fighter.color;
    ctx.shadowBlur = 10;

    // Panel background
    ctx.fillStyle = 'rgba(10, 10, 20, 0.88)';
    roundRect(ctx, panelX, panelY, panelWidth, panelHeight, 10);
    ctx.fill();

    ctx.shadowBlur = 0;

    // Panel border (fighter color)
    ctx.strokeStyle = fighter.color;
    ctx.lineWidth = 2;
    roundRect(ctx, panelX, panelY, panelWidth, panelHeight, 10);
    ctx.stroke();

    // Thin color accent top bar
    ctx.fillStyle = fighter.color;
    ctx.globalAlpha = 0.35;
    roundRect(ctx, panelX + 2, panelY + 2, panelWidth - 4, 4, 3);
    ctx.fill();
    ctx.globalAlpha = 1;

    let curY = panelY + padV;

    // --- Fighter name ---
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${isMobile ? 13 : 15}px 'Segoe UI', Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(fighter.name, panelX + panelWidth / 2, curY);
    curY += nameH + 4;

    // --- HP bar ---
    const hpPercent = Math.max(0, fighter.hp / fighter.maxHp);
    const hpBarW = panelWidth - padH * 2;
    const hpColor = hpPercent > 0.5 ? '#56d364' : hpPercent > 0.25 ? '#ffd93d' : '#ff6b6b';

    // HP label inline
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = `${isMobile ? 9 : 10}px Arial`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('HP', panelX + padH, curY);
    ctx.textAlign = 'right';
    ctx.fillText(`${Math.ceil(fighter.hp)}`, panelX + panelWidth - padH, curY);

    const hpBarY = curY + (isMobile ? 10 : 11);
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    roundRect(ctx, panelX + padH, hpBarY, hpBarW, hpH, hpH / 2);
    ctx.fill();
    if (hpPercent > 0) {
      ctx.fillStyle = hpColor;
      roundRect(ctx, panelX + padH, hpBarY, hpBarW * hpPercent, hpH, hpH / 2);
      ctx.fill();
    }
    curY += (isMobile ? 10 : 11) + hpH + 8;

    // --- Skills: one per row, full width ---
    const skills = [
      { label: skillNames.skill1, cd: fighter.cooldowns.skill1, maxCd: 150, isUlt: false },
      { label: skillNames.skill2, cd: fighter.cooldowns.skill2, maxCd: 130, isUlt: false },
      { label: skillNames.ultimate, cd: fighter.cooldowns.ultimate, maxCd: 180, isUlt: true, charge: fighter.ultimateCharge }
    ];

    skills.forEach(skill => {
      drawSkillRow(ctx, panelX + padH, curY, panelWidth - padH * 2, skillRowH - 2, skill, isMobile);
      curY += skillRowH;
    });

    ctx.restore();
  });
}

function drawSkillRow(ctx, x, y, w, h, skill, isMobile) {
  const isUlt = skill.isUlt;
  const ready = isUlt
    ? (skill.charge >= 10 && skill.cd === 0)
    : (skill.cd === 0);

  const pulse = 0.7 + Math.sin(Date.now() / 120) * 0.3;

  // Row background pill
  ctx.fillStyle = ready
    ? (isUlt ? `rgba(180,0,255,${0.15 * pulse})` : `rgba(86,211,100,${0.15 * pulse})`)
    : 'rgba(255,255,255,0.05)';
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fill();

  // Skill name (left)
  const nameColor = ready
    ? (isUlt ? '#dd77ff' : '#56d364')
    : 'rgba(255,255,255,0.75)';
  ctx.fillStyle = nameColor;
  ctx.font = `bold ${isMobile ? 10 : 11}px 'Segoe UI', Arial`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const label = isUlt ? `★ ${skill.label}` : skill.label;
  ctx.fillText(label, x + 6, y + h / 2);

  // Status / cooldown bar (right side)
  const barW = w * 0.38;
  const barH = isMobile ? 4 : 5;
  const barX = x + w - barW - 4;
  const barY = y + (h - barH) / 2;

  if (isUlt) {
    if (skill.charge < 10) {
      // Charge bar (purple)
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      roundRect(ctx, barX, barY, barW, barH, barH / 2);
      ctx.fill();
      ctx.fillStyle = '#aa44ff';
      roundRect(ctx, barX, barY, barW * (skill.charge / 10), barH, barH / 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font = `${isMobile ? 9 : 10}px Arial`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${Math.floor(skill.charge)}/10`, barX - 3, y + h / 2);
    } else if (skill.cd > 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      roundRect(ctx, barX, barY, barW, barH, barH / 2);
      ctx.fill();
      ctx.fillStyle = '#aa44ff';
      roundRect(ctx, barX, barY, barW * (1 - skill.cd / skill.maxCd), barH, barH / 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font = `${isMobile ? 9 : 10}px Arial`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${(skill.cd / 60).toFixed(1)}s`, barX - 3, y + h / 2);
    } else {
      ctx.globalAlpha = pulse;
      ctx.fillStyle = '#dd77ff';
      ctx.font = `bold ${isMobile ? 10 : 11}px Arial`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText('READY', x + w - 4, y + h / 2);
      ctx.globalAlpha = 1;
    }
  } else {
    if (skill.cd > 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      roundRect(ctx, barX, barY, barW, barH, barH / 2);
      ctx.fill();
      ctx.fillStyle = '#56d364';
      roundRect(ctx, barX, barY, barW * (1 - skill.cd / skill.maxCd), barH, barH / 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font = `${isMobile ? 9 : 10}px Arial`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${(skill.cd / 60).toFixed(1)}s`, barX - 3, y + h / 2);
    } else {
      ctx.globalAlpha = pulse;
      ctx.fillStyle = '#56d364';
      ctx.font = `bold ${isMobile ? 10 : 11}px Arial`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText('READY', x + w - 4, y + h / 2);
      ctx.globalAlpha = 1;
    }
  }
}

function getSkillNames(shapeType) {
  const skillNames = {
    circle: { skill1: 'Dash', skill2: 'Spin', ultimate: 'Meteor' },
    triangle: { skill1: 'Pierce', skill2: 'Charge', ultimate: 'Spike' },
    square: { skill1: 'Shield', skill2: 'Slam', ultimate: 'Quake' },
    oval: { skill1: 'Speed', skill2: 'Drift', ultimate: 'Phase' },
    hexagon: { skill1: 'Orbit', skill2: 'Hex', ultimate: 'Burst' },
    spiral: { skill1: 'Vortex', skill2: 'Curve', ultimate: 'Tornado' },
    rhombus: { skill1: 'Heavy', skill2: 'Boost', ultimate: 'Impact' },
    star: { skill1: 'Burst', skill2: 'Beam', ultimate: 'Nova' },
    heart: { skill1: 'Heal', skill2: 'Pulse', ultimate: 'Love' },
    diamond: { skill1: 'Reflect', skill2: 'Sharp', ultimate: 'Prism' },
    crescent: { skill1: 'Slice', skill2: 'Moon', ultimate: 'Eclipse' },
    dodecahedron: { skill1: 'Adapt', skill2: 'Face', ultimate: 'Transform' }
  };
  return skillNames[shapeType] || { skill1: 'Skill 1', skill2: 'Skill 2', ultimate: 'Ult' };
}



gameLoop();
