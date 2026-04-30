// Shape Arena - Physics-Based Battle Simulator
// Designed for spectating, not playing

const canvas = document.createElement('canvas');
canvas.style.display = 'block';
canvas.style.width = '100vw';
canvas.style.height = '100vh';
document.body.appendChild(canvas);

const ctx = canvas.getContext('2d');

// ── Audio System ──────────────────────────────────────────────────────────
const soundSprite = new Howl({
  src: ['https://cdn.jsdelivr.net/npm/@rse/soundfx@1.1.3/soundfx.data-sprite.mp3'],
  sprite: {
    // Circle sounds
    'circle_dash': [245000, 2343],
    'circle_spin': [242000, 1061],
    'circle_meteor_start': [173000, 6817],
    'circle_meteor_end': [54000, 2034],
    // Triangle sounds
    'triangle_pierce': [167000, 793],
    'triangle_charge': [212000, 854],
    'triangle_spike_start': [181000, 1718],
    'triangle_spike_end': [58000, 1472],
    // Square sounds
    'square_shield': [61000, 4304],
    'square_slam': [171000, 633],
    'square_slam_shockwave': [54000, 2034],
    'square_quake_start': [188000, 4000],
    'square_quake_pulse': [2813, 4000]
  },
  volume: 0.3
});

let audioEnabled = false;

function enableAudio() {
  if (!audioEnabled) {
    audioEnabled = true;
    soundSprite.play('circle_dash'); // Test sound
  }
}

function playSound(soundName) {
  if (audioEnabled) {
    soundSprite.play(soundName);
  }
}

// Enable audio on first user interaction
document.addEventListener('click', enableAudio, { once: true });
document.addEventListener('keydown', enableAudio, { once: true });
document.addEventListener('touchstart', enableAudio, { once: true });

// Arena configuration
let ARENA_SIZE = 800;
const BORDER_WIDTH = 2;

function updateArenaSize() {
  const minDimension = Math.min(window.innerWidth, window.innerHeight);
  ARENA_SIZE = Math.min(800, minDimension * 0.9);
}

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  updateArenaSize();
}
resize();
updateArenaSize();
window.addEventListener('resize', resize);

let introState = 'selection';
let introTimer = 0;
const READY_DURATION = 60;
const FIGHT_DURATION = 60;

let hitPauseTimer = 0;
const HIT_PAUSE_DURATION = 8;
let screenShake = { x: 0, y: 0, intensity: 0 };

const REPLAY_DURATION = 180;
let replayBuffer = [];
let replayIndex = 0;
let koTimer = 0;
const KO_PAUSE_DURATION = 120;

const FRICTION = 0.96;
const ELASTICITY = 0.8;
const GRAVITY = 0;
const MIN_SPEED = 4;
const DEFAULT_SPEED = 5;

// ── Particle system ──────────────────────────────────────────────────────────
const particles = [];

function spawnParticles(x, y, color, count, opts = {}) {
  for (let i = 0; i < count; i++) {
    const angle = opts.angle !== undefined
      ? opts.angle + (Math.random() - 0.5) * (opts.spread || Math.PI * 2)
      : Math.random() * Math.PI * 2;
    const speed = (opts.minSpeed || 1) + Math.random() * (opts.maxSpeed || 4);
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color: opts.colors ? opts.colors[Math.floor(Math.random() * opts.colors.length)] : color,
      life: 1,
      decay: (opts.minDecay || 0.02) + Math.random() * (opts.decayRange || 0.03),
      size: (opts.minSize || 2) + Math.random() * (opts.sizeRange || 4),
      shape: opts.shape || 'circle',
      glow: opts.glow || false,
      gravity: opts.gravity || 0,
      spin: (Math.random() - 0.5) * 0.3,
      rotation: Math.random() * Math.PI * 2,
      trail: opts.trail || false,
      trailPoints: []
    });
  }
}

function updateAndDrawParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += p.gravity;
    p.vx *= 0.97;
    p.vy *= 0.97;
    p.life -= p.decay;
    p.rotation += p.spin;

    if (p.trail) {
      p.trailPoints.push({ x: p.x, y: p.y });
      if (p.trailPoints.length > 8) p.trailPoints.shift();
    }

    if (p.life <= 0) { particles.splice(i, 1); continue; }

    ctx.save();
    ctx.globalAlpha = Math.min(p.life, 1);

    if (p.glow) {
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 12;
    }

    if (p.trail && p.trailPoints.length > 1) {
      ctx.strokeStyle = p.color;
      ctx.lineWidth = p.size * 0.5 * p.life;
      ctx.beginPath();
      ctx.moveTo(p.trailPoints[0].x, p.trailPoints[0].y);
      for (let tp of p.trailPoints) ctx.lineTo(tp.x, tp.y);
      ctx.stroke();
    }

    ctx.fillStyle = p.color;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    const s = p.size * p.life;

    switch (p.shape) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(0, 0, s, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'square':
        ctx.fillRect(-s, -s, s * 2, s * 2);
        break;
      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(0, -s); ctx.lineTo(s * 0.866, s * 0.5); ctx.lineTo(-s * 0.866, s * 0.5);
        ctx.closePath(); ctx.fill();
        break;
      case 'star': {
        ctx.beginPath();
        for (let k = 0; k < 5; k++) {
          const oa = (Math.PI * 2 / 5) * k - Math.PI / 2;
          const ia = oa + Math.PI / 5;
          if (k === 0) ctx.moveTo(Math.cos(oa) * s, Math.sin(oa) * s);
          else ctx.lineTo(Math.cos(oa) * s, Math.sin(oa) * s);
          ctx.lineTo(Math.cos(ia) * s * 0.4, Math.sin(ia) * s * 0.4);
        }
        ctx.closePath(); ctx.fill();
        break;
      }
      case 'ring':
        ctx.beginPath();
        ctx.arc(0, 0, s, 0, Math.PI * 2);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2;
        ctx.stroke();
        break;
      case 'spark':
        ctx.strokeStyle = p.color;
        ctx.lineWidth = s * 0.4;
        ctx.beginPath();
        ctx.moveTo(-s, 0); ctx.lineTo(s, 0);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, -s); ctx.lineTo(0, s);
        ctx.stroke();
        break;
    }
    ctx.restore();
  }
}

// ── Wall-bounce requirement system ───────────────────────────────────────────
// After hitting another fighter, must bounce a wall before dealing damage again
class Fighter {
  constructor(id, x, y, color, name, shapeType) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.radius = 35;
    this.baseMass = this.radius * this.radius;
    this.mass = this.baseMass;
    this.color = color;
    this.name = name;
    this.shapeType = shapeType;
    this.hp = 100;
    this.maxHp = 100;
    this.shield = 0; // Temporary shield HP
    this.target = null;
    this.ultimateCharge = 0;
    this.lastAttacker = null;

    // Wall-bounce requirement: after hitting a fighter, must wall-bounce before dealing damage
    this.needsWallBounce = false;
    this.wallBounceFlash = 0; // visual feedback when wall bounce resets damage

    this.cooldowns = { skill1: 0, skill2: 0, ultimate: 0 };
    this.activeEffects = [];
    this.trail = [];
    this.hitFlash = 0;
    this.abilityFlash = 0;
    this.collisionKnockbackCooldown = 0; // Prevents AI movement after collision knockback

    // Star-specific: speed stacking for Burst ability
    this.speedStacks = 0;
    this.maxSpeedStacks = 5;

    // Star-specific: impact crater zones for Beam ability
    this.impactCraters = [];

    // Shape-specific physics properties
    this.initShapePhysics();

    this.initPersonality();
  }

  initPersonality() {
    const basePersonalities = {
      circle:       { aggression:7,  mobility:8,  precision:6,  chaos:5, greed:6, fear:3, revenge:5, skillDiscipline:7 },
      triangle:     { aggression:8,  mobility:9,  precision:7,  chaos:4, greed:7, fear:2, revenge:6, skillDiscipline:8 },
      square:       { aggression:5,  mobility:4,  precision:8,  chaos:2, greed:4, fear:5, revenge:7, skillDiscipline:9 },
      oval:         { aggression:6,  mobility:10, precision:5,  chaos:4, greed:5, fear:4, revenge:4, skillDiscipline:6 },
      hexagon:      { aggression:4,  mobility:5,  precision:9,  chaos:3, greed:3, fear:6, revenge:8, skillDiscipline:8 },
      spiral:       { aggression:5,  mobility:7,  precision:4,  chaos:9, greed:5, fear:4, revenge:5, skillDiscipline:5 },
      rhombus:      { aggression:6,  mobility:6,  precision:7,  chaos:6, greed:8, fear:3, revenge:9, skillDiscipline:7 },
      star:         { aggression:10, mobility:7,  precision:5,  chaos:7, greed:9, fear:1, revenge:7, skillDiscipline:6 },
      heart:        { aggression:3,  mobility:8,  precision:6,  chaos:3, greed:2, fear:8, revenge:4, skillDiscipline:7 },
      diamond:      { aggression:7,  mobility:6,  precision:10, chaos:2, greed:6, fear:4, revenge:6, skillDiscipline:8 },
      crescent:     { aggression:6,  mobility:8,  precision:6,  chaos:5, greed:5, fear:5, revenge:5, skillDiscipline:6 },
      dodecahedron: { aggression:6,  mobility:6,  precision:7,  chaos:4, greed:5, fear:5, revenge:5, skillDiscipline:10 }
    };
    const base = basePersonalities[this.shapeType];
    this.personality = {};
    for (let stat in base) {
      const variation = 1 + (Math.random() * 0.1 - 0.05);
      this.personality[stat] = Math.max(1, Math.min(10, Math.round(base[stat] * variation)));
    }
  }

  initShapePhysics() {
    // Shape-specific physics: maxSpeed, wallBounceMultiplier, collisionRestitution
    // Lower values to reduce excessive bouncing for more engaging matches
    const shapePhysics = {
      circle:       { maxSpeed: 12, wallBounce: 0.8, collisionRestitution: 1.8 },
      triangle:     { maxSpeed: 15, wallBounce: 0.9, collisionRestitution: 2.0 }, // High mobility, fast
      square:       { maxSpeed: 8,  wallBounce: 0.7, collisionRestitution: 1.5 }, // Tank, slow
      oval:         { maxSpeed: 14, wallBounce: 0.8, collisionRestitution: 1.9 }, // Very fast
      hexagon:      { maxSpeed: 9,  wallBounce: 0.7, collisionRestitution: 1.6 }, // Precision, moderate
      spiral:       { maxSpeed: 11, wallBounce: 0.8, collisionRestitution: 1.9 }, // Chaotic, bouncy
      rhombus:      { maxSpeed: 10, wallBounce: 0.7, collisionRestitution: 1.8 },
      star:         { maxSpeed: 13, wallBounce: 0.9, collisionRestitution: 2.0 }, // Aggressive, fast
      heart:        { maxSpeed: 10, wallBounce: 0.7, collisionRestitution: 1.6 },
      diamond:      { maxSpeed: 9,  wallBounce: 0.7, collisionRestitution: 1.5 }, // Precision, controlled
      crescent:     { maxSpeed: 11, wallBounce: 0.7, collisionRestitution: 1.8 },
      dodecahedron: { maxSpeed: 8,  wallBounce: 0.6, collisionRestitution: 1.4 }  // Disciplined, slow
    };
    const physics = shapePhysics[this.shapeType] || { maxSpeed: 10, wallBounce: 0.8, collisionRestitution: 1.8 };
    this.maxSpeed = physics.maxSpeed;
    this.wallBounceMultiplier = physics.wallBounce;
    this.collisionRestitution = physics.collisionRestitution;
  }

  update(fighters) {
    // Update impact craters (Star-specific)
    this.impactCraters = this.impactCraters.filter(crater => {
      crater.duration--;
      return crater.duration > 0;
    });

    this.updateActiveEffects();
    if (this.cooldowns.skill1 > 0) this.cooldowns.skill1--;
    if (this.cooldowns.skill2 > 0) this.cooldowns.skill2--;
    if (this.cooldowns.ultimate > 0) this.cooldowns.ultimate--;
    if (this.abilityFlash > 0) this.abilityFlash--;
    if (this.wallBounceFlash > 0) this.wallBounceFlash--;

    this.vx *= FRICTION;
    this.vy *= FRICTION;

    // Decrement collision knockback cooldown
    if (this.collisionKnockbackCooldown > 0) this.collisionKnockbackCooldown--;

    // Clamp speed to shape-specific maxSpeed (unless velocityUncap is active or during knockback cooldown)
    const uncapEffect = this.activeEffects.find(e => e.type === 'velocityUncap');
    const slowEffect = this.activeEffects.find(e => e.type === 'slow');
    const effectiveMaxSpeed = slowEffect ? this.maxSpeed * (1 - slowEffect.value) : this.maxSpeed;
    if (!uncapEffect && this.collisionKnockbackCooldown === 0) {
      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      if (speed > effectiveMaxSpeed) {
        const scale = effectiveMaxSpeed / speed;
        this.vx *= scale;
        this.vy *= scale;
      }
    }

    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (speed > 3 && isFinite(this.x) && isFinite(this.y)) {
      this.trail.push({ x: this.x, y: this.y, alpha: 0.5 });
    }
    // Clean up invalid trail entries
    this.trail = this.trail.filter(t => isFinite(t.x) && isFinite(t.y));
    if (this.trail.length > 10) this.trail.shift();
    if (this.hitFlash > 0) this.hitFlash--;

    if (speed < MIN_SPEED && speed > 0) {
      const boost = (MIN_SPEED - speed) * 0.1;
      this.vx += (this.vx / speed) * boost;
      this.vy += (this.vy / speed) * boost;
    } else if (speed === 0) {
      const angle = Math.random() * Math.PI * 2;
      this.vx = Math.cos(angle) * MIN_SPEED;
      this.vy = Math.sin(angle) * MIN_SPEED;
    }

    let nearestDist = Infinity;
    this.target = null;
    for (let fighter of fighters) {
      if (fighter === this) continue;
      const dx = fighter.x - this.x;
      const dy = fighter.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      let effectiveDist = dist;
      if (this.personality.revenge > 5 && this.lastAttacker === fighter) {
        effectiveDist *= (1 - (this.personality.revenge - 5) / 20);
      }
      if (effectiveDist < nearestDist) {
        nearestDist = effectiveDist;
        this.target = fighter;
      }
    }

    const arenaLeft   = (canvas.width  - ARENA_SIZE) / 2;
    const arenaRight  = (canvas.width  + ARENA_SIZE) / 2;
    const arenaTop    = (canvas.height - ARENA_SIZE) / 2;
    const arenaBottom = (canvas.height + ARENA_SIZE) / 2;
    const wallMargin  = 80;

    let avoidX = 0, avoidY = 0;
    if (this.x - this.radius < arenaLeft   + wallMargin) avoidX += 1;
    if (this.x + this.radius > arenaRight  - wallMargin) avoidX -= 1;
    if (this.y - this.radius < arenaTop    + wallMargin) avoidY += 1;
    if (this.y + this.radius > arenaBottom - wallMargin) avoidY -= 1;

    if (this.target && this.target.hp > 0 && this.collisionKnockbackCooldown === 0) {
      const dx = this.target.x - this.x;
      const dy = this.target.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      this.makeAbilityDecision(dist, arenaLeft, arenaRight, arenaTop, arenaBottom);
      this.applyShapeBias(dx, dy, dist, arenaLeft, arenaRight, arenaTop, arenaBottom, avoidX, avoidY);

      const p = this.personality;
      const hpPercent = this.hp / this.maxHp;
      const fearThreshold = p.fear / 10;

      if (hpPercent < fearThreshold && p.fear > 3) {
        const retreatStrength = 0.6 * (fearThreshold - hpPercent + 0.1);
        this.vx -= (dx / dist) * retreatStrength;
        this.vy -= (dy / dist) * retreatStrength;
      } else {
        const greedBonus = p.greed / 10;
        const nearWall = avoidX !== 0 || avoidY !== 0;
        if (nearWall) {
          const avoidStrength = 0.8 * (1 + p.mobility / 20);
          this.vx += avoidX * avoidStrength;
          this.vy += avoidY * avoidStrength;
        } else {
          const pursueStrength = 0.4 * (1 + p.aggression / 20 + greedBonus * 0.3);
          let targetX = this.target.x;
          let targetY = this.target.y;
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
            const chaosOffset = (Math.random() - 0.5) * (p.chaos / 10) * 0.5;
            this.vx += (predDx / predDist) * pursueStrength + chaosOffset;
            this.vy += (predDy / predDist) * pursueStrength + chaosOffset;
          }
        }
      }
      if (p.skillDiscipline < 5 && Math.random() < (5 - p.skillDiscipline) / 100) {
        this.vx += (Math.random() - 0.5) * 2;
        this.vy += (Math.random() - 0.5) * 2;
      }
    } else {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const dx = centerX - this.x;
      const dy = centerY - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 0) { this.vx += (dx / dist) * 0.3; this.vy += (dy / dist) * 0.3; }
      this.vx += avoidX * 0.5;
      this.vy += avoidY * 0.5;
    }

    this.x += this.vx;
    this.y += this.vy;

    // Check for NaN/Infinity values and reset if found
    if (!isFinite(this.x) || !isFinite(this.y) || !isFinite(this.vx) || !isFinite(this.vy)) {
      this.x = (arenaLeft + arenaRight) / 2;
      this.y = (arenaTop + arenaBottom) / 2;
      this.vx = (Math.random() - 0.5) * 4;
      this.vy = (Math.random() - 0.5) * 4;
    }

    // Wall collision — clears needsWallBounce (must be before position clamping)
    const ricochetEffect = this.activeEffects.find(e => e.type === 'ricochet');
    const bounceMultiplier = ricochetEffect ? this.wallBounceMultiplier * 1.3 : this.wallBounceMultiplier;
    let hitWall = false;

    if (this.x - this.radius < arenaLeft) {
      this.x = arenaLeft + this.radius;
      this.vx *= -bounceMultiplier;
      if (!isFinite(this.vx) || Math.abs(this.vx) < MIN_SPEED) this.vx = this.vx > 0 ? MIN_SPEED : -MIN_SPEED;
      hitWall = true;
    }
    if (this.x + this.radius > arenaRight) {
      this.x = arenaRight - this.radius;
      this.vx *= -bounceMultiplier;
      if (!isFinite(this.vx) || Math.abs(this.vx) < MIN_SPEED) this.vx = this.vx > 0 ? MIN_SPEED : -MIN_SPEED;
      hitWall = true;
    }
    if (this.y - this.radius < arenaTop) {
      this.y = arenaTop + this.radius;
      this.vy *= -bounceMultiplier;
      if (!isFinite(this.vy) || Math.abs(this.vy) < MIN_SPEED) this.vy = this.vy > 0 ? MIN_SPEED : -MIN_SPEED;
      hitWall = true;
    }
    if (this.y + this.radius > arenaBottom) {
      this.y = arenaBottom - this.radius;
      this.vy *= -bounceMultiplier;
      if (!isFinite(this.vy) || Math.abs(this.vy) < MIN_SPEED) this.vy = this.vy > 0 ? MIN_SPEED : -MIN_SPEED;
      hitWall = true;
    }

    // Clamp position to arena bounds as safety net (after wall collision)
    this.x = Math.max(arenaLeft + this.radius, Math.min(arenaRight - this.radius, this.x));
    this.y = Math.max(arenaTop + this.radius, Math.min(arenaBottom - this.radius, this.y));

    if (hitWall && this.needsWallBounce) {
      this.needsWallBounce = false;
      this.wallBounceFlash = 20;
      // Spawn wall-bounce ready particles
      spawnParticles(this.x, this.y, this.color, 12, {
        minSpeed: 2, maxSpeed: 6, shape: 'spark', glow: true,
        minDecay: 0.04, decayRange: 0.04
      });
    }

    if (this.attackCooldown > 0) this.attackCooldown--;
  }

  updateActiveEffects() {
    this.activeEffects = this.activeEffects.filter(effect => {
      effect.duration--;
      if (effect.type === 'massMultiplier') {
        this.mass = this.baseMass * effect.value;
      } else if (effect.type === 'velocityCap') {
        // Skip velocity cap if velocityUncap is active
        const uncapEffect = this.activeEffects.find(e => e.type === 'velocityUncap');
        if (!uncapEffect) {
          const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
          if (isFinite(speed) && speed > effect.value) {
            const scale = effect.value / speed;
            this.vx *= scale; this.vy *= scale;
          }
        }
      } else if (effect.type === 'orbitalForce') {
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (isFinite(speed) && speed > 0) {
          const angle = Math.atan2(this.vy, this.vx);
          const perpAngle = angle + Math.PI / 2;
          this.vx += Math.cos(perpAngle) * effect.value;
          this.vy += Math.sin(perpAngle) * effect.value;
        }
      } else if (effect.type === 'speedBoost') {
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (isFinite(speed) && speed > 0) {
          this.vx *= (1 + effect.value * 0.01);
          this.vy *= (1 + effect.value * 0.01);
        }
      } else if (effect.type === 'chaosSpin') {
        const angle = Math.random() * Math.PI * 2;
        this.vx += Math.cos(angle) * effect.value;
        this.vy += Math.sin(angle) * effect.value;
      } else if (effect.type === 'regeneration') {
        if (this.hp < this.maxHp) this.hp = Math.min(this.maxHp, this.hp + effect.value);
      } else if (effect.type === 'curveForce') {
        if (this.vx !== 0 || this.vy !== 0) {
          const angle = Math.atan2(this.vy, this.vx);
          const curveAngle = angle + effect.value;
          const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
          if (isFinite(speed)) {
            this.vx = Math.cos(curveAngle) * speed;
            this.vy = Math.sin(curveAngle) * speed;
          }
        }
      } else if (effect.type === 'afterimageTrail') {
        // Afterimage trail: leave fake position copies
        if (Math.random() < 0.3 && isFinite(this.x) && isFinite(this.y)) {
          this.trail.push({ x: this.x, y: this.y, alpha: 0.7 });
        }
        if (this.trail.length > 20) this.trail.shift();
      } else if (effect.type === 'damageReduction') {
        // Damage reduction: reduces incoming damage (handled in collision)
      } else if (effect.type === 'slamShockwave') {
        // Slam shockwave: create shockwave when speed drops significantly
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed < 2 && !effect.shockwaveTriggered) {
          effect.shockwaveTriggered = true;
          // Create shockwave particles
          spawnParticles(this.x, this.y, this.color, 20, {
            minSpeed: 4, maxSpeed: 8, shape: 'ring', glow: true,
            minDecay: 0.03, decayRange: 0.02
          });
          playSound('square_slam_shockwave');
        }
      } else if (effect.type === 'quakePulse') {
        // Quake pulse: area knockback every 0.5s (30 frames)
        if (effect.duration % 30 === 0) {
          // Create pulse visual
          spawnParticles(this.x, this.y, this.color, 16, {
            minSpeed: 3, maxSpeed: 6, shape: 'ring', glow: true,
            minDecay: 0.04, decayRange: 0.02
          });
          playSound('square_quake_pulse');
        }
      } else if (effect.type === 'velocityUncap') {
        // Velocity uncapped: temporarily ignore speed limits
        // This effect doesn't modify velocity directly, it just allows higher speeds
        // The actual uncapping is handled by skipping velocity cap checks
      } else if (effect.type === 'invisibility') {
        // Invisibility: fighter becomes transparent and harder to hit
        // This effect doesn't modify velocity directly
        // The actual invisibility is handled in the draw method
      } else if (effect.type === 'ghostTrail') {
        // Ghost trail: leaves damaging echoes behind
        // Create ghost particles periodically
        if (effect.duration % 10 === 0) {
          const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
          if (speed > 3) {
            spawnParticles(this.x, this.y, this.color, 2, {
              minSpeed: 0, maxSpeed: 0, shape: 'ghost', glow: true,
              minDecay: 0.05, decayRange: 0.02
            });
          }
        }
      } else if (effect.type === 'slow') {
        // Slow: reduces movement speed
        // This effect doesn't modify velocity directly
        // The actual slowing is handled in the velocity cap checks
      } else if (effect.type === 'shieldConversion') {
        // Shield conversion: converts damage taken into temporary shield
        // This effect doesn't modify velocity directly
        // The actual conversion is handled in the collision damage logic
      } else if (effect.type === 'knockbackResistance') {
        // Knockback resistance: reduces knockback force
        // This effect doesn't modify velocity directly
        // The actual resistance is handled in the collision knockback logic
      } else if (effect.type === 'vortexPull') {
        // Vortex pull: pulls enemies toward a random direction
        // This effect doesn't modify velocity directly
        // The actual pulling is handled in the collision logic
      } else if (effect.type === 'chaosZone') {
        // Chaos zone: moving chaos zone that follows
        // This effect doesn't modify velocity directly
        // The actual chaos is handled in the collision logic
      } else if (effect.type === 'gravitySlow') {
        // Gravity slow: slows enemies being pulled
        // This effect doesn't modify velocity directly
        // The actual slowing is handled in the collision logic
      } else if (effect.type === 'gravitySlam') {
        // Gravity slam: converts attraction into slam detonation
        // This effect doesn't modify velocity directly
        // The actual slam is handled in the collision logic
      } else if (effect.type === 'explosivePulses') {
        // Nova: explosive knockback pulses every pulseInterval frames
        if (effect.duration % effect.value.pulseInterval === 0) {
          // Create pulse visual
          spawnParticles(this.x, this.y, '#ffaa00', 20, {
            minSpeed: 5, maxSpeed: 12, shape: 'ring', glow: true,
            minDecay: 0.03, decayRange: 0.02
          });
          spawnParticles(this.x, this.y, '#ff4400', 15, {
            minSpeed: 3, maxSpeed: 8, shape: 'star', glow: true,
            minDecay: 0.04, decayRange: 0.02
          });
          // Apply knockback to nearby fighters
          for (let fighter of fighters) {
            if (fighter === this) continue;
            const dx = fighter.x - this.x;
            const dy = fighter.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < effect.value.range && dist > 0) {
              const knockbackForce = effect.value.knockback * (1 - dist / effect.value.range);
              fighter.vx += (dx / dist) * knockbackForce;
              fighter.vy += (dy / dist) * knockbackForce;
            }
          }
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

  // ── Skill visuals ─────────────────────────────────────────────────────────
  triggerSkillVFX(skillKey) {
    const x = this.x, y = this.y, c = this.color;
    switch (this.shapeType) {

      case 'circle':
        if (skillKey === 'skill1') {
          // Dash: blue speed streaks
          spawnParticles(x, y, '#00ccff', 16, {
            angle: Math.atan2(-this.vy, -this.vx), spread: 0.6,
            minSpeed: 3, maxSpeed: 9, shape: 'circle', glow: true,
            minDecay: 0.03, decayRange: 0.03, trail: true
          });
        } else if (skillKey === 'skill2') {
          // Spin: cyan ring burst
          spawnParticles(x, y, '#00ffff', 24, {
            minSpeed: 2, maxSpeed: 6, shape: 'ring', glow: true,
            minDecay: 0.04, decayRange: 0.02
          });
        } else {
          // Orbital/Meteor: swirling rings
          for (let r = 20; r <= 60; r += 20) {
            spawnParticles(x, y, '#4488ff', 12, {
              minSpeed: 1, maxSpeed: 3, shape: 'ring', glow: true,
              minDecay: 0.02, decayRange: 0.02
            });
          }
          spawnParticles(x, y, '#ffffff', 30, {
            minSpeed: 4, maxSpeed: 10, shape: 'circle', glow: true,
            minDecay: 0.02, decayRange: 0.02
          });
        }
        break;

      case 'triangle':
        if (skillKey === 'skill1') {
          // Pierce: sharp orange triangles forward
          const fwdAngle = Math.atan2(this.vy, this.vx);
          spawnParticles(x, y, '#ff8800', 12, {
            angle: fwdAngle, spread: 0.5,
            minSpeed: 5, maxSpeed: 14, shape: 'triangle', glow: true,
            minDecay: 0.04, decayRange: 0.03
          });
        } else if (skillKey === 'skill2') {
          // Charge: yellow streaks sideways
          spawnParticles(x, y, '#ffff00', 18, {
            minSpeed: 3, maxSpeed: 8, shape: 'spark', glow: true,
            minDecay: 0.03, decayRange: 0.03
          });
        } else {
          // Spike ultimate: explosive triangle burst
          spawnParticles(x, y, '#ff4400', 30, {
            minSpeed: 6, maxSpeed: 16, shape: 'triangle', glow: true,
            minDecay: 0.02, decayRange: 0.02
          });
          spawnParticles(x, y, '#ffaa00', 20, {
            minSpeed: 3, maxSpeed: 8, shape: 'spark', glow: true,
            minDecay: 0.03, decayRange: 0.03
          });
        }
        break;

      case 'square':
        if (skillKey === 'skill1') {
          // Shield: blue square shards outward
          spawnParticles(x, y, '#3399ff', 14, {
            minSpeed: 2, maxSpeed: 6, shape: 'square', glow: true,
            minDecay: 0.03, decayRange: 0.02
          });
        } else if (skillKey === 'skill2') {
          // Slam: heavy dark squares + ground dust
          spawnParticles(x, y, '#8866ff', 20, {
            minSpeed: 1, maxSpeed: 5, shape: 'square', glow: false,
            gravity: 0.3, minDecay: 0.02, decayRange: 0.02
          });
          spawnParticles(x, y + this.radius, '#ffffff', 10, {
            angle: Math.PI / 2, spread: 1.2,
            minSpeed: 2, maxSpeed: 7, shape: 'circle', glow: false,
            minDecay: 0.05, decayRange: 0.03
          });
        } else {
          // Quake ultimate: massive square shockwave
          spawnParticles(x, y, '#ffffff', 40, {
            minSpeed: 5, maxSpeed: 15, shape: 'square', glow: true,
            minDecay: 0.015, decayRange: 0.02
          });
          spawnParticles(x, y, '#aa66ff', 20, {
            minSpeed: 2, maxSpeed: 6, shape: 'ring', glow: true,
            minDecay: 0.02, decayRange: 0.02
          });
        }
        break;

      case 'oval':
        if (skillKey === 'skill1') {
          // Speed: green streaks
          spawnParticles(x, y, '#00ff88', 18, {
            angle: Math.atan2(-this.vy, -this.vx), spread: 0.4,
            minSpeed: 4, maxSpeed: 12, shape: 'circle', glow: true,
            trail: true, minDecay: 0.03, decayRange: 0.03
          });
        } else if (skillKey === 'skill2') {
          // Drift: teal perpendicular wisps
          spawnParticles(x, y, '#00ffcc', 20, {
            minSpeed: 2, maxSpeed: 7, shape: 'circle', glow: true,
            minDecay: 0.04, decayRange: 0.03
          });
        } else {
          // Phase: ghostly translucent rings
          spawnParticles(x, y, '#88ffff', 30, {
            minSpeed: 1, maxSpeed: 5, shape: 'ring', glow: true,
            minDecay: 0.015, decayRange: 0.02
          });
          spawnParticles(x, y, '#ffffff', 15, {
            minSpeed: 3, maxSpeed: 8, shape: 'circle', glow: true,
            minDecay: 0.02, decayRange: 0.02
          });
        }
        break;

      case 'hexagon':
        if (skillKey === 'skill1') {
          // Orbit: spinning hex shards
          spawnParticles(x, y, '#00ccaa', 18, {
            minSpeed: 3, maxSpeed: 8, shape: 'circle', glow: true,
            minDecay: 0.03, decayRange: 0.02
          });
        } else if (skillKey === 'skill2') {
          // Hex defensive: outward shield hex
          spawnParticles(x, y, '#44ddbb', 24, {
            minSpeed: 2, maxSpeed: 5, shape: 'circle', glow: true,
            minDecay: 0.02, decayRange: 0.02
          });
        } else {
          // Burst ultimate: hex grid explosion
          spawnParticles(x, y, '#00ffaa', 40, {
            minSpeed: 4, maxSpeed: 14, shape: 'circle', glow: true,
            minDecay: 0.018, decayRange: 0.02
          });
          spawnParticles(x, y, '#ffffff', 15, {
            minSpeed: 6, maxSpeed: 12, shape: 'spark', glow: true,
            minDecay: 0.03, decayRange: 0.02
          });
        }
        break;

      case 'spiral':
        if (skillKey === 'skill1') {
          // Vortex: magenta swirling chaos
          spawnParticles(x, y, '#ff00ff', 25, {
            minSpeed: 2, maxSpeed: 10, shape: 'circle', glow: true,
            trail: true, minDecay: 0.03, decayRange: 0.03
          });
        } else if (skillKey === 'skill2') {
          // Warp teleport: bright flash then dissipation
          spawnParticles(x, y, '#ffffff', 30, {
            minSpeed: 5, maxSpeed: 12, shape: 'circle', glow: true,
            minDecay: 0.05, decayRange: 0.04
          });
          spawnParticles(x, y, '#ff44ff', 15, {
            minSpeed: 2, maxSpeed: 6, shape: 'ring', glow: true,
            minDecay: 0.04, decayRange: 0.03
          });
        } else {
          // Tornado ultimate: huge chaotic spiral
          spawnParticles(x, y, '#ff00ff', 50, {
            minSpeed: 3, maxSpeed: 14, shape: 'circle', glow: true,
            trail: true, minDecay: 0.015, decayRange: 0.02
          });
          spawnParticles(x, y, '#ffaaff', 20, {
            minSpeed: 6, maxSpeed: 16, shape: 'ring', glow: true,
            minDecay: 0.02, decayRange: 0.02
          });
        }
        break;

      case 'rhombus':
        if (skillKey === 'skill1') {
          // Heavy lure: yellow gravity rings
          spawnParticles(x, y, '#ffee00', 20, {
            minSpeed: 1, maxSpeed: 4, shape: 'ring', glow: true,
            minDecay: 0.015, decayRange: 0.02
          });
        } else if (skillKey === 'skill2') {
          // Counter thrust: orange forward burst
          spawnParticles(x, y, '#ff9900', 18, {
            angle: Math.atan2(this.vy, this.vx), spread: 0.5,
            minSpeed: 4, maxSpeed: 10, shape: 'circle', glow: true,
            trail: true, minDecay: 0.03, decayRange: 0.03
          });
        } else {
          // Impact ultimate: gold shockwave
          spawnParticles(x, y, '#ffdd00', 40, {
            minSpeed: 5, maxSpeed: 15, shape: 'star', glow: true,
            minDecay: 0.018, decayRange: 0.02
          });
          spawnParticles(x, y, '#ffffff', 20, {
            minSpeed: 3, maxSpeed: 8, shape: 'ring', glow: true,
            minDecay: 0.025, decayRange: 0.02
          });
        }
        break;

      case 'star':
        if (skillKey === 'skill1') {
          // Burst: flare explosions with star-shaped flashes
          const fwdAngle = Math.atan2(this.vy, this.vx);
          spawnParticles(x, y, '#ffaa00', 20, {
            angle: fwdAngle, spread: 0.8,
            minSpeed: 5, maxSpeed: 14, shape: 'star', glow: true,
            minDecay: 0.03, decayRange: 0.02
          });
          spawnParticles(x, y, '#ff4400', 15, {
            minSpeed: 3, maxSpeed: 8, shape: 'circle', glow: true,
            minDecay: 0.04, decayRange: 0.02
          });
        } else if (skillKey === 'skill2') {
          // Beam: impact crater creation visual
          spawnParticles(x, y, '#ff6600', 25, {
            minSpeed: 2, maxSpeed: 6, shape: 'ring', glow: true,
            minDecay: 0.02, decayRange: 0.02
          });
          spawnParticles(x, y, '#ffaa00', 20, {
            minSpeed: 4, maxSpeed: 10, shape: 'star', glow: true,
            minDecay: 0.03, decayRange: 0.02
          });
        } else {
          // Nova: explosive knockback pulses
          spawnParticles(x, y, '#ff4400', 40, {
            minSpeed: 6, maxSpeed: 16, shape: 'star', glow: true,
            minDecay: 0.02, decayRange: 0.02
          });
          spawnParticles(x, y, '#ffaa00', 30, {
            minSpeed: 4, maxSpeed: 12, shape: 'ring', glow: true,
            minDecay: 0.025, decayRange: 0.02
          });
          spawnParticles(x, y, '#ffffff', 25, {
            minSpeed: 8, maxSpeed: 18, shape: 'circle', glow: true,
            minDecay: 0.015, decayRange: 0.02
          });
        }
        break;

      case 'heart':
        if (skillKey === 'skill1') {
          // Heal: rising pink hearts/circles
          spawnParticles(x, y, '#ff66aa', 18, {
            angle: -Math.PI / 2, spread: 1.5,
            minSpeed: 1, maxSpeed: 5, shape: 'circle', glow: true,
            gravity: -0.05, minDecay: 0.02, decayRange: 0.03
          });
          spawnParticles(x, y, '#ffffff', 10, {
            minSpeed: 1, maxSpeed: 3, shape: 'ring', glow: true,
            minDecay: 0.03, decayRange: 0.02
          });
        } else if (skillKey === 'skill2') {
          // Pulse: pink concentric rings
          spawnParticles(x, y, '#ff44aa', 24, {
            minSpeed: 2, maxSpeed: 7, shape: 'ring', glow: true,
            minDecay: 0.025, decayRange: 0.025
          });
        } else {
          // Love ultimate: pink + white explosion + heal aura
          spawnParticles(x, y, '#ff3399', 40, {
            minSpeed: 3, maxSpeed: 12, shape: 'circle', glow: true,
            gravity: -0.05, minDecay: 0.015, decayRange: 0.02
          });
          spawnParticles(x, y, '#ffffff', 25, {
            minSpeed: 2, maxSpeed: 8, shape: 'ring', glow: true,
            minDecay: 0.02, decayRange: 0.02
          });
        }
        break;

      case 'diamond':
        if (skillKey === 'skill1') {
          // Reflect: cyan diamond shards
          spawnParticles(x, y, '#00ffff', 20, {
            minSpeed: 4, maxSpeed: 10, shape: 'square', glow: true,
            minDecay: 0.03, decayRange: 0.03
          });
        } else if (skillKey === 'skill2') {
          // Refract: rainbow spark burst
          spawnParticles(x, y, '#00ffff', 8, { minSpeed:3, maxSpeed:9, shape:'spark', glow:true, minDecay:0.04, decayRange:0.03 });
          spawnParticles(x, y, '#ff00ff', 8, { minSpeed:3, maxSpeed:9, shape:'spark', glow:true, minDecay:0.04, decayRange:0.03 });
          spawnParticles(x, y, '#ffff00', 8, { minSpeed:3, maxSpeed:9, shape:'spark', glow:true, minDecay:0.04, decayRange:0.03 });
        } else {
          // Prism ultimate: massive rainbow explosion
          const rainbowColors = ['#ff0000','#ff8800','#ffff00','#00ff00','#0088ff','#8800ff'];
          for (let rc of rainbowColors) {
            spawnParticles(x, y, rc, 10, {
              minSpeed: 5, maxSpeed: 15, shape: 'square', glow: true,
              minDecay: 0.015, decayRange: 0.02
            });
          }
          spawnParticles(x, y, '#ffffff', 25, {
            minSpeed: 3, maxSpeed: 10, shape: 'ring', glow: true,
            minDecay: 0.02, decayRange: 0.02
          });
        }
        break;

      case 'crescent':
        if (skillKey === 'skill1') {
          // Slice: curved arc of silver sparks
          const sliceAngle = Math.atan2(this.vy, this.vx);
          for (let i = -4; i <= 4; i++) {
            spawnParticles(
              x + Math.cos(sliceAngle + Math.PI / 2) * i * 6,
              y + Math.sin(sliceAngle + Math.PI / 2) * i * 6,
              '#aaddff', 3, {
                angle: sliceAngle, spread: 0.4,
                minSpeed: 4, maxSpeed: 10, shape: 'circle', glow: true,
                minDecay: 0.04, decayRange: 0.03
              });
          }
        } else if (skillKey === 'skill2') {
          // Moon phase: blue orbs
          spawnParticles(x, y, '#4488ff', 20, {
            minSpeed: 4, maxSpeed: 8, shape: 'circle', glow: true,
            minDecay: 0.015, decayRange: 0.02
          });
        } else {
          // Eclipse ultimate: dark + blue burst
          spawnParticles(x, y, '#0033ff', 35, {
            minSpeed: 5, maxSpeed: 14, shape: 'circle', glow: true,
            trail: true, minDecay: 0.015, decayRange: 0.02
          });
          spawnParticles(x, y, '#8833ff', 20, {
            minSpeed: 3, maxSpeed: 8, shape: 'ring', glow: true,
            minDecay: 0.02, decayRange: 0.02
          });
          spawnParticles(x, y, '#ffffff', 15, {
            minSpeed: 6, maxSpeed: 12, shape: 'spark', glow: true,
            minDecay: 0.03, decayRange: 0.02
          });
        }
        break;

      case 'dodecahedron':
        if (skillKey === 'skill1') {
          // Adapt: multi-color geometric burst
          spawnParticles(x, y, '#33ff8c', 20, {
            minSpeed: 2, maxSpeed: 7, shape: 'circle', glow: true,
            minDecay: 0.025, decayRange: 0.025
          });
          spawnParticles(x, y, '#ffffff', 10, {
            minSpeed: 3, maxSpeed: 6, shape: 'square', glow: true,
            minDecay: 0.04, decayRange: 0.03
          });
        } else if (skillKey === 'skill2') {
          // Face shift: prismatic panels
          spawnParticles(x, y, '#33ff8c', 12, { minSpeed:2, maxSpeed:6, shape:'square', glow:true, minDecay:0.03, decayRange:0.03 });
          spawnParticles(x, y, '#88ffaa', 12, { minSpeed:3, maxSpeed:8, shape:'circle', glow:true, minDecay:0.03, decayRange:0.03 });
        } else {
          // Transform ultimate: full spectrum explosion
          const colors = ['#33ff8c','#00ffff','#8800ff','#ffff00','#ff4400'];
          for (let cc of colors) {
            spawnParticles(x, y, cc, 12, {
              minSpeed: 4, maxSpeed: 14, shape: 'circle', glow: true,
              minDecay: 0.015, decayRange: 0.02
            });
          }
          spawnParticles(x, y, '#ffffff', 20, {
            minSpeed: 3, maxSpeed: 9, shape: 'ring', glow: true,
            minDecay: 0.02, decayRange: 0.02
          });
        }
        break;
    }
  }

  useSkill1() {
    this.triggerSkillVFX('skill1');
    if (this.shapeType === 'circle') {
      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      if (speed > 0) { 
        // Dash scales harder with current speed - reward momentum
        const speedMultiplier = 1.5 + (speed / 10); // 1.5x to 2.5x based on speed
        this.vx *= speedMultiplier; 
        this.vy *= speedMultiplier; 
        this.addEffect('momentumBoost', 1, 30); 
      }
      this.cooldowns.skill1 = 120;
      playSound('circle_dash');
    } else if (this.shapeType === 'triangle') {
      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      const executeThreshold = 10; // High speed threshold for execute bonus
      if (this.target) {
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0) {
          // Execute bonus: higher force at high speed
          const force = speed > executeThreshold ? 18 : 12;
          this.vx += (dx / dist) * force;
          this.vy += (dy / dist) * force;
          if (speed > executeThreshold) {
            this.addEffect('executeBoost', 1, 60); // Execute bonus for 1 second
          }
        }
      }
      this.cooldowns.skill1 = 150;
      playSound('triangle_pierce');
    } else if (this.shapeType === 'square') {
      this.addEffect('damageReduction', 0.5, 120); // 50% damage reduction for 2 seconds
      this.cooldowns.skill1 = 150;
      playSound('square_shield');
    } else if (this.shapeType === 'oval') {
      // Speed: exceed normal speed caps briefly
      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      if (speed > 0) {
        this.vx *= 1.8; this.vy *= 1.8;
        this.addEffect('velocityUncap', 1, 90); // Remove velocity cap for 1.5 seconds
      }
      this.cooldowns.skill1 = 120;
    } else if (this.shapeType === 'hexagon') {
      // Orbit: precision strike that applies slow to enemy
      if (this.target) {
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0) {
          this.vx += (dx / dist) * 8; this.vy += (dy / dist) * 8;
          this.addEffect('predictionBoost', 1, 60);
          // Apply slow to target
          this.target.addEffect('slow', 0.5, 90); // 50% speed reduction for 1.5 seconds
        }
      }
      this.cooldowns.skill1 = 130;
    } else if (this.shapeType === 'spiral') {
      // Vortex: pulls enemies slightly toward random direction
      const pullAngle = Math.random() * Math.PI * 2;
      const pullForce = 5;
      this.vx += Math.cos(pullAngle) * 8; this.vy += Math.sin(pullAngle) * 8;
      this.addEffect('chaosSpin', 2, 30);
      // Store pull data for effect processing
      this.addEffect('vortexPull', { angle: pullAngle, force: pullForce }, 60);
      this.cooldowns.skill1 = 90;
    } else if (this.shapeType === 'rhombus') {
      // Heavy: stronger pull + slow effect
      this.addEffect('attraction', 250, 120); // Stronger pull range (250px) for 2 seconds
      this.addEffect('gravitySlow', 0.4, 120); // 40% slow to pulled enemies for 2 seconds
      this.cooldowns.skill1 = 140;
    } else if (this.shapeType === 'star') {
      // Burst: gains stacking speed per hit (consumes stacks for burst)
      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      const stackBonus = 1 + (this.speedStacks * 0.15); // 15% bonus per stack
      if (speed > 0) {
        this.vx *= 2.0 * stackBonus;
        this.vy *= 2.0 * stackBonus;
      }
      this.speedStacks = 0; // Consume stacks on use
      this.cooldowns.skill1 = 110;
    } else if (this.shapeType === 'heart') {
      const angle = Math.atan2(this.vy, this.vx);
      this.vx = Math.cos(angle) * 6; this.vy = Math.sin(angle) * 6; this.cooldowns.skill1 = 95;
    } else if (this.shapeType === 'diamond') {
      if (this.target) {
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0) {
          const predX = this.target.x + this.target.vx * 8;
          const predY = this.target.y + this.target.vy * 8;
          const predDx = predX - this.x; const predDy = predY - this.y;
          const predDist = Math.sqrt(predDx * predDx + predDy * predDy);
          if (predDist > 0) { this.vx += (predDx / predDist) * 10; this.vy += (predDy / predDist) * 10; }
        }
      }
      this.cooldowns.skill1 = 120;
    } else if (this.shapeType === 'crescent') {
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
      const stat = ['aggression','mobility','precision'][Math.floor(Math.random() * 3)];
      this.personality[stat] = Math.min(10, this.personality[stat] + 2);
      this.addEffect('adaptiveStats', 1, 180); this.cooldowns.skill1 = 150;
    }
  }

  useSkill2(arenaLeft, arenaRight, arenaTop, arenaBottom) {
    this.triggerSkillVFX('skill2');
    if (this.shapeType === 'circle') {
      const wallMargin = 100;
      const nearWall = this.x - this.radius < arenaLeft + wallMargin ||
                       this.x + this.radius > arenaRight - wallMargin ||
                       this.y - this.radius < arenaTop + wallMargin ||
                       this.y + this.radius > arenaBottom - wallMargin;
      if (nearWall) {
        // Targeted ricochet: bounce toward nearest enemy
        let targetAngle = Math.atan2(-this.vy, -this.vx); // Default: bounce back
        if (this.target && this.target.hp > 0) {
          const dx = this.target.x - this.x;
          const dy = this.target.y - this.y;
          targetAngle = Math.atan2(dy, dx);
        }
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        this.vx = Math.cos(targetAngle) * speed * 1.3;
        this.vy = Math.sin(targetAngle) * speed * 1.3;
        this.addEffect('predictionBoost', 1, 45); // Lock onto target briefly
      }
      this.cooldowns.skill2 = 90;
      playSound('circle_spin');
    } else if (this.shapeType === 'triangle') {
      // Charge: leaves afterimage trail (fake direction bait)
      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      if (speed > 0) {
        const angle = Math.atan2(this.vy, this.vx);
        const perpAngle = angle + Math.PI / 2;
        this.vx += Math.cos(perpAngle) * 8; this.vy += Math.sin(perpAngle) * 8;
      }
      this.addEffect('afterimageTrail', 1, 90); // Afterimage trail for 1.5 seconds
      this.cooldowns.skill2 = 100;
      playSound('triangle_charge');
    } else if (this.shapeType === 'square') {
      this.addEffect('slamShockwave', 1, 60); // Slam effect for 1 second
      this.cooldowns.skill2 = 120;
      playSound('square_slam');
    } else if (this.shapeType === 'oval') {
      // Drift: gains invisibility frames during lateral movement
      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      if (speed > 0) {
        const angle = Math.atan2(this.vy, this.vx);
        const driftAngle = angle + Math.PI / 2;
        this.vx += Math.cos(driftAngle) * 6; this.vy += Math.sin(driftAngle) * 6;
        this.addEffect('invisibility', 1, 60); // Invisibility for 1 second
      }
      this.cooldowns.skill2 = 100;
    } else if (this.shapeType === 'hexagon') {
      // Hex: converts damage taken into temporary shield
      this.addEffect('shieldConversion', 0.5, 120); // 50% damage conversion to shield for 2 seconds
      this.cooldowns.skill2 = 110;
    } else if (this.shapeType === 'spiral') {
      // Curve: multi-blink (2 small teleports)
      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      if (speed > 0) {
        const angle = Math.atan2(this.vy, this.vx);
        // First blink
        this.x += Math.cos(angle) * 50; this.y += Math.sin(angle) * 50;
        // Second blink (random direction offset)
        const offsetAngle = angle + (Math.random() - 0.5) * Math.PI;
        this.x += Math.cos(offsetAngle) * 30; this.y += Math.sin(offsetAngle) * 30;
      }
      this.cooldowns.skill2 = 130;
    } else if (this.shapeType === 'rhombus') {
      // Boost: gains bonus speed toward pulled enemies
      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      if (speed > 0) { this.vx *= 1.6; this.vy *= 1.6; }
      // Add gravity attraction boost toward nearest enemy
      if (this.target && this.target.hp > 0) {
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0) {
          this.vx += (dx / dist) * 6; this.vy += (dy / dist) * 6;
        }
      }
      this.cooldowns.skill2 = 95;
    } else if (this.shapeType === 'star') {
      // Beam: leaves impact crater (temporary slow zone)
      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      if (speed > 0) {
        const angle = Math.atan2(this.vy, this.vx);
        this.vx += Math.cos(angle) * 10;
        this.vy += Math.sin(angle) * 10;
      }
      // Create impact crater at current position
      this.impactCraters.push({
        x: this.x,
        y: this.y,
        radius: 80,
        slowAmount: 0.5,
        duration: 180, // 3 seconds
        maxDuration: 180
      });
      this.cooldowns.skill2 = 115;
    } else if (this.shapeType === 'heart') {
      this.addEffect('massMultiplier', 2, 75); this.cooldowns.skill2 = 100;
    } else if (this.shapeType === 'diamond') {
      if (this.vx !== 0 || this.vy !== 0) {
        const angle = Math.atan2(this.vy, this.vx);
        const newAngle = angle + (Math.random() - 0.5) * 1.5;
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        this.vx = Math.cos(newAngle) * speed; this.vy = Math.sin(newAngle) * speed;
      }
      this.cooldowns.skill2 = 90;
    } else if (this.shapeType === 'crescent') {
      const phase = Math.sin(Date.now() / 500);
      this.addEffect('massMultiplier', 1.5 + phase * 0.5, 60); this.cooldowns.skill2 = 100;
    } else if (this.shapeType === 'dodecahedron') {
      this.addEffect('massMultiplier', 1.8, 80);
      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      if (speed > 0) { this.vx *= 1.2; this.vy *= 1.2; }
      this.cooldowns.skill2 = 125;
    }
  }

  useUltimate() {
    this.triggerSkillVFX('ultimate');
    if (this.shapeType === 'circle') {
      // Gravity Ring Trap: controlled orbit zone that pulls and traps enemies
      this.addEffect('gravityRingTrap', 250, 180); // 250px range, 3 second duration
      playSound('circle_meteor_start');
    } else if (this.shapeType === 'triangle') {
      // Spike: removes velocity cap temporarily (all-in burst, high risk)
      this.addEffect('velocityUncap', 1, 120); // Remove velocity cap for 2 seconds
      playSound('triangle_spike_start');
    } else if (this.shapeType === 'square') {
      this.addEffect('quakePulse', 1, 180); // Area knockback pulse for 3 seconds
      playSound('square_quake_start');
    } else if (this.shapeType === 'oval') {
      // Phase: leaves ghost trail that damages enemies
      this.addEffect('ghostTrail', 1, 180); // Ghost trail for 3 seconds
      this.vx *= 1.5; this.vy *= 1.5;
    } else if (this.shapeType === 'hexagon') {
      // Burst: emits protective field reducing knockback
      this.addEffect('knockbackResistance', 0.7, 180); // 70% knockback reduction for 3 seconds
      this.vx *= 0.3; this.vy *= 0.3;
    } else if (this.shapeType === 'spiral') {
      // Tornado: creates moving chaos zone that follows you
      this.addEffect('chaosZone', { range: 120, force: 3 }, 180); // Chaos zone for 3 seconds
      this.addEffect('speedBoost', 25, 180);
    } else if (this.shapeType === 'rhombus') {
      // Impact: converts attraction into slam detonation
      this.addEffect('gravitySlam', { range: 150, damage: 15, knockback: 12 }, 120); // Gravity slam for 2 seconds
      this.vx *= 1.8; this.vy *= 1.8;
    } else if (this.shapeType === 'star') {
      // Nova: explosive knockback pulses
      this.vx *= 2.5; this.vy *= 2.5;
      this.addEffect('explosivePulses', { range: 150, knockback: 8, pulseInterval: 30 }, 180); // 3 seconds of pulses
      this.addEffect('speedBoost', 25, 120);
      this.addEffect('massMultiplier', 1.5, 120);
    } else if (this.shapeType === 'heart') {
      this.hp = Math.min(this.maxHp, this.hp + 30);
      this.addEffect('regeneration', 0.5, 180); this.addEffect('speedBoost', 20, 180);
    } else if (this.shapeType === 'diamond') {
      this.addEffect('predictionBoost', 2, 150); this.addEffect('velocityCap', 20, 150);
    } else if (this.shapeType === 'crescent') {
      this.vx *= 2.0; this.vy *= 2.0;
      this.addEffect('curveForce', 0.1, 150); this.addEffect('speedBoost', 20, 150);
    } else if (this.shapeType === 'dodecahedron') {
      this.personality.aggression = Math.min(10, this.personality.aggression + 3);
      this.personality.mobility   = Math.min(10, this.personality.mobility   + 3);
      this.personality.precision  = Math.min(10, this.personality.precision  + 3);
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
    const chaosFactor = p.chaos / 10;
    const rand = Math.random();
    const baseChance = 0.02 * (1 + chaosFactor * 0.5);
    const ultimateChance = 0.01 * (1 + p.skillDiscipline / 20);

    if (this.ultimateCharge >= 10 && this.cooldowns.ultimate === 0 && rand < ultimateChance) {
      this.useUltimate(); return;
    }
    if (this.cooldowns.skill1 === 0 && rand < baseChance) {
      const aggressionBonus = p.aggression / 10;
      if (this.shapeType === 'circle' && speed > 5 * (1 - p.mobility / 20)) this.useSkill1();
      else if (this.shapeType === 'triangle' && distToTarget > 150 * (1 - p.greed / 20)) this.useSkill1();
      else if (this.shapeType === 'square' && rand < 0.5 * aggressionBonus) this.useSkill1();
      else if (this.shapeType === 'oval' && speed < 8) this.useSkill1();
      else if (this.shapeType === 'hexagon' && distToTarget < 80) this.useSkill1();
      else if (this.shapeType === 'spiral' && rand < 0.03) this.useSkill1();
      else if (this.shapeType === 'rhombus' && distToTarget > 120) this.useSkill1();
      else if (this.shapeType === 'star' && distToTarget < 200) this.useSkill1();
      else if (this.shapeType === 'heart' && this.hp < 50) this.useSkill1();
      else if (this.shapeType === 'diamond' && distToTarget > 100) this.useSkill1();
      else if (this.shapeType === 'crescent' && rand < 0.025) this.useSkill1();
      else if (this.shapeType === 'dodecahedron' && rand < 0.015) this.useSkill1();
    }
    if (this.cooldowns.skill2 === 0 && rand < baseChance) {
      if (this.shapeType === 'circle') this.useSkill2(arenaLeft, arenaRight, arenaTop, arenaBottom);
      else if (this.shapeType === 'triangle' && distToTarget < 100 * (1 + p.greed / 10)) this.useSkill2(arenaLeft, arenaRight, arenaTop, arenaBottom);
      else if (this.shapeType === 'square' && speed > 6 * (1 - p.fear / 20)) this.useSkill2(arenaLeft, arenaRight, arenaTop, arenaBottom);
      else if (['oval','hexagon','spiral','rhombus','star','heart','diamond','crescent','dodecahedron'].includes(this.shapeType)) this.useSkill2(arenaLeft, arenaRight, arenaTop, arenaBottom);
    }
  }

  applyShapeBias(dx, dy, dist, arenaLeft, arenaRight, arenaTop, arenaBottom, avoidX, avoidY) {
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    switch (this.shapeType) {
      case 'circle':
        if (avoidX !== 0 || avoidY !== 0) { this.vx += avoidX * 0.3; this.vy += avoidY * 0.3; } break;
      case 'triangle':
        if (dist < 100 && speed > 5) { this.vx -= dx / dist * 0.5; this.vy -= dy / dist * 0.5; } break;
      case 'square':
        if (avoidX !== 0 || avoidY !== 0) { this.vx -= avoidX * 0.2; this.vy -= avoidY * 0.2; } break;
      case 'oval':
        if (speed < 6) { const a = Math.atan2(this.vy, this.vx); this.vx += Math.cos(a) * 0.3; this.vy += Math.sin(a) * 0.3; } break;
      case 'hexagon':
        if (dist < 120) { this.vx -= dx / dist * 0.3; this.vy -= dy / dist * 0.3; } break;
      case 'spiral':
        if (Math.random() < 0.05) { const a = Math.random() * Math.PI * 2; this.vx += Math.cos(a) * 1.5; this.vy += Math.sin(a) * 1.5; } break;
      case 'rhombus':
        if (dist > 150) { this.vx += dx / dist * 0.2; this.vy += dy / dist * 0.2; } break;
      case 'star':
        this.vx += dx / dist * 0.3; this.vy += dy / dist * 0.3; break;
      case 'heart':
        if (this.hp < 60) { this.vx -= dx / dist * 0.4; this.vy -= dy / dist * 0.4; } break;
      case 'diamond':
        if (this.target) {
          const predX = this.target.x + this.target.vx * 5;
          const predY = this.target.y + this.target.vy * 5;
          const predDx = predX - this.x; const predDy = predY - this.y;
          const predDist = Math.sqrt(predDx * predDx + predDy * predDy);
          if (predDist > 0) { this.vx += (predDx / predDist) * 0.2; this.vy += (predDy / predDist) * 0.2; }
        } break;
      case 'crescent':
        if (speed > 0) { const a = Math.atan2(this.vy, this.vx); this.vx += Math.cos(a + 0.1) * 0.15; this.vy += Math.sin(a + 0.1) * 0.15; } break;
      case 'dodecahedron':
        if (this.hp < 50) this.personality.aggression = Math.min(10, this.personality.aggression + 0.01); break;
    }
  }

  draw() {
    // Wall-bounce required indicator: pulsing grey ring
    if (this.needsWallBounce) {
      const pulse = 0.4 + Math.sin(Date.now() / 80) * 0.3;
      ctx.save();
      ctx.globalAlpha = pulse;
      ctx.strokeStyle = '#888888';
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius + 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // Wall-bounce cleared flash: bright green ring burst
    if (this.wallBounceFlash > 0) {
      ctx.save();
      ctx.globalAlpha = this.wallBounceFlash / 20;
      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#00ff88';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius + 14 + (20 - this.wallBounceFlash) * 0.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Draw impact craters (Star-specific)
    for (const crater of this.impactCraters) {
      const alpha = crater.duration / crater.maxDuration;
      ctx.save();
      ctx.globalAlpha = alpha * 0.3;
      ctx.fillStyle = '#ff6600';
      ctx.shadowColor = '#ffaa00';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(crater.x, crater.y, crater.radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Crater rim
      ctx.globalAlpha = alpha * 0.5;
      ctx.strokeStyle = '#ffaa00';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(crater.x, crater.y, crater.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Active effect overlays
    for (const effect of this.activeEffects) {
      if (effect.type === 'speedBoost') {
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
        ctx.save();
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(this.x, this.y, effect.value, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (effect.type === 'phaseShift') {
        ctx.save();
        ctx.globalAlpha = 0.3;
        this.drawShape(this.x + (Math.random() - 0.5) * 10, this.y + (Math.random() - 0.5) * 10, this.radius, this.color, 0.5);
        ctx.restore();
      } else if (effect.type === 'regeneration') {
        ctx.save();
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = '#00ff00';
        const healSize = this.radius + 5 + Math.sin(Date.now() / 100) * 3;
        ctx.beginPath();
        ctx.arc(this.x, this.y, healSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (effect.type === 'adaptiveStats') {
        ctx.save();
        ctx.globalAlpha = 0.3;
        const hue = (Date.now() / 20) % 360;
        ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`;
        ctx.lineWidth = 3;
        this.drawShapeOutline(this.x, this.y, this.radius + 10, `hsl(${hue}, 100%, 50%)`, 3);
        ctx.restore();
      } else if (effect.type === 'massMultiplier' && effect.value >= 3) {
        // Heavy mass: dark pulsing aura
        ctx.save();
        ctx.globalAlpha = 0.25 + Math.sin(Date.now() / 60) * 0.1;
        ctx.fillStyle = '#330055';
        ctx.shadowColor = '#8800ff';
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (effect.type === 'orbitalForce') {
        // Circle orbital: spinning ring
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = '#4488ff';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#4488ff';
        ctx.shadowBlur = 12;
        const orbitAngle = Date.now() / 100;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + 12, orbitAngle, orbitAngle + Math.PI * 1.4);
        ctx.stroke();
        ctx.restore();
      } else if (effect.type === 'gravityRingTrap') {
        // Gravity Ring Trap: multiple orbit layers
        ctx.save();
        ctx.globalAlpha = 0.4;
        ctx.shadowColor = '#8844ff';
        ctx.shadowBlur = 15;
        const layers = 3;
        for (let l = 0; l < layers; l++) {
          const radius = this.radius + 20 + (l * 25);
          const angle = Date.now() / (150 + l * 50) + (l * Math.PI / 3);
          ctx.strokeStyle = l === 0 ? '#8844ff' : l === 1 ? '#aa66ff' : '#cc88ff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(this.x, this.y, radius, angle, angle + Math.PI * 1.2);
          ctx.stroke();
        }
        // Inner glow
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = '#8844ff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, effect.value, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (effect.type === 'predictionBoost') {
        // Diamond sight lines: target prediction arrow
        if (this.target) {
          ctx.save();
          ctx.globalAlpha = 0.4;
          ctx.strokeStyle = '#00ffff';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(this.x, this.y);
          ctx.lineTo(this.target.x + this.target.vx * 8, this.target.y + this.target.vy * 8);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.restore();
        }
      } else if (effect.type === 'velocityCap') {
        // Triangle velocity cap: lightning arc
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#ffff00';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      } else if (effect.type === 'curveForce') {
        // Crescent curve trail
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = '#8833ff';
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
      } else if (effect.type === 'damageReduction') {
        // Square Shield: blue protective aura
        ctx.save();
        ctx.globalAlpha = 0.35;
        ctx.strokeStyle = '#3399ff';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#3399ff';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      } else if (effect.type === 'invisibility') {
        // Oval Drift: transparency effect
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = '#cc66ff';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#cc66ff';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, this.radius * 1.3, this.radius * 0.8, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      } else if (effect.type === 'ghostTrail') {
        // Oval Phase: ghost trail aura
        ctx.save();
        ctx.globalAlpha = 0.25;
        ctx.strokeStyle = '#ff66ff';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#ff66ff';
        ctx.shadowBlur = 25;
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, this.radius * 1.5, this.radius * 1.0, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      } else if (effect.type === 'slamShockwave') {
        // Square Slam: charging indicator
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed >= 2) {
          ctx.save();
          ctx.globalAlpha = 0.4;
          ctx.fillStyle = '#8866ff';
          ctx.shadowColor = '#8866ff';
          ctx.shadowBlur = 12;
          const pulseSize = this.radius + 5 + Math.sin(Date.now() / 50) * 3;
          ctx.fillRect(this.x - pulseSize, this.y - pulseSize, pulseSize * 2, pulseSize * 2);
          ctx.restore();
        }
      } else if (effect.type === 'quakePulse') {
        // Square Quake: fortress aura
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = '#aa66ff';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#aa66ff';
        ctx.shadowBlur = 20;
        const pulseSize = this.radius + 15 + Math.sin(Date.now() / 80) * 5;
        ctx.strokeRect(this.x - pulseSize, this.y - pulseSize, pulseSize * 2, pulseSize * 2);
        ctx.restore();
      } else if (effect.type === 'slow') {
        // Hexagon Orbit slow: cyan frost effect
        ctx.save();
        ctx.globalAlpha = 0.25;
        ctx.strokeStyle = '#00ccff';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#00ccff';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      } else if (effect.type === 'shieldConversion') {
        // Hexagon Hex: green shield conversion aura
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + 10, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      } else if (effect.type === 'knockbackResistance') {
        // Hexagon Burst: protective field
        ctx.save();
        ctx.globalAlpha = 0.35;
        ctx.strokeStyle = '#00ffaa';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#00ffaa';
        ctx.shadowBlur = 25;
        const pulseSize = this.radius + 12 + Math.sin(Date.now() / 60) * 4;
        ctx.beginPath();
        ctx.arc(this.x, this.y, pulseSize, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      } else if (effect.type === 'vortexPull') {
        // Spiral Vortex: swirling pull effect
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = '#aa44ff';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#cc66ff';
        ctx.shadowBlur = 20;
        const vortexRadius = this.radius + 20 + Math.sin(Date.now() / 100) * 5;
        ctx.beginPath();
        ctx.arc(this.x, this.y, vortexRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      } else if (effect.type === 'chaosZone') {
        // Spiral Tornado: chaos zone aura
        ctx.save();
        ctx.globalAlpha = 0.4;
        ctx.strokeStyle = '#ff4444';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#ff6666';
        ctx.shadowBlur = 30;
        const chaosRadius = this.radius + 30 + Math.sin(Date.now() / 80) * 8;
        ctx.beginPath();
        ctx.arc(this.x, this.y, chaosRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      } else if (effect.type === 'gravitySlow') {
        // Rhombus Heavy: gravity slow aura
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = '#8844ff';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#aa66ff';
        ctx.shadowBlur = 20;
        const slowRadius = this.radius + 15 + Math.sin(Date.now() / 100) * 5;
        ctx.beginPath();
        ctx.arc(this.x, this.y, slowRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      } else if (effect.type === 'gravitySlam') {
        // Rhombus Impact: gravity slam detonation aura
        ctx.save();
        ctx.globalAlpha = 0.4;
        ctx.strokeStyle = '#ff4444';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#ff6666';
        ctx.shadowBlur = 30;
        const slamRadius = this.radius + 20 + Math.sin(Date.now() / 60) * 6;
        ctx.beginPath();
        ctx.arc(this.x, this.y, slamRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }

    // Motion trail
    for (let i = 0; i < this.trail.length; i++) {
      const t = this.trail[i];
      // Skip invalid trail positions
      if (!isFinite(t.x) || !isFinite(t.y)) continue;
      const alpha = (i / this.trail.length) * 0.3;
      const size = this.radius * (i / this.trail.length);
      this.drawShape(t.x, t.y, size, this.color, alpha);
    }

    // Glow
    this.drawShape(this.x, this.y, this.radius + 5, this.color, 0.3);

    // Body
    const bodyColor = this.hitFlash > 0 ? '#fff' : this.color;
    this.drawShape(this.x, this.y, this.radius, bodyColor, 1);

    // Outline
    this.drawShapeOutline(this.x, this.y, this.radius, '#fff', 2);

    // HP number
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(Math.ceil(this.hp), this.x, this.y);

    // Circle Orbit Blades weapon (drawn on top)
    if (this.shapeType === 'circle') {
      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      const momentumBoostEffect = this.activeEffects.find(e => e.type === 'momentumBoost');
      const isDashing = momentumBoostEffect !== undefined;
      
      ctx.save();
      
      // Two orbiting blade pairs (green orbs)
      for (let ring = 0; ring < 2; ring++) {
        const ringRadius = this.radius + 28 + (ring * 18);
        const rotation = Date.now() / (120 + ring * 60) + (ring * Math.PI / 2);
        
        // Draw 3 orbiting blades per ring instead of complete ring
        for (let blade = 0; blade < 3; blade++) {
          const bladeAngle = rotation + (blade * Math.PI * 2 / 3);
          
          if (isDashing) {
            // Stretch into arcs during Dash (like slicing wind)
            const dashAngle = Math.atan2(this.vy, this.vx);
            const arcLength = Math.PI * 0.4;
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 6;
            ctx.shadowColor = '#00aa00';
            ctx.shadowBlur = 20;
            ctx.globalAlpha = 1;
            ctx.beginPath();
            ctx.arc(this.x, this.y, ringRadius, dashAngle - arcLength/2, dashAngle + arcLength/2);
            ctx.stroke();
          } else {
            // Normal orbiting blades - green orbs
            const bladeX = this.x + Math.cos(bladeAngle) * ringRadius;
            const bladeY = this.y + Math.sin(bladeAngle) * ringRadius;
            ctx.fillStyle = '#00ff00';
            ctx.shadowColor = '#00aa00';
            ctx.shadowBlur = 15;
            ctx.globalAlpha = 0.9;
            ctx.beginPath();
            ctx.arc(bladeX, bladeY, 6, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      ctx.restore();
    }

    // Square Impact Core weapon (drawn on top)
    if (this.shapeType === 'square') {
      ctx.save();
      
      // Floating mass block/aura around the square
      const auraSize = this.radius + 20;
      const pulse = 0.3 + Math.sin(Date.now() / 100) * 0.15;
      
      // Outer aura glow
      ctx.globalAlpha = pulse;
      ctx.fillStyle = '#8866ff';
      ctx.shadowColor = '#aa66ff';
      ctx.shadowBlur = 25;
      ctx.fillRect(this.x - auraSize, this.y - auraSize, auraSize * 2, auraSize * 2);
      
      // Inner dense core
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = '#5533aa';
      ctx.shadowBlur = 15;
      const coreSize = this.radius + 8;
      ctx.fillRect(this.x - coreSize, this.y - coreSize, coreSize * 2, coreSize * 2);
      
      // Shockwave plates for Slam effect
      const slamEffect = this.activeEffects.find(e => e.type === 'slamShockwave');
      if (slamEffect && !slamEffect.shockwaveTriggered) {
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed >= 2) {
          ctx.globalAlpha = 0.5;
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 3;
          ctx.shadowColor = '#ffffff';
          ctx.shadowBlur = 20;
          const plateSize = this.radius + 30 + Math.sin(Date.now() / 30) * 5;
          ctx.strokeRect(this.x - plateSize, this.y - plateSize, plateSize * 2, plateSize * 2);
        }
      }
      
      // Fortress mode for Quake ultimate
      const quakeEffect = this.activeEffects.find(e => e.type === 'quakePulse');
      if (quakeEffect) {
        ctx.globalAlpha = 0.4;
        ctx.strokeStyle = '#ff88ff';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#ff88ff';
        ctx.shadowBlur = 30;
        const fortressSize = this.radius + 40 + Math.sin(Date.now() / 60) * 8;
        ctx.strokeRect(this.x - fortressSize, this.y - fortressSize, fortressSize * 2, fortressSize * 2);
        
        // Corner fortifications
        const cornerSize = 15;
        ctx.fillStyle = '#aa66ff';
        ctx.fillRect(this.x - fortressSize - cornerSize, this.y - fortressSize - cornerSize, cornerSize * 2, cornerSize * 2);
        ctx.fillRect(this.x + fortressSize - cornerSize, this.y - fortressSize - cornerSize, cornerSize * 2, cornerSize * 2);
        ctx.fillRect(this.x - fortressSize - cornerSize, this.y + fortressSize - cornerSize, cornerSize * 2, cornerSize * 2);
        ctx.fillRect(this.x + fortressSize - cornerSize, this.y + fortressSize - cornerSize, cornerSize * 2, cornerSize * 2);
      }
      
      ctx.restore();
    }

    // Oval Phase Blades weapon (drawn on top)
    if (this.shapeType === 'oval') {
      ctx.save();
      
      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      const flicker = 0.5 + Math.sin(Date.now() / 50) * 0.3;
      
      // Twin curved knives
      const bladeLength = this.radius * 1.8;
      const bladeWidth = 8;
      
      // Left blade
      ctx.globalAlpha = flicker;
      ctx.strokeStyle = '#cc66ff';
      ctx.lineWidth = bladeWidth;
      ctx.shadowColor = '#aa44ff';
      ctx.shadowBlur = 15;
      
      ctx.beginPath();
      ctx.moveTo(this.x - this.radius * 0.5, this.y);
      ctx.quadraticCurveTo(
        this.x - this.radius * 1.2, this.y - bladeLength * 0.3,
        this.x - this.radius * 0.8, this.y - bladeLength
      );
      ctx.stroke();
      
      // Right blade
      ctx.beginPath();
      ctx.moveTo(this.x + this.radius * 0.5, this.y);
      ctx.quadraticCurveTo(
        this.x + this.radius * 1.2, this.y + bladeLength * 0.3,
        this.x + this.radius * 0.8, this.y + bladeLength
      );
      ctx.stroke();
      
      // Ghost trail during fast movement
      if (speed > 8) {
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = '#9933ff';
        ctx.lineWidth = bladeWidth * 0.7;
        ctx.shadowBlur = 10;
        
        // Echo blades lagging behind
        const lagX = this.x - this.vx * 2;
        const lagY = this.y - this.vy * 2;
        
        ctx.beginPath();
        ctx.moveTo(lagX - this.radius * 0.5, lagY);
        ctx.quadraticCurveTo(
          lagX - this.radius * 1.2, lagY - bladeLength * 0.3,
          lagX - this.radius * 0.8, lagY - bladeLength
        );
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(lagX + this.radius * 0.5, lagY);
        ctx.quadraticCurveTo(
          lagX + this.radius * 1.2, lagY + bladeLength * 0.3,
          lagX + this.radius * 0.8, lagY + bladeLength
        );
        ctx.stroke();
      }
      
      // Phase ultimate: weapons lag behind like echoes
      const ghostEffect = this.activeEffects.find(e => e.type === 'ghostTrail');
      if (ghostEffect) {
        ctx.globalAlpha = 0.4;
        ctx.strokeStyle = '#ff66ff';
        ctx.lineWidth = bladeWidth * 0.8;
        ctx.shadowColor = '#ff44ff';
        ctx.shadowBlur = 20;
        
        // Multiple echo layers
        for (let i = 1; i <= 3; i++) {
          const echoX = this.x - this.vx * i * 3;
          const echoY = this.y - this.vy * i * 3;
          const echoAlpha = 0.4 - i * 0.1;
          ctx.globalAlpha = echoAlpha;
          
          ctx.beginPath();
          ctx.moveTo(echoX - this.radius * 0.5, echoY);
          ctx.quadraticCurveTo(
            echoX - this.radius * 1.2, echoY - bladeLength * 0.3,
            echoX - this.radius * 0.8, echoY - bladeLength
          );
          ctx.stroke();
          
          ctx.beginPath();
          ctx.moveTo(echoX + this.radius * 0.5, echoY);
          ctx.quadraticCurveTo(
            echoX + this.radius * 1.2, echoY + bladeLength * 0.3,
            echoX + this.radius * 0.8, echoY + bladeLength
          );
          ctx.stroke();
        }
      }
      
      ctx.restore();
    }

    // Hexagon Hex Drones weapon (drawn on top)
    if (this.shapeType === 'hexagon') {
      ctx.save();
      
      const predictionBoostEffect = this.activeEffects.find(e => e.type === 'predictionBoost');
      const isPredictionActive = predictionBoostEffect !== undefined;
      
      const droneCount = 4; // Reduced from 6 to 4
      const orbitRadius = this.radius * 1.5;
      const droneSize = 8;
      const glowIntensity = isPredictionActive ? 20 : 10; // Reduced glow
      const glowColor = isPredictionActive ? '#00ffaa' : '#00cc88';
      
      // Draw orbiting hex drones
      for (let i = 0; i < droneCount; i++) {
        const angle = (Date.now() / 500) + (Math.PI * 2 / droneCount) * i;
        const droneX = this.x + Math.cos(angle) * orbitRadius;
        const droneY = this.y + Math.sin(angle) * orbitRadius;
        
        // Draw hexagonal drone
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = glowColor;
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = glowIntensity;
        
        ctx.beginPath();
        for (let j = 0; j < 6; j++) {
          const a = (Math.PI / 3) * j - Math.PI / 6;
          const px = droneX + droneSize * Math.cos(a);
          const py = droneY + droneSize * Math.sin(a);
          if (j === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        
        // Inner glow for each drone
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(droneX, droneY, droneSize * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Draw connecting lines when predictionBoost is active
      if (isPredictionActive) {
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = '#00ffaa';
        ctx.lineWidth = 1;
        ctx.shadowBlur = 5; // Reduced glow
        
        for (let i = 0; i < droneCount; i++) {
          const angle = (Date.now() / 500) + (Math.PI * 2 / droneCount) * i;
          const droneX = this.x + Math.cos(angle) * orbitRadius;
          const droneY = this.y + Math.sin(angle) * orbitRadius;
          
          ctx.beginPath();
          ctx.moveTo(this.x, this.y);
          ctx.lineTo(droneX, droneY);
          ctx.stroke();
        }
      }
      
      // Central hub
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = '#00aa88';
      ctx.shadowColor = '#00cc88';
      ctx.shadowBlur = 10; // Reduced glow
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius * 0.4, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    }

    // Spiral Chaos Orb weapon (drawn on top)
    if (this.shapeType === 'spiral') {
      ctx.save();
      
      const chaosZoneEffect = this.activeEffects.find(e => e.type === 'chaosZone');
      const isTornadoActive = chaosZoneEffect !== undefined;
      
      const orbRadius = this.radius * 0.8;
      const spikeCount = 5; // Reduced from 8 to 5
      const instability = isTornadoActive ? 0.3 : 0.15;
      
      // Draw unstable sphere with random spikes
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = isTornadoActive ? '#ff4444' : '#aa44ff';
      ctx.shadowColor = isTornadoActive ? '#ff6666' : '#cc66ff';
      ctx.shadowBlur = isTornadoActive ? 20 : 10; // Reduced glow
      
      // Main orb body
      ctx.beginPath();
      ctx.arc(this.x, this.y, orbRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Random spikes/tendrils
      for (let i = 0; i < spikeCount; i++) {
        const baseAngle = (Math.PI * 2 / spikeCount) * i + (Date.now() / 500);
        const spikeLength = orbRadius * (0.5 + Math.random() * instability);
        const spikeAngle = baseAngle + (Math.random() - 0.5) * instability;
        
        const startX = this.x + Math.cos(spikeAngle) * orbRadius;
        const startY = this.y + Math.sin(spikeAngle) * orbRadius;
        const endX = this.x + Math.cos(spikeAngle) * (orbRadius + spikeLength);
        const endY = this.y + Math.sin(spikeAngle) * (orbRadius + spikeLength);
        
        ctx.strokeStyle = isTornadoActive ? '#ff8888' : '#dd88ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }
      
      // Inner swirling effect - reduced from 3 to 2 trails
      ctx.globalAlpha = 0.4;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      for (let i = 0; i < 2; i++) {
        const spiralOffset = (Date.now() / 200) + (i * Math.PI * 2 / 3);
        ctx.beginPath();
        for (let j = 0; j < 15; j++) { // Reduced from 20 to 15
          const a = spiralOffset + j * 0.3;
          const r = (j / 15) * orbRadius * 0.8;
          const px = this.x + r * Math.cos(a);
          const py = this.y + r * Math.sin(a);
          if (j === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
      
      // Tornado core during ultimate - reduced from 5 to 3 rings
      if (isTornadoActive) {
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = '#ff6666';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#ff4444';
        ctx.shadowBlur = 20; // Reduced glow
        
        for (let i = 0; i < 3; i++) {
          const tornadoRadius = orbRadius + 10 + i * 8;
          ctx.beginPath();
          ctx.arc(this.x, this.y, tornadoRadius, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      
      ctx.restore();
    }

    // Rhombus Gravity Chain weapon (drawn on top)
    if (this.shapeType === 'rhombus') {
      ctx.save();
      
      const gravitySlamEffect = this.activeEffects.find(e => e.type === 'gravitySlam');
      const isSlamActive = gravitySlamEffect !== undefined;
      const attractionEffect = this.activeEffects.find(e => e.type === 'attraction');
      const isPulling = attractionEffect !== undefined;
      
      const chainLength = this.radius * 2.5;
      const chainThickness = isSlamActive ? 5 : 2; // Reduced thickness
      const chainColor = isSlamActive ? '#ff4444' : '#8844ff';
      
      // Find nearest enemy to draw chain toward
      let targetX = this.x;
      let targetY = this.y;
      let hasTarget = false;
      
      if (this.target && this.target.hp > 0) {
        targetX = this.target.x;
        targetY = this.target.y;
        hasTarget = true;
      }
      
      // Draw chain/tether
      if (hasTarget || isPulling) {
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        
        // Chain segments - reduced from 8 to 5
        const segmentCount = 5;
        const segmentLength = Math.min(dist, chainLength) / segmentCount;
        
        ctx.globalAlpha = 0.7;
        ctx.strokeStyle = chainColor;
        ctx.shadowColor = isSlamActive ? '#ff6666' : '#aa66ff';
        ctx.shadowBlur = isSlamActive ? 15 : 8; // Reduced glow
        ctx.lineWidth = chainThickness;
        
        for (let i = 0; i < segmentCount; i++) {
          const startX = this.x + Math.cos(angle) * segmentLength * i;
          const startY = this.y + Math.sin(angle) * segmentLength * i;
          const endX = this.x + Math.cos(angle) * segmentLength * (i + 1);
          const endY = this.y + Math.sin(angle) * segmentLength * (i + 1);
          
          // Add slight wave to chain
          const waveOffset = Math.sin(Date.now() / 100 + i) * 3;
          const perpAngle = angle + Math.PI / 2;
          const waveX = Math.cos(perpAngle) * waveOffset;
          const waveY = Math.sin(perpAngle) * waveOffset;
          
          ctx.beginPath();
          ctx.moveTo(startX + waveX, startY + waveY);
          ctx.lineTo(endX + waveX, endY + waveY);
          ctx.stroke();
        }
        
        // Chain anchor at target
        if (hasTarget) {
          ctx.globalAlpha = 0.5;
          ctx.fillStyle = chainColor;
          ctx.beginPath();
          ctx.arc(targetX, targetY, 6, 0, Math.PI * 2); // Reduced size
          ctx.fill();
        }
      }
      
      // Central gravity core
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = isSlamActive ? '#ff6666' : '#9966ff';
      ctx.shadowColor = isSlamActive ? '#ff8888' : '#bb88ff';
      ctx.shadowBlur = isSlamActive ? 15 : 8; // Reduced glow
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius * 0.5, 0, Math.PI * 2);
      ctx.fill();
      
      // Inner pulsing core
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = '#ffffff';
      const pulseSize = this.radius * 0.2 + Math.sin(Date.now() / 150) * 3;
      ctx.beginPath();
      ctx.arc(this.x, this.y, pulseSize, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    }

    // Triangle Piercing Lance weapon (drawn on top)
    if (this.shapeType === 'triangle') {
      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      const executeBoostEffect = this.activeEffects.find(e => e.type === 'executeBoost');
      const isPierceActive = executeBoostEffect !== undefined;
      const afterimageEffect = this.activeEffects.find(e => e.type === 'afterimageTrail');
      const isChargeActive = afterimageEffect !== undefined;
      
      ctx.save();
      
      // Calculate direction based on movement or default upward
      let angle = -Math.PI / 2; // Default: pointing up
      if (speed > 0.5) {
        angle = Math.atan2(this.vy, this.vx);
      }
      
      // Spear length extends dramatically during Pierce
      const baseLength = this.radius * 2.5;
      const extendMultiplier = isPierceActive ? 3.5 : 1;
      const spearLength = baseLength * extendMultiplier;
      
      // Draw dark streak trails
      if (isChargeActive || speed > 8) {
        ctx.strokeStyle = '#4400aa';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#6600ff';
        ctx.shadowBlur = 20;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - this.vx * 5, this.y - this.vy * 5);
        ctx.stroke();
      }
      
      // Draw the spear
      const tipX = this.x + Math.cos(angle) * spearLength;
      const tipY = this.y + Math.sin(angle) * spearLength;
      
      // Spear shaft
      ctx.strokeStyle = '#8800ff';
      ctx.lineWidth = isPierceActive ? 8 : 6;
      ctx.shadowColor = '#aa00ff';
      ctx.shadowBlur = isPierceActive ? 30 : 20;
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(tipX, tipY);
      ctx.stroke();
      
      // Spear tip (energy blade)
      ctx.fillStyle = '#ff00ff';
      ctx.shadowColor = '#ff00ff';
      ctx.shadowBlur = 25;
      ctx.beginPath();
      ctx.arc(tipX, tipY, isPierceActive ? 10 : 8, 0, Math.PI * 2);
      ctx.fill();
      
      // Energy glow around spear
      ctx.strokeStyle = '#aa00ff';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(tipX, tipY);
      ctx.stroke();
      
      ctx.restore();
    }

    // Star Radiant Gauntlets weapon (drawn on top)
    if (this.shapeType === 'star') {
      ctx.save();
      
      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      const angle = Math.atan2(this.vy, this.vx);
      const pulse = 0.6 + Math.sin(Date.now() / 80) * 0.3;
      
      // Two glowing gauntlets positioned on sides of the star
      const gauntletOffset = this.radius + 12;
      const leftAngle = angle - Math.PI / 2;
      const rightAngle = angle + Math.PI / 2;
      
      const leftX = this.x + Math.cos(leftAngle) * gauntletOffset;
      const leftY = this.y + Math.sin(leftAngle) * gauntletOffset;
      const rightX = this.x + Math.cos(rightAngle) * gauntletOffset;
      const rightY = this.y + Math.sin(rightAngle) * gauntletOffset;
      
      // Draw gauntlets as glowing orbs with star-shaped flashes
      for (const [gx, gy] of [[leftX, leftY], [rightX, rightY]]) {
        // Outer glow
        ctx.globalAlpha = pulse * 0.5;
        ctx.fillStyle = '#ffaa00';
        ctx.shadowColor = '#ff6600';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(gx, gy, 10, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner core
        ctx.globalAlpha = pulse;
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ffaa00';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(gx, gy, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Star-shaped flash on high speed or during abilities
        if (speed > 8 || this.cooldowns.skill1 < 90 || this.cooldowns.skill2 < 90) {
          ctx.globalAlpha = pulse * 0.8;
          ctx.fillStyle = '#ff4400';
          ctx.shadowColor = '#ffaa00';
          ctx.shadowBlur = 25;
          
          // Draw small star shape
          ctx.beginPath();
          for (let k = 0; k < 5; k++) {
            const oa = (Math.PI * 2 / 5) * k - Math.PI / 2;
            const ia = oa + Math.PI / 5;
            if (k === 0) ctx.moveTo(gx + Math.cos(oa) * 8, gy + Math.sin(oa) * 8);
            else ctx.lineTo(gx + Math.cos(oa) * 8, gy + Math.sin(oa) * 8);
            ctx.lineTo(gx + Math.cos(ia) * 3, gy + Math.sin(ia) * 3);
          }
          ctx.closePath();
          ctx.fill();
        }
      }
      
      // Speed stacks indicator (small stars around the body)
      if (this.speedStacks > 0) {
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = '#ffaa00';
        ctx.shadowColor = '#ff6600';
        ctx.shadowBlur = 12;
        
        for (let i = 0; i < this.speedStacks; i++) {
          const stackAngle = (Date.now() / 200) + (i * Math.PI * 2 / this.maxSpeedStacks);
          const stackRadius = this.radius + 18;
          const sx = this.x + Math.cos(stackAngle) * stackRadius;
          const sy = this.y + Math.sin(stackAngle) * stackRadius;
          
          ctx.beginPath();
          ctx.arc(sx, sy, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      ctx.restore();
    }
  }

  drawShape(x, y, size, color, alpha) {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    if (this.shapeType === 'circle') {
      ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2); ctx.fill();
    } else if (this.shapeType === 'triangle') {
      ctx.beginPath(); ctx.moveTo(x, y - size); ctx.lineTo(x + size * 0.866, y + size * 0.5); ctx.lineTo(x - size * 0.866, y + size * 0.5); ctx.closePath(); ctx.fill();
    } else if (this.shapeType === 'square') {
      ctx.fillRect(x - size, y - size, size * 2, size * 2);
    } else if (this.shapeType === 'oval') {
      ctx.beginPath(); ctx.ellipse(x, y, size * 1.3, size * 0.8, 0, 0, Math.PI * 2); ctx.fill();
    } else if (this.shapeType === 'hexagon') {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) { const a = (Math.PI / 3) * i - Math.PI / 6; const px = x + size * Math.cos(a); const py = y + size * Math.sin(a); if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); }
      ctx.closePath(); ctx.fill();
    } else if (this.shapeType === 'spiral') {
      ctx.beginPath();
      for (let i = 0; i < 50; i++) { const a = i * 0.3; const r = (i / 50) * size; const px = x + r * Math.cos(a); const py = y + r * Math.sin(a); if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); }
      ctx.stroke();
      ctx.beginPath(); ctx.arc(x, y, size * 0.3, 0, Math.PI * 2); ctx.fill();
    } else if (this.shapeType === 'rhombus') {
      ctx.beginPath(); ctx.moveTo(x, y - size); ctx.lineTo(x + size * 0.7, y); ctx.lineTo(x, y + size); ctx.lineTo(x - size * 0.7, y); ctx.closePath(); ctx.fill();
    } else if (this.shapeType === 'star') {
      ctx.beginPath();
      for (let i = 0; i < 5; i++) { const oa = (Math.PI * 2 / 5) * i - Math.PI / 2; const ia = oa + Math.PI / 5; if (i === 0) ctx.moveTo(x + size * Math.cos(oa), y + size * Math.sin(oa)); else ctx.lineTo(x + size * Math.cos(oa), y + size * Math.sin(oa)); ctx.lineTo(x + size * 0.4 * Math.cos(ia), y + size * 0.4 * Math.sin(ia)); }
      ctx.closePath(); ctx.fill();
    } else if (this.shapeType === 'heart') {
      ctx.beginPath(); ctx.moveTo(x, y + size * 0.3); ctx.bezierCurveTo(x - size, y - size * 0.5, x - size * 0.5, y - size, x, y - size * 0.3); ctx.bezierCurveTo(x + size * 0.5, y - size, x + size, y - size * 0.5, x, y + size * 0.3); ctx.fill();
    } else if (this.shapeType === 'diamond') {
      ctx.beginPath(); ctx.moveTo(x, y - size); ctx.lineTo(x + size * 0.6, y - size * 0.3); ctx.lineTo(x + size * 0.6, y + size * 0.3); ctx.lineTo(x, y + size); ctx.lineTo(x - size * 0.6, y + size * 0.3); ctx.lineTo(x - size * 0.6, y - size * 0.3); ctx.closePath(); ctx.fill();
    } else if (this.shapeType === 'crescent') {
      ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2); ctx.fill();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath(); ctx.arc(x + size * 0.4, y, size * 0.8, 0, Math.PI * 2); ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = alpha; ctx.fillStyle = color;
    } else if (this.shapeType === 'dodecahedron') {
      ctx.beginPath();
      for (let i = 0; i < 12; i++) { const a = (Math.PI * 2 / 12) * i; const px = x + size * Math.cos(a); const py = y + size * Math.sin(a); if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); }
      ctx.closePath(); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  drawShapeOutline(x, y, size, color, lineWidth) {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    if (this.shapeType === 'circle') {
      ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2); ctx.stroke();
    } else if (this.shapeType === 'triangle') {
      ctx.beginPath(); ctx.moveTo(x, y - size); ctx.lineTo(x + size * 0.866, y + size * 0.5); ctx.lineTo(x - size * 0.866, y + size * 0.5); ctx.closePath(); ctx.stroke();
    } else if (this.shapeType === 'square') {
      ctx.strokeRect(x - size, y - size, size * 2, size * 2);
    } else if (this.shapeType === 'oval') {
      ctx.beginPath(); ctx.ellipse(x, y, size * 1.3, size * 0.8, 0, 0, Math.PI * 2); ctx.stroke();
    } else if (this.shapeType === 'hexagon') {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) { const a = (Math.PI / 3) * i - Math.PI / 6; const px = x + size * Math.cos(a); const py = y + size * Math.sin(a); if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); }
      ctx.closePath(); ctx.stroke();
    } else if (this.shapeType === 'spiral') {
      ctx.beginPath();
      for (let i = 0; i < 50; i++) { const a = i * 0.3; const r = (i / 50) * size; const px = x + r * Math.cos(a); const py = y + r * Math.sin(a); if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); }
      ctx.stroke();
    } else if (this.shapeType === 'rhombus') {
      ctx.beginPath(); ctx.moveTo(x, y - size); ctx.lineTo(x + size * 0.7, y); ctx.lineTo(x, y + size); ctx.lineTo(x - size * 0.7, y); ctx.closePath(); ctx.stroke();
    } else if (this.shapeType === 'star') {
      ctx.beginPath();
      for (let i = 0; i < 5; i++) { const oa = (Math.PI * 2 / 5) * i - Math.PI / 2; const ia = oa + Math.PI / 5; if (i === 0) ctx.moveTo(x + size * Math.cos(oa), y + size * Math.sin(oa)); else ctx.lineTo(x + size * Math.cos(oa), y + size * Math.sin(oa)); ctx.lineTo(x + size * 0.4 * Math.cos(ia), y + size * 0.4 * Math.sin(ia)); }
      ctx.closePath(); ctx.stroke();
    } else if (this.shapeType === 'heart') {
      ctx.beginPath(); ctx.moveTo(x, y + size * 0.3); ctx.bezierCurveTo(x - size, y - size * 0.5, x - size * 0.5, y - size, x, y - size * 0.3); ctx.bezierCurveTo(x + size * 0.5, y - size, x + size, y - size * 0.5, x, y + size * 0.3); ctx.stroke();
    } else if (this.shapeType === 'diamond') {
      ctx.beginPath(); ctx.moveTo(x, y - size); ctx.lineTo(x + size * 0.6, y - size * 0.3); ctx.lineTo(x + size * 0.6, y + size * 0.3); ctx.lineTo(x, y + size); ctx.lineTo(x - size * 0.6, y + size * 0.3); ctx.lineTo(x - size * 0.6, y - size * 0.3); ctx.closePath(); ctx.stroke();
    } else if (this.shapeType === 'crescent') {
      ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2); ctx.stroke();
    } else if (this.shapeType === 'dodecahedron') {
      ctx.beginPath();
      for (let i = 0; i < 12; i++) { const a = (Math.PI * 2 / 12) * i; const px = x + size * Math.cos(a); const py = y + size * Math.sin(a); if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); }
      ctx.closePath(); ctx.stroke();
    }
  }
}

// ── Collision handling ────────────────────────────────────────────────────────
function handleCollisions(fighters) {
  // Attraction effects
  for (let i = 0; i < fighters.length; i++) {
    const f1 = fighters[i];
    // Skip dead fighters
    if (f1.hp <= 0) continue;
    
    const attractionEffect = f1.activeEffects.find(e => e.type === 'attraction');
    const gravitySlowEffect = f1.activeEffects.find(e => e.type === 'gravitySlow');
    if (attractionEffect) {
      for (let j = 0; j < fighters.length; j++) {
        if (i === j) continue;
        const f2 = fighters[j];
        if (f2.hp <= 0) continue;
        const dx = f1.x - f2.x; const dy = f1.y - f2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0 && dist < attractionEffect.value) {
          const force = 0.4 * (1 - dist / attractionEffect.value); // Stronger pull force
          f2.vx += (dx / dist) * force; f2.vy += (dy / dist) * force;
          // Apply slow if gravitySlow effect is active
          if (gravitySlowEffect) {
            f2.addEffect('slow', gravitySlowEffect.value, 60); // Slow for 1 second
          }
        }
      }
    }
    // Gravity Ring Trap: pulls enemies and applies orbital force
    const gravityTrapEffect = f1.activeEffects.find(e => e.type === 'gravityRingTrap');
    if (gravityTrapEffect) {
      for (let j = 0; j < fighters.length; j++) {
        if (i === j) continue;
        const f2 = fighters[j];
        if (f2.hp <= 0) continue;
        const dx = f1.x - f2.x; const dy = f1.y - f2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0 && dist < gravityTrapEffect.value) {
          const pullForce = 0.4 * (1 - dist / gravityTrapEffect.value);
          f2.vx += (dx / dist) * pullForce; f2.vy += (dy / dist) * pullForce;
          // Apply orbital force (perpendicular to pull direction)
          const angle = Math.atan2(dy, dx);
          const perpAngle = angle + Math.PI / 2;
          f2.vx += Math.cos(perpAngle) * 0.8;
          f2.vy += Math.sin(perpAngle) * 0.8;
        }
      }
    }
    // Slam Shockwave: knockback when speed drops
    const slamEffect = f1.activeEffects.find(e => e.type === 'slamShockwave');
    if (slamEffect && slamEffect.shockwaveTriggered) {
      for (let j = 0; j < fighters.length; j++) {
        if (i === j) continue;
        const f2 = fighters[j];
        if (f2.hp <= 0) continue;
        const dx = f2.x - f1.x; const dy = f2.y - f1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0 && dist < 150) {
          const knockback = (150 - dist) / 10;
          f2.vx += (dx / dist) * knockback;
          f2.vy += (dy / dist) * knockback;
        }
      }
    }
    // Quake Pulse: area knockback every 0.5s
    const quakeEffect = f1.activeEffects.find(e => e.type === 'quakePulse');
    if (quakeEffect && quakeEffect.duration % 30 === 0) {
      for (let j = 0; j < fighters.length; j++) {
        if (i === j) continue;
        const f2 = fighters[j];
        if (f2.hp <= 0) continue;
        const dx = f2.x - f1.x; const dy = f2.y - f1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0 && dist < 200) {
          const knockback = (200 - dist) / 15;
          f2.vx += (dx / dist) * knockback;
          f2.vy += (dy / dist) * knockback;
        }
      }
    }
    // Ghost Trail: damage enemies who contact the trail
    const ghostEffect = f1.activeEffects.find(e => e.type === 'ghostTrail');
    if (ghostEffect) {
      for (let j = 0; j < fighters.length; j++) {
        if (i === j) continue;
        const f2 = fighters[j];
        if (f2.hp <= 0) continue;
        const dx = f2.x - f1.x; const dy = f2.y - f1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0 && dist < 80) {
          f2.hp -= 0.5; // Small damage over time
          f2.lastAttacker = f1;
        }
      }
    }
    // Star impact craters: apply slow to enemies in crater zones
    for (let crater of f1.impactCraters) {
      for (let j = 0; j < fighters.length; j++) {
        if (i === j) continue;
        const f2 = fighters[j];
        if (f2.hp <= 0) continue;
        const dx = f2.x - crater.x; const dy = f2.y - crater.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0 && dist < crater.radius) {
          // Apply slow effect
          f2.addEffect('slow', crater.slowAmount, 30);
        }
      }
    }
    // Vortex Pull: pull enemies toward random direction
    const vortexEffect = f1.activeEffects.find(e => e.type === 'vortexPull');
    if (vortexEffect && vortexEffect.value) {
      for (let j = 0; j < fighters.length; j++) {
        if (i === j) continue;
        const f2 = fighters[j];
        if (f2.hp <= 0) continue;
        const dx = f2.x - f1.x; const dy = f2.y - f1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0 && dist < 150) {
          // Pull enemy toward the random direction
          f2.vx += Math.cos(vortexEffect.value.angle) * vortexEffect.value.force;
          f2.vy += Math.sin(vortexEffect.value.angle) * vortexEffect.value.force;
        }
      }
    }
    // Chaos Zone: moving chaos zone that follows
    const chaosEffect = f1.activeEffects.find(e => e.type === 'chaosZone');
    if (chaosEffect && chaosEffect.value) {
      for (let j = 0; j < fighters.length; j++) {
        if (i === j) continue;
        const f2 = fighters[j];
        if (f2.hp <= 0) continue;
        const dx = f2.x - f1.x; const dy = f2.y - f1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0 && dist < chaosEffect.value.range) {
          // Apply random chaotic force
          const chaosAngle = Math.random() * Math.PI * 2;
          f2.vx += Math.cos(chaosAngle) * chaosEffect.value.force;
          f2.vy += Math.sin(chaosAngle) * chaosEffect.value.force;
        }
      }
    }
    // Gravity Slam: converts attraction into slam detonation
    const gravitySlamEffect = f1.activeEffects.find(e => e.type === 'gravitySlam');
    if (gravitySlamEffect && gravitySlamEffect.value) {
      for (let j = 0; j < fighters.length; j++) {
        if (i === j) continue;
        const f2 = fighters[j];
        if (f2.hp <= 0) continue;
        const dx = f2.x - f1.x; const dy = f2.y - f1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0 && dist < gravitySlamEffect.value.range) {
          // Apply slam damage and knockback
          f2.hp -= gravitySlamEffect.value.damage;
          f2.hitFlash = 15;
          f2.lastAttacker = f1;
          const slamAngle = Math.atan2(dy, dx);
          f2.vx += Math.cos(slamAngle) * gravitySlamEffect.value.knockback;
          f2.vy += Math.sin(slamAngle) * gravitySlamEffect.value.knockback;
        }
      }
    }
  }

  for (let i = 0; i < fighters.length; i++) {
    for (let j = i + 1; j < fighters.length; j++) {
      const f1 = fighters[i];
      const f2 = fighters[j];
      
      // Skip dead fighters
      if (f1.hp <= 0 || f2.hp <= 0) continue;

      const f1Phase = f1.activeEffects.find(e => e.type === 'phaseShift');
      const f2Phase = f2.activeEffects.find(e => e.type === 'phaseShift');
      if (f1Phase || f2Phase) continue;

      const dx = f2.x - f1.x; const dy = f2.y - f1.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minDist = f1.radius + f2.radius;

      if (dist < minDist && dist > 0) {
        const nx = dx / dist; const ny = dy / dist;
        const overlap = minDist - dist;
        f1.x -= nx * overlap / 2; f1.y -= ny * overlap / 2;
        f2.x += nx * overlap / 2; f2.y += ny * overlap / 2;
        
        // Clamp positions to arena bounds to prevent teleportation
        const { arenaLeft, arenaTop } = getArenaBounds();
        const arenaRight = arenaLeft + ARENA_SIZE;
        const arenaBottom = arenaTop + ARENA_SIZE;
        
        f1.x = Math.max(arenaLeft + f1.radius, Math.min(arenaRight - f1.radius, f1.x));
        f1.y = Math.max(arenaTop + f1.radius, Math.min(arenaBottom - f1.radius, f1.y));
        f2.x = Math.max(arenaLeft + f2.radius, Math.min(arenaRight - f2.radius, f2.x));
        f2.y = Math.max(arenaTop + f2.radius, Math.min(arenaBottom - f2.radius, f2.y));

        const dvx = f1.vx - f2.vx; const dvy = f1.vy - f2.vy;
        const dvn = dvx * nx + dvy * ny;

        if (dvn > 0) {
          const m1 = f1.mass; const m2 = f2.mass;
          // Use average of both shapes' collision restitution
          const restitution = (f1.collisionRestitution + f2.collisionRestitution) / 2;
          const impulse = (2 * dvn) / (m1 + m2);
          
          // Apply impulse with restitution
          f1.vx -= impulse * m2 * nx * restitution;
          f1.vy -= impulse * m2 * ny * restitution;
          f2.vx += impulse * m1 * nx * restitution;
          f2.vy += impulse * m1 * ny * restitution;
          
          // Add guaranteed minimum knockback to ensure wall hits
          const minKnockback = 15;
          
          // Apply knockback resistance if fighters have the effect
          const krEffect1 = f1.activeEffects.find(e => e.type === 'knockbackResistance');
          const krEffect2 = f2.activeEffects.find(e => e.type === 'knockbackResistance');
          const knockbackMultiplier1 = krEffect1 ? (1 - krEffect1.value) : 1;
          const knockbackMultiplier2 = krEffect2 ? (1 - krEffect2.value) : 1;
          
          f1.vx -= nx * minKnockback * knockbackMultiplier1;
          f1.vy -= ny * minKnockback * knockbackMultiplier1;
          f2.vx += nx * minKnockback * knockbackMultiplier2;
          f2.vy += ny * minKnockback * knockbackMultiplier2;
          
          // Set collision knockback cooldown to prevent AI movement
          f1.collisionKnockbackCooldown = 30; // 0.5 seconds
          f2.collisionKnockbackCooldown = 30;

          const collisionSpeed = Math.abs(dvn);
          if (collisionSpeed > 3) {
            const baseDamage = Math.floor(collisionSpeed * 0.8) + Math.floor(Math.random() * 3);
            const luckRoll = Math.random();

            // Ultimate charge
            let chargeAmount = 1;
            if (baseDamage > 5)   chargeAmount = 2;
            if (collisionSpeed > 8) chargeAmount = 3;
            if (baseDamage > 10)  chargeAmount = 4;

            // ── Wall-bounce damage gate ──────────────────────────────────
            // Collision VFX (spark burst at contact point)
            const contactX = f1.x + nx * f1.radius;
            const contactY = f1.y + ny * f1.radius;
            spawnParticles(contactX, contactY, '#ffffff', 8, {
              minSpeed: 2, maxSpeed: 6, shape: 'spark', glow: true,
              minDecay: 0.06, decayRange: 0.04
            });

            // f1 hits f2
            const f1CanDamage = !f1.needsWallBounce;
            const f2CanDamage = !f2.needsWallBounce;

            if (luckRoll < 0.5) {
              // f2 is the "attacker" (pushes f1)
              if (f2CanDamage) {
                // Apply damage reduction if f1 has the effect
                const drEffect = f1.activeEffects.find(e => e.type === 'damageReduction');
                let reducedDamage = drEffect ? Math.floor(baseDamage * (1 - drEffect.value)) : baseDamage;
                
                // Apply shield conversion if f1 has the effect
                const scEffect = f1.activeEffects.find(e => e.type === 'shieldConversion');
                if (scEffect && reducedDamage > 0) {
                  const shieldAbsorb = Math.floor(reducedDamage * scEffect.value);
                  f1.shield += shieldAbsorb;
                  reducedDamage -= shieldAbsorb;
                }
                
                // Use shield first if available
                if (f1.shield > 0 && reducedDamage > 0) {
                  const shieldDamage = Math.min(f1.shield, reducedDamage);
                  f1.shield -= shieldDamage;
                  reducedDamage -= shieldDamage;
                }
                
                if (reducedDamage > 0) {
                  f1.hp -= reducedDamage;
                }
                f1.hitFlash = 15;
                f1.lastAttacker = f2;
                f2.ultimateCharge = Math.min(f2.ultimateCharge + chargeAmount, 10);
                // Attacker now needs to wall-bounce before next damage
                f2.needsWallBounce = true;
                // Star: gain speed stack on successful hit
                if (f2.shapeType === 'star') {
                  f2.speedStacks = Math.min(f2.speedStacks + 1, f2.maxSpeedStacks);
                }
                spawnParticles(contactX, contactY, f2.color, 12, {
                  minSpeed: 3, maxSpeed: 8, shape: 'circle', glow: true,
                  minDecay: 0.04, decayRange: 0.03
                });
              } else {
                // No damage but physics still apply; show a deflect VFX
                spawnParticles(contactX, contactY, '#888888', 6, {
                  minSpeed: 1, maxSpeed: 4, shape: 'ring', glow: false,
                  minDecay: 0.06, decayRange: 0.04
                });
              }
            } else {
              // f1 is the "attacker"
              if (f1CanDamage) {
                // Apply damage reduction if f2 has the effect
                const drEffect = f2.activeEffects.find(e => e.type === 'damageReduction');
                let reducedDamage = drEffect ? Math.floor(baseDamage * (1 - drEffect.value)) : baseDamage;
                
                // Apply shield conversion if f2 has the effect
                const scEffect = f2.activeEffects.find(e => e.type === 'shieldConversion');
                if (scEffect && reducedDamage > 0) {
                  const shieldAbsorb = Math.floor(reducedDamage * scEffect.value);
                  f2.shield += shieldAbsorb;
                  reducedDamage -= shieldAbsorb;
                }
                
                // Use shield first if available
                if (f2.shield > 0 && reducedDamage > 0) {
                  const shieldDamage = Math.min(f2.shield, reducedDamage);
                  f2.shield -= shieldDamage;
                  reducedDamage -= shieldDamage;
                }
                
                if (reducedDamage > 0) {
                  f2.hp -= reducedDamage;
                }
                f2.hitFlash = 15;
                f2.lastAttacker = f1;
                f1.ultimateCharge = Math.min(f1.ultimateCharge + chargeAmount, 10);
                f1.needsWallBounce = true;
                spawnParticles(contactX, contactY, f1.color, 12, {
                  minSpeed: 3, maxSpeed: 8, shape: 'circle', glow: true,
                  minDecay: 0.04, decayRange: 0.03
                });
              } else {
                spawnParticles(contactX, contactY, '#888888', 6, {
                  minSpeed: 1, maxSpeed: 4, shape: 'ring', glow: false,
                  minDecay: 0.06, decayRange: 0.04
                });
              }
            }

            const f1NearKO = f1.hp < 25;
            const f2NearKO = f2.hp < 25;
            if (baseDamage > 15 || f1NearKO || f2NearKO) hitPauseTimer = HIT_PAUSE_DURATION;
            if (baseDamage > 20) {
              screenShake.intensity = Math.min(baseDamage / 5, 15);
              screenShake.x = (Math.random() - 0.5) * screenShake.intensity;
              screenShake.y = (Math.random() - 0.5) * screenShake.intensity;
            }
          }
        }
      }
    }
  }
}

// ── Fighter configs ───────────────────────────────────────────────────────────
const fighters = [];
const fighterConfigs = [
  { id:1,  color:'#FF5733', name:'Alpha',   shapeType:'circle'       },
  { id:2,  color:'#33FF57', name:'Beta',    shapeType:'triangle'     },
  { id:3,  color:'#3357FF', name:'Gamma',   shapeType:'square'       },
  { id:4,  color:'#FF33A8', name:'Delta',   shapeType:'oval'         },
  { id:5,  color:'#33FFF5', name:'Epsilon', shapeType:'hexagon'      },
  { id:6,  color:'#F5FF33', name:'Zeta',    shapeType:'spiral'       },
  { id:7,  color:'#FF8C33', name:'Eta',     shapeType:'rhombus'      },
  { id:8,  color:'#FF3333', name:'Theta',   shapeType:'star'         },
  { id:9,  color:'#FF33FF', name:'Iota',    shapeType:'heart'        },
  { id:10, color:'#33FFFF', name:'Kappa',   shapeType:'diamond'      },
  { id:11, color:'#8C33FF', name:'Lambda',  shapeType:'crescent'     },
  { id:12, color:'#33FF8C', name:'Mu',      shapeType:'dodecahedron' }
];

const selectedFighters = new Set([1,2,3,4,5,6,7,8,9,10,11,12]);

function getArenaBounds() {
  const arenaLeft = (canvas.width  - ARENA_SIZE) / 2;
  const arenaTop  = (canvas.height - ARENA_SIZE) / 2;
  return { arenaLeft, arenaTop };
}

function spawnFighters() {
  fighters.length = 0;
  replayBuffer = [];
  particles.length = 0;
  const selectedConfigs = fighterConfigs.filter(c => selectedFighters.has(c.id));
  const { arenaLeft, arenaTop } = getArenaBounds();
  const centerX = arenaLeft + ARENA_SIZE / 2;
  const centerY = arenaTop  + ARENA_SIZE / 2;
  const radius = ARENA_SIZE * 0.25;
  selectedConfigs.forEach((config, index) => {
    const angle = (index / selectedConfigs.length) * Math.PI * 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    fighters.push(new Fighter(config.id, x, y, config.color, config.name, config.shapeType));
  });
}

function recordState() {
  const state = fighters.map(f => ({
    x: f.x, y: f.y, vx: f.vx, vy: f.vy, hp: f.hp,
    hitFlash: f.hitFlash, trail: f.trail.filter(t => isFinite(t.x) && isFinite(t.y))
  }));
  replayBuffer.push(state);
  if (replayBuffer.length > REPLAY_DURATION) replayBuffer.shift();
}

function triggerKO(winner) {
  introState = 'ko';
  koTimer = 0;
  screenShake.intensity = 20;
  screenShake.x = (Math.random() - 0.5) * screenShake.intensity;
  screenShake.y = (Math.random() - 0.5) * screenShake.intensity;
  window.koWinner = winner;
}

// ── Selection UI ──────────────────────────────────────────────────────────────
const cardHitAreas = [];
const startButton    = { x:0, y:0, width:220, height:54 };
const selectAllButton = { x:0, y:0, width:140, height:38 };

function drawShapePreview(x, y, size, shapeType, color, alpha = 1) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  switch (shapeType) {
    case 'circle':       ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2); ctx.fill(); break;
    case 'triangle':     ctx.beginPath(); ctx.moveTo(x, y - size); ctx.lineTo(x + size * 0.866, y + size * 0.5); ctx.lineTo(x - size * 0.866, y + size * 0.5); ctx.closePath(); ctx.fill(); break;
    case 'square':       ctx.fillRect(x - size, y - size, size * 2, size * 2); break;
    case 'oval':         ctx.beginPath(); ctx.ellipse(x, y, size * 1.3, size * 0.8, 0, 0, Math.PI * 2); ctx.fill(); break;
    case 'hexagon':      ctx.beginPath(); for (let i=0;i<6;i++){const a=(Math.PI/3)*i-Math.PI/6;if(i===0)ctx.moveTo(x+size*Math.cos(a),y+size*Math.sin(a));else ctx.lineTo(x+size*Math.cos(a),y+size*Math.sin(a));}ctx.closePath();ctx.fill(); break;
    case 'spiral':       ctx.beginPath();for(let i=0;i<50;i++){const a=i*0.3;const r=(i/50)*size;if(i===0)ctx.moveTo(x+r*Math.cos(a),y+r*Math.sin(a));else ctx.lineTo(x+r*Math.cos(a),y+r*Math.sin(a));}ctx.stroke();ctx.beginPath();ctx.arc(x,y,size*0.3,0,Math.PI*2);ctx.fill(); break;
    case 'rhombus':      ctx.beginPath();ctx.moveTo(x,y-size);ctx.lineTo(x+size*0.7,y);ctx.lineTo(x,y+size);ctx.lineTo(x-size*0.7,y);ctx.closePath();ctx.fill(); break;
    case 'star':         ctx.beginPath();for(let i=0;i<5;i++){const oa=(Math.PI*2/5)*i-Math.PI/2;const ia=oa+Math.PI/5;if(i===0)ctx.moveTo(x+size*Math.cos(oa),y+size*Math.sin(oa));else ctx.lineTo(x+size*Math.cos(oa),y+size*Math.sin(oa));ctx.lineTo(x+size*0.4*Math.cos(ia),y+size*0.4*Math.sin(ia));}ctx.closePath();ctx.fill(); break;
    case 'heart':        ctx.beginPath();ctx.moveTo(x,y+size*0.3);ctx.bezierCurveTo(x-size,y-size*0.5,x-size*0.5,y-size,x,y-size*0.3);ctx.bezierCurveTo(x+size*0.5,y-size,x+size,y-size*0.5,x,y+size*0.3);ctx.fill(); break;
    case 'diamond':      ctx.beginPath();ctx.moveTo(x,y-size);ctx.lineTo(x+size*0.6,y-size*0.3);ctx.lineTo(x+size*0.6,y+size*0.3);ctx.lineTo(x,y+size);ctx.lineTo(x-size*0.6,y+size*0.3);ctx.lineTo(x-size*0.6,y-size*0.3);ctx.closePath();ctx.fill(); break;
    case 'crescent':     ctx.save();ctx.beginPath();ctx.arc(x,y,size,0,Math.PI*2);ctx.fill();ctx.globalCompositeOperation='destination-out';ctx.beginPath();ctx.arc(x+size*0.4,y,size*0.8,0,Math.PI*2);ctx.fill();ctx.restore();ctx.globalAlpha=alpha; break;
    case 'dodecahedron': ctx.beginPath();for(let i=0;i<12;i++){const a=(Math.PI*2/12)*i;if(i===0)ctx.moveTo(x+size*Math.cos(a),y+size*Math.sin(a));else ctx.lineTo(x+size*Math.cos(a),y+size*Math.sin(a));}ctx.closePath();ctx.fill(); break;
  }
  ctx.globalAlpha = 1;
}

const TRAIT_LABELS  = { aggression:'ATK', mobility:'SPD', precision:'AIM', chaos:'CHS', skillDiscipline:'SKL', fear:'DEF' };
const SHOWN_TRAITS  = ['aggression','mobility','precision','chaos','skillDiscipline','fear'];
const basePersonalities = {
  circle:       { aggression:7,  mobility:8,  precision:6,  chaos:5, fear:3,  skillDiscipline:7 },
  triangle:     { aggression:8,  mobility:9,  precision:7,  chaos:4, fear:2,  skillDiscipline:8 },
  square:       { aggression:5,  mobility:4,  precision:8,  chaos:2, fear:5,  skillDiscipline:9 },
  oval:         { aggression:6,  mobility:10, precision:5,  chaos:4, fear:4,  skillDiscipline:6 },
  hexagon:      { aggression:4,  mobility:5,  precision:9,  chaos:3, fear:6,  skillDiscipline:8 },
  spiral:       { aggression:5,  mobility:7,  precision:4,  chaos:9, fear:4,  skillDiscipline:5 },
  rhombus:      { aggression:6,  mobility:6,  precision:7,  chaos:6, fear:3,  skillDiscipline:7 },
  star:         { aggression:10, mobility:7,  precision:5,  chaos:7, fear:1,  skillDiscipline:6 },
  heart:        { aggression:3,  mobility:8,  precision:6,  chaos:3, fear:8,  skillDiscipline:7 },
  diamond:      { aggression:7,  mobility:6,  precision:10, chaos:2, fear:4,  skillDiscipline:8 },
  crescent:     { aggression:6,  mobility:8,  precision:6,  chaos:5, fear:5,  skillDiscipline:6 },
  dodecahedron: { aggression:6,  mobility:6,  precision:7,  chaos:4, fear:5,  skillDiscipline:10 }
};

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
}

function drawSelectionUI() {
  const W = canvas.width, H = canvas.height, cx = W / 2;
  ctx.fillStyle = 'rgba(0,0,0,0.78)'; ctx.fillRect(0, 0, W, H);
  const titleH = Math.min(H * 0.08, 48);
  const titleY = Math.min(H * 0.06, 45);
  ctx.save();
  ctx.shadowColor = '#7ec8ff'; ctx.shadowBlur = 18;
  ctx.fillStyle = '#fff'; ctx.font = `bold ${titleH}px Arial`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('SELECT FIGHTERS', cx, titleY);
  ctx.restore();

  const isMobile = W < 600 || H > W * 1.5;
  const COLS = isMobile ? 3 : 4, ROWS = isMobile ? 4 : 3;
  const padding = Math.min(W * 0.02, 15);
  const topOffset = titleY + titleH * 0.8;
  const bottomReserve = isMobile ? Math.min(H * 0.22, 160) : Math.min(H * 0.16, 100);
  const gridW = W - padding * 2, gridH = H - topOffset - bottomReserve - padding;
  const cardW = Math.floor(gridW / COLS), cardH = Math.floor(gridH / ROWS);
  cardHitAreas.length = 0;

  fighterConfigs.forEach((config, index) => {
    const col = index % COLS, row = Math.floor(index / COLS);
    const cx0 = padding + col * cardW + cardW / 2;
    const cy0 = topOffset + row * cardH + cardH / 2;
    const cardLeft = padding + col * cardW, cardTop = topOffset + row * cardH;
    const isSelected = selectedFighters.has(config.id);
    ctx.save();
    ctx.globalAlpha = isSelected ? 0.18 : 0.06; ctx.fillStyle = config.color;
    roundRect(ctx, cardLeft+4, cardTop+4, cardW-8, cardH-8, 10); ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = isSelected ? 1 : 0.3;
    ctx.strokeStyle = isSelected ? config.color : '#555'; ctx.lineWidth = isSelected ? 2.5 : 1.5;
    roundRect(ctx, cardLeft+4, cardTop+4, cardW-8, cardH-8, 10); ctx.stroke();
    ctx.restore();

    const shapeSize = Math.min(cardW, cardH) * 0.22;
    const shapeY = cy0 - cardH * 0.06;
    if (isSelected) {
      ctx.save(); ctx.globalAlpha = 0.25; ctx.fillStyle = config.color;
      ctx.beginPath(); ctx.arc(cx0, shapeY, shapeSize + 8, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
    drawShapePreview(cx0, shapeY, shapeSize, config.shapeType, isSelected ? config.color : '#777');

    const nameFontSize = Math.max(Math.min(cardW * 0.18, cardH * 0.18, 18), 11);
    ctx.fillStyle = isSelected ? '#fff' : '#888';
    ctx.font = `bold ${nameFontSize}px Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(config.name.toUpperCase(), cx0, shapeY + shapeSize + nameFontSize * 1.1);

    const stats = basePersonalities[config.shapeType];
    const barAreaTop = shapeY + shapeSize + nameFontSize * 2.5;
    const barAreaH = (cardTop + cardH - 8) - barAreaTop - 4;
    const barRowH = barAreaH / SHOWN_TRAITS.length;
    const barLabelW = Math.max(cardW * 0.13, 22);
    const barRight = cardLeft + cardW - 10, barLeft2 = cardLeft + 10 + barLabelW;
    const barMaxW = barRight - barLeft2 - 4, barH = Math.max(barRowH * 0.38, 3);
    if (barAreaH > 10) {
      SHOWN_TRAITS.forEach((trait, ti) => {
        const val = stats[trait] ?? 5;
        const by = barAreaTop + ti * barRowH + barRowH / 2;
        const fillW = (val / 10) * barMaxW;
        const labelSize = Math.max(Math.min(barRowH * 0.52, cardW * 0.1, 10), 7);
        ctx.fillStyle = isSelected ? '#aaa' : '#555'; ctx.font = `${labelSize}px Arial`;
        ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
        ctx.fillText(TRAIT_LABELS[trait], cardLeft + 10 + barLabelW - 3, by);
        ctx.fillStyle = isSelected ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)';
        roundRect(ctx, barLeft2, by - barH/2, barMaxW, barH, barH/2); ctx.fill();
        if (fillW > 0) {
          ctx.fillStyle = isSelected ? config.color : '#444'; ctx.globalAlpha = isSelected ? 0.85 : 0.4;
          roundRect(ctx, barLeft2, by - barH/2, fillW, barH, barH/2); ctx.fill(); ctx.globalAlpha = 1;
        }
      });
    }
    if (isSelected) {
      const bx = cardLeft + cardW - 18, by2 = cardTop + 16, br = 9;
      ctx.fillStyle = config.color; ctx.beginPath(); ctx.arc(bx, by2, br, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(bx - 4.5, by2); ctx.lineTo(bx - 1.5, by2 + 3.5); ctx.lineTo(bx + 5, by2 - 4); ctx.stroke();
    }
    cardHitAreas.push({ x:cardLeft+4, y:cardTop+4, w:cardW-8, h:cardH-8, id:config.id });
  });

  const barY = H - bottomReserve + (bottomReserve - startButton.height) / 2;
  const isMob = isMobile;
  if (isMob) {
    const buttonWidth = Math.min(W * 0.85, 220), buttonHeight = 50, buttonSpacing = 12;
    const startY = H - buttonHeight * 2 - buttonSpacing - 20;
    const allSelected = selectedFighters.size === fighterConfigs.length;
    selectAllButton.width = buttonWidth; selectAllButton.height = buttonHeight;
    selectAllButton.x = cx - buttonWidth / 2; selectAllButton.y = startY;
    ctx.fillStyle = allSelected ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.08)';
    roundRect(ctx, selectAllButton.x, selectAllButton.y, selectAllButton.width, selectAllButton.height, 8); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1.5;
    roundRect(ctx, selectAllButton.x, selectAllButton.y, selectAllButton.width, selectAllButton.height, 8); ctx.stroke();
    ctx.fillStyle = '#ddd'; ctx.font = 'bold 14px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(allSelected ? 'DESELECT ALL' : 'SELECT ALL', selectAllButton.x + selectAllButton.width/2, selectAllButton.y + selectAllButton.height/2);
    ctx.fillStyle = 'rgba(255,255,255,0.15)'; roundRect(ctx, cx-35, startY-30, 70, 24, 6); ctx.fill();
    ctx.fillStyle = '#ccc'; ctx.font = 'bold 13px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(`${selectedFighters.size}/${fighterConfigs.length}`, cx, startY - 18);
    startButton.width = buttonWidth; startButton.height = buttonHeight;
    startButton.x = cx - buttonWidth / 2; startButton.y = startY + buttonHeight + buttonSpacing;
    const canStart = selectedFighters.size >= 2;
    const btnGrad = ctx.createLinearGradient(startButton.x, startButton.y, startButton.x, startButton.y + startButton.height);
    if (canStart) { btnGrad.addColorStop(0, '#56d364'); btnGrad.addColorStop(1, '#2ea043'); }
    else { btnGrad.addColorStop(0, '#444'); btnGrad.addColorStop(1, '#333'); }
    ctx.fillStyle = btnGrad; roundRect(ctx, startButton.x, startButton.y, startButton.width, startButton.height, 10); ctx.fill();
    if (canStart) {
      ctx.save(); ctx.shadowColor = '#56d364'; ctx.shadowBlur = 12;
      ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 1.5;
      roundRect(ctx, startButton.x, startButton.y, startButton.width, startButton.height, 10); ctx.stroke(); ctx.restore();
    }
    ctx.fillStyle = canStart ? '#fff' : '#666'; ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('⚔ START BATTLE', startButton.x + startButton.width/2, startButton.y + startButton.height/2);
    if (!canStart) { ctx.fillStyle = '#ff6b6b'; ctx.font = '12px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillText('Select at least 2 fighters', cx, startButton.y + startButton.height + 6); }
  } else {
    const allSelected = selectedFighters.size === fighterConfigs.length;
    selectAllButton.x = cx - startButton.width/2 - selectAllButton.width - 16; selectAllButton.y = barY;
    ctx.fillStyle = allSelected ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.08)';
    roundRect(ctx, selectAllButton.x, selectAllButton.y, selectAllButton.width, selectAllButton.height, 8); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1.5;
    roundRect(ctx, selectAllButton.x, selectAllButton.y, selectAllButton.width, selectAllButton.height, 8); ctx.stroke();
    ctx.fillStyle = '#ddd'; ctx.font = 'bold 14px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(allSelected ? 'DESELECT ALL' : 'SELECT ALL', selectAllButton.x + selectAllButton.width/2, selectAllButton.y + selectAllButton.height/2);
    ctx.fillStyle = 'rgba(255,255,255,0.15)'; roundRect(ctx, cx-38, barY+4, 76, selectAllButton.height-8, 6); ctx.fill();
    ctx.fillStyle = '#ccc'; ctx.font = 'bold 14px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(`${selectedFighters.size}/${fighterConfigs.length}`, cx, barY + selectAllButton.height/2);
    startButton.x = cx + 54; startButton.y = barY - (startButton.height - selectAllButton.height)/2;
    const canStart = selectedFighters.size >= 2;
    const btnGrad = ctx.createLinearGradient(startButton.x, startButton.y, startButton.x, startButton.y + startButton.height);
    if (canStart) { btnGrad.addColorStop(0, '#56d364'); btnGrad.addColorStop(1, '#2ea043'); }
    else { btnGrad.addColorStop(0, '#444'); btnGrad.addColorStop(1, '#333'); }
    ctx.fillStyle = btnGrad; roundRect(ctx, startButton.x, startButton.y, startButton.width, startButton.height, 10); ctx.fill();
    if (canStart) {
      ctx.save(); ctx.shadowColor = '#56d364'; ctx.shadowBlur = 12;
      ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 1.5;
      roundRect(ctx, startButton.x, startButton.y, startButton.width, startButton.height, 10); ctx.stroke(); ctx.restore();
    }
    ctx.fillStyle = canStart ? '#fff' : '#666'; ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('⚔  START BATTLE', startButton.x + startButton.width/2, startButton.y + startButton.height/2);
    if (!canStart) { ctx.fillStyle = '#ff6b6b'; ctx.font = '13px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillText('Select at least 2 fighters', cx, startButton.y + startButton.height + 6); }
  }
}

canvas.addEventListener('click', (e) => {
  if (introState !== 'selection') return;
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width, scaleY = canvas.height / rect.height;
  const mouseX = (e.clientX - rect.left) * scaleX;
  const mouseY = (e.clientY - rect.top)  * scaleY;
  for (const card of cardHitAreas) {
    if (mouseX >= card.x && mouseX <= card.x + card.w && mouseY >= card.y && mouseY <= card.y + card.h) {
      if (selectedFighters.has(card.id)) selectedFighters.delete(card.id);
      else selectedFighters.add(card.id);
      return;
    }
  }
  if (mouseX >= selectAllButton.x && mouseX <= selectAllButton.x + selectAllButton.width &&
      mouseY >= selectAllButton.y && mouseY <= selectAllButton.y + selectAllButton.height) {
    if (selectedFighters.size === fighterConfigs.length) selectedFighters.clear();
    else fighterConfigs.forEach(c => selectedFighters.add(c.id));
    return;
  }
  if (mouseX >= startButton.x && mouseX <= startButton.x + startButton.width &&
      mouseY >= startButton.y && mouseY <= startButton.y + startButton.height) {
    if (selectedFighters.size >= 2) {
      spawnFighters(); introState = 'ready'; introTimer = 0;
    }
  }
});

// ── Game loop ─────────────────────────────────────────────────────────────────
function gameLoop() {
  ctx.save();
  if (screenShake.intensity > 0) {
    screenShake.x = (Math.random() - 0.5) * screenShake.intensity;
    screenShake.y = (Math.random() - 0.5) * screenShake.intensity;
    ctx.translate(screenShake.x, screenShake.y);
    screenShake.intensity *= 0.9;
    if (screenShake.intensity < 0.5) screenShake.intensity = 0;
  }

  const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  bgGrad.addColorStop(0, '#0a0a1a'); bgGrad.addColorStop(1, '#05080f');
  ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, canvas.width, canvas.height);

  const { arenaLeft, arenaTop } = getArenaBounds();

  // Arena floor
  const floorGrad = ctx.createRadialGradient(
    arenaLeft + ARENA_SIZE/2, arenaTop + ARENA_SIZE/2, 0,
    arenaLeft + ARENA_SIZE/2, arenaTop + ARENA_SIZE/2, ARENA_SIZE * 0.72
  );
  floorGrad.addColorStop(0, '#0d1117'); floorGrad.addColorStop(1, '#050810');
  ctx.fillStyle = floorGrad; ctx.fillRect(arenaLeft, arenaTop, ARENA_SIZE, ARENA_SIZE);

  // Grid
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 1;
  const gridStep = ARENA_SIZE / 10;
  for (let i = 1; i < 10; i++) {
    ctx.beginPath(); ctx.moveTo(arenaLeft + i * gridStep, arenaTop); ctx.lineTo(arenaLeft + i * gridStep, arenaTop + ARENA_SIZE); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(arenaLeft, arenaTop + i * gridStep); ctx.lineTo(arenaLeft + ARENA_SIZE, arenaTop + i * gridStep); ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(arenaLeft + ARENA_SIZE/2, arenaTop + 20); ctx.lineTo(arenaLeft + ARENA_SIZE/2, arenaTop + ARENA_SIZE - 20); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(arenaLeft + 20, arenaTop + ARENA_SIZE/2); ctx.lineTo(arenaLeft + ARENA_SIZE - 20, arenaTop + ARENA_SIZE/2); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.07)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(arenaLeft + ARENA_SIZE/2, arenaTop + ARENA_SIZE/2, ARENA_SIZE * 0.2, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();

  // Border glow
  ctx.save();
  ctx.shadowColor = 'rgba(100,180,255,0.6)'; ctx.shadowBlur = 18;
  ctx.strokeStyle = 'rgba(130,200,255,0.85)'; ctx.lineWidth = 2.5;
  ctx.strokeRect(arenaLeft, arenaTop, ARENA_SIZE, ARENA_SIZE);
  ctx.restore();
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1;
  ctx.strokeRect(arenaLeft + 3, arenaTop + 3, ARENA_SIZE - 6, ARENA_SIZE - 6);

  // Corner decorations
  const cornerSize = 16;
  ctx.save(); ctx.strokeStyle = 'rgba(130,200,255,0.9)'; ctx.lineWidth = 3;
  for (const [cx2, cy2, sx, sy] of [[arenaLeft,arenaTop,1,1],[arenaLeft+ARENA_SIZE,arenaTop,-1,1],[arenaLeft,arenaTop+ARENA_SIZE,1,-1],[arenaLeft+ARENA_SIZE,arenaTop+ARENA_SIZE,-1,-1]]) {
    ctx.beginPath(); ctx.moveTo(cx2+sx*cornerSize,cy2); ctx.lineTo(cx2,cy2); ctx.lineTo(cx2,cy2+sy*cornerSize); ctx.stroke();
  }
  ctx.restore();

  // ── States ──
  if (introState === 'selection') {
    drawSelectionUI();
  } else if (introState === 'ready') {
    introTimer++;
    ctx.fillStyle = '#fff'; ctx.font = 'bold 72px Arial';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('READY', canvas.width/2, canvas.height/2);
    if (introTimer >= READY_DURATION) { introState = 'fight'; introTimer = 0; }
  } else if (introState === 'fight') {
    introTimer++;
    ctx.fillStyle = '#fff'; ctx.font = 'bold 72px Arial';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('FIGHT!', canvas.width/2, canvas.height/2);
    for (let fighter of fighters) { if (fighter.hp > 0) fighter.draw(); }
    if (introTimer >= FIGHT_DURATION) {
      introState = 'battle';
      for (let fighter of fighters) {
        const angle = Math.random() * Math.PI * 2, speed = 3 + Math.random() * 3;
        fighter.vx = Math.cos(angle) * speed; fighter.vy = Math.sin(angle) * speed;
      }
    }
  } else if (introState === 'ko') {
    koTimer++;
    for (let fighter of fighters) { if (fighter.hp > 0) fighter.draw(); }
    updateAndDrawParticles();
    ctx.fillStyle = '#ff4444'; ctx.font = 'bold 96px Arial';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('FINISH!', canvas.width/2, canvas.height/2);
    if (window.koWinner) {
      ctx.fillStyle = '#fff'; ctx.font = 'bold 48px Arial';
      ctx.fillText(`${window.koWinner.name} WINS!`, canvas.width/2, canvas.height/2 + 80);
    }
    if (koTimer >= KO_PAUSE_DURATION) { introState = 'replay'; replayIndex = 0; }
  } else if (introState === 'replay') {
    if (replayIndex < replayBuffer.length) {
      const state = replayBuffer[replayIndex];
      for (let i = 0; i < fighters.length && i < state.length; i++) {
        fighters[i].x = state[i].x; fighters[i].y = state[i].y;
        fighters[i].hp = state[i].hp; fighters[i].hitFlash = state[i].hitFlash;
        fighters[i].trail = state[i].trail; fighters[i].draw();
      }
      ctx.fillStyle = '#ffff00'; ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText('▶ REPLAY', arenaLeft + 10, arenaTop + 10);
      replayIndex++;
    } else {
      const aliveFighters = fighters.filter(f => f.hp > 0);
      ctx.fillStyle = '#fff'; ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(aliveFighters.length === 1 ? `${aliveFighters[0].name} WINS!` : 'DRAW!', canvas.width/2, canvas.height/2);
      ctx.font = 'bold 24px Arial';
      ctx.fillText('Refresh to restart', canvas.width/2, canvas.height/2 + 50);
    }
  } else {
    // Battle
    const aliveFighters = fighters.filter(f => f.hp > 0);
    if (aliveFighters.length <= 1) {
      if (introState === 'battle' && aliveFighters.length === 1) {
        triggerKO(aliveFighters[0]);
      } else if (introState === 'battle') {
        ctx.fillStyle = '#fff'; ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('DRAW!', canvas.width/2, canvas.height/2);
        ctx.font = 'bold 24px Arial';
        ctx.fillText('Refresh to restart', canvas.width/2, canvas.height/2 + 50);
      }
    } else {
      recordState();
      if (hitPauseTimer > 0) {
        hitPauseTimer--;
        if (hitPauseTimer % 2 === 0) {
          handleCollisions(fighters);
          for (let fighter of fighters) { if (fighter.hp > 0) fighter.update(fighters); }
        }
        for (let fighter of fighters) { if (fighter.hp > 0) fighter.draw(); }
      } else {
        handleCollisions(fighters);
        for (let fighter of fighters) { if (fighter.hp > 0) { fighter.update(fighters); fighter.draw(); } }
      }
      updateAndDrawParticles();
    }
  }

  ctx.restore();
  drawVSDisplay();
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
  ctx.fillStyle = '#fff'; ctx.font = `bold ${isMobile ? 14 : 18}px Arial`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
  ctx.fillText(aliveFighters.map(f => f.name).join(' vs '), canvas.width/2, arenaTop - 15);
  ctx.restore();
}

function drawFighterStatusPanels() {
  if (introState !== 'battle' && introState !== 'replay' && introState !== 'ko') return;
  const aliveFighters = fighters.filter(f => f.hp > 0);
  if (aliveFighters.length === 0) return;
  const { arenaLeft, arenaTop } = getArenaBounds();
  const arenaRight  = arenaLeft + ARENA_SIZE;
  const arenaBottom = arenaTop  + ARENA_SIZE;
  const isMobile = canvas.width < 600 || canvas.height > canvas.width * 1.5;
  const totalPanelW = ARENA_SIZE, panelSpacing = isMobile ? 6 : 10, count = aliveFighters.length;
  const panelWidth = Math.min(isMobile ? 160 : 200, (totalPanelW - panelSpacing * (count - 1)) / count);
  const nameH = isMobile ? 20 : 22, hpH = isMobile ? 10 : 12, skillRowH = isMobile ? 18 : 20;
  const padV = isMobile ? 8 : 10, padH = isMobile ? 8 : 10;
  const panelHeight = padV + nameH + 6 + hpH + 6 + skillRowH * 3 + padV;
  const startX = arenaLeft, panelY = arenaBottom + (isMobile ? 12 : 18);

  aliveFighters.forEach((fighter, index) => {
    const panelX = startX + index * (panelWidth + panelSpacing);
    const skillNames = getSkillNames(fighter.shapeType);
    ctx.save();
    ctx.shadowColor = fighter.color; ctx.shadowBlur = 10;
    ctx.fillStyle = 'rgba(10,10,20,0.88)';
    roundRect(ctx, panelX, panelY, panelWidth, panelHeight, 10); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = fighter.color; ctx.lineWidth = 2;
    roundRect(ctx, panelX, panelY, panelWidth, panelHeight, 10); ctx.stroke();
    ctx.fillStyle = fighter.color; ctx.globalAlpha = 0.35;
    roundRect(ctx, panelX+2, panelY+2, panelWidth-4, 4, 3); ctx.fill(); ctx.globalAlpha = 1;

    // Wall-bounce indicator on panel
    if (fighter.needsWallBounce) {
      ctx.fillStyle = 'rgba(255,255,100,0.15)';
      roundRect(ctx, panelX, panelY, panelWidth, panelHeight, 10); ctx.fill();
      ctx.strokeStyle = '#aaaa00'; ctx.lineWidth = 1.5; ctx.setLineDash([4,3]);
      roundRect(ctx, panelX, panelY, panelWidth, panelHeight, 10); ctx.stroke();
      ctx.setLineDash([]);
    }

    let curY = panelY + padV;
    ctx.fillStyle = '#fff'; ctx.font = `bold ${isMobile ? 13 : 15}px 'Segoe UI', Arial`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText(fighter.name, panelX + panelWidth/2, curY);
    curY += nameH + 4;

    const hpPercent = Math.max(0, fighter.hp / fighter.maxHp);
    const hpBarW = panelWidth - padH * 2;
    const hpColor = hpPercent > 0.5 ? '#56d364' : hpPercent > 0.25 ? '#ffd93d' : '#ff6b6b';
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = `${isMobile ? 9 : 10}px Arial`;
    ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.fillText('HP', panelX + padH, curY);
    ctx.textAlign = 'right'; ctx.fillText(`${Math.ceil(fighter.hp)}`, panelX + panelWidth - padH, curY);
    const hpBarY = curY + (isMobile ? 10 : 11);
    ctx.fillStyle = 'rgba(255,255,255,0.12)'; roundRect(ctx, panelX + padH, hpBarY, hpBarW, hpH, hpH/2); ctx.fill();
    if (hpPercent > 0) { ctx.fillStyle = hpColor; roundRect(ctx, panelX + padH, hpBarY, hpBarW * hpPercent, hpH, hpH/2); ctx.fill(); }
    curY += (isMobile ? 10 : 11) + hpH + 8;

    // Wall-bounce status label
    if (fighter.needsWallBounce) {
      ctx.fillStyle = '#ffff44'; ctx.font = `bold ${isMobile ? 8 : 9}px Arial`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText('⚡ WALL BOUNCE NEEDED', panelX + panelWidth/2, curY - 6);
    }

    const skills = [
      { label: skillNames.skill1,   cd: fighter.cooldowns.skill1,   maxCd: 150, isUlt: false },
      { label: skillNames.skill2,   cd: fighter.cooldowns.skill2,   maxCd: 130, isUlt: false },
      { label: skillNames.ultimate, cd: fighter.cooldowns.ultimate, maxCd: 180, isUlt: true, charge: fighter.ultimateCharge }
    ];
    skills.forEach(skill => { drawSkillRow(ctx, panelX + padH, curY, panelWidth - padH*2, skillRowH - 2, skill, isMobile); curY += skillRowH; });
    ctx.restore();
  });
}

function drawSkillRow(ctx, x, y, w, h, skill, isMobile) {
  const isUlt = skill.isUlt;
  const ready = isUlt ? (skill.charge >= 10 && skill.cd === 0) : (skill.cd === 0);
  const pulse = 0.7 + Math.sin(Date.now() / 120) * 0.3;
  ctx.fillStyle = ready ? (isUlt ? `rgba(180,0,255,${0.15*pulse})` : `rgba(86,211,100,${0.15*pulse})`) : 'rgba(255,255,255,0.05)';
  roundRect(ctx, x, y, w, h, h/2); ctx.fill();
  const nameColor = ready ? (isUlt ? '#dd77ff' : '#56d364') : 'rgba(255,255,255,0.75)';
  ctx.fillStyle = nameColor; ctx.font = `bold ${isMobile ? 10 : 11}px 'Segoe UI', Arial`;
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(isUlt ? `★ ${skill.label}` : skill.label, x + 6, y + h/2);
  const barW = w * 0.38, barH = isMobile ? 4 : 5, barX = x + w - barW - 4, barY = y + (h - barH)/2;
  if (isUlt) {
    if (skill.charge < 10) {
      ctx.fillStyle = 'rgba(255,255,255,0.12)'; roundRect(ctx, barX, barY, barW, barH, barH/2); ctx.fill();
      ctx.fillStyle = '#aa44ff'; roundRect(ctx, barX, barY, barW*(skill.charge/10), barH, barH/2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.font = `${isMobile?9:10}px Arial`;
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillText(`${Math.floor(skill.charge)}/10`, barX-3, y+h/2);
    } else if (skill.cd > 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.12)'; roundRect(ctx, barX, barY, barW, barH, barH/2); ctx.fill();
      ctx.fillStyle = '#aa44ff'; roundRect(ctx, barX, barY, barW*(1-skill.cd/skill.maxCd), barH, barH/2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.font = `${isMobile?9:10}px Arial`;
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillText(`${(skill.cd/60).toFixed(1)}s`, barX-3, y+h/2);
    } else {
      ctx.globalAlpha = pulse; ctx.fillStyle = '#dd77ff'; ctx.font = `bold ${isMobile?10:11}px Arial`;
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillText('READY', x+w-4, y+h/2); ctx.globalAlpha = 1;
    }
  } else {
    if (skill.cd > 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.12)'; roundRect(ctx, barX, barY, barW, barH, barH/2); ctx.fill();
      ctx.fillStyle = '#56d364'; roundRect(ctx, barX, barY, barW*(1-skill.cd/skill.maxCd), barH, barH/2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.font = `${isMobile?9:10}px Arial`;
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillText(`${(skill.cd/60).toFixed(1)}s`, barX-3, y+h/2);
    } else {
      ctx.globalAlpha = pulse; ctx.fillStyle = '#56d364'; ctx.font = `bold ${isMobile?10:11}px Arial`;
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillText('READY', x+w-4, y+h/2); ctx.globalAlpha = 1;
    }
  }
}

function getSkillNames(shapeType) {
  const skillNames = {
    circle:       { skill1:'Dash',    skill2:'Spin',    ultimate:'Meteor'    },
    triangle:     { skill1:'Pierce',  skill2:'Charge',  ultimate:'Spike'     },
    square:       { skill1:'Shield',  skill2:'Slam',    ultimate:'Quake'     },
    oval:         { skill1:'Speed',   skill2:'Drift',   ultimate:'Phase'     },
    hexagon:      { skill1:'Orbit',   skill2:'Hex',     ultimate:'Burst'     },
    spiral:       { skill1:'Vortex',  skill2:'Curve',   ultimate:'Tornado'   },
    rhombus:      { skill1:'Heavy',   skill2:'Boost',   ultimate:'Impact'    },
    star:         { skill1:'Burst',   skill2:'Beam',    ultimate:'Nova'      },
    heart:        { skill1:'Heal',    skill2:'Pulse',   ultimate:'Love'      },
    diamond:      { skill1:'Reflect', skill2:'Sharp',   ultimate:'Prism'     },
    crescent:     { skill1:'Slice',   skill2:'Moon',    ultimate:'Eclipse'   },
    dodecahedron: { skill1:'Adapt',   skill2:'Face',    ultimate:'Transform' }
  };
  return skillNames[shapeType] || { skill1:'Skill 1', skill2:'Skill 2', ultimate:'Ult' };
}

gameLoop();
