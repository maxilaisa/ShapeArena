// Shape Arena - Physics-Based Battle Simulator
// Designed for spectating, not playing

const canvas = document.createElement('canvas');
canvas.style.display = 'block';
canvas.style.width = '100vw';
canvas.style.height = '100vh';
document.body.appendChild(canvas);

const ctx = canvas.getContext('2d');

// Arena configuration
const ARENA_SIZE = 600;
const BORDER_WIDTH = 2;

// Resize canvas to fit arena
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

// Intro animation state
let introState = 'ready'; // 'ready', 'fight', 'battle'
let introTimer = 0;
const READY_DURATION = 60; // frames
const FIGHT_DURATION = 30; // frames

// Physics constants
const FRICTION = 0.98;
const ELASTICITY = 0.8;
const GRAVITY = 0;

// Fighter class
class Fighter {
  constructor(id, x, y, color, name, shapeType) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 4;
    this.vy = (Math.random() - 0.5) * 4;
    this.radius = 30 + Math.random() * 20;
    this.mass = this.radius * this.radius;
    this.color = color;
    this.name = name;
    this.shapeType = shapeType; // 'circle', 'triangle', 'square'
    this.hp = 100;
    this.maxHp = 100;
    this.attackCooldown = 0;
    this.target = null;
    this.ultimateCharge = 0;
    this.cooldownTimers = {
      attack: 0,
      ability: 0,
      ultimate: 0
    };
    
    // Visual effects
    this.trail = [];
    this.hitFlash = 0;
  }

  update(fighters) {
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

    // Find nearest target
    let nearestDist = Infinity;
    this.target = null;
    
    for (let fighter of fighters) {
      if (fighter === this) continue;
      const dx = fighter.x - this.x;
      const dy = fighter.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < nearestDist) {
        nearestDist = dist;
        this.target = fighter;
      }
    }

    // Autonomous AI - move toward target
    if (this.target && this.target.hp > 0) {
      const dx = this.target.x - this.x;
      const dy = this.target.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist > 0) {
        const speed = 0.5;
        this.vx += (dx / dist) * speed;
        this.vy += (dy / dist) * speed;
      }

      // Attack if close
      if (dist < this.radius + this.target.radius + 10 && this.attackCooldown <= 0) {
        this.attack(this.target);
        this.attackCooldown = 30;
      }
    }

    // Update position
    this.x += this.vx;
    this.y += this.vy;

    // Boundary collision (arena bounds)
    const arenaLeft = (canvas.width - ARENA_SIZE) / 2;
    const arenaRight = (canvas.width + ARENA_SIZE) / 2;
    const arenaTop = (canvas.height - ARENA_SIZE) / 2;
    const arenaBottom = (canvas.height + ARENA_SIZE) / 2;

    if (this.x - this.radius < arenaLeft) {
      this.x = arenaLeft + this.radius;
      this.vx *= -ELASTICITY;
    }
    if (this.x + this.radius > arenaRight) {
      this.x = arenaRight - this.radius;
      this.vx *= -ELASTICITY;
    }
    if (this.y - this.radius < arenaTop) {
      this.y = arenaTop + this.radius;
      this.vy *= -ELASTICITY;
    }
    if (this.y + this.radius > arenaBottom) {
      this.y = arenaBottom - this.radius;
      this.vy *= -ELASTICITY;
    }

    // Cooldown
    if (this.attackCooldown > 0) this.attackCooldown--;
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
          const restitution = ELASTICITY;
          
          const impulse = (2 * dvn) / (m1 + m2);
          
          f1.vx -= impulse * m2 * nx * restitution;
          f1.vy -= impulse * m2 * ny * restitution;
          f2.vx += impulse * m1 * nx * restitution;
          f2.vy += impulse * m1 * ny * restitution;
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
  { id: 3, color: '#3357FF', name: 'Gamma', shapeType: 'square' }
];

function getArenaBounds() {
  const arenaLeft = (canvas.width - ARENA_SIZE) / 2;
  const arenaTop = (canvas.height - ARENA_SIZE) / 2;
  return { arenaLeft, arenaTop };
}

for (const config of fighterConfigs) {
  const { arenaLeft, arenaTop } = getArenaBounds();
  const x = arenaLeft + 50 + Math.random() * (ARENA_SIZE - 100);
  const y = arenaTop + 50 + Math.random() * (ARENA_SIZE - 100);
  fighters.push(new Fighter(config.id, x, y, config.color, config.name, config.shapeType));
}

// Game loop
function gameLoop() {
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
  if (introState === 'ready') {
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
  } else {
    // Battle mode
    const aliveFighters = fighters.filter(f => f.hp > 0);
    
    if (aliveFighters.length <= 1) {
      // Winner announcement
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
