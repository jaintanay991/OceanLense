import fs from 'fs';
import https from 'https';
import path from 'path';

const files = [
  { url: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg', name: 'earth_color.jpg' },
  { url: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg', name: 'earth_specular.jpg' },
  { url: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg', name: 'earth_normal.jpg' },
  { url: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png', name: 'earth_clouds.png' }
];

const downloadDir = path.resolve('public/textures/earth');

files.forEach(file => {
  const dest = path.join(downloadDir, file.name);
  const fileStream = fs.createWriteStream(dest);
  https.get(file.url, response => {
    response.pipe(fileStream);
    fileStream.on('finish', () => {
      fileStream.close();
      console.log(`Downloaded ${file.name}`);
    });
  }).on('error', err => {
    fs.unlink(dest, () => {});
    console.error(`Error downloading ${file.name}: ${err.message}`);
  });
});
