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
    }

    update() {
        // Apply gravity
        this.vy += 0.2;

        // Update position
        this.x += this.vx;
        this.y += this.vy;

        // Boundary collision
        if (this.y + this.radius > canvas.height) {
            this.y = canvas.height - this.radius;
            this.vy *= -0.5; // Bounce with damping
        }
        if (this.x + this.radius > canvas.width) {
            this.x = canvas.width - this.radius;
            this.vx *= -0.5;
        }
        if (this.x - this.radius < 0) {
            this.x = this.radius;
            this.vx *= -0.5;
        }
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

    // Update and draw particles
    particles = particles.filter(p => p.y < canvas.height + p.radius); // Remove particles off-screen
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
    particles = [];
});

animate();