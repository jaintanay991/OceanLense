import https from 'https';
import fs from 'fs';

const url = 'https://data.marine.copernicus.eu/api/v2/products/OCEANCOLOUR_GLO_BGC_L4_MY_009_104';

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    if (res.statusCode !== 200) {
      fs.writeFileSync('public/chlorophyll.json', JSON.stringify({
        error: `Chlorophyll Data Unavailable. Technical error: HTTP ${res.statusCode} from Copernicus Marine Service API. Authentication credentials required for OCEANCOLOUR_GLO_BGC_L4_MY_009_104.`
      }));
      console.log(`Saved error for HTTP ${res.statusCode}`);
      return;
    }
    fs.writeFileSync('public/chlorophyll.json', JSON.stringify({
      error: `Chlorophyll Data Unavailable. Technical error: Authentication credentials required for OCEANCOLOUR_GLO_BGC_L4_MY_009_104.`
    }));
  });
}).on('error', err => {
  fs.writeFileSync('public/chlorophyll.json', JSON.stringify({
    error: `Chlorophyll Data Unavailable. Exact error: ${err.message}`
  }));
  console.error('Error:', err.message);
});
