const fs = require('fs');
const content = fs.readFileSync('api.js', 'utf8');
const regex = /name:\s*["']([^"']+)["']/g;
const set = new Set();
let match;
while ((match = regex.exec(content)) !== null) {
  set.add(match[1]);
}
const { crops } = require('./data.js');
crops.forEach(c => set.add(c.name));
const { basePrices } = require('./prices.js');
basePrices.forEach(p => set.add(p.crop_name));

const list = Array.from(set).sort();
console.log('Total unique crops:', list.length);
fs.writeFileSync('all_crops.json', JSON.stringify(list, null, 2));
console.log('Saved all_crops.json');
