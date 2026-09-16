const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const CROPS_DIR = path.join(__dirname, 'images', 'crops');
if (!fs.existsSync(CROPS_DIR)) {
  fs.mkdirSync(CROPS_DIR, { recursive: true });
}

// Aliases for better Wikimedia matching
const ALIASES = {
  'sunflower': 'Common sunflower',
  'oats': 'Oat',
  'mustard': 'Mustard plant',
  'peas': 'Pea',
  'muskmelon': 'Cantaloupe',
  'castor': 'Ricinus',
  'ajwain': 'Ajwain',
  'aloe vera': 'Aloe vera',
  'ashwagandha': 'Withania somnifera',
  'moringa': 'Moringa oleifera',
  'tulsi': 'Ocimum tenuiflorum',
  'groundnut': 'Peanut',
  'orange': 'Orange (fruit)',
  'coffee': 'Coffea',
  'tobacco': 'Nicotiana tabacum',
  'capsicum': 'Bell pepper',
  'arhar/tur': 'Pigeon pea',
  'arhar': 'Pigeon pea',
  'tur': 'Pigeon pea',
  'moong': 'Mung bean',
  'urad': 'Vigna mungo',
  'masur': 'Lentil',
  'moth bean': 'Vigna aconitifolia',
  'cluster bean': 'Guar',
  'horse gram': 'Macrotyloma uniflorum',
  'rajma': 'Kidney bean',
  'green gram': 'Mung bean',
  'black gram': 'Vigna mungo',
  'pigeon pea': 'Pigeon pea',
  'pearl millet': 'Pearl millet',
  'bitter gourd': 'Momordica charantia',
  'bottle gourd': 'Calabash',
  'sweet potato': 'Sweet potato',
  'green beans': 'Green bean',
  'chili': 'Chili pepper',
  'brinjal': 'Eggplant',
  'okra': 'Okra',
  'cassava': 'Cassava',
  'yam': 'Dioscorea',
  'black pepper': 'Black pepper',
  'jute': 'Jute',
  'jackfruit': 'Jackfruit',
  'niger': 'Guizotia abyssinica',
  'linseed': 'Flax',
  'sesame': 'Sesame',
  'safflower': 'Safflower',
  'fenugreek': 'Fenugreek',
  'fennel': 'Fennel',
  'clove': 'Clove',
  'cinnamon': 'Cinnamon',
  'nutmeg': 'Nutmeg',
  'vanilla': 'Vanilla',
  'saffron': 'Saffron',
  'rubber': 'Hevea brasiliensis'
};

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'AgriSystemBot/1.0 (https://github.com/AgriSystem; dev@agrisystem.org)'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', reject);
  });
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    const req = proto.get(url, {
      headers: {
        'User-Agent': 'AgriSystemBot/1.0 (https://github.com/AgriSystem; dev@agrisystem.org)'
      }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download ${url}: status ${res.statusCode}`));
      }
      const fileStream = fs.createWriteStream(destPath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve(destPath);
      });
    });
    req.on('error', reject);
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

async function findWikiImage(name) {
  const cleanName = name.toLowerCase();
  const searchName = ALIASES[cleanName] || name.replace(/\/.*/, '').trim();

  // 1. Wikipedia PageImages API
  const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(searchName)}&prop=pageimages&format=json&pithumbsize=400`;
  try {
    const wikiData = await fetchJson(wikiUrl);
    if (wikiData && wikiData.query && wikiData.query.pages) {
      const pages = Object.values(wikiData.query.pages);
      if (pages[0] && pages[0].thumbnail && pages[0].thumbnail.source) {
        return pages[0].thumbnail.source;
      }
    }
  } catch (e) {}

  // 2. Wikipedia generator search API
  const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(searchName + ' plant')}&gsrlimit=3&prop=pageimages&format=json&pithumbsize=600`;
  try {
    const searchData = await fetchJson(searchUrl);
    if (searchData && searchData.query && searchData.query.pages) {
      const pages = Object.values(searchData.query.pages);
      for (const p of pages) {
        if (p.thumbnail && p.thumbnail.source) {
          return p.thumbnail.source;
        }
      }
    }
  } catch (e) {}

  return null;
}

async function main() {
  const allCrops = JSON.parse(fs.readFileSync('all_crops.json', 'utf8'));
  console.log(`Processing ${allCrops.length} crops for Wikimedia photos...`);

  const results = {};
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < allCrops.length; i++) {
    const crop = allCrops[i];
    const slug = slugify(crop);
    const destFile = path.join(CROPS_DIR, `${slug}.jpg`);
    const relPath = `images/crops/${slug}.jpg`;

    process.stdout.write(`[${i+1}/${allCrops.length}] ${crop}... `);

    if (fs.existsSync(destFile) && fs.statSync(destFile).size > 1000) {
      console.log(`Already exists (${Math.round(fs.statSync(destFile).size / 1024)} KB)`);
      results[crop.toLowerCase()] = relPath;
      successCount++;
      continue;
    }

    try {
      const imgUrl = await findWikiImage(crop);
      if (imgUrl) {
        await downloadFile(imgUrl, destFile);
        results[crop.toLowerCase()] = relPath;
        console.log(`Downloaded (${Math.round(fs.statSync(destFile).size / 1024)} KB)`);
        successCount++;
      } else {
        console.log(`No Wikimedia photo found`);
        failCount++;
      }
    } catch (err) {
      console.log(`Error: ${err.message}`);
      failCount++;
    }

    // Small delay to be respectful to Wikimedia API
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`\nCompleted! Success: ${successCount}, Failed: ${failCount}`);

  // Write JS mapping for the browser
  const jsContent = `// Auto-generated crop image map from Wikimedia Commons\nwindow.CROP_IMAGES = ${JSON.stringify(results, null, 2)};\n`;
  fs.writeFileSync('crop_images.js', jsContent);
  console.log('Saved crop_images.js');
}

main().catch(console.error);
