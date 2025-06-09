// This is a script to create placeholder character images
// You can run this with Node.js to generate placeholder images
// npm install canvas
// node create_placeholder_images.js

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Character placeholders
const characters = [
  { name: 'knight', color: '#FF0000', icon: '⚔️' },
  { name: 'mage', color: '#00FF00', icon: '🔮' },
  { name: 'archer', color: '#0000FF', icon: '🏹' }
];

// UI elements
const uiElements = [
  { name: 'back-button', width: 200, height: 80, color: '#555555', text: 'BACK' },
  { name: 'confirm-button', width: 320, height: 100, color: '#00AA00', text: 'CONFIRM' },
  { name: 'start-button', width: 320, height: 100, color: '#0066BB', text: 'START' },
  { name: 'select-frame', width: 220, height: 320, color: '#FFFF00', text: '' },
  { name: 'devsmith-logo', width: 400, height: 120, color: '#FF00FF', text: 'DEVSMITH' },
  { name: 'boss-battle-logo', width: 500, height: 200, color: '#FF6600', text: 'BOSS BATTLE' }
];

// Create character images
characters.forEach(character => {
  const width = 200;
  const height = 300;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = character.color;
  ctx.fillRect(0, 0, width, height);
  
  // Border
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, width - 4, height - 4);
  
  // Character icon
  ctx.font = '120px Arial';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(character.icon, width / 2, height / 2 - 20);
  
  // Character name
  ctx.font = 'bold 32px Arial';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(character.name.toUpperCase(), width / 2, height - 40);
  
  // Save the image
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(__dirname, `${character.name}.png`), buffer);
  console.log(`Created ${character.name}.png`);
});

// Create UI elements
uiElements.forEach(element => {
  const { width, height, color, text, name } = element;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Background with rounded corners if not a frame
  ctx.fillStyle = color;
  if (name === 'select-frame') {
    ctx.strokeStyle = color;
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, width - 8, height - 8);
  } else {
    // Draw rounded rectangle
    const radius = 15;
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(width - radius, 0);
    ctx.quadraticCurveTo(width, 0, width, radius);
    ctx.lineTo(width, height - radius);
    ctx.quadraticCurveTo(width, height, width - radius, height);
    ctx.lineTo(radius, height);
    ctx.quadraticCurveTo(0, height, 0, height - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();
    ctx.fill();
    
    // Text
    if (text) {
      ctx.font = 'bold 32px Arial';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, width / 2, height / 2);
    }
  }
  
  // Save the image
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(__dirname, '..', `${name}.png`), buffer);
  console.log(`Created ${name}.png`);
});

// Create background image
const bgCanvas = createCanvas(1080, 1920);
const bgCtx = bgCanvas.getContext('2d');

// Create gradient background
const gradient = bgCtx.createLinearGradient(0, 0, 0, 1920);
gradient.addColorStop(0, '#000033');
gradient.addColorStop(1, '#330033');
bgCtx.fillStyle = gradient;
bgCtx.fillRect(0, 0, 1080, 1920);

// Add some stars
for (let i = 0; i < 200; i++) {
  const x = Math.random() * 1080;
  const y = Math.random() * 1920;
  const radius = Math.random() * 2;
  const opacity = Math.random();
  
  bgCtx.beginPath();
  bgCtx.arc(x, y, radius, 0, Math.PI * 2);
  bgCtx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
  bgCtx.fill();
}

// Save the background image
const bgBuffer = bgCanvas.toBuffer('image/png');
fs.writeFileSync(path.join(__dirname, '..', 'background.png'), bgBuffer);
console.log('Created background.png');

// Create logo
const logoCanvas = createCanvas(200, 200);
const logoCtx = logoCanvas.getContext('2d');

// Logo background
logoCtx.fillStyle = '#FFFFFF';
logoCtx.beginPath();
logoCtx.arc(100, 100, 90, 0, Math.PI * 2);
logoCtx.fill();

// Logo text
logoCtx.font = 'bold 48px Arial';
logoCtx.fillStyle = '#000000';
logoCtx.textAlign = 'center';
logoCtx.textBaseline = 'middle';
logoCtx.fillText('LOGO', 100, 100);

// Save the logo
const logoBuffer = logoCanvas.toBuffer('image/png');
fs.writeFileSync(path.join(__dirname, '..', 'logo.png'), logoBuffer);
console.log('Created logo.png'); 