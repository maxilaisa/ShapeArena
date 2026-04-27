// Shape Arena - Physics-Based Battle Simulator
// Designed for spectating, not playing

const canvas = document.createElement('canvas');
canvas.style.display = 'block';
canvas.style.width = '100vw';
canvas.style.height = '100vh';
document.body.appendChild(canvas);

const ctx = canvas.getContext('2d');

// Arena configuration
const ARENA_SIZE = 800;
const BORDER_WIDTH = 2;

// Resize canvas to fit arena
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

// Intro animation state
let introState = 'selection'; // 'selection', 'ready', 'fight', 'battle', 'replay', 'ko'
let introTimer = 0;
const READY_DURATION = 60; // frames
const FIGHT_DURATION = 30; // frames

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
    this.vx = (Math.random() - 0.5) * 4;
    this.vy = (Math.random() - 0.5) * 4;
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
          if (p.precision > 5) {
            const predictionFactor = (p.precision - 5) / 20;
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
    if (this.x - this.radius < arenaLeft) {
      this.x = arenaLeft + this.radius;
      this.vx *= -1.2;
      if (Math.abs(this.vx) < MIN_SPEED) {
        this.vx = this.vx > 0 ? MIN_SPEED : -MIN_SPEED;
      }
    }
    if (this.x + this.radius > arenaRight) {
      this.x = arenaRight - this.radius;
      this.vx *= -1.2;
      if (Math.abs(this.vx) < MIN_SPEED) {
        this.vx = this.vx > 0 ? MIN_SPEED : -MIN_SPEED;
      }
    }
    if (this.y - this.radius < arenaTop) {
      this.y = arenaTop + this.radius;
      this.vy *= -1.2;
      if (Math.abs(this.vy) < MIN_SPEED) {
        this.vy = this.vy > 0 ? MIN_SPEED : -MIN_SPEED;
      }
    }
    if (this.y + this.radius > arenaBottom) {
      this.y = arenaBottom - this.radius;
      this.vy *= -1.2;
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
    const damage = 5 + Math.random() * 10;
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
  for (let i = 0; i < fighters.length; i++) {
    for (let j = i + 1; j < fighters.length; j++) {
      const f1 = fighters[i];
      const f2 = fighters[j];
      
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
            const damage = Math.floor(collisionSpeed * 2) + Math.floor(Math.random() * 5);
            const luckRoll = Math.random();
            
            // Ultimate charge system
            let chargeAmount = 1; // light hit default
            if (damage > 10) chargeAmount = 2; // clean hit
            if (collisionSpeed > 8) chargeAmount = 3; // wall combo
            if (damage > 20) chargeAmount = 4; // counter hit
            
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
  for (const config of fighterConfigs) {
    if (selectedFighters.has(config.id)) {
      const { arenaLeft, arenaTop } = getArenaBounds();
      const x = arenaLeft + 50 + Math.random() * (ARENA_SIZE - 100);
      const y = arenaTop + 50 + Math.random() * (ARENA_SIZE - 100);
      fighters.push(new Fighter(config.id, x, y, config.color, config.name, config.shapeType));
    }
  }
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
const checkboxes = [];
const startButton = { x: 0, y: 0, width: 200, height: 50 };

function drawSelectionUI() {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  
  // Title
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('SELECT FIGHTERS', centerX, centerY - 200);
  
  // Draw checkboxes for each fighter
  checkboxes.length = 0;
  const boxSize = 30;
  const startY = centerY - 50;
  const spacing = 80;
  
  fighterConfigs.forEach((config, index) => {
    const x = centerX - 100;
    const y = startY + index * spacing;
    
    // Store checkbox position
    checkboxes.push({ x, y, size: boxSize, id: config.id });
    
    // Draw checkbox
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, boxSize, boxSize);
    
    // Draw checkmark if selected
    if (selectedFighters.has(config.id)) {
      ctx.fillStyle = config.color;
      ctx.fillRect(x + 4, y + 4, boxSize - 8, boxSize - 8);
    }
    
    // Draw fighter name and shape preview
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(config.name, x + boxSize + 20, y + boxSize / 2);
    
    // Draw small shape preview
    const previewX = x + boxSize + 150;
    const previewY = y + boxSize / 2;
    const previewSize = 15;
    
    ctx.fillStyle = config.color;
    if (config.shapeType === 'circle') {
      ctx.beginPath();
      ctx.arc(previewX, previewY, previewSize, 0, Math.PI * 2);
      ctx.fill();
    } else if (config.shapeType === 'triangle') {
      ctx.beginPath();
      ctx.moveTo(previewX, previewY - previewSize);
      ctx.lineTo(previewX + previewSize * 0.866, previewY + previewSize * 0.5);
      ctx.lineTo(previewX - previewSize * 0.866, previewY + previewSize * 0.5);
      ctx.closePath();
      ctx.fill();
    } else if (config.shapeType === 'square') {
      ctx.fillRect(previewX - previewSize, previewY - previewSize, previewSize * 2, previewSize * 2);
    }
  });
  
  // Draw start button
  startButton.x = centerX - startButton.width / 2;
  startButton.y = centerY + 150;
  
  ctx.fillStyle = selectedFighters.size >= 2 ? '#4CAF50' : '#666';
  ctx.fillRect(startButton.x, startButton.y, startButton.width, startButton.height);
  
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.strokeRect(startButton.x, startButton.y, startButton.width, startButton.height);
  
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('START BATTLE', centerX, startButton.y + startButton.height / 2);
  
  // Instruction
  if (selectedFighters.size < 2) {
    ctx.fillStyle = '#ff6b6b';
    ctx.font = '18px Arial';
    ctx.fillText('Select at least 2 fighters', centerX, startButton.y + startButton.height + 30);
  }
}

// Handle mouse clicks
canvas.addEventListener('click', (e) => {
  if (introState !== 'selection') return;
  
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  
  // Check checkbox clicks
  for (const checkbox of checkboxes) {
    if (mouseX >= checkbox.x && mouseX <= checkbox.x + checkbox.size &&
        mouseY >= checkbox.y && mouseY <= checkbox.y + checkbox.size) {
      if (selectedFighters.has(checkbox.id)) {
        selectedFighters.delete(checkbox.id);
      } else {
        selectedFighters.add(checkbox.id);
      }
      return;
    }
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

  // Clear canvas with black background
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const { arenaLeft, arenaTop } = getArenaBounds();

  // Draw arena (black square with white border)
  ctx.fillStyle = '#000';
  ctx.fillRect(arenaLeft, arenaTop, ARENA_SIZE, ARENA_SIZE);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = BORDER_WIDTH;
  ctx.strokeRect(arenaLeft, arenaTop, ARENA_SIZE, ARENA_SIZE);

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
    
    if (introTimer >= FIGHT_DURATION) {
      introState = 'battle';
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

  // Draw fighter names at top (vs format)
  const aliveFighters = fighters.filter(f => f.hp > 0);
  if (aliveFighters.length >= 2 && introState === 'battle') {
    const leftFighter = aliveFighters[0];
    const rightFighter = aliveFighters[1];
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`${leftFighter.name}`, arenaLeft, arenaTop - 40);
    
    ctx.textAlign = 'center';
    ctx.fillText('VS', canvas.width / 2, arenaTop - 40);
    
    ctx.textAlign = 'right';
    ctx.fillText(`${rightFighter.name}`, arenaLeft + ARENA_SIZE, arenaTop - 40);
  }

  requestAnimationFrame(gameLoop);
}

gameLoop();
