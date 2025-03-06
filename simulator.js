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