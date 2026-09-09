import https from 'https';
import fs from 'fs';

const url = 'https://www.ncei.noaa.gov/thredds-ocean/dodsC/woa23/DATA/temperature/netcdf/decav/1.00/woa23_decav_t00_01.nc.ascii?t_an[0:1:0][0:1:0][0:4:179][0:4:359]';

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    fs.writeFileSync('test_opendap.txt', data);
    console.log('Downloaded. Status:', res.statusCode);
  });
}).on('error', err => {
  console.error('Error:', err.message);
});
