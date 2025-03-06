# PLAN.md: Implementing a Liquid Simulator in HTML Canvas

## Overview
This plan outlines the development of a liquid simulator using an HTML canvas. The simulator will allow users to click, hold, and drag to place liquid, and include a button to reset the scene and clear all liquid. The implementation will use vanilla JavaScript, HTML, and CSS, with a particle-based approach for the liquid simulation. The project will be version-controlled using Git, with changes committed after each step and a GitHub PR created at the end.

### Requirements
- A liquid simulator rendered in an HTML canvas.
- Users can click, hold, and drag to place liquid particles.
- A button to reset the scene and clear all liquid.
- Development environment: GitHub CLI, npm, Node.js, and Python3 are installed.

### General Approach
1. Use a particle-based system to simulate liquid, where each particle has position, velocity, and simple physics (gravity, collision).
2. Render particles on an HTML canvas.
3. Implement mouse interaction to spawn particles when clicking, holding, and dragging.
4. Add a reset button to clear all particles.
5. Structure the project with separate files for clarity (`index.html`, `styles.css`, `simulator.js`).
6. Use Git for version control, committing after each step, and create a GitHub PR at the end.

---

## Discrete Steps for Implementation

Each step below is designed to be self-contained and executable by a sub-LLM. After each step, the sub-LLM must commit changes to Git and stop for feedback before proceeding to the next step. The steps are ordered to build the system incrementally, ensuring stability and clarity.

### Step 1: Set Up the Project Structure and Git Worktree
**Objective**: Create a new Git worktree, initialize the project structure, and set up basic files.

**Instructions**:
1. Run the following command to create a new Git worktree for this feature:
   ```
   git worktree add ../liquid-simulator-worktree -b feature/liquid-simulator
   ```
2. Navigate to the new worktree directory:
   ```
   cd ../liquid-simulator-worktree
   ```
3. Create the following files:
   - `index.html`
   - `styles.css`
   - `simulator.js`
4. Populate `index.html` with the following basic structure:
   ```html
   <!DOCTYPE html>
   <html lang="en">
   <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>Liquid Simulator</title>
       <link rel="stylesheet" href="styles.css">
   </head>
   <body>
       <canvas id="simulatorCanvas"></canvas>
       <button id="resetButton">Reset</button>
       <script src="simulator.js"></script>
   </body>
   </html>
   ```
5. Populate `styles.css` with basic styling:
   ```css
   body {
       margin: 0;
       display: flex;
       flex-direction: column;
       align-items: center;
       justify-content: center;
       height: 100vh;
       background-color: #f0f0f0;
   }
   canvas {
       border: 1px solid black;
   }
   button {
       margin-top: 10px;
       padding: 10px 20px;
       font-size: 16px;
       cursor: pointer;
   }
   ```
6. Leave `simulator.js` empty for now.
7. Stage and commit the changes:
   ```
   git add .
   git commit -m "Step 1: Set up project structure and basic files"
   ```

**Stop for Feedback**: Do not proceed to the next step. Wait for feedback on the project setup and file structure.

---

### Step 2: Initialize Canvas and Basic Rendering Loop
**Objective**: Set up the HTML canvas, initialize a rendering loop, and clear the canvas each frame.

**Instructions**:
1. Open `simulator.js` and add the following code to initialize the canvas and set up a basic rendering loop:
   ```javascript
   const canvas = document.getElementById('simulatorCanvas');
   const ctx = canvas.getContext('2d');

   // Set canvas size
   canvas.width = 800;
   canvas.height = 600;

   // Animation loop
   function animate() {
       // Clear the canvas
       ctx.fillStyle = '#ffffff';
       ctx.fillRect(0, 0, canvas.width, canvas.height);

       // Request next frame
       requestAnimationFrame(animate);
   }

   // Start the animation loop
   animate();
   ```
2. Test the setup by opening `index.html` in a browser (e.g., using a simple server like `python3 -m http.server 8000`).
3. Stage and commit the changes:
   ```
   git add .
   git commit -m "Step 2: Initialize canvas and basic rendering loop"
   ```

**Stop for Feedback**: Do not proceed to the next step. Wait for feedback on the canvas setup and rendering loop.

---

### Step 3: Implement Particle System for Liquid Simulation
**Objective**: Create a particle system to represent liquid, with basic physics (gravity, boundaries).

**Instructions**:
1. Open `simulator.js` and replace the existing code with the following, which adds a particle system:
   ```javascript
   const canvas = document.getElementById('simulatorCanvas');
   const ctx = canvas.getContext('2d');

   canvas.width = 800;
   canvas.height = 600;

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

       // Update and draw particles
       particles.forEach(particle => {
           particle.update();
           particle.draw();
       });

       requestAnimationFrame(animate);
   }

   animate();
   ```
2. Test by opening `index.html` in a browser. No particles will appear yet since none are created, but ensure no errors occur.
3. Stage and commit the changes:
   ```
   git add .
   git commit -m "Step 3: Implement particle system for liquid simulation"
   ```

**Stop for Feedback**: Do not proceed to the next step. Wait for feedback on the particle system implementation.

---

### Step 4: Add Mouse Interaction to Spawn Particles
**Objective**: Implement mouse click, hold, and drag functionality to spawn liquid particles.

**Instructions**:
1. Open `simulator.js` and append the following code at the bottom (before the `animate` call) to handle mouse interaction:
   ```javascript
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
   ```
2. Update the `animate` function to limit the number of particles for performance (optional but recommended):
   ```javascript
   function animate() {
       ctx.fillStyle = '#ffffff';
       ctx.fillRect(0, 0, canvas.width, canvas.height);

       // Update and draw particles
       particles = particles.filter(p => p.y < canvas.height + p.radius); // Remove particles off-screen
       particles.forEach(particle => {
           particle.update();
           particle.draw();
       });

       requestAnimationFrame(animate);
   }
   ```
3. Test by opening `index.html` in a browser. Click, hold, and drag to spawn particles and verify they fall and bounce.
4. Stage and commit the changes:
   ```
   git add .
   git commit -m "Step 4: Add mouse interaction to spawn particles"
   ```

**Stop for Feedback**: Do not proceed to the next step. Wait for feedback on the mouse interaction and particle spawning.

---

### Step 5: Implement Reset Button Functionality
**Objective**: Add functionality to the reset button to clear all particles.

**Instructions**:
1. Open `simulator.js` and append the following code at the bottom to handle the reset button:
   ```javascript
   const resetButton = document.getElementById('resetButton');

   resetButton.addEventListener('click', () => {
       particles = [];
   });
   ```
2. Test by opening `index.html` in a browser. Spawn some particles, then click the reset button to clear them.
3. Stage and commit the changes:
   ```
   git add .
   git commit -m "Step 5: Implement reset button functionality"
   ```

**Stop for Feedback**: Do not proceed to the next step. Wait for feedback on the reset button functionality.

---

### Step 6: Finalize and Create GitHub PR
**Objective**: Perform final testing, push changes to the remote repository, and create a GitHub PR.

**Instructions**:
1. Test the entire application by opening `index.html` in a browser:
   - Verify that particles spawn correctly when clicking, holding, and dragging.
   - Verify that particles fall, bounce, and stay within boundaries.
   - Verify that the reset button clears all particles.
2. If any issues are found, fix them and document the changes in the commit message.
3. Push the changes to the remote repository:
   ```
   git push origin feature/liquid-simulator
   ```
4. Create a GitHub PR using the GitHub CLI:
   ```
   gh pr create --title "Implement Liquid Simulator" --body "Added a liquid simulator with particle-based physics, mouse interaction, and reset functionality."
   ```
5. Output the PR URL for review.

**Stop for Feedback**: Do not proceed further. Wait for feedback on the final implementation and PR creation.

---

## Final Notes
- Each step includes a commit to ensure progress is tracked.
- The sub-LLM must stop after each step for feedback to ensure alignment with requirements.
- The implementation uses a simple particle system for the liquid simulation. If further realism (e.g., particle interactions, smoothing) is desired, additional steps can be added after feedback.
- The project structure and code are kept minimal and modular for clarity.
