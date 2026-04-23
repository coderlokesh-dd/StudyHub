const fs = require('fs');
const https = require('https');
const path = require('path');

const files = ['Shared.jsx', 'Pages.jsx', 'styles.css', 'StudyZoneDesktop.jsx', 'Prototype.jsx', 'Pages2.jsx', 'Mascot.jsx', 'design-canvas.jsx'];

files.forEach(file => {
  https.get(`https://helpful-nasturtium-0dce59.netlify.app/${file}`, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      fs.writeFileSync(path.join(__dirname, file), data);
      console.log(`Downloaded ${file}`);
    });
  }).on('error', err => {
    console.error(`Error downloading ${file}:`, err.message);
  });
});
