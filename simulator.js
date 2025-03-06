const canvas = document.getElementById('simulatorCanvas');
const ctx = canvas.getContext('2d');

// Set initial canvas size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Update Matter.js boundaries when canvas size changes
    if (typeof engine !== 'undefined') {
        World.remove(engine.world, [ground, leftWall, rightWall]);
        createBoundaries();
    }
}
resizeCanvas();

// Update canvas size on window resize
window.addEventListener('resize', resizeCanvas);

// Initialize Matter.js engine
const Engine = Matter.Engine;
const World = Matter.World;
const Bodies = Matter.Bodies;

const engine = Engine.create();
engine.world.gravity.y = 1; // Set gravity similar to current simulation

// Create boundaries (static walls)
let ground, leftWall, rightWall;

function createBoundaries() {
    ground = Bodies.rectangle(canvas.width / 2, canvas.height, canvas.width, 50, { isStatic: true });
    leftWall = Bodies.rectangle(0, canvas.height / 2, 50, canvas.height, { isStatic: true });
    rightWall = Bodies.rectangle(canvas.width, canvas.height / 2, 50, canvas.height, { isStatic: true });
    
    World.add(engine.world, [ground, leftWall, rightWall]);
}

createBoundaries();

// Update Matter.js engine in animation loop
function updateMatter() {
    Engine.update(engine, 1000 / 60);
}

// Particle class to represent liquid particles
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.radius = 3;
        this.density = 0;
        this.pressure = 0;
        this.fx = 0; // Forces
        this.fy = 0;
        
        // Create a Matter.js body
        this.body = Bodies.circle(x, y, this.radius, { friction: 0, restitution: 0.3 });
        World.add(engine.world, this.body);
    }

    computeDensity(particles) {
        const h = 20; // Smoothing radius
        this.density = 0;
        const mass = 1; // Assume constant mass for simplicity
        particles.forEach(other => {
            const dx = other.x - this.x;
            const dy = other.y - this.y;
            const r = Math.sqrt(dx * dx + dy * dy);
            if (r < h) {
                const W = (315 / (64 * Math.PI * Math.pow(h, 9))) * Math.pow(h * h - r * r, 3);
                this.density += mass * W;
            }
        });
        this.density = Math.max(this.density, 0.1); // Avoid division by zero
    }

    computePressure() {
        const k = 200; // Gas constant
        const density0 = 1; // Rest density
        this.pressure = k * (this.density - density0);
    }

    computeForces(particles) {
        const h = 20; // Smoothing radius
        this.fx = 0;
        this.fy = 0;

        // Pressure forces
        particles.forEach(other => {
            if (other === this) return;
            const dx = other.x - this.x;
            const dy = other.y - this.y;
            const r = Math.sqrt(dx * dx + dy * dy);
            if (r < h && r > 0) {
                const W = -(45 / (Math.PI * Math.pow(h, 6))) * Math.pow(h - r, 2);
                const force = ((this.pressure + other.pressure) / (2 * other.density)) * W;
                this.fx += force * (dx / r);
                this.fy += force * (dy / r);
            }
        });

        // Viscosity forces
        const viscosity = 0.1;
        particles.forEach(other => {
            if (other === this) return;
            const dx = other.x - this.x;
            const dy = other.y - this.y;
            const r = Math.sqrt(dx * dx + dy * dy);
            if (r < h && r > 0) {
                const W = (45 / (Math.PI * Math.pow(h, 6))) * (h - r);
                this.fx += viscosity * (other.vx - this.vx) * W / other.density;
                this.fy += viscosity * (other.vy - this.vy) * W / other.density;
            }
        });

        // Gravity
        this.fy += 0.2 * this.density;
    }

    update() {
        // Update velocity from SPH forces
        this.vx += this.fx / this.density;
        this.vy += this.fy / this.density;

        // Apply velocity to Matter.js body
        Matter.Body.setVelocity(this.body, { x: this.vx, y: this.vy });

        // Sync position with Matter.js body
        this.x = this.body.position.x;
        this.y = this.body.position.y;
    }
    
    // Remove Matter.js body when particle is removed
    destroy() {
        World.remove(engine.world, this.body);
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'blue';
        ctx.fill();
        ctx.closePath();
    }
}

// Array to store particles
let particles = [];

// Animation loop
function animate() {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    updateMatter(); // Update Matter.js physics

    // Compute SPH properties
    particles.forEach(particle => particle.computeDensity(particles));
    particles.forEach(particle => particle.computePressure());
    particles.forEach(particle => particle.computeForces(particles));

    // Update and draw particles
    particles = particles.filter(p => {
        if (p.y < canvas.height + p.radius) return true;
        p.destroy(); // Clean up Matter.js body
        return false;
    });
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });

    requestAnimationFrame(animate);
}

let isMouseDown = false;

canvas.addEventListener('mousedown', (e) => {
    isMouseDown = true;
    spawnParticle(e);
});

canvas.addEventListener('mouseup', () => {
    isMouseDown = false;
});

canvas.addEventListener('mousemove', (e) => {
    if (isMouseDown) {
        spawnParticle(e);
    }
});

function spawnParticle(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const particle = new Particle(x, y);
    particles.push(particle);
}

const resetButton = document.getElementById('resetButton');

resetButton.addEventListener('click', () => {
    // Clean up Matter.js bodies
    particles.forEach(particle => {
        particle.destroy();
    });
    particles = [];
});

animate();