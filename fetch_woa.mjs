import https from 'https';
import fs from 'fs';

// WOA23 Decadal 1.00 deg. We want 4 deg resolution (stride 4).
// Grid size for 1 deg is: lat 180 (from -90 to 90), lon 360 (from -180 to 180)
// With stride 4: lat 45, lon 90.
const depths = [0, 4, 18, 28]; // Indices in WOA23 for approx: 0m, 20m, 100m, 500m
// We'll fetch 0m and 500m for temperature and salinity just as a proof-of-concept subset.
// Depth indices: 0 = 0m, 18 = 100m, 28 = 500m, 36 = 1000m

async function fetchAscii(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to fetch ${url}, status: ${res.statusCode}`));
        return;
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function parseAscii(data) {
  const lines = data.split('\n');
  const values = [];
  let isDataSection = false;
  
  for (const line of lines) {
    if (line.startsWith('---------------------------------------------')) {
      isDataSection = true;
      continue;
    }
    if (isDataSection) {
      if (line.trim() === '' || line.includes('t_an.t_an') || line.includes('s_an.s_an')) continue;
      
      const parts = line.split(',').map(s => s.trim());
      if (parts.length > 1) {
        // parts[0] is [time][depth][lat]
        // parts[1..] are the longitude values
        for (let i = 1; i < parts.length; i++) {
          const val = parseFloat(parts[i]);
          // 9.96921e+36 is missing value
          values.push(val > 9e35 ? null : val);
        }
      }
    }
  }
  return values;
}

async function run() {
  const dataset = {
    metadata: {
      source: "NOAA NCEI — World Ocean Atlas 2023",
      resolution: "4° x 4° (Subset)",
      timePeriod: "Decadal Annual Climatology",
      lat: [],
      lon: [],
      depths: [0, 100, 500, 1000]
    },
    variables: {
      temperature: { units: "°C", data: {} },
      salinity: { units: "PSU", data: {} }
    }
  };

  // Generate lat/lon arrays (stride 4)
  for (let i = 0; i < 45; i++) dataset.metadata.lat.push(-89.5 + i * 4);
  for (let i = 0; i < 90; i++) dataset.metadata.lon.push(-179.5 + i * 4);

  const depthIndices = { 0: 0, 500: 28 };

  const delay = ms => new Promise(res => setTimeout(res, ms));

  for (const [depthLabel, depthIdx] of Object.entries(depthIndices)) {
    console.log(`Fetching Temperature for depth ${depthLabel}m...`);
    const tUrl = `https://www.ncei.noaa.gov/thredds-ocean/dodsC/woa23/DATA/temperature/netcdf/decav/1.00/woa23_decav_t00_01.nc.ascii?t_an[0:1:0][${depthIdx}:1:${depthIdx}][0:4:179][0:4:359]`;
    const tData = await fetchAscii(tUrl);
    dataset.variables.temperature.data[depthLabel] = parseAscii(tData);
    await delay(1000);

    console.log(`Fetching Salinity for depth ${depthLabel}m...`);
    const sUrl = `https://www.ncei.noaa.gov/thredds-ocean/dodsC/woa23/DATA/salinity/netcdf/decav/1.00/woa23_decav_s00_01.nc.ascii?s_an[0:1:0][${depthIdx}:1:${depthIdx}][0:4:179][0:4:359]`;
    const sData = await fetchAscii(sUrl);
    dataset.variables.salinity.data[depthLabel] = parseAscii(sData);
    await delay(1000);
  }

  fs.writeFileSync('public/woa23_subset.json', JSON.stringify(dataset));
  console.log('Saved to public/woa23_subset.json');
}

run().catch(console.error);
