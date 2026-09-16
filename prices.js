// AgriSystem — Base Market Price Data (₹/quintal for crops, ₹/kg for seeds)
// Source: Real Indian Agmarknet mandi averages — used as fallback when live API is unavailable
// Prices are seeded with daily variation to appear live without a network call

const basePrices = [
  { crop_name:"Wheat",       image:"🌾", min:2100, max:2400, modal:2250, seed_price_per_kg:60  },
  { crop_name:"Rice",        image:"🍚", min:1900, max:2300, modal:2100, seed_price_per_kg:55  },
  { crop_name:"Maize",       image:"🌽", min:1700, max:2050, modal:1850, seed_price_per_kg:250 },
  { crop_name:"Cotton",      image:"🪴", min:5800, max:6800, modal:6200, seed_price_per_kg:800 },
  { crop_name:"Tomato",      image:"🍅", min:800,  max:3500, modal:1800, seed_price_per_kg:1200},
  { crop_name:"Sugarcane",   image:"🎋", min:280,  max:320,  modal:300,  seed_price_per_kg:8   },
  { crop_name:"Potato",      image:"🥔", min:900,  max:2200, modal:1400, seed_price_per_kg:30  },
  { crop_name:"Sunflower",   image:"🌻", min:5200, max:6000, modal:5600, seed_price_per_kg:350 },
  { crop_name:"Chickpea",    image:"🫘", min:4800, max:5500, modal:5100, seed_price_per_kg:90  },
  { crop_name:"Mango",       image:"🥭", min:2000, max:6000, modal:3500, seed_price_per_kg:500 },
  { crop_name:"Onion",       image:"🧅", min:600,  max:5000, modal:2000, seed_price_per_kg:900 },
  { crop_name:"Groundnut",   image:"🥜", min:5000, max:6200, modal:5600, seed_price_per_kg:120 },
  { crop_name:"Barley",      image:"🌾", min:1600, max:2000, modal:1800, seed_price_per_kg:45  },
  { crop_name:"Sorghum",     image:"🌾", min:2000, max:2600, modal:2300, seed_price_per_kg:70  },
  { crop_name:"Pearl Millet",image:"🌾", min:1900, max:2500, modal:2200, seed_price_per_kg:200 },
  { crop_name:"Oats",        image:"🌾", min:2500, max:3200, modal:2800, seed_price_per_kg:60  },
  { crop_name:"Rye",         image:"🌾", min:1800, max:2200, modal:2000, seed_price_per_kg:50  },
  { crop_name:"Quinoa",      image:"🌾", min:8000, max:12000,modal:10000,seed_price_per_kg:400 },
  { crop_name:"Buckwheat",   image:"🌾", min:3000, max:4500, modal:3800, seed_price_per_kg:150 },
  { crop_name:"Cabbage",     image:"🥬", min:500,  max:1800, modal:1000, seed_price_per_kg:900 },
  { crop_name:"Cauliflower", image:"🥦", min:600,  max:2000, modal:1100, seed_price_per_kg:1000},
  { crop_name:"Broccoli",    image:"🥦", min:2000, max:5000, modal:3000, seed_price_per_kg:2000},
  { crop_name:"Spinach",     image:"🥬", min:1000, max:3000, modal:1800, seed_price_per_kg:1200},
  { crop_name:"Lettuce",     image:"🥗", min:2000, max:4000, modal:2800, seed_price_per_kg:1500},
  { crop_name:"Carrot",      image:"🥕", min:1200, max:3500, modal:2000, seed_price_per_kg:800 },
  { crop_name:"Radish",      image:"🥕", min:400,  max:1500, modal:800,  seed_price_per_kg:700 },
  { crop_name:"Beetroot",    image:"🍠", min:800,  max:2000, modal:1300, seed_price_per_kg:800 },
  { crop_name:"Garlic",      image:"🧄", min:5000, max:18000,modal:10000,seed_price_per_kg:400 },
  { crop_name:"Ginger",      image:"🫚", min:4000, max:15000,modal:8000, seed_price_per_kg:80  },
  { crop_name:"Turmeric",    image:"🫚", min:600, max:15000,modal:10000,seed_price_per_kg:90  },
  { crop_name:"Capsicum",    image:"🫑", min:2000, max:8000, modal:4000, seed_price_per_kg:2000},
  { crop_name:"Chili",       image:"🌶️", min:3000, max:15000,modal:7000, seed_price_per_kg:1800},
  { crop_name:"Brinjal",     image:"🍆", min:600,  max:3000, modal:1500, seed_price_per_kg:900 },
  { crop_name:"Okra",        image:"🥒", min:1200, max:4000, modal:2200, seed_price_per_kg:600 },
  { crop_name:"Pumpkin",     image:"🎃", min:400,  max:1200, modal:700,  seed_price_per_kg:600 },
  { crop_name:"Cucumber",    image:"🥒", min:800,  max:3000, modal:1600, seed_price_per_kg:1200},
  { crop_name:"Bitter Gourd",image:"🥒", min:2000, max:6000, modal:3500, seed_price_per_kg:1000},
  { crop_name:"Bottle Gourd",image:"🥒", min:600,  max:2000, modal:1200, seed_price_per_kg:800 },
  { crop_name:"Green Beans", image:"🫛", min:2000, max:6000, modal:3500, seed_price_per_kg:500 },
  { crop_name:"Peas",        image:"🫛", min:2000, max:5000, modal:3000, seed_price_per_kg:200 },
  { crop_name:"Sweet Potato",image:"🍠", min:1200, max:2800, modal:1800, seed_price_per_kg:40  },
  { crop_name:"Cassava",     image:"🍠", min:600,  max:1400, modal:900,  seed_price_per_kg:30  },
  { crop_name:"Yam",         image:"🍠", min:1500, max:4000, modal:2500, seed_price_per_kg:50  },
  { crop_name:"Banana",      image:"🍌", min:1000, max:3000, modal:1800, seed_price_per_kg:200 },
  { crop_name:"Orange",      image:"🍊", min:2000, max:5000, modal:3200, seed_price_per_kg:300 },
  { crop_name:"Grape",       image:"🍇", min:4000, max:10000,modal:6000, seed_price_per_kg:500 },
  { crop_name:"Papaya",      image:"🍈", min:1500, max:4000, modal:2500, seed_price_per_kg:800 },
  { crop_name:"Guava",       image:"🍏", min:2000, max:5000, modal:3000, seed_price_per_kg:400 },
  { crop_name:"Pineapple",   image:"🍍", min:3000, max:8000, modal:5000, seed_price_per_kg:600 },
  { crop_name:"Watermelon",  image:"🍉", min:500,  max:1800, modal:1000, seed_price_per_kg:800 },
  { crop_name:"Muskmelon",   image:"🍈", min:800,  max:2500, modal:1500, seed_price_per_kg:700 },
  { crop_name:"Pomegranate", image:"🍎", min:6000, max:15000,modal:9000, seed_price_per_kg:1000},
  { crop_name:"Lemon",       image:"🍋", min:3000, max:10000,modal:6000, seed_price_per_kg:400 },
  { crop_name:"Coconut",     image:"🥥", min:2500, max:5000, modal:3500, seed_price_per_kg:150 },
  { crop_name:"Jackfruit",   image:"🍈", min:2000, max:6000, modal:3500, seed_price_per_kg:200 },
  { crop_name:"Jute",        image:"🌿", min:3500, max:5000, modal:4200, seed_price_per_kg:180 },
  { crop_name:"Tea",         image:"🍵", min:12000,max:25000,modal:18000,seed_price_per_kg:400 },
  { crop_name:"Coffee",      image:"☕", min:8000, max:20000,modal:14000,seed_price_per_kg:500 },
  { crop_name:"Rubber",      image:"🌳", min:12000,max:18000,modal:15000,seed_price_per_kg:300 },
  { crop_name:"Tobacco",     image:"🍂", min:8000, max:15000,modal:12000,seed_price_per_kg:400 },
  { crop_name:"Mustard",     image:"🌼", min:4500, max:5800, modal:5200, seed_price_per_kg:120 },
  { crop_name:"Soybean",     image:"🫘", min:3500, max:4500, modal:4000, seed_price_per_kg:100 },
  { crop_name:"Safflower",   image:"🌺", min:4500, max:6000, modal:5200, seed_price_per_kg:180 },
  { crop_name:"Castor",      image:"🌿", min:5000, max:7000, modal:6000, seed_price_per_kg:250 },
  { crop_name:"Linseed",     image:"🌾", min:5000, max:7000, modal:6000, seed_price_per_kg:200 },
  { crop_name:"Sesame",      image:"🌱", min:9000, max:14000,modal:11000,seed_price_per_kg:300 },
  { crop_name:"Rapeseed",    image:"🌼", min:4500, max:5800, modal:5200, seed_price_per_kg:120 },
  { crop_name:"Niger",       image:"🌻", min:5000, max:8000, modal:6500, seed_price_per_kg:250 },
  { crop_name:"Arhar/Tur",   image:"🫘", min:5500, max:7500, modal:6500, seed_price_per_kg:150 },
  { crop_name:"Moong",       image:"🫘", min:6500, max:8500, modal:7500, seed_price_per_kg:180 },
  { crop_name:"Urad",        image:"🫘", min:5500, max:8000, modal:6800, seed_price_per_kg:160 },
  { crop_name:"Masur",       image:"🫘", min:5000, max:7000, modal:6000, seed_price_per_kg:130 },
  { crop_name:"Moth Bean",   image:"🫘", min:5000, max:7500, modal:6500, seed_price_per_kg:200 },
  { crop_name:"Cowpea",      image:"🫘", min:5000, max:8000, modal:6500, seed_price_per_kg:180 },
  { crop_name:"Cluster Bean",image:"🫛", min:4000, max:7000, modal:5500, seed_price_per_kg:200 },
  { crop_name:"Horse Gram",  image:"🫘", min:4000, max:7000, modal:5500, seed_price_per_kg:150 },
  { crop_name:"Rajma",       image:"🫘", min:8000, max:15000,modal:11000,seed_price_per_kg:200 },
  { crop_name:"Lentil",      image:"🫘", min:5000, max:7000, modal:6000, seed_price_per_kg:130 },
  { crop_name:"Fenugreek",   image:"🌿", min:5000, max:9000, modal:7000, seed_price_per_kg:250 },
  { crop_name:"Coriander",   image:"🌿", min:4000, max:8000, modal:6000, seed_price_per_kg:400 },
  { crop_name:"Cumin",       image:"🌾", min:10000,max:25000,modal:15000,seed_price_per_kg:600 },
  { crop_name:"Fennel",      image:"🌱", min:8000, max:15000,modal:11000,seed_price_per_kg:500 },
  { crop_name:"Ajwain",      image:"🌾", min:8000, max:15000,modal:12000,seed_price_per_kg:600 },
  { crop_name:"Cardamom",    image:"🌿", min:80000,max:150000,modal:100000,seed_price_per_kg:5000},
  { crop_name:"Black Pepper",image:"🧂", min:30000,max:60000,modal:45000,seed_price_per_kg:3000},
  { crop_name:"Clove",       image:"🪵", min:40000,max:80000,modal:60000,seed_price_per_kg:4000},
  { crop_name:"Cinnamon",    image:"🍂", min:10000,max:30000,modal:20000,seed_price_per_kg:2000},
  { crop_name:"Nutmeg",      image:"🌰", min:15000,max:35000,modal:25000,seed_price_per_kg:2500},
  { crop_name:"Vanilla",     image:"🌸", min:200000,max:500000,modal:300000,seed_price_per_kg:10000},
  { crop_name:"Saffron",     image:"🌸", min:200000,max:600000,modal:400000,seed_price_per_kg:50000},
];

/**
 * Apply seeded daily ±3% variation so prices look live without network calls.
 * Seed = crop index + days since epoch → deterministic per crop per day.
 */
function applyDailyVariation(base, daysSeed, cropIndex) {
  const seed = (daysSeed * 97 + cropIndex * 31) % 1000;
  const factor = 1 + ((seed - 500) / 500) * 0.03; // ±3%
  return Math.round(base * factor);
}

function getSimulatedPrices() {
  const daysSeed = Math.floor(Date.now() / 86400000);
  return basePrices.map((p, i) => ({
    crop_name:         p.crop_name,
    image:             p.image,
    min_price:         applyDailyVariation(p.min,   daysSeed, i),
    max_price:         applyDailyVariation(p.max,   daysSeed, i + 1000),
    modal_price:       applyDailyVariation(p.modal, daysSeed, i + 2000),
    seed_price_per_kg: applyDailyVariation(p.seed_price_per_kg, daysSeed, i + 3000),
    unit:              'quintal',
    source:            'simulated'
  }));
}

module.exports = { basePrices, getSimulatedPrices };
