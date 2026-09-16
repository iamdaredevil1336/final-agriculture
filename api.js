// ============================================================
//  AgriSystem — API Layer (js/api.js)
//  Works in TWO modes:
//  1. STANDALONE: Uses embedded data (no server needed)
//  2. LIVE:       Calls real API at API_BASE_URL
// ============================================================

// ── CONFIG ──────────────────────────────────────────────────
// Automatically use live API when served over HTTP/HTTPS; fallback on file://
const USE_LIVE_API = typeof window !== 'undefined' && window.location.protocol.startsWith('http');
// Dynamically resolve origin for local development, Vercel preview, and production
const API_BASE_URL = (typeof window !== 'undefined' && window.location.origin)
  ? window.location.origin.replace(/\/+$/, '')
  : '';

// ── EMBEDDED DATA (used when USE_LIVE_API = false) ───────────
const _crops = [
  { id:1, name:"Wheat", image:"🌾", category:"cereal", season:["rabi","winter"], soil_types:["loamy","clay","alluvial"], climate:["cool","temperate"], water_requirement:"medium", sowing_months:["October","November","December"], harvest_months:["March","April"], duration_days:"120-150", description:"Wheat is a staple cereal crop grown in cool, dry climates. One of the most widely cultivated crops worldwide.", care_tips:["Irrigate 4–6 times during growing period","Apply nitrogen fertilizer at sowing and top-dress after 3 weeks","Watch for rust disease — use resistant varieties","Ensure well-drained soil to avoid waterlogging"], seeds:{ type:"Grain Seed", sowing_depth_cm:"5-7", seed_rate_kg_per_acre:"40-50 kg", germination_days:"7-10", spacing_cm:"20-22 (row)" } },
  { id:2, name:"Rice", image:"🍚", category:"cereal", season:["kharif","summer"], soil_types:["clay","alluvial","loamy"], climate:["hot","humid","tropical"], water_requirement:"high", sowing_months:["June","July"], harvest_months:["October","November"], duration_days:"120-160", description:"Rice is the most important food crop in Asia. Requires standing water during most of its growth period.", care_tips:["Maintain 5–10 cm standing water in fields","Transplant seedlings 25–30 days after nursery sowing","Top dress urea at tillering stage","Drain field 2 weeks before harvest"], seeds:{ type:"Paddy Seed", sowing_depth_cm:"2-3 (nursery)", seed_rate_kg_per_acre:"8-10 kg", germination_days:"5-8", spacing_cm:"20×15 transplanted" } },
  { id:3, name:"Maize", image:"🌽", category:"cereal", season:["kharif","summer"], soil_types:["loamy","sandy-loam","alluvial"], climate:["warm","tropical","subtropical"], water_requirement:"medium", sowing_months:["June","July","February"], harvest_months:["September","October"], duration_days:"90-110", description:"Maize is a versatile crop used for food, fodder, and industrial products. Grows best in warm, well-drained soils.", care_tips:["Sow seeds on ridges or raised beds","Irrigate at knee-high and silking stage","Apply balanced NPK fertilizer","Control stem borer with appropriate pesticide"], seeds:{ type:"Hybrid / Open-Pollinated", sowing_depth_cm:"4-5", seed_rate_kg_per_acre:"8-10 kg", germination_days:"6-10", spacing_cm:"60×25" } },
  { id:4, name:"Cotton", image:"🪴", category:"cash_crop", season:["kharif","summer"], soil_types:["black","clay","deep-loam"], climate:["hot","tropical","subtropical"], water_requirement:"medium", sowing_months:["April","May","June"], harvest_months:["October","November","December"], duration_days:"150-180", description:"Cotton is a major cash crop grown for its fiber. Thrives in hot climates with deep, well-drained soils.", care_tips:["Sow after last frost when soil is warm","Thin to 1 plant per hill after germination","Monitor for bollworm and whitefly","Reduce irrigation at boll maturity"], seeds:{ type:"Hybrid / Bt Cotton", sowing_depth_cm:"3-5", seed_rate_kg_per_acre:"1-1.5 kg", germination_days:"7-10", spacing_cm:"90×60" } },
  { id:5, name:"Tomato", image:"🍅", category:"vegetable", season:["rabi","kharif","winter","summer"], soil_types:["loamy","sandy-loam","alluvial"], climate:["warm","temperate"], water_requirement:"medium", sowing_months:["June","July","October","November"], harvest_months:["September","October","January","February"], duration_days:"60-80", description:"Tomato is one of the most popular vegetable crops. Can be grown in multiple seasons, rich in vitamins.", care_tips:["Start seeds in nursery trays 30 days before transplanting","Stake plants when 30 cm tall","Irrigate regularly — avoid waterlogging","Spray fungicide to prevent early blight"], seeds:{ type:"Hybrid Vegetable Seed", sowing_depth_cm:"0.5-1", seed_rate_kg_per_acre:"0.1-0.15 kg", germination_days:"5-7", spacing_cm:"75×60" } },
  { id:6, name:"Sugarcane", image:"🎋", category:"cash_crop", season:["annual"], soil_types:["loamy","clay","alluvial"], climate:["tropical","subtropical","hot"], water_requirement:"high", sowing_months:["February","March","October"], harvest_months:["November","December","January"], duration_days:"300-360", description:"Sugarcane is the primary source of sugar and ethanol. Long-duration crop requiring high water input.", care_tips:["Use healthy 2-3 budded setts for planting","Provide earthing up at 90 days","Irrigate every 10–15 days","Control top borer during early growth"], seeds:{ type:"Stem Cuttings (Setts)", sowing_depth_cm:"10-15", seed_rate_kg_per_acre:"2500-3000 setts", germination_days:"15-21", spacing_cm:"90×30" } },
  { id:7, name:"Potato", image:"🥔", category:"vegetable", season:["rabi","winter"], soil_types:["sandy-loam","loamy","alluvial"], climate:["cool","temperate"], water_requirement:"medium", sowing_months:["October","November"], harvest_months:["January","February","March"], duration_days:"80-110", description:"Potato is a major vegetable crop grown in cool weather. Grown from tubers and rich in carbohydrates.", care_tips:["Use certified, disease-free seed tubers","Hill up soil around plants at 30 days","Irrigate every 7–10 days","Spray fungicide to prevent late blight"], seeds:{ type:"Seed Tubers", sowing_depth_cm:"8-10", seed_rate_kg_per_acre:"500-600 kg", germination_days:"14-21", spacing_cm:"60×20" } },
  { id:8, name:"Sunflower", image:"🌻", category:"oilseed", season:["kharif","rabi","summer"], soil_types:["loamy","sandy-loam","black"], climate:["warm","temperate","cool"], water_requirement:"low", sowing_months:["June","July","October","January"], harvest_months:["September","October","March"], duration_days:"90-100", description:"Sunflower is an important oilseed crop that can be grown in multiple seasons. Drought-tolerant and adaptable.", care_tips:["Sow 2 seeds per hill, thin to 1 after germination","Apply boron micronutrient to improve seed setting","Irrigate at flowering and seed-filling stages","Protect from birds during seed filling"], seeds:{ type:"Hybrid Oilseed", sowing_depth_cm:"3-5", seed_rate_kg_per_acre:"2-2.5 kg", germination_days:"6-8", spacing_cm:"60×30" } },
  { id:9, name:"Chickpea", image:"🫘", category:"pulse", season:["rabi","winter"], soil_types:["loamy","sandy-loam","black"], climate:["cool","dry","temperate"], water_requirement:"low", sowing_months:["October","November"], harvest_months:["February","March"], duration_days:"100-120", description:"Chickpea is a drought-tolerant pulse crop that fixes nitrogen in the soil. Rich source of protein.", care_tips:["Treat seeds with Rhizobium culture before sowing","Avoid excess irrigation — 1–2 irrigations sufficient","Monitor for pod borer at flowering","Harvest when leaves turn yellow and pods are dry"], seeds:{ type:"Pulse Seed", sowing_depth_cm:"5-8", seed_rate_kg_per_acre:"30-35 kg", germination_days:"8-12", spacing_cm:"30×10" } },
  { id:10, name:"Mango", image:"🥭", category:"fruit", season:["perennial"], soil_types:["loamy","alluvial","laterite"], climate:["tropical","subtropical","hot"], water_requirement:"low", sowing_months:["July","August"], harvest_months:["April","May","June"], duration_days:"1800+ (5 yrs)", description:"Mango is the king of fruits and a major horticultural crop. Grafted plants bear fruit in 3–4 years.", care_tips:["Use grafted plants for early and reliable fruiting","Apply farmyard manure in July–August every year","Irrigate young trees weekly; mature trees before flowering","Prune dead wood after harvest"], seeds:{ type:"Grafted Sapling", sowing_depth_cm:"10-15", seed_rate_kg_per_acre:"16-20 plants", germination_days:"14-21", spacing_cm:"1000×1000 (10m)" } },
  { id:11, name:"Onion", image:"🧅", category:"vegetable", season:["rabi","kharif"], soil_types:["loamy","sandy-loam","alluvial"], climate:["cool","temperate","warm"], water_requirement:"medium", sowing_months:["October","November","June"], harvest_months:["February","March","September"], duration_days:"100-120", description:"Onion is one of the most important commercial vegetable crops used worldwide as a condiment and vegetable.", care_tips:["Transplant 6-week-old nursery seedlings","Irrigate every 7-10 days; stop 10 days before harvest","Apply potassium for better bulb development","Control thrips with neem oil spray"], seeds:{ type:"Bulb Seed / Sets", sowing_depth_cm:"1-2", seed_rate_kg_per_acre:"3-4 kg", germination_days:"8-12", spacing_cm:"15×10" } },
  { id:12, name:"Groundnut", image:"🥜", category:"oilseed", season:["kharif","summer"], soil_types:["sandy-loam","loamy","red"], climate:["warm","tropical","subtropical"], water_requirement:"medium", sowing_months:["June","July","January"], harvest_months:["September","October","April"], duration_days:"100-130", description:"Groundnut is a major oilseed and food crop. It fixes atmospheric nitrogen and improves soil fertility.", care_tips:["Shell seeds just before sowing for best germination","Earthing up is essential for pod development","Avoid waterlogging — causes collar rot","Apply gypsum at pegging stage for calcium"], seeds:{ type:"Oilseed (Kernel)", sowing_depth_cm:"4-6", seed_rate_kg_per_acre:"50-60 kg", germination_days:"7-10", spacing_cm:"30×10" } },
  { id:13, name:"Barley", image:"🌾", category:"cereal", season:["rabi","winter"], soil_types:["loamy","alluvial","sandy-loam"], climate:["warm","temperate"], water_requirement:"low", sowing_months:["June","July"], harvest_months:["October","November"], duration_days:"90-120", description:"A resilient crop widely cultivated for its uses. Barley prefers a supportive climate.", care_tips:["Ensure proper soil drainage","Monitor for pests during early growth phases","Apply balanced fertilizers"], seeds:{ type:"Standard Seed", sowing_depth_cm:"2-5", seed_rate_kg_per_acre:"5-10", germination_days:"7-14", spacing_cm:"30x10" } },
  { id:14, name:"Sorghum", image:"🌾", category:"cereal", season:["kharif","summer"], soil_types:["loamy","alluvial","sandy-loam"], climate:["warm","temperate"], water_requirement:"low", sowing_months:["June","July"], harvest_months:["October","November"], duration_days:"90-120", description:"A resilient crop widely cultivated for its uses. Sorghum prefers a supportive climate.", care_tips:["Ensure proper soil drainage","Monitor for pests during early growth phases","Apply balanced fertilizers"], seeds:{ type:"Standard Seed", sowing_depth_cm:"2-5", seed_rate_kg_per_acre:"5-10", germination_days:"7-14", spacing_cm:"30x10" } },
  { id:15, name:"Pearl Millet", image:"🌾", category:"cereal", season:["kharif","summer"], soil_types:["loamy","alluvial","sandy-loam"], climate:["warm","temperate"], water_requirement:"low", sowing_months:["June","July"], harvest_months:["October","November"], duration_days:"90-120", description:"A resilient crop widely cultivated for its uses. Pearl Millet prefers a supportive climate.", care_tips:["Ensure proper soil drainage","Monitor for pests during early growth phases","Apply balanced fertilizers"], seeds:{ type:"Standard Seed", sowing_depth_cm:"2-5", seed_rate_kg_per_acre:"5-10", germination_days:"7-14", spacing_cm:"30x10" } },
  { id:16, name:"Oats", image:"🌾", category:"cereal", season:["rabi","winter"], soil_types:["loamy","alluvial","sandy-loam"], climate:["warm","temperate"], water_requirement:"medium", sowing_months:["June","July"], harvest_months:["October","November"], duration_days:"90-120", description:"A resilient crop widely cultivated for its uses. Oats prefers a supportive climate.", care_tips:["Ensure proper soil drainage","Monitor for pests during early growth phases","Apply balanced fertilizers"], seeds:{ type:"Standard Seed", sowing_depth_cm:"2-5", seed_rate_kg_per_acre:"5-10", germination_days:"7-14", spacing_cm:"30x10" } },
  { id:17, name:"Rye", image:"🌾", category:"cereal", season:["rabi","winter"], soil_types:["loamy","alluvial","sandy-loam"], climate:["warm","temperate"], water_requirement:"low", sowing_months:["June","July"], harvest_months:["October","November"], duration_days:"90-120", description:"A resilient crop widely cultivated for its uses. Rye prefers a supportive climate.", care_tips:["Ensure proper soil drainage","Monitor for pests during early growth phases","Apply balanced fertilizers"], seeds:{ type:"Standard Seed", sowing_depth_cm:"2-5", seed_rate_kg_per_acre:"5-10", germination_days:"7-14", spacing_cm:"30x10" } },
  { id:18, name:"Quinoa", image:"🌾", category:"cereal", season:["rabi","winter"], soil_types:["loamy","alluvial","sandy-loam"], climate:["warm","temperate"], water_requirement:"low", sowing_months:["June","July"], harvest_months:["October","November"], duration_days:"90-120", description:"A resilient crop widely cultivated for its uses. Quinoa prefers a supportive climate.", care_tips:["Ensure proper soil drainage","Monitor for pests during early growth phases","Apply balanced fertilizers"], seeds:{ type:"Standard Seed", sowing_depth_cm:"2-5", seed_rate_kg_per_acre:"5-10", germination_days:"7-14", spacing_cm:"30x10" } },
  { id:19, name:"Buckwheat", image:"🌾", category:"cereal", season:["kharif"], soil_types:["loamy","alluvial","sandy-loam"], climate:["warm","temperate"], water_requirement:"medium", sowing_months:["June","July"], harvest_months:["October","November"], duration_days:"90-120", description:"A resilient crop widely cultivated for its uses. Buckwheat prefers a supportive climate.", care_tips:["Ensure proper soil drainage","Monitor for pests during early growth phases","Apply balanced fertilizers"], seeds:{ type:"Standard Seed", sowing_depth_cm:"2-5", seed_rate_kg_per_acre:"5-10", germination_days:"7-14", spacing_cm:"30x10" } },
  { id:20, name:"Cabbage", image:"🥬", category:"vegetable", season:["rabi","winter"], soil_types:["loamy","alluvial","sandy-loam"], climate:["warm","temperate"], water_requirement:"medium", sowing_months:["June","July"], harvest_months:["October","November"], duration_days:"90-120", description:"A resilient crop widely cultivated for its uses. Cabbage prefers a supportive climate.", care_tips:["Ensure proper soil drainage","Monitor for pests during early growth phases","Apply balanced fertilizers"], seeds:{ type:"Standard Seed", sowing_depth_cm:"2-5", seed_rate_kg_per_acre:"5-10", germination_days:"7-14", spacing_cm:"30x10" } },
  { id:21, name:"Cauliflower", image:"🥦", category:"vegetable", season:["rabi","winter"], soil_types:["loamy","alluvial","sandy-loam"], climate:["warm","temperate"], water_requirement:"medium", sowing_months:["June","July"], harvest_months:["October","November"], duration_days:"90-120", description:"A resilient crop widely cultivated for its uses. Cauliflower prefers a supportive climate.", care_tips:["Ensure proper soil drainage","Monitor for pests during early growth phases","Apply balanced fertilizers"], seeds:{ type:"Standard Seed", sowing_depth_cm:"2-5", seed_rate_kg_per_acre:"5-10", germination_days:"7-14", spacing_cm:"30x10" } },
  { id:22, name:"Broccoli", image:"🥦", category:"vegetable", season:["rabi","winter"], soil_types:["loamy","alluvial","sandy-loam"], climate:["warm","temperate"], water_requirement:"medium", sowing_months:["June","July"], harvest_months:["October","November"], duration_days:"90-120", description:"A resilient crop widely cultivated for its uses. Broccoli prefers a supportive climate.", care_tips:["Ensure proper soil drainage","Monitor for pests during early growth phases","Apply balanced fertilizers"], seeds:{ type:"Standard Seed", sowing_depth_cm:"2-5", seed_rate_kg_per_acre:"5-10", germination_days:"7-14", spacing_cm:"30x10" } },
  { id:23, name:"Spinach", image:"🥬", category:"vegetable", season:["rabi","winter"], soil_types:["loamy","alluvial","sandy-loam"], climate:["warm","temperate"], water_requirement:"high", sowing_months:["June","July"], harvest_months:["October","November"], duration_days:"90-120", description:"A resilient crop widely cultivated for its uses. Spinach prefers a supportive climate.", care_tips:["Ensure proper soil drainage","Monitor for pests during early growth phases","Apply balanced fertilizers"], seeds:{ type:"Standard Seed", sowing_depth_cm:"2-5", seed_rate_kg_per_acre:"5-10", germination_days:"7-14", spacing_cm:"30x10" } },
  { id:24, name:"Lettuce", image:"🥗", category:"vegetable", season:["rabi","winter"], soil_types:["loamy","alluvial","sandy-loam"], climate:["warm","temperate"], water_requirement:"medium", sowing_months:["June","July"], harvest_months:["October","November"], duration_days:"90-120", description:"A resilient crop widely cultivated for its uses. Lettuce prefers a supportive climate.", care_tips:["Ensure proper soil drainage","Monitor for pests during early growth phases","Apply balanced fertilizers"], seeds:{ type:"Standard Seed", sowing_depth_cm:"2-5", seed_rate_kg_per_acre:"5-10", germination_days:"7-14", spacing_cm:"30x10" } },
  { id:25, name:"Carrot", image:"🥕", category:"vegetable", season:["rabi","winter"], soil_types:["loamy","alluvial","sandy-loam"], climate:["warm","temperate"], water_requirement:"medium", sowing_months:["June","July"], harvest_months:["October","November"], duration_days:"90-120", description:"A resilient crop widely cultivated for its uses. Carrot prefers a supportive climate.", care_tips:["Ensure proper soil drainage","Monitor for pests during early growth phases","Apply balanced fertilizers"], seeds:{ type:"Standard Seed", sowing_depth_cm:"2-5", seed_rate_kg_per_acre:"5-10", germination_days:"7-14", spacing_cm:"30x10" } },
  { id:26, name:"Radish", image:"🥕", category:"vegetable", season:["rabi","winter"], soil_types:["loamy","alluvial","sandy-loam"], climate:["warm","temperate"], water_requirement:"medium", sowing_months:["June","July"], harvest_months:["October","November"], duration_days:"90-120", description:"A resilient crop widely cultivated for its uses. Radish prefers a supportive climate.", care_tips:["Ensure proper soil drainage","Monitor for pests during early growth phases","Apply balanced fertilizers"], seeds:{ type:"Standard Seed", sowing_depth_cm:"2-5", seed_rate_kg_per_acre:"5-10", germination_days:"7-14", spacing_cm:"30x10" } },
  { id:27, name:"Beetroot", image:"🍠", category:"vegetable", season:["rabi","winter"], soil_types:["loamy","alluvial","sandy-loam"], climate:["warm","temperate"], water_requirement:"medium", sowing_months:["June","July"], harvest_months:["October","November"], duration_days:"90-120", description:"A resilient crop widely cultivated for its uses. Beetroot prefers a supportive climate.", care_tips:["Ensure proper soil drainage","Monitor for pests during early growth phases","Apply balanced fertilizers"], seeds:{ type:"Standard Seed", sowing_depth_cm:"2-5", seed_rate_kg_per_acre:"5-10", germination_days:"7-14", spacing_cm:"30x10" } },
  { id:28, name:"Garlic", image:"🧄", category:"vegetable", season:["rabi","winter"], soil_types:["loamy","alluvial","sandy-loam"], climate:["warm","temperate"], water_requirement:"medium", sowing_months:["June","July"], harvest_months:["October","November"], duration_days:"90-120", description:"A resilient crop widely cultivated for its uses. Garlic prefers a supportive climate.", care_tips:["Ensure proper soil drainage","Monitor for pests during early growth phases","Apply balanced fertilizers"], seeds:{ type:"Standard Seed", sowing_depth_cm:"2-5", seed_rate_kg_per_acre:"5-10", germination_days:"7-14", spacing_cm:"30x10" } },
  { id:29, name:"Ginger", image:"🫚", category:"vegetable", season:["kharif"], soil_types:["loamy","alluvial","sandy-loam"], climate:["warm","temperate"], water_requirement:"medium", sowing_months:["June","July"], harvest_months:["October","November"], duration_days:"90-120", description:"A resilient crop widely cultivated for its uses. Ginger prefers a supportive climate.", care_tips:["Ensure proper soil drainage","Monitor for pests during early growth phases","Apply balanced fertilizers"], seeds:{ type:"Standard Seed", sowing_depth_cm:"2-5", seed_rate_kg_per_acre:"5-10", germination_days:"7-14", spacing_cm:"30x10" } },
  { id:30, name:"Turmeric", image:"🫚", category:"vegetable", season:["kharif"], soil_types:["loamy","alluvial","sandy-loam"], climate:["warm","temperate"], water_requirement:"medium", sowing_months:["June","July"], harvest_months:["October","November"], duration_days:"90-120", description:"A resilient crop widely cultivated for its uses. Turmeric prefers a supportive climate.", care_tips:["Ensure proper soil drainage","Monitor for pests during early growth phases","Apply balanced fertilizers"], seeds:{ type:"Standard Seed", sowing_depth_cm:"2-5", seed_rate_kg_per_acre:"5-10", germination_days:"7-14", spacing_cm:"30x10" } },
  { id:31, name:"Capsicum", image:"🫑", category:"vegetable", season:["kharif","rabi"], soil_types:["loamy","alluvial","sandy-loam"], climate:["warm","temperate"], water_requirement:"medium", sowing_months:["June","July"], harvest_months:["October","November"], duration_days:"90-120", description:"A resilient crop widely cultivated for its uses. Capsicum prefers a supportive climate.", care_tips:["Ensure proper soil drainage","Monitor for pests during early growth phases","Apply balanced fertilizers"], seeds:{ type:"Standard Seed", sowing_depth_cm:"2-5", seed_rate_kg_per_acre:"5-10", germination_days:"7-14", spacing_cm:"30x10" } },
  { id:32, name:"Chili", image:"🌶️", category:"vegetable", season:["kharif","rabi","summer"], soil_types:["loamy","alluvial","sandy-loam"], climate:["warm","temperate"], water_requirement:"medium", sowing_months:["June","July"], harvest_months:["October","November"], duration_days:"90-120", description:"A resilient crop widely cultivated for its uses. Chili prefers a supportive climate.", care_tips:["Ensure proper soil drainage","Monitor for pests during early growth phases","Apply balanced fertilizers"], seeds:{ type:"Standard Seed", sowing_depth_cm:"2-5", seed_rate_kg_per_acre:"5-10", germination_days:"7-14", spacing_cm:"30x10" } },
  { id:33, name:"Brinjal", image:"🍆", category:"vegetable", season:["kharif","rabi","summer"], soil_types:["loamy","alluvial","sandy-loam"], climate:["warm","temperate"], water_requirement:"medium", sowing_months:["June","July"], harvest_months:["October","November"], duration_days:"90-120", description:"A resilient crop widely cultivated for its uses. Brinjal prefers a supportive climate.", care_tips:["Ensure proper soil drainage","Monitor for pests during early growth phases","Apply balanced fertilizers"], seeds:{ type:"Standard Seed", sowing_depth_cm:"2-5", seed_rate_kg_per_acre:"5-10", germination_days:"7-14", spacing_cm:"30x10" } },
  { id:34, name:"Okra", image:"🥒", category:"vegetable", season:["kharif","summer"], soil_types:["loamy","alluvial","sandy-loam"], climate:["warm","temperate"], water_requirement:"medium", sowing_months:["June","July"], harvest_months:["October","November"], duration_days:"90-120", description:"A resilient crop widely cultivated for its uses. Okra prefers a supportive climate.", care_tips:["Ensure proper soil drainage","Monitor for pests during early growth phases","Apply balanced fertilizers"], seeds:{ type:"Standard Seed", sowing_depth_cm:"2-5", seed_rate_kg_per_acre:"5-10", germination_days:"7-14", spacing_cm:"30x10" } },
  { id:35, name:"Pumpkin", image:"🎃", category:"vegetable", season:["kharif","summer"], soil_types:["loamy","alluvial","sandy-loam"], climate:["warm","temperate"], water_requirement:"medium", sowing_months:["June","July"], harvest_months:["October","November"], duration_days:"90-120", description:"A resilient crop widely cultivated for its uses. Pumpkin prefers a supportive climate.", care_tips:["Ensure proper soil drainage","Monitor for pests during early growth phases","Apply balanced fertilizers"], seeds:{ type:"Standard Seed", sowing_depth_cm:"2-5", seed_rate_kg_per_acre:"5-10", germination_days:"7-14", spacing_cm:"30x10" } },
  { id:36, name:"Cucumber", image:"🥒", category:"vegetable", season:["kharif","summer"], soil_types:["loamy","alluvial","sandy-loam"], climate:["warm","temperate"], water_requirement:"high", sowing_months:["June","July"], harvest_months:["October","November"], duration_days:"90-120", description:"A resilient crop widely cultivated for its uses. Cucumber prefers a supportive climate.", care_tips:["Ensure proper soil drainage","Monitor for pests during early growth phases","Apply balanced fertilizers"], seeds:{ type:"Standard Seed", sowing_depth_cm:"2-5", seed_rate_kg_per_acre:"5-10", germination_days:"7-14", spacing_cm:"30x10" } },
  { id:37, name:"Bitter Gourd", image:"🥒", category:"vegetable", season:["kharif","summer"], soil_types:["loamy","alluvial","sandy-loam"], climate:["warm","temperate"], water_requirement:"medium", sowing_months:["June","July"], harvest_months:["October","November"], duration_days:"90-120", description:"A resilient crop widely cultivated for its uses. Bitter Gourd prefers a supportive climate.", care_tips:["Ensure proper soil drainage","Monitor for pests during early growth phases","Apply balanced fertilizers"], seeds:{ type:"Standard Seed", sowing_depth_cm:"2-5", seed_rate_kg_per_acre:"5-10", germination_days:"7-14", spacing_cm:"30x10" } },
  { id:38, name:"Bottle Gourd", image:"🥒", category:"vegetable", season:["kharif","summer"], soil_types:["loamy","alluvial","sandy-loam"], climate:["warm","temperate"], water_requirement:"medium", sowing_months:["June","July"], harvest_months:["October","November"], duration_days:"90-120", description:"A resilient crop widely cultivated for its uses. Bottle Gourd prefers a supportive climate.", care_tips:["Ensure proper soil drainage","Monitor for pests during early growth phases","Apply balanced fertilizers"], seeds:{ type:"Standard Seed", sowing_depth_cm:"2-5", seed_rate_kg_per_acre:"5-10", germination_days:"7-14", spacing_cm:"30x10" } },
  { id:39, name:"Green Beans", image:"🫛", category:"vegetable", season:["kharif","rabi"], soil_types:["loamy","alluvial","sandy-loam"], climate:["warm","temperate"], water_requirement:"medium", sowing_months:["June","July"], harvest_months:["October","November"], duration_days:"90-120", description:"A resilient crop widely cultivated for its uses. Green Beans prefers a supportive climate.", care_tips:["Ensure proper soil drainage","Monitor for pests during early growth phases","Apply balanced fertilizers"], seeds:{ type:"Standard Seed", sowing_depth_cm:"2-5", seed_rate_kg_per_acre:"5-10", germination_days:"7-14", spacing_cm:"30x10" } },
  { id:40, name:"Peas", image:"🫛", category:"vegetable", season:["rabi","winter"], soil_types:["loamy","alluvial","sandy-loam"], climate:["warm","temperate"], water_requirement:"medium", sowing_months:["June","July"], harvest_months:["October","November"], duration_days:"90-120", description:"A resilient crop widely cultivated for its uses. Peas prefers a supportive climate.", care_tips:["Ensure proper soil drainage","Monitor for pests during early growth phases","Apply balanced fertilizers"], seeds:{ type:"Standard Seed", sowing_depth_cm:"2-5", seed_rate_kg_per_acre:"5-10", germination_days:"7-14", spacing_cm:"30x10" } },
  { id:41, name:"Sweet Potato", image:"🍠", category:"vegetable", season:["kharif","rabi"], soil_types:["loamy","alluvial","sandy-loam"], climate:["warm","temperate"], water_requirement:"medium", sowing_months:["June","July"], harvest_months:["October","November"], duration_days:"90-120", description:"A resilient crop widely cultivated for its uses. Sweet Potato prefers a supportive climate.", care_tips:["Ensure proper soil drainage","Monitor for pests during early growth phases","Apply balanced fertilizers"], seeds:{ type:"Standard Seed", sowing_depth_cm:"2-5", seed_rate_kg_per_acre:"5-10", germination_days:"7-14", spacing_cm:"30x10" } },
  { id:42, name:"Cassava", image:"🍠", category:"vegetable", season:["perennial","annual"], soil_types:["loamy","alluvial","sandy-loam"], climate:["warm","temperate"], water_requirement:"low", sowing_months:["June","July"], harvest_months:["October","November"], duration_days:"90-120", description:"A resilient crop widely cultivated for its uses. Cassava prefers a supportive climate.", care_tips:["Ensure proper soil drainage","Monitor for pests during early growth phases","Apply balanced fertilizers"], seeds:{ type:"Standard Seed", sowing_depth_cm:"2-5", seed_rate_kg_per_acre:"5-10", germination_days:"7-14", spacing_cm:"30x10" } },
  { id:43, name:"Yam", image:"🍠", category:"vegetable", season:["kharif","annual"], soil_types:["loamy","alluvial","sandy-loam"], climate:["warm","temperate"], water_requirement:"medium", sowing_months:["June","July"], harvest_months:["October","November"], duration_days:"90-120", description:"A resilient crop widely cultivated for its uses. Yam prefers a supportive climate.", care_tips:["Ensure proper soil drainage","Monitor for pests during early growth phases","Apply balanced fertilizers"], seeds:{ type:"Standard Seed", sowing_depth_cm:"2-5", seed_rate_kg_per_acre:"5-10", germination_days:"7-14", spacing_cm:"30x10" } },
  { id:44, name:"Banana", image:"🍌", category:"fruit", season:["perennial"], soil_types:["loamy","alluvial","sandy-loam"], climate:["warm","temperate"], water_requirement:"high", sowing_months:["June","July"], harvest_months:["October","November"], duration_days:"90-120", description:"A resilient crop widely cultivated for its uses. Banana prefers a supportive climate.", care_tips:["Ensure proper soil drainage","Monitor for pests during early growth phases","Apply balanced fertilizers"], seeds:{ type:"Standard Seed", sowing_depth_cm:"2-5", seed_rate_kg_per_acre:"5-10", germination_days:"7-14", spacing_cm:"30x10" } },
  { id:45, name:"Orange", image:"🍊", category:"fruit", season:["perennial"], soil_types:["loamy","alluvial","sandy-loam"], climate:["warm","temperate"], water_requirement:"medium", sowing_months:["June","July"], harvest_months:["October","November"], duration_days:"90-120", description:"A resilient crop widely cultivated for its uses. Orange prefers a supportive climate.", care_tips:["Ensure proper soil drainage","Monitor for pests during early growth phases","Apply balanced fertilizers"], seeds:{ type:"Standard Seed", sowing_depth_cm:"2-5", seed_rate_kg_per_acre:"5-10", germination_days:"7-14", spacing_cm:"30x10" } },
  { id:46, name:"Grape", image:"🍇", category:"fruit", season:["perennial"], soil_types:["loamy","alluvial","sandy-loam"], climate:["warm","temperate"], water_requirement:"medium", sowing_months:["June","July"], harvest_months:["October","November"], duration_days:"90-120", description:"A resilient crop widely cultivated for its uses. Grape prefers a supportive climate.", care_tips:["Ensure proper soil drainage","Monitor for pests during early growth phases","Apply balanced fertilizers"], seeds:{ type:"Standard Seed", sowing_depth_cm:"2-5", seed_rate_kg_per_acre:"5-10", germination_days:"7-14", spacing_cm:"30x10" } },
  { id:47, name:"Papaya", image:"🍈", category:"fruit", season:["perennial"], soil_types:["loamy","alluvial","sandy-loam"], climate:["warm","temperate"], water_requirement:"high", sowing_months:["June","July"], harvest_months:["October","November"], duration_days:"90-120", description:"A resilient crop widely cultivated for its uses. Papaya prefers a supportive climate.", care_tips:["Ensure proper soil drainage","Monitor for pests during early growth phases","Apply balanced fertilizers"], seeds:{ type:"Standard Seed", sowing_depth_cm:"2-5", seed_rate_kg_per_acre:"5-10", germination_days:"7-14", spacing_cm:"30x10" } },
  { id:48, name:"Guava", image:"🍏", category:"fruit", season:["perennial"], soil_types:["loamy","alluvial","sandy-loam"], climate:["warm","temperate"], water_requirement:"medium", sowing_months:["June","July"], harvest_months:["October","November"], duration_days:"90-120", description:"A resilient crop widely cultivated for its uses. Guava prefers a supportive climate.", care_tips:["Ensure proper soil drainage","Monitor for pests during early growth phases","Apply balanced fertilizers"], seeds:{ type:"Standard Seed", sowing_depth_cm:"2-5", seed_rate_kg_per_acre:"5-10", germination_days:"7-14", spacing_cm:"30x10" } },
  { id:49, name:"Pineapple", image:"🍍", category:"fruit", season:["perennial"], soil_types:["loamy","alluvial","sandy-loam"], climate:["warm","temperate"], water_requirement:"medium", sowing_months:["June","July"], harvest_months:["October","November"], duration_days:"90-120", description:"A resilient crop widely cultivated for its uses. Pineapple prefers a supportive climate.", care_tips:["Ensure proper soil drainage","Monitor for pests during early growth phases","Apply balanced fertilizers"], seeds:{ type:"Standard Seed", sowing_depth_cm:"2-5", seed_rate_kg_per_acre:"5-10", germination_days:"7-14", spacing_cm:"30x10" } },
  { id:50, name:"Watermelon", image:"🍉", category:"fruit", season:["summer"], soil_types:["loamy","alluvial","sandy-loam"], climate:["warm","temperate"], water_requirement:"high", sowing_months:["June","July"], harvest_months:["October","November"], duration_days:"90-120", description:"A resilient crop widely cultivated for its uses. Watermelon prefers a supportive climate.", care_tips:["Ensure proper soil drainage","Monitor for pests during early growth phases","Apply balanced fertilizers"], seeds:{ type:"Standard Seed", sowing_depth_cm:"2-5", seed_rate_kg_per_acre:"5-10", germination_days:"7-14", spacing_cm:"30x10" } },
  { id:51, name:"Muskmelon", image:"🍈", category:"fruit", season:["summer"], soil_types:["loamy","alluvial","sandy-loam"], climate:["warm","temperate"], water_requirement:"high", sowing_months:["June","July"], harvest_months:["October","November"], duration_days:"90-120", description:"A resilient crop widely cultivated for its uses. Muskmelon prefers a supportive climate.", care_tips:["Ensure proper soil drainage","Monitor for pests during early growth phases","Apply balanced fertilizers"], seeds:{ type:"Standard Seed", sowing_depth_cm:"2-5", seed_rate_kg_per_acre:"5-10", germination_days:"7-14", spacing_cm:"30x10" } },
  { id:52, name:"Pomegranate", image:"🍎", category:"fruit", season:["perennial"], soil_types:["loamy","alluvial","sandy-loam"], climate:["warm","temperate"], water_requirement:"medium", sowing_months:["June","July"], harvest_months:["October","November"], duration_days:"90-120", description:"A resilient crop widely cultivated for its uses. Pomegranate prefers a supportive climate.", care_tips:["Ensure proper soil drainage","Monitor for pests during early growth phases","Apply balanced fertilizers"], seeds:{ type:"Standard Seed", sowing_depth_cm:"2-5", seed_rate_kg_per_acre:"5-10", germination_days:"7-14", spacing_cm:"30x10" } },
  { id:53, name:"Lemon", image:"🍋", category:"fruit", season:["perennial"], soil_types:["loamy","alluvial","sandy-loam"], climate:["warm","temperate"], water_requirement:"medium", sowing_months:["June","July"], harvest_months:["October","November"], duration_days:"90-120", description:"A resilient crop widely cultivated for its uses. Lemon prefers a supportive climate.", care_tips:["Ensure proper soil drainage","Monitor for pests during early growth phases","Apply balanced fertilizers"], seeds:{ type:"Standard Seed", sowing_depth_cm:"2-5", seed_rate_kg_per_acre:"5-10", germination_days:"7-14", spacing_cm:"30x10" } },
  { id:54, name:"Coconut", image:"🥥", category:"fruit", season:["perennial"], soil_types:["loamy","alluvial","sandy-loam"], climate:["warm","temperate"], water_requirement:"high", sowing_months:["June","July"], harvest_months:["October","November"], duration_days:"90-120", description:"A resilient crop widely cultivated for its uses. Coconut prefers a supportive climate.", care_tips:["Ensure proper soil drainage","Monitor for pests during early growth phases","Apply balanced fertilizers"], seeds:{ type:"Standard Seed", sowing_depth_cm:"2-5", seed_rate_kg_per_acre:"5-10", germination_days:"7-14", spacing_cm:"30x10" } },
  { id:55, name:"Jackfruit", image:"🍈", category:"fruit", season:["perennial"], soil_types:["loamy","alluvial","sandy-loam"], climate:["warm","temperate"], water_requirement:"medium", sowing_months:["June","July"], harvest_months:["October","November"], duration_days:"90-120", description:"A resilient crop widely cultivated for its uses. Jackfruit prefers a supportive climate.", care_tips:["Ensure proper soil drainage","Monitor for pests during early growth phases","Apply balanced fertilizers"], seeds:{ type:"Standard Seed", sowing_depth_cm:"2-5", seed_rate_kg_per_acre:"5-10", germination_days:"7-14", spacing_cm:"30x10" } },
  { id:56, name:"Jute", image:"🌿", category:"cash_crop", season:["kharif"], soil_types:["loamy","alluvial","sandy-loam"], climate:["warm","temperate"], water_requirement:"high", sowing_months:["June","July"], harvest_months:["October","November"], duration_days:"90-120", description:"A resilient crop widely cultivated for its uses. Jute prefers a supportive climate.", care_tips:["Ensure proper soil drainage","Monitor for pests during early growth phases","Apply balanced fertilizers"], seeds:{ type:"Standard Seed", sowing_depth_cm:"2-5", seed_rate_kg_per_acre:"5-10", germination_days:"7-14", spacing_cm:"30x10" } },
  { id:57, name:"Tea", image:"🍵", category:"cash_crop", season:["perennial"], soil_types:["loamy","alluvial","sandy-loam"], climate:["warm","temperate"], water_requirement:"high", sowing_months:["June","July"], harvest_months:["October","November"], duration_days:"90-120", description:"A resilient crop widely cultivated for its uses. Tea prefers a supportive climate.", care_tips:["Ensure proper soil drainage","Monitor for pests during early growth phases","Apply balanced fertilizers"], seeds:{ type:"Standard Seed", sowing_depth_cm:"2-5", seed_rate_kg_per_acre:"5-10", germination_days:"7-14", spacing_cm:"30x10" } },
  { id:58, name:"Coffee", image:"☕", category:"cash_crop", season:["perennial"], soil_types:["loamy","alluvial","sandy-loam"], climate:["warm","temperate"], water_requirement:"medium", sowing_months:["June","July"], harvest_months:["October","November"], duration_days:"90-120", description:"A resilient crop widely cultivated for its uses. Coffee prefers a supportive climate.", care_tips:["Ensure proper soil drainage","Monitor for pests during early growth phases","Apply balanced fertilizers"], seeds:{ type:"Standard Seed", sowing_depth_cm:"2-5", seed_rate_kg_per_acre:"5-10", germination_days:"7-14", spacing_cm:"30x10" } },
  { id:59, name:"Rubber", image:"🌳", category:"cash_crop", season:["perennial"], soil_types:["loamy","alluvial","sandy-loam"], climate:["warm","temperate"], water_requirement:"high", sowing_months:["June","July"], harvest_months:["October","November"], duration_days:"90-120", description:"A resilient crop widely cultivated for its uses. Rubber prefers a supportive climate.", care_tips:["Ensure proper soil drainage","Monitor for pests during early growth phases","Apply balanced fertilizers"], seeds:{ type:"Standard Seed", sowing_depth_cm:"2-5", seed_rate_kg_per_acre:"5-10", germination_days:"7-14", spacing_cm:"30x10" } },
  { id:60, name:"Tobacco", image:"🍂", category:"cash_crop", season:["rabi","kharif"], soil_types:["loamy","alluvial","sandy-loam"], climate:["warm","temperate"], water_requirement:"medium", sowing_months:["June","July"], harvest_months:["October","November"], duration_days:"90-120", description:"A resilient crop widely cultivated for its uses. Tobacco prefers a supportive climate.", care_tips:["Ensure proper soil drainage","Monitor for pests during early growth phases","Apply balanced fertilizers"], seeds:{ type:"Standard Seed", sowing_depth_cm:"2-5", seed_rate_kg_per_acre:"5-10", germination_days:"7-14", spacing_cm:"30x10" } },
  { id:61, name:"Mustard", image:"🌼", category:"oilseed", season:["rabi","winter"], soil_types:["loamy","alluvial","sandy-loam"], climate:["warm","temperate"], water_requirement:"low", sowing_months:["June","July"], harvest_months:["October","November"], duration_days:"90-120", description:"A resilient crop widely cultivated for its uses. Mustard prefers a supportive climate.", care_tips:["Ensure proper soil drainage","Monitor for pests during early growth phases","Apply balanced fertilizers"], seeds:{ type:"Standard Seed", sowing_depth_cm:"2-5", seed_rate_kg_per_acre:"5-10", germination_days:"7-14", spacing_cm:"30x10" } },
  { id:62, name:"Soybean", image:"🫘", category:"oilseed", season:["kharif"], soil_types:["loamy","alluvial","sandy-loam"], climate:["warm","temperate"], water_requirement:"medium", sowing_months:["June","July"], harvest_months:["October","November"], duration_days:"90-120", description:"A resilient crop widely cultivated for its uses. Soybean prefers a supportive climate.", care_tips:["Ensure proper soil drainage","Monitor for pests during early growth phases","Apply balanced fertilizers"], seeds:{ type:"Standard Seed", sowing_depth_cm:"2-5", seed_rate_kg_per_acre:"5-10", germination_days:"7-14", spacing_cm:"30x10" } },
  { id:63, name:"Sunflower", image:"🌻", category:"oilseed", season:["kharif","rabi","summer"], soil_types:["loamy","black","sandy-loam"], climate:["warm","semi-arid","subtropical"], water_requirement:"medium", sowing_months:["June","July","January","February"], harvest_months:["September","October","April","May"], duration_days:"90-100", description:"Sunflower is an important oilseed crop grown for edible oil and poultry feed. It adapts well to different climates.", care_tips:["Sow seeds 3-4 cm deep in rows","Irrigate at critical stages — flowering and seed fill","Apply boron micronutrient for better seed set","Harvest when back of head turns yellow-brown"], seeds:{ type:"Hybrid/Open-pollinated", sowing_depth_cm:"3-4", seed_rate_kg_per_acre:"2-3 kg", germination_days:"6-10", spacing_cm:"60x30" } },
  { id:64, name:"Safflower", image:"🌺", category:"oilseed", season:["rabi","winter"], soil_types:["black","loamy","clay"], climate:["semi-arid","dry","warm"], water_requirement:"low", sowing_months:["October","November"], harvest_months:["March","April"], duration_days:"140-160", description:"Safflower is a drought tolerant oilseed crop grown for cooking oil and dye. It is well suited for dry regions.", care_tips:["Deep tillage helps root development","Minimal irrigation — mainly at branching stage","Apply phosphorus for good flower yield","Weed control in first 45 days is critical"], seeds:{ type:"Open-pollinated", sowing_depth_cm:"4-5", seed_rate_kg_per_acre:"6-8 kg", germination_days:"8-12", spacing_cm:"45x20" } },
  { id:65, name:"Castor", image:"🌿", category:"oilseed", season:["kharif","summer"], soil_types:["red","loamy","sandy-loam"], climate:["tropical","semi-arid","warm"], water_requirement:"low", sowing_months:["June","July","January"], harvest_months:["October","November","April"], duration_days:"120-150", description:"Castor is a non-edible oilseed crop with wide industrial applications. India is the world's largest producer.", care_tips:["Use hybrid varieties for higher yields","Avoid waterlogging — very sensitive to excess water","Apply DAP at sowing for root establishment","Harvest racemes in 2-3 picks as they mature"], seeds:{ type:"Hybrid", sowing_depth_cm:"5-7", seed_rate_kg_per_acre:"4-6 kg", germination_days:"7-12", spacing_cm:"90x60" } },
  { id:66, name:"Linseed", image:"🌾", category:"oilseed", season:["rabi","winter"], soil_types:["loamy","clay","black"], climate:["cool","temperate"], water_requirement:"low", sowing_months:["October","November"], harvest_months:["February","March"], duration_days:"110-130", description:"Linseed (flaxseed) is grown for both its oil and fiber. Its seeds are rich in omega-3 fatty acids.", care_tips:["Sow in well-prepared seedbed with fine tilth","One or two light irrigations are usually sufficient","Apply moderate nitrogen — excess causes lodging","Harvest when 75% of capsules turn brown"], seeds:{ type:"Open-pollinated", sowing_depth_cm:"2-3", seed_rate_kg_per_acre:"10-12 kg", germination_days:"7-10", spacing_cm:"25x5" } },
  { id:67, name:"Pigeon Pea", image:"🫘", category:"pulse", season:["kharif"], soil_types:["red","loamy","black"], climate:["tropical","semi-arid","subtropical"], water_requirement:"low", sowing_months:["June","July"], harvest_months:["November","December","January"], duration_days:"150-200", description:"Pigeon pea (Tur/Arhar) is a major pulse crop in India. It is drought tolerant and fixes atmospheric nitrogen.", care_tips:["Seed treatment with Rhizobium culture before sowing","Avoid excessive irrigation — one or two are enough","Intercrop with cereals for efficient land use","Harvest pods when they turn grey-brown"], seeds:{ type:"Open-pollinated / Hybrid", sowing_depth_cm:"4-6", seed_rate_kg_per_acre:"6-8 kg", germination_days:"5-8", spacing_cm:"90x30" } },
  { id:68, name:"Green Gram", image:"🫘", category:"pulse", season:["kharif","summer"], soil_types:["loamy","sandy-loam","red"], climate:["warm","tropical"], water_requirement:"low", sowing_months:["June","July","March"], harvest_months:["September","October","May","June"], duration_days:"60-75", description:"Green gram (Moong) is a short-duration pulse crop rich in protein. It improves soil fertility through nitrogen fixation.", care_tips:["Treat seeds with Rhizobium before sowing","Irrigate 2-3 times during crop growth","Harvest in 2-3 pickings when pods turn black","Store seeds below 12% moisture to prevent spoilage"], seeds:{ type:"Open-pollinated", sowing_depth_cm:"3-4", seed_rate_kg_per_acre:"8-10 kg", germination_days:"4-6", spacing_cm:"30x10" } },
  { id:69, name:"Black Gram", image:"🫘", category:"pulse", season:["kharif","rabi"], soil_types:["loamy","clay","black"], climate:["warm","tropical"], water_requirement:"low", sowing_months:["June","July","November"], harvest_months:["September","October","February","March"], duration_days:"65-80", description:"Black gram (Urad) is an important pulse crop used widely in Indian cuisine. It is an excellent source of protein and minerals.", care_tips:["Inoculate seeds with Rhizobium culture","Provide one pre-sowing irrigation in dry season","Avoid waterlogging especially after flowering","Pick pods when fully mature and turning black"], seeds:{ type:"Open-pollinated", sowing_depth_cm:"3-4", seed_rate_kg_per_acre:"8-10 kg", germination_days:"4-7", spacing_cm:"30x10" } },
  { id:70, name:"Chickpea", image:"🫘", category:"pulse", season:["rabi","winter"], soil_types:["loamy","sandy-loam","black"], climate:["cool","semi-arid","temperate"], water_requirement:"low", sowing_months:["October","November"], harvest_months:["February","March"], duration_days:"90-120", description:"Chickpea (Chana) is the most important pulse crop in India. Both desi and kabuli varieties are widely grown.", care_tips:["Seed treatment with Rhizobium and fungicide","One irrigation at flowering stage is critical","Avoid excess nitrogen — reduces nodulation","Wilt-resistant varieties should be used in affected areas"], seeds:{ type:"Desi/Kabuli varieties", sowing_depth_cm:"7-10", seed_rate_kg_per_acre:"30-40 kg", germination_days:"6-10", spacing_cm:"30x10" } },
  { id:71, name:"Lentil", image:"🫘", category:"pulse", season:["rabi","winter"], soil_types:["loamy","clay","alluvial"], climate:["cool","temperate"], water_requirement:"low", sowing_months:["October","November"], harvest_months:["February","March"], duration_days:"110-130", description:"Lentil (Masur) is a cool-season pulse crop. India is one of the world's largest producers, especially in Madhya Pradesh and UP.", care_tips:["Pre-treat seed with Rhizobium inoculant","One or two irrigations at critical flowering stage","Weed management in the first 4-5 weeks is essential","Harvest when 80% of pods turn straw colored"], seeds:{ type:"Open-pollinated", sowing_depth_cm:"3-5", seed_rate_kg_per_acre:"12-15 kg", germination_days:"6-10", spacing_cm:"25x5" } },
  { id:72, name:"Cardamom", image:"🌿", category:"spice", season:["perennial"], soil_types:["loamy","laterite","forest"], climate:["tropical","humid"], water_requirement:"high", sowing_months:["May","June"], harvest_months:["August","September","October","November"], duration_days:"365+ (2-3 yrs to first harvest)", description:"Cardamom is the queen of spices and is one of the most valuable spice crops. It thrives in high-altitude humid forests.", care_tips:["Grow in shaded conditions under forest canopy","Irrigate throughout year — highly water demanding","Apply organic manure and trace elements annually","Harvest capsules before they split open"], seeds:{ type:"Rhizome/Seedling transplant", sowing_depth_cm:"3-5", seed_rate_kg_per_acre:"500-600 seedlings", germination_days:"20-30", spacing_cm:"180x180" } },
  { id:73, name:"Black Pepper", image:"🧂", category:"spice", season:["perennial"], soil_types:["laterite","loamy","forest"], climate:["tropical","humid"], water_requirement:"high", sowing_months:["May","June"], harvest_months:["November","December","January"], duration_days:"365+ (3 yrs to first harvest)", description:"Black pepper is the king of spices. India, particularly Kerala, is a major producer of this highly valued spice.", care_tips:["Train vines on live standards like erythrina trees","Irrigate regularly during dry months","Apply potassium and magnesium for vine health","Harvest when one or two berries on spike turn red"], seeds:{ type:"Rooted cuttings/Vine cuttings", sowing_depth_cm:"10-15", seed_rate_kg_per_acre:"200-250 cuttings", germination_days:"30-45", spacing_cm:"300x300" } },
  { id:74, name:"Coriander", image:"🌿", category:"spice", season:["rabi","winter"], soil_types:["loamy","sandy-loam","black"], climate:["cool","temperate"], water_requirement:"low", sowing_months:["October","November"], harvest_months:["January","February","March"], duration_days:"90-100", description:"Coriander is an important dual-purpose spice crop. Both its leaves and dried seeds are widely used in cooking.", care_tips:["Crush seeds gently before sowing to improve germination","Apply light irrigation — avoid waterlogging","Harvest leaves after 30-40 days; seeds after 90 days","Thresh and clean seeds before storage"], seeds:{ type:"Open-pollinated", sowing_depth_cm:"2-3", seed_rate_kg_per_acre:"8-10 kg (seed) / 3-4 kg (leaf crop)", germination_days:"10-15", spacing_cm:"30x10" } },
  { id:75, name:"Cumin", image:"🌾", category:"spice", season:["rabi","winter"], soil_types:["sandy-loam","loamy","alluvial"], climate:["cool","semi-arid"], water_requirement:"low", sowing_months:["November","December"], harvest_months:["February","March"], duration_days:"90-105", description:"Cumin (Jeera) is one of the world's most important spices. Rajasthan and Gujarat account for most of India's cumin production.", care_tips:["Sow on well-prepared flat beds","Avoid heavy irrigation — 3-4 light lifts are enough","Apply sulfur fungicide against powdery mildew","Harvest in early morning to reduce shattering losses"], seeds:{ type:"Open-pollinated", sowing_depth_cm:"1-2", seed_rate_kg_per_acre:"4-5 kg", germination_days:"7-12", spacing_cm:"25x5" } },
  { id:76, name:"Fenugreek", image:"🌿", category:"spice", season:["rabi","winter"], soil_types:["loamy","clay","black"], climate:["cool","temperate"], water_requirement:"low", sowing_months:["October","November"], harvest_months:["January","February","March"], duration_days:"90-110", description:"Fenugreek (Methi) is an important spice cum vegetable crop. Its seeds are used as a spice while leaves are eaten as a vegetable.", care_tips:["Apply Rhizobium seed treatment for nitrogen fixation","Sow in lines for good air circulation","Avoid excess water — prefers drier conditions","Harvest fresh leaves multiple times; seeds when pods dry"], seeds:{ type:"Open-pollinated", sowing_depth_cm:"2-3", seed_rate_kg_per_acre:"12-15 kg (seed crop) / 25-30 kg (leaf crop)", germination_days:"5-8", spacing_cm:"25x5" } },
  { id:77, name:"Turmeric", image:"🫚", category:"spice", season:["kharif"], soil_types:["loamy","clay","red"], climate:["tropical","subtropical","humid"], water_requirement:"medium", sowing_months:["April","May","June"], harvest_months:["January","February","March"], duration_days:"240-270", description:"Turmeric is a rhizomatous herb widely used as a spice, medicine, and dye. India produces over 75% of the world's turmeric.", care_tips:["Use healthy, disease-free seed rhizomes","Provide full or partial shade in early stages","Earthing up around plants improves rhizome yield","Cure harvested rhizomes in hot water before drying"], seeds:{ type:"Seed Rhizomes (mother/daughter)", sowing_depth_cm:"5-7", seed_rate_kg_per_acre:"400-500 kg", germination_days:"20-30", spacing_cm:"45x25" } },
  { id:78, name:"Ginger", image:"🫚", category:"spice", season:["kharif"], soil_types:["loamy","red","laterite"], climate:["tropical","subtropical","humid"], water_requirement:"high", sowing_months:["April","May","June"], harvest_months:["December","January","February"], duration_days:"240-270", description:"Ginger is one of the world's most consumed spices. It is grown both as a fresh vegetable and for the dry ginger spice trade.", care_tips:["Use disease-free seed rhizomes treated with fungicide","Mulch beds with dry leaves or straw after planting","Irrigate every 7-10 days; more frequently in summer","Harvest at 8-9 months for dry ginger; 6-7 for fresh ginger"], seeds:{ type:"Seed Rhizomes (20-25g pieces)", sowing_depth_cm:"4-5", seed_rate_kg_per_acre:"400-500 kg", germination_days:"15-25", spacing_cm:"30x20" } },
  { id:79, name:"Chili", image:"🌶️", category:"spice", season:["kharif","rabi","summer"], soil_types:["loamy","sandy-loam","alluvial"], climate:["warm","tropical","subtropical"], water_requirement:"medium", sowing_months:["June","July","October","January"], harvest_months:["September","October","January","February","April"], duration_days:"100-130", description:"Chili pepper is both a vegetable and a spice. India is the world's largest producer, consumer, and exporter of chillies.", care_tips:["Transplant 30-35 day old nursery seedlings","Irrigate every 8-10 days; critical at flowering","Apply potassium for better fruit quality and color","Control thrips and mites which spread leaf curl virus"], seeds:{ type:"Open-pollinated / Hybrid", sowing_depth_cm:"0.5-1", seed_rate_kg_per_acre:"0.5-1 kg (nursery sowing)", germination_days:"8-12", spacing_cm:"60x45" } },
  { id:80, name:"Garlic", image:"🧄", category:"spice", season:["rabi","winter"], soil_types:["loamy","alluvial","sandy-loam"], climate:["cool","temperate"], water_requirement:"medium", sowing_months:["October","November"], harvest_months:["February","March","April"], duration_days:"120-150", description:"Garlic is an indispensable cooking spice with proven medicinal properties. India is the world's second largest producer.", care_tips:["Plant large-sized cloves for better yield","Irrigate at planting and at 10-15 day intervals","Stop irrigation 2-3 weeks before harvest","Cure bulbs in dry airy shade for 2-3 weeks after harvest"], seeds:{ type:"Cloves (1 bulb = 10-15 cloves)", sowing_depth_cm:"5-7", seed_rate_kg_per_acre:"200-250 kg", germination_days:"7-14", spacing_cm:"15x10" } },
  { id:81, name:"Onion", image:"🧅", category:"vegetable", season:["rabi","kharif"], soil_types:["loamy","sandy-loam","red"], climate:["cool","temperate","semi-arid"], water_requirement:"medium", sowing_months:["October","November","May","June"], harvest_months:["February","March","August","September"], duration_days:"100-130", description:"Onion is the most commercially important vegetable crop in India. Maharashtra, Karnataka, and Madhya Pradesh are major producers.", care_tips:["Transplant 6-week-old seedlings at 15×10 cm spacing","Stop irrigation 10-15 days before harvest","Spray calcium chloride to improve shelf life","Cure bulbs in windrows or shaded storage for 2-3 weeks"], seeds:{ type:"Open-pollinated / Hybrid", sowing_depth_cm:"1-2", seed_rate_kg_per_acre:"3-4 kg (nursery)", germination_days:"8-12", spacing_cm:"15x10" } },
  { id:82, name:"Tomato", image:"🍅", category:"vegetable", season:["kharif","rabi","summer"], soil_types:["loamy","sandy-loam","alluvial"], climate:["warm","subtropical","temperate"], water_requirement:"medium", sowing_months:["June","July","October","January"], harvest_months:["September","October","January","February","April"], duration_days:"90-120", description:"Tomato is the world's most consumed vegetable. It is a major source of lycopene and vitamin C and grown across India round the year.", care_tips:["Stake plants after 30 days to support growth","Irrigate every 7-10 days using drip irrigation","Remove suckers regularly for determinate varieties","Scout for fruit borer and apply biocides or neem spray"], seeds:{ type:"Hybrid F1", sowing_depth_cm:"0.5-1", seed_rate_kg_per_acre:"0.2-0.3 kg (nursery)", germination_days:"7-10", spacing_cm:"90x60" } },
  { id:83, name:"Brinjal", image:"🍆", category:"vegetable", season:["kharif","rabi","summer"], soil_types:["loamy","clay","alluvial"], climate:["warm","tropical","subtropical"], water_requirement:"medium", sowing_months:["June","July","October","January"], harvest_months:["September","October","January","February","April"], duration_days:"90-120", description:"Brinjal (Eggplant/Baingan) is one of India's most widely grown vegetables available throughout the year.", care_tips:["Transplant 4-5 week old nursery seedlings","Irrigate every 8-10 days; more in summer","Remove dried and diseased leaves regularly","Apply neem oil spray to control shoot and fruit borer"], seeds:{ type:"Open-pollinated / Hybrid", sowing_depth_cm:"0.5-1", seed_rate_kg_per_acre:"0.2-0.4 kg (nursery)", germination_days:"7-10", spacing_cm:"75x60" } },
  { id:84, name:"Okra", image:"🥒", category:"vegetable", season:["kharif","summer"], soil_types:["loamy","sandy-loam","alluvial"], climate:["warm","tropical","subtropical"], water_requirement:"medium", sowing_months:["June","July","February","March"], harvest_months:["August","September","October","April","May"], duration_days:"50-60", description:"Okra (Bhindi/Lady Finger) is a warm-season vegetable loved for its tender pods. It is fast growing and gives early returns.", care_tips:["Direct sow soaked seeds in warm soil","Harvest pods every 2-3 days to maintain tenderness","Irrigate every 5-7 days during pod formation","Apply potassium for crunchier, better-quality pods"], seeds:{ type:"Open-pollinated / Hybrid", sowing_depth_cm:"2-3", seed_rate_kg_per_acre:"4-5 kg", germination_days:"6-10", spacing_cm:"45x30" } },
  { id:85, name:"Watermelon", image:"🍉", category:"fruit", season:["summer","kharif"], soil_types:["sandy-loam","loamy","alluvial"], climate:["warm","hot","tropical"], water_requirement:"high", sowing_months:["February","March","June"], harvest_months:["May","June","August","September"], duration_days:"80-100", description:"Watermelon is a warm-season fruit crop with high water content. It is widely grown in sandy river beds and loamy soils.", care_tips:["Sow 2-3 seeds per pit and thin to 1 healthy plant","Use drip irrigation for water efficiency","Apply mulch to retain soil moisture and control weeds","Harvest when tendril nearest to fruit dries up"], seeds:{ type:"Hybrid F1", sowing_depth_cm:"2-3", seed_rate_kg_per_acre:"1-1.5 kg", germination_days:"7-10", spacing_cm:"300x100" } },
  { id:86, name:"Muskmelon", image:"🍈", category:"fruit", season:["summer"], soil_types:["sandy-loam","loamy","alluvial"], climate:["warm","hot","semi-arid"], water_requirement:"medium", sowing_months:["February","March"], harvest_months:["May","June"], duration_days:"75-90", description:"Muskmelon is a summer fruit crop with aromatic flesh. It is grown in river beds and sandy soils with low humidity.", care_tips:["Sow in pre-formed raised beds with good drainage","Reduce irrigation frequency as fruits mature for better taste","Avoid overhead irrigation — promotes fungal diseases","Harvest when netting on skin is prominent and aroma is strong"], seeds:{ type:"Hybrid F1", sowing_depth_cm:"2-3", seed_rate_kg_per_acre:"0.8-1 kg", germination_days:"6-9", spacing_cm:"250x75" } },
  { id:87, name:"Aloe Vera", image:"🪴", category:"medicinal", season:["perennial"], soil_types:["sandy-loam","loamy","red"], climate:["semi-arid","arid","tropical"], water_requirement:"low", sowing_months:["February","March","July","August"], harvest_months:["perennial harvest every 3-4 months"], duration_days:"180-270 to first harvest", description:"Aloe vera is a succulent medicinal plant grown for its gel, which has huge demand in cosmetic, pharmaceutical, and food industries.", care_tips:["Plant suckers (offsets) at 60×60 cm spacing","Very drought tolerant — irrigate once a week or less","Avoid waterlogging — causes root rot","Harvest mature outer leaves by cutting at the base"], seeds:{ type:"Suckers (vegetative offsets)", sowing_depth_cm:"10-12", seed_rate_kg_per_acre:"2500-3000 suckers", germination_days:"14-21 (sucker establishment)", spacing_cm:"60x60" } },
  { id:88, name:"Stevia", image:"🌿", category:"medicinal", season:["perennial"], soil_types:["loamy","sandy-loam","alluvial"], climate:["warm","subtropical","temperate"], water_requirement:"medium", sowing_months:["February","March","September","October"], harvest_months:["perennial — harvest every 3-4 months"], duration_days:"90-120 to first harvest", description:"Stevia is a natural calorie-free sweetener plant with leaves 200 times sweeter than sugar. It has rapidly growing demand in food & beverage markets.", care_tips:["Transplant tissue-cultured or rooted cuttings","Irrigate regularly — does not tolerate drought","Harvest just before flowering for highest stevioside content","Dry leaves immediately after harvest to preserve quality"], seeds:{ type:"Tissue-cultured plantlets / Cuttings", sowing_depth_cm:"3-5", seed_rate_kg_per_acre:"5000-6000 plants", germination_days:"10-15 (seed germination is difficult; cuttings preferred)", spacing_cm:"40x30" } },
  { id:89, name:"Moringa", image:"🌿", category:"medicinal", season:["perennial"], soil_types:["loamy","sandy-loam","red"], climate:["tropical","subtropical","semi-arid"], water_requirement:"low", sowing_months:["June","July","February","March"], harvest_months:["perennial — pods and leaves year-round"], duration_days:"240-270 to first pod harvest", description:"Moringa (Drumstick) is called the miracle tree with exceptional nutritional and medicinal value. Every part of the plant is edible.", care_tips:["Can be propagated from seeds or hard stem cuttings","Drought tolerant once established — minimal irrigation needed","Prune regularly to maintain bushier growth and easier harvest","Harvest young pods at 30-45 cm length for best taste"], seeds:{ type:"Seeds / Hard wood cuttings", sowing_depth_cm:"2-3", seed_rate_kg_per_acre:"1-1.5 kg seeds or 500 cuttings", germination_days:"10-15", spacing_cm:"300x300" } },
  { id:90, name:"Ashwagandha", image:"🪴", category:"medicinal", season:["kharif","rabi"], soil_types:["sandy-loam","red","loamy"], climate:["semi-arid","tropical","subtropical"], water_requirement:"low", sowing_months:["June","July","September","October"], harvest_months:["January","February","March"], duration_days:"150-180", description:"Ashwagandha is one of the most important Ayurvedic herbs. Its root is used extensively in traditional medicine and health supplements.", care_tips:["Sow seeds directly with 2-3 seeds per spot","Very hardy — thrives with minimal or no irrigation","Avoid heavy clay soils — excellent natural drainage required","Harvest roots when leaves start yellowing in winter"], seeds:{ type:"Open-pollinated (botanical seed)", sowing_depth_cm:"2-3", seed_rate_kg_per_acre:"3-4 kg", germination_days:"7-12", spacing_cm:"60x30" } },
  { id:91, name:"Tulsi", image:"🌿", category:"medicinal", season:["kharif","perennial"], soil_types:["loamy","sandy-loam","alluvial"], climate:["tropical","subtropical"], water_requirement:"low", sowing_months:["February","March","June","July"], harvest_months:["year-round leaf harvest"], duration_days:"60-90 to first harvest", description:"Holy Basil (Tulsi) is a sacred medicinal plant with strong essential oil content. It is widely used in Ayurveda and aromatherapy.", care_tips:["Transplant or direct sow after last frost","Prune flower buds to prolong vegetative growth","Harvest in early morning for highest essential oil content","Distill leaves for essential oil or dry for herbal products"], seeds:{ type:"Open-pollinated / Clonal cuttings", sowing_depth_cm:"0.5-1", seed_rate_kg_per_acre:"0.5-1 kg", germination_days:"5-8", spacing_cm:"50x40" } },
  { id:92, name:"Hemp", image:"🌿", category:"cash_crop", season:["kharif","rabi"], soil_types:["loamy","alluvial","sandy-loam"], climate:["temperate","subtropical","warm"], water_requirement:"medium", sowing_months:["March","April","June","July"], harvest_months:["July","August","October","November"], duration_days:"80-110", description:"Industrial hemp is a versatile crop grown for fiber, seeds, and CBD oil. It has rapidly growing commercial and industrial demand.", care_tips:["Grow only licensed varieties with <0.3% THC content","No special pest management needed — naturally pest resistant","Moisture stress during flowering reduces seed yield significantly","Harvest fiber crop before full flowering for finest quality fiber"], seeds:{ type:"Certified industrial hemp seed", sowing_depth_cm:"2-3", seed_rate_kg_per_acre:"15-20 kg (fiber) / 5-8 kg (seed crop)", germination_days:"5-7", spacing_cm:"10-15 cm (fiber) / 40-50 cm (seed crop)" } }

];


const _seasons = [
  { id:"kharif",    label:"Kharif",    months:"June – October",  emoji:"🌧️", description:"Monsoon / summer crops sown at onset of rains" },
  { id:"rabi",      label:"Rabi",      months:"Oct – March",     emoji:"❄️", description:"Winter crops sown after monsoon withdrawal" },
  { id:"summer",    label:"Summer",    months:"Feb – June",      emoji:"☀️", description:"Short-duration warm-season crops" },
  { id:"annual",    label:"Annual",    months:"Year-round",      emoji:"📅", description:"Long-duration crops grown for a full year" },
  { id:"perennial", label:"Perennial", months:"Multi-year",      emoji:"🌳", description:"Trees and long-term horticultural crops" }
];

const _soils = [
  { id:"alluvial",   label:"Alluvial Soil", emoji:"🟤", description:"Fertile, found in river plains. Best for most crops." },
  { id:"black",      label:"Black Soil",    emoji:"⚫", description:"Rich in clay, retains moisture. Ideal for cotton." },
  { id:"loamy",      label:"Loamy Soil",    emoji:"🟫", description:"Balanced texture, best all-purpose agricultural soil." },
  { id:"sandy-loam", label:"Sandy Loam",    emoji:"🟡", description:"Well-draining, good for root vegetables and pulses." },
  { id:"clay",       label:"Clay Soil",     emoji:"🔵", description:"Heavy, water-retentive. Good for paddy and sugarcane." },
  { id:"laterite",   label:"Laterite Soil", emoji:"🔴", description:"Iron-rich, acidic. Suited for mangoes and cashews." }
];

// ── API FUNCTIONS ────────────────────────────────────────────
async function apiGetCrops(filters = {}) {
  if (USE_LIVE_API) {
    try {
      const params = new URLSearchParams(filters);
      const res = await fetch(`${API_BASE_URL}/api/crops?${params}`);
      if (res.ok) {
        const json = await res.json();
        if (json && json.success && Array.isArray(json.data) && json.data.length > 0) {
          return json.data;
        }
      }
    } catch (err) {
      console.warn('[API] Crops fetch failed, using embedded fallback:', err);
    }
  }
  return localFilterCrops(filters);
}

async function apiGetCropById(id) {
  if (USE_LIVE_API) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/crops/${id}`);
      if (res.ok) {
        const json = await res.json();
        if (json && json.success && json.data) {
          return json.data;
        }
      }
    } catch (err) {
      console.warn('[API] CropById fetch failed, using embedded fallback:', err);
    }
  }
  return _crops.find(c => c.id === parseInt(id)) || null;
}

async function apiGetSeeds(filters = {}) {
  if (USE_LIVE_API) {
    try {
      const params = new URLSearchParams(filters);
      const res = await fetch(`${API_BASE_URL}/api/seeds?${params}`);
      if (res.ok) {
        const json = await res.json();
        if (json && json.success && Array.isArray(json.data) && json.data.length > 0) {
          return json.data;
        }
      }
    } catch (err) {
      console.warn('[API] Seeds fetch failed, using embedded fallback:', err);
    }
  }
  return localFilterCrops(filters).map(c => ({
    crop_id: c.id, crop_name: c.name, image: c.image,
    category: c.category, season: c.season, care_tips: c.care_tips, ...c.seeds
  }));
}

async function apiGetSeasons() {
  if (USE_LIVE_API) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/seasons`);
      if (res.ok) {
        const json = await res.json();
        if (json && json.success && Array.isArray(json.data) && json.data.length > 0) {
          return json.data;
        }
      }
    } catch (err) {
      console.warn('[API] Seasons fetch failed, using embedded fallback:', err);
    }
  }
  return _seasons.map(s => ({
    ...s,
    crops_count: _crops.filter(c => c.season.includes(s.id)).length,
    crops: _crops.filter(c => c.season.includes(s.id)).map(c => ({ id: c.id, name: c.name, image: c.image }))
  }));
}

async function apiGetSoils() {
  if (USE_LIVE_API) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/soils`);
      if (res.ok) {
        const json = await res.json();
        if (json && json.success && Array.isArray(json.data) && json.data.length > 0) {
          return json.data;
        }
      }
    } catch (err) {
      console.warn('[API] Soils fetch failed, using embedded fallback:', err);
    }
  }
  return _soils.map(s => ({
    ...s,
    crops: _crops.filter(c => c.soil_types.includes(s.id)).map(c => ({ id: c.id, name: c.name, image: c.image, category: c.category }))
  }));
}

// Local filter helper
function localFilterCrops(q = {}) {
  let r = [..._crops];
  if (q.season)   r = r.filter(c => c.season.some(s  => s.toLowerCase()  === q.season.toLowerCase()));
  if (q.soil)     r = r.filter(c => c.soil_types.some(s => s.toLowerCase() === q.soil.toLowerCase()));
  if (q.climate)  r = r.filter(c => c.climate.some(cl => cl.toLowerCase() === q.climate.toLowerCase()));
  if (q.water)    r = r.filter(c => c.water_requirement.toLowerCase() === q.water.toLowerCase());
  if (q.category) r = r.filter(c => c.category.toLowerCase() === q.category.toLowerCase());
  if (q.search) {
    const t = q.search.toLowerCase();
    r = r.filter(c => c.name.toLowerCase().includes(t) || c.description.toLowerCase().includes(t) || c.category.toLowerCase().includes(t));
  }
  return r;
}

// ── SHARED UI FUNCTIONS (available on every page) ───────────

// Theme toggle with localStorage persistence
(function initTheme() {
  const saved = localStorage.getItem('agri-theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
})();

function toggleTheme() {
  const root = document.documentElement;
  const current = root.getAttribute('data-theme') || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  localStorage.setItem('agri-theme', next);
}

// ── PWA SERVICE WORKER REGISTRATION ────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then(reg => {
        reg.update();
        console.log('[PWA] ServiceWorker registered with scope:', reg.scope);
      })
      .catch(err => console.warn('[PWA] ServiceWorker registration failed:', err));
  });
}

// ── SHARED VOICE SEARCH (Speech-to-Text) ────────────────────
let activeVoiceRecog = null;

function toggleVoiceSearch(inputSelector, buttonEl) {
  const input = typeof inputSelector === 'string' ? document.querySelector(inputSelector) : inputSelector;
  if (!input) return;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    const curLang = localStorage.getItem('agribot_lang') || 'en';
    const alertMsg = curLang === 'gu'
      ? 'તમારું બ્રાઉઝર વૉઇસ સર્ચ સપોર્ટ કરતું નથી. કૃપા કરીને Chrome અથવા Edge વાપરો.'
      : curLang === 'hi'
      ? 'आपका ब्राउज़र वॉइस सर्च का समर्थन नहीं करता। कृपया Chrome या Edge का उपयोग करें।'
      : 'Voice search is not supported by your browser. Please use Chrome or Edge.';
    alert(alertMsg);
    return;
  }

  if (activeVoiceRecog) {
    activeVoiceRecog.stop();
    activeVoiceRecog = null;
    if (buttonEl) buttonEl.classList.remove('listening');
    return;
  }

  const recog = new SpeechRecognition();
  const curLang = localStorage.getItem('agribot_lang') || 'en';
  recog.lang = curLang === 'gu' ? 'gu-IN' : curLang === 'hi' ? 'hi-IN' : 'en-IN';
  recog.continuous = false;
  recog.interimResults = false;

  const originalPlaceholder = input.placeholder;
  input.placeholder = curLang === 'gu' ? '🎙️ સાંભળી રહ્યા છીએ… બોલો' : curLang === 'hi' ? '🎙️ सुन रहे हैं… बोलिए' : '🎙️ Listening… speak now';
  if (buttonEl) buttonEl.classList.add('listening');
  activeVoiceRecog = recog;

  recog.onresult = (e) => {
    const transcript = e.results[0][0].transcript;
    input.value = transcript;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    if (typeof filterCrops === 'function') filterCrops();
    if (typeof filterSeeds === 'function') filterSeeds();
    if (typeof filterPrices === 'function') filterPrices();
  };

  recog.onerror = (e) => {
    console.warn('[Voice Search Error]', e.error);
    cleanup();
  };

  recog.onend = () => {
    cleanup();
  };

  function cleanup() {
    input.placeholder = originalPlaceholder;
    if (buttonEl) buttonEl.classList.remove('listening');
    activeVoiceRecog = null;
  }

  try {
    recog.start();
  } catch (err) {
    console.error(err);
    cleanup();
  }
}

// Mobile menu toggle
function toggleMenu() {
  document.getElementById('mobileMenu').classList.toggle('open');
}

// Modal close (shared)
function closeModal() {
  const ov = document.getElementById('modalOverlay');
  if (ov) ov.classList.remove('open');
  stopCropSpeech();
}

// ── WEB SPEECH API — BILINGUAL READ ALOUD (English + Hindi) ──────────────────
let activeSpeechCropId  = null;
let activeSpeechLang    = null; // 'en' | 'hi'

// ── Hindi lookup data ─────────────────────────────────────────────────────────
// Structured translations for every crop field used in speech generation.
// Fields: name, description, category, care_tips[], seed_type
// Numeric/month values are translated via helper maps below.
const _hindiCropData = {
  // id → { name, description, category, care_tips[], seed_type }
  1:  { name:"गेहूं", description:"गेहूं एक मुख्य अनाज फसल है जो ठंडी और शुष्क जलवायु में उगाई जाती है। यह विश्व की सबसे अधिक उगाई जाने वाली फसलों में से एक है।", category:"अनाज", seed_type:"अनाज बीज", care_tips:["उगाई के दौरान 4-6 बार सिंचाई करें","बुवाई के समय नाइट्रोजन खाद डालें और 3 सप्ताह बाद ऊपरी खाद दें","रतुआ रोग से बचाव के लिए प्रतिरोधी किस्मों का उपयोग करें","जलभराव से बचाने के लिए अच्छी जल निकासी वाली मिट्टी सुनिश्चित करें"] },
  2:  { name:"चावल", description:"चावल एशिया की सबसे महत्वपूर्ण खाद्य फसल है। इसकी अधिकांश वृद्धि के दौरान खेत में खड़ा पानी आवश्यक होता है।", category:"अनाज", seed_type:"धान बीज", care_tips:["खेतों में 5-10 सेमी खड़ा पानी बनाए रखें","नर्सरी में बुवाई के 25-30 दिन बाद पौध रोपण करें","कल्ले फूटने की अवस्था पर यूरिया डालें","कटाई से 2 सप्ताह पहले खेत का पानी निकाल दें"] },
  3:  { name:"मक्का", description:"मक्का एक बहुउद्देशीय फसल है जिसका उपयोग भोजन, चारे और औद्योगिक उत्पादों में होता है। यह गर्म और अच्छी जल निकासी वाली मिट्टी में सबसे अच्छी तरह उगती है।", category:"अनाज", seed_type:"हाइब्रिड / खुले परागण", care_tips:["मेड़ों या उठी हुई क्यारियों पर बीज बोएं","घुटने की ऊंचाई और रेशम निकलने की अवस्था में सिंचाई करें","संतुलित एनपीके उर्वरक डालें","उचित कीटनाशक से तना छेदक नियंत्रित करें"] },
  4:  { name:"कपास", description:"कपास एक प्रमुख नकदी फसल है जो अपने रेशे के लिए उगाई जाती है। गर्म जलवायु और गहरी अच्छी जल निकासी वाली मिट्टी में पनपती है।", category:"नकदी फसल", seed_type:"हाइब्रिड / बीटी कपास", care_tips:["अंतिम पाला पड़ने के बाद जब मिट्टी गर्म हो तब बोएं","अंकुरण के बाद प्रति थाला एक पौधा रखें","बॉलवर्म और सफेद मक्खी की निगरानी करें","डोडे पकने पर सिंचाई कम करें"] },
  5:  { name:"टमाटर", description:"टमाटर सबसे लोकप्रिय सब्जी फसलों में से एक है। यह कई मौसमों में उगाई जा सकती है और विटामिन से भरपूर होती है।", category:"सब्जी", seed_type:"हाइब्रिड सब्जी बीज", care_tips:["रोपाई से 30 दिन पहले नर्सरी ट्रे में बीज बोएं","30 सेमी ऊंचे होने पर पौधों को बांधें","नियमित सिंचाई करें — जलभराव से बचें","अगेती झुलसा रोग से बचाव के लिए फफूंदनाशक का छिड़काव करें"] },
  6:  { name:"गन्ना", description:"गन्ना चीनी और इथेनॉल का प्राथमिक स्रोत है। यह लंबे समय तक चलने वाली फसल है जिसे अधिक पानी की आवश्यकता होती है।", category:"नकदी फसल", seed_type:"तने की कटिंग (सेट्स)", care_tips:["स्वस्थ 2-3 कली वाले सेट्स से रोपण करें","90 दिनों पर मिट्टी चढ़ाएं","हर 10-15 दिन में सिंचाई करें","प्रारंभिक विकास के दौरान शीर्ष छेदक को नियंत्रित करें"] },
  7:  { name:"आलू", description:"आलू एक प्रमुख सब्जी फसल है जो ठंडे मौसम में उगाई जाती है। यह कंद से उगाई जाती है और कार्बोहाइड्रेट से भरपूर होती है।", category:"सब्जी", seed_type:"बीज कंद", care_tips:["प्रमाणित और रोगमुक्त बीज कंद का उपयोग करें","30 दिनों में पौधों के चारों ओर मिट्टी चढ़ाएं","हर 7-10 दिन में सिंचाई करें","पिछेती झुलसा रोग से बचाव के लिए फफूंदनाशक का छिड़काव करें"] },
  8:  { name:"सूरजमुखी", description:"सूरजमुखी एक महत्वपूर्ण तिलहन फसल है जिसे कई मौसमों में उगाया जा सकता है। यह सूखा सहिष्णु और अनुकूलनीय है।", category:"तिलहन", seed_type:"हाइब्रिड तिलहन", care_tips:["प्रति थाला 2 बीज बोएं, अंकुरण के बाद 1 रखें","बोरॉन सूक्ष्म पोषक तत्व डालें","फूल आने और बीज भरने की अवस्था में सिंचाई करें","बीज भरने के दौरान पक्षियों से बचाएं"] },
  9:  { name:"चना", description:"चना एक सूखा सहिष्णु दलहन फसल है जो मिट्टी में नाइट्रोजन स्थिर करती है। यह प्रोटीन का समृद्ध स्रोत है।", category:"दलहन", seed_type:"दलहन बीज", care_tips:["बुवाई से पहले बीजों को राइजोबियम कल्चर से उपचारित करें","अधिक सिंचाई से बचें — 1-2 सिंचाई पर्याप्त है","फूल आने पर फली छेदक की निगरानी करें","पत्तियां पीली होने और फलियां सूखने पर कटाई करें"] },
  10: { name:"आम", description:"आम फलों का राजा है और एक प्रमुख बागवानी फसल है। कलम लगाए पौधे 3-4 वर्षों में फल देने लगते हैं।", category:"फल", seed_type:"कलमी पौध", care_tips:["जल्दी और विश्वसनीय फल के लिए कलमी पौधों का उपयोग करें","हर साल जुलाई-अगस्त में गोबर की खाद डालें","छोटे पेड़ों को साप्ताहिक सिंचाई करें; बड़े पेड़ों को फूल आने से पहले","कटाई के बाद सूखी लकड़ी छांटें"] },
  11: { name:"प्याज", description:"प्याज दुनिया भर में मसाले और सब्जी के रूप में उपयोग की जाने वाली सबसे महत्वपूर्ण व्यावसायिक सब्जी फसलों में से एक है।", category:"सब्जी", seed_type:"बल्ब बीज / सेट्स", care_tips:["6 सप्ताह पुरानी नर्सरी पौध का रोपण करें","हर 7-10 दिन में सिंचाई करें; कटाई से 10 दिन पहले बंद करें","बेहतर कंद विकास के लिए पोटेशियम डालें","नीम के तेल के छिड़काव से थ्रिप्स नियंत्रित करें"] },
  12: { name:"मूंगफली", description:"मूंगफली एक प्रमुख तिलहन और खाद्य फसल है। यह वायुमंडलीय नाइट्रोजन स्थिर करती है और मिट्टी की उर्वरता में सुधार करती है।", category:"तिलहन", seed_type:"तिलहन (गिरी)", care_tips:["सर्वोत्तम अंकुरण के लिए बुवाई से ठीक पहले छिलका उतारें","फली विकास के लिए मिट्टी चढ़ाना आवश्यक है","जलभराव से बचें — कॉलर रॉट होता है","कैल्शियम के लिए खूंटी अवस्था पर जिप्सम डालें"] },
  13: { name:"जौ", description:"जौ एक मजबूत फसल है जो व्यापक रूप से उगाई जाती है। यह अनुकूल जलवायु को प्राथमिकता देता है।", category:"अनाज", seed_type:"मानक बीज", care_tips:["उचित मिट्टी जल निकासी सुनिश्चित करें","प्रारंभिक विकास चरणों में कीटों की निगरानी करें","संतुलित उर्वरक डालें"] },
  14: { name:"ज्वार", description:"ज्वार एक मजबूत फसल है जो व्यापक रूप से उगाई जाती है। यह अनुकूल जलवायु को प्राथमिकता देता है।", category:"अनाज", seed_type:"मानक बीज", care_tips:["उचित मिट्टी जल निकासी सुनिश्चित करें","प्रारंभिक विकास चरणों में कीटों की निगरानी करें","संतुलित उर्वरक डालें"] },
  15: { name:"बाजरा", description:"बाजरा एक मजबूत फसल है जो व्यापक रूप से उगाई जाती है। यह अनुकूल जलवायु को प्राथमिकता देता है।", category:"अनाज", seed_type:"मानक बीज", care_tips:["उचित मिट्टी जल निकासी सुनिश्चित करें","प्रारंभिक विकास चरणों में कीटों की निगरानी करें","संतुलित उर्वरक डालें"] },
  16: { name:"जई", description:"जई एक मजबूत फसल है जो व्यापक रूप से उगाई जाती है। यह अनुकूल जलवायु को प्राथमिकता देता है।", category:"अनाज", seed_type:"मानक बीज", care_tips:["उचित मिट्टी जल निकासी सुनिश्चित करें","प्रारंभिक विकास चरणों में कीटों की निगरानी करें","संतुलित उर्वरक डालें"] },
  17: { name:"राई", description:"राई एक मजबूत फसल है जो व्यापक रूप से उगाई जाती है। यह अनुकूल जलवायु को प्राथमिकता देता है।", category:"अनाज", seed_type:"मानक बीज", care_tips:["उचित मिट्टी जल निकासी सुनिश्चित करें","प्रारंभिक विकास चरणों में कीटों की निगरानी करें","संतुलित उर्वरक डालें"] },
  18: { name:"क्विनोआ", description:"क्विनोआ एक मजबूत फसल है जो व्यापक रूप से उगाई जाती है। यह अनुकूल जलवायु को प्राथमिकता देता है।", category:"अनाज", seed_type:"मानक बीज", care_tips:["उचित मिट्टी जल निकासी सुनिश्चित करें","प्रारंभिक विकास चरणों में कीटों की निगरानी करें","संतुलित उर्वरक डालें"] },
  19: { name:"कुट्टू", description:"कुट्टू एक मजबूत फसल है जो व्यापक रूप से उगाई जाती है। यह अनुकूल जलवायु को प्राथमिकता देता है।", category:"अनाज", seed_type:"मानक बीज", care_tips:["उचित मिट्टी जल निकासी सुनिश्चित करें","प्रारंभिक विकास चरणों में कीटों की निगरानी करें","संतुलित उर्वरक डालें"] },
  20: { name:"पत्तागोभी", description:"पत्तागोभी एक लोकप्रिय सब्जी फसल है। यह ठंडी जलवायु में अच्छी तरह उगती है।", category:"सब्जी", seed_type:"मानक बीज", care_tips:["उचित मिट्टी जल निकासी सुनिश्चित करें","प्रारंभिक विकास चरणों में कीटों की निगरानी करें","संतुलित उर्वरक डालें"] },
  21: { name:"फूलगोभी", description:"फूलगोभी एक लोकप्रिय सब्जी फसल है। यह ठंडी जलवायु में अच्छी तरह उगती है।", category:"सब्जी", seed_type:"मानक बीज", care_tips:["उचित मिट्टी जल निकासी सुनिश्चित करें","प्रारंभिक विकास चरणों में कीटों की निगरानी करें","संतुलित उर्वरक डालें"] },
  22: { name:"ब्रोकोली", description:"ब्रोकोली एक पौष्टिक सब्जी फसल है। यह ठंडी जलवायु में उगाई जाती है।", category:"सब्जी", seed_type:"मानक बीज", care_tips:["उचित मिट्टी जल निकासी सुनिश्चित करें","प्रारंभिक विकास चरणों में कीटों की निगरानी करें","संतुलित उर्वरक डालें"] },
  23: { name:"पालक", description:"पालक एक पत्तेदार सब्जी फसल है जो ठंडे मौसम में उगाई जाती है।", category:"सब्जी", seed_type:"मानक बीज", care_tips:["उचित मिट्टी जल निकासी सुनिश्चित करें","प्रारंभिक विकास चरणों में कीटों की निगरानी करें","संतुलित उर्वरक डालें"] },
  24: { name:"लेट्यूस", description:"लेट्यूस एक सलाद पत्ती की सब्जी है जो ठंडे मौसम में उगाई जाती है।", category:"सब्जी", seed_type:"मानक बीज", care_tips:["उचित मिट्टी जल निकासी सुनिश्चित करें","प्रारंभिक विकास चरणों में कीटों की निगरानी करें","संतुलित उर्वरक डालें"] },
  25: { name:"गाजर", description:"गाजर एक जड़ वाली सब्जी फसल है जो ठंडे मौसम में उगाई जाती है।", category:"सब्जी", seed_type:"मानक बीज", care_tips:["उचित मिट्टी जल निकासी सुनिश्चित करें","प्रारंभिक विकास चरणों में कीटों की निगरानी करें","संतुलित उर्वरक डालें"] },
  26: { name:"मूली", description:"मूली एक तेज उगने वाली जड़ सब्जी है जो ठंडे मौसम में उगाई जाती है।", category:"सब्जी", seed_type:"मानक बीज", care_tips:["उचित मिट्टी जल निकासी सुनिश्चित करें","प्रारंभिक विकास चरणों में कीटों की निगरानी करें","संतुलित उर्वरक डालें"] },
  27: { name:"चुकंदर", description:"चुकंदर एक जड़ वाली सब्जी है जो ठंडे मौसम में उगाई जाती है।", category:"सब्जी", seed_type:"मानक बीज", care_tips:["उचित मिट्टी जल निकासी सुनिश्चित करें","प्रारंभिक विकास चरणों में कीटों की निगरानी करें","संतुलित उर्वरक डालें"] },
  28: { name:"लहसुन", description:"लहसुन एक महत्वपूर्ण मसाला और औषधीय फसल है।", category:"सब्जी", seed_type:"मानक बीज", care_tips:["उचित मिट्टी जल निकासी सुनिश्चित करें","प्रारंभिक विकास चरणों में कीटों की निगरानी करें","संतुलित उर्वरक डालें"] },
  29: { name:"अदरक", description:"अदरक एक महत्वपूर्ण मसाला और औषधीय फसल है।", category:"सब्जी", seed_type:"मानक बीज", care_tips:["उचित मिट्टी जल निकासी सुनिश्चित करें","प्रारंभिक विकास चरणों में कीटों की निगरानी करें","संतुलित उर्वरक डालें"] },
  30: { name:"हल्दी", description:"हल्दी एक महत्वपूर्ण मसाला और औषधीय फसल है जो भारत में व्यापक रूप से उगाई जाती है।", category:"सब्जी", seed_type:"मानक बीज", care_tips:["उचित मिट्टी जल निकासी सुनिश्चित करें","प्रारंभिक विकास चरणों में कीटों की निगरानी करें","संतुलित उर्वरक डालें"] },
  31: { name:"शिमला मिर्च", description:"शिमला मिर्च एक लोकप्रिय सब्जी फसल है जो गर्म जलवायु में उगाई जाती है।", category:"सब्जी", seed_type:"मानक बीज", care_tips:["उचित मिट्टी जल निकासी सुनिश्चित करें","प्रारंभिक विकास चरणों में कीटों की निगरानी करें","संतुलित उर्वरक डालें"] },
  32: { name:"मिर्च", description:"मिर्च एक लोकप्रिय मसाला फसल है जो विभिन्न मौसमों में उगाई जाती है।", category:"सब्जी", seed_type:"मानक बीज", care_tips:["उचित मिट्टी जल निकासी सुनिश्चित करें","प्रारंभिक विकास चरणों में कीटों की निगरानी करें","संतुलित उर्वरक डालें"] },
  33: { name:"बैंगन", description:"बैंगन एक लोकप्रिय सब्जी फसल है जो विभिन्न मौसमों में उगाई जाती है।", category:"सब्जी", seed_type:"मानक बीज", care_tips:["उचित मिट्टी जल निकासी सुनिश्चित करें","प्रारंभिक विकास चरणों में कीटों की निगरानी करें","संतुलित उर्वरक डालें"] },
  34: { name:"भिंडी", description:"भिंडी एक लोकप्रिय सब्जी फसल है जो गर्म मौसम में उगाई जाती है।", category:"सब्जी", seed_type:"मानक बीज", care_tips:["उचित मिट्टी जल निकासी सुनिश्चित करें","प्रारंभिक विकास चरणों में कीटों की निगरानी करें","संतुलित उर्वरक डालें"] },
  35: { name:"कद्दू", description:"कद्दू एक लोकप्रिय सब्जी फसल है जो गर्म मौसम में उगाई जाती है।", category:"सब्जी", seed_type:"मानक बीज", care_tips:["उचित मिट्टी जल निकासी सुनिश्चित करें","प्रारंभिक विकास चरणों में कीटों की निगरानी करें","संतुलित उर्वरक डालें"] },
  36: { name:"खीरा", description:"खीरा गर्म मौसम में उगाई जाने वाली एक ताज़ी सब्जी फसल है।", category:"सब्जी", seed_type:"मानक बीज", care_tips:["उचित मिट्टी जल निकासी सुनिश्चित करें","प्रारंभिक विकास चरणों में कीटों की निगरानी करें","संतुलित उर्वरक डालें"] },
  37: { name:"करेला", description:"करेला एक कड़वी सब्जी फसल है जो औषधीय गुणों के लिए जानी जाती है।", category:"सब्जी", seed_type:"मानक बीज", care_tips:["उचित मिट्टी जल निकासी सुनिश्चित करें","प्रारंभिक विकास चरणों में कीटों की निगरानी करें","संतुलित उर्वरक डालें"] },
  38: { name:"लौकी", description:"लौकी एक लोकप्रिय गर्मियों की सब्जी फसल है।", category:"सब्जी", seed_type:"मानक बीज", care_tips:["उचित मिट्टी जल निकासी सुनिश्चित करें","प्रारंभिक विकास चरणों में कीटों की निगरानी करें","संतुलित उर्वरक डालें"] },
  39: { name:"फ्रेंच बीन्स", description:"फ्रेंच बीन्स एक लोकप्रिय फलीदार सब्जी फसल है।", category:"सब्जी", seed_type:"मानक बीज", care_tips:["उचित मिट्टी जल निकासी सुनिश्चित करें","प्रारंभिक विकास चरणों में कीटों की निगरानी करें","संतुलित उर्वरक डालें"] },
  40: { name:"मटर", description:"मटर एक ठंडे मौसम की फलीदार सब्जी फसल है।", category:"सब्जी", seed_type:"मानक बीज", care_tips:["उचित मिट्टी जल निकासी सुनिश्चित करें","प्रारंभिक विकास चरणों में कीटों की निगरानी करें","संतुलित उर्वरक डालें"] },
  41: { name:"शकरकंद", description:"शकरकंद एक पौष्टिक जड़ वाली सब्जी फसल है।", category:"सब्जी", seed_type:"मानक बीज", care_tips:["उचित मिट्टी जल निकासी सुनिश्चित करें","प्रारंभिक विकास चरणों में कीटों की निगरानी करें","संतुलित उर्वरक डालें"] },
  42: { name:"कसावा", description:"कसावा एक उष्णकटिबंधीय जड़ वाली सब्जी फसल है।", category:"सब्जी", seed_type:"मानक बीज", care_tips:["उचित मिट्टी जल निकासी सुनिश्चित करें","प्रारंभिक विकास चरणों में कीटों की निगरानी करें","संतुलित उर्वरक डालें"] },
  43: { name:"जिमीकंद", description:"जिमीकंद एक उष्णकटिबंधीय जड़ वाली फसल है।", category:"सब्जी", seed_type:"मानक बीज", care_tips:["उचित मिट्टी जल निकासी सुनिश्चित करें","प्रारंभिक विकास चरणों में कीटों की निगरानी करें","संतुलित उर्वरक डालें"] },
  44: { name:"केला", description:"केला एक लोकप्रिय उष्णकटिबंधीय फल फसल है।", category:"फल", seed_type:"मानक बीज", care_tips:["उचित मिट्टी जल निकासी सुनिश्चित करें","प्रारंभिक विकास चरणों में कीटों की निगरानी करें","संतुलित उर्वरक डालें"] },
  45: { name:"संतरा", description:"संतरा एक लोकप्रिय खट्टे फल फसल है।", category:"फल", seed_type:"मानक बीज", care_tips:["उचित मिट्टी जल निकासी सुनिश्चित करें","प्रारंभिक विकास चरणों में कीटों की निगरानी करें","संतुलित उर्वरक डालें"] },
  46: { name:"अंगूर", description:"अंगूर एक लोकप्रिय फल फसल है जो बेल पर उगती है।", category:"फल", seed_type:"मानक बीज", care_tips:["उचित मिट्टी जल निकासी सुनिश्चित करें","प्रारंभिक विकास चरणों में कीटों की निगरानी करें","संतुलित उर्वरक डालें"] },
  47: { name:"पपीता", description:"पपीता एक उष्णकटिबंधीय फल फसल है जो जल्दी फल देती है।", category:"फल", seed_type:"मानक बीज", care_tips:["उचित मिट्टी जल निकासी सुनिश्चित करें","प्रारंभिक विकास चरणों में कीटों की निगरानी करें","संतुलित उर्वरक डालें"] },
  48: { name:"अमरूद", description:"अमरूद एक लोकप्रिय उष्णकटिबंधीय फल फसल है।", category:"फल", seed_type:"मानक बीज", care_tips:["उचित मिट्टी जल निकासी सुनिश्चित करें","प्रारंभिक विकास चरणों में कीटों की निगरानी करें","संतुलित उर्वरक डालें"] },
  49: { name:"अनानास", description:"अनानास एक उष्णकटिबंधीय फल फसल है।", category:"फल", seed_type:"मानक बीज", care_tips:["उचित मिट्टी जल निकासी सुनिश्चित करें","प्रारंभिक विकास चरणों में कीटों की निगरानी करें","संतुलित उर्वरक डालें"] },
  50: { name:"तरबूज", description:"तरबूज एक लोकप्रिय गर्मियों की फल फसल है जो अपने रसीले स्वाद के लिए जानी जाती है।", category:"फल", seed_type:"मानक बीज", care_tips:["उचित मिट्टी जल निकासी सुनिश्चित करें","प्रारंभिक विकास चरणों में कीटों की निगरानी करें","संतुलित उर्वरक डालें"] },
  51: { name:"खरबूजा", description:"खरबूजा एक मीठी गर्मियों की फल फसल है।", category:"फल", seed_type:"मानक बीज", care_tips:["उचित मिट्टी जल निकासी सुनिश्चित करें","प्रारंभिक विकास चरणों में कीटों की निगरानी करें","संतुलित उर्वरक डालें"] },
  52: { name:"अनार", description:"अनार एक बहुवर्षीय फल फसल है जो औषधीय गुणों के लिए प्रसिद्ध है।", category:"फल", seed_type:"मानक बीज", care_tips:["उचित मिट्टी जल निकासी सुनिश्चित करें","प्रारंभिक विकास चरणों में कीटों की निगरानी करें","संतुलित उर्वरक डालें"] },
  53: { name:"नींबू", description:"नींबू एक लोकप्रिय खट्टे फल की बहुवर्षीय फसल है।", category:"फल", seed_type:"मानक बीज", care_tips:["उचित मिट्टी जल निकासी सुनिश्चित करें","प्रारंभिक विकास चरणों में कीटों की निगरानी करें","संतुलित उर्वरक डालें"] },
  54: { name:"नारियल", description:"नारियल एक उष्णकटिबंधीय बहुवर्षीय फल फसल है।", category:"फल", seed_type:"मानक बीज", care_tips:["उचित मिट्टी जल निकासी सुनिश्चित करें","प्रारंभिक विकास चरणों में कीटों की निगरानी करें","संतुलित उर्वरक डालें"] },
  55: { name:"कटहल", description:"कटहल एक उष्णकटिबंधीय बहुवर्षीय फल फसल है।", category:"फल", seed_type:"मानक बीज", care_tips:["उचित मिट्टी जल निकासी सुनिश्चित करें","प्रारंभिक विकास चरणों में कीटों की निगरानी करें","संतुलित उर्वरक डालें"] },
  56: { name:"जूट", description:"जूट एक महत्वपूर्ण रेशे वाली नकदी फसल है।", category:"नकदी फसल", seed_type:"मानक बीज", care_tips:["उचित मिट्टी जल निकासी सुनिश्चित करें","प्रारंभिक विकास चरणों में कीटों की निगरानी करें","संतुलित उर्वरक डालें"] },
  57: { name:"चाय", description:"चाय एक महत्वपूर्ण बहुवर्षीय नकदी फसल है।", category:"नकदी फसल", seed_type:"मानक बीज", care_tips:["उचित मिट्टी जल निकासी सुनिश्चित करें","प्रारंभिक विकास चरणों में कीटों की निगरानी करें","संतुलित उर्वरक डालें"] },
  58: { name:"कॉफी", description:"कॉफी एक महत्वपूर्ण बहुवर्षीय नकदी फसल है।", category:"नकदी फसल", seed_type:"मानक बीज", care_tips:["उचित मिट्टी जल निकासी सुनिश्चित करें","प्रारंभिक विकास चरणों में कीटों की निगरानी करें","संतुलित उर्वरक डालें"] },
  59: { name:"रबर", description:"रबर एक महत्वपूर्ण औद्योगिक बहुवर्षीय नकदी फसल है।", category:"नकदी फसल", seed_type:"मानक बीज", care_tips:["उचित मिट्टी जल निकासी सुनिश्चित करें","प्रारंभिक विकास चरणों में कीटों की निगरानी करें","संतुलित उर्वरक डालें"] },
  60: { name:"तंबाकू", description:"तंबाकू एक व्यावसायिक नकदी फसल है।", category:"नकदी फसल", seed_type:"मानक बीज", care_tips:["उचित मिट्टी जल निकासी सुनिश्चित करें","प्रारंभिक विकास चरणों में कीटों की निगरानी करें","संतुलित उर्वरक डालें"] },
  61: { name:"सरसों", description:"सरसों एक महत्वपूर्ण रबी तिलहन फसल है।", category:"तिलहन", seed_type:"मानक बीज", care_tips:["उचित मिट्टी जल निकासी सुनिश्चित करें","प्रारंभिक विकास चरणों में कीटों की निगरानी करें","संतुलित उर्वरक डालें"] },
  62: { name:"सोयाबीन", description:"सोयाबीन एक महत्वपूर्ण तिलहन और प्रोटीन फसल है।", category:"तिलहन", seed_type:"मानक बीज", care_tips:["उचित मिट्टी जल निकासी सुनिश्चित करें","प्रारंभिक विकास चरणों में कीटों की निगरानी करें","संतुलित उर्वरक डालें"] }
};

// Helper maps for Hindi month/term translations
const _hiMonths = {
  "January":"जनवरी","February":"फरवरी","March":"मार्च","April":"अप्रैल",
  "May":"मई","June":"जून","July":"जुलाई","August":"अगस्त",
  "September":"सितंबर","October":"अक्टूबर","November":"नवंबर","December":"दिसंबर"
};
const _hiSeasons = {
  "kharif":"खरीफ","rabi":"रबी","summer":"ग्रीष्मकालीन","annual":"वार्षिक",
  "perennial":"बहुवर्षीय","winter":"शीतकालीन","zaid":"जायद"
};
const _hiSoils = {
  "loamy":"दोमट","clay":"चिकनी मिट्टी","alluvial":"जलोढ़","black":"काली मिट्टी",
  "sandy-loam":"बलुई दोमट","laterite":"लेटराइट","red":"लाल मिट्टी","deep-loam":"गहरी दोमट"
};
const _hiClimates = {
  "cool":"ठंडी","warm":"गर्म","hot":"अत्यधिक गर्म","humid":"आर्द्र",
  "tropical":"उष्णकटिबंधीय","subtropical":"उपोष्णकटिबंधीय","temperate":"समशीतोष्ण",
  "dry":"शुष्क","semi-arid":"अर्ध-शुष्क"
};
const _hiWater = { "low":"कम","medium":"मध्यम","high":"अधिक" };

function _translateHiArr(arr, map) {
  if (!arr || !arr.length) return '';
  return arr.map(v => map[v] || v).join(', ');
}

// ── Speech text generators ────────────────────────────────────────────────────

// generateCropSpeechText — legacy alias for generateEnglishSpeechText
// (kept for backward compatibility; toggleCropSpeech uses the specific functions below)
function generateCropSpeechText(crop) {
  return generateEnglishSpeechText(crop);
}


function generateEnglishSpeechText(crop) {
  if (!crop) return '';
  const parts = [];
  parts.push(`Crop Name: ${crop.name}.`);
  if (crop.category) parts.push(`Category: ${crop.category.replace('_',' ')}.`);
  if (crop.description) parts.push(`Description: ${crop.description}`);
  if (crop.season && crop.season.length) parts.push(`Suitable Season: ${crop.season.join(', ')}.`);
  if (crop.soil_types && crop.soil_types.length) parts.push(`Suitable Soil Types: ${crop.soil_types.join(', ')}.`);
  if (crop.climate && crop.climate.length) parts.push(`Temperature and Climate: ${crop.climate.join(', ')}.`);
  if (crop.water_requirement) parts.push(`Water Requirement: ${crop.water_requirement}.`);
  if (crop.duration_days) parts.push(`Growth Duration: ${crop.duration_days} days.`);
  if (crop.sowing_months && crop.sowing_months.length) parts.push(`Sowing Months: ${crop.sowing_months.join(', ')}.`);
  if (crop.harvest_months && crop.harvest_months.length) parts.push(`Harvest Months: ${crop.harvest_months.join(', ')}.`);
  if (crop.seeds) {
    const sd = [];
    if (crop.seeds.type)                  sd.push(`Seed Type: ${crop.seeds.type}`);
    if (crop.seeds.sowing_depth_cm)       sd.push(`Sowing Depth: ${crop.seeds.sowing_depth_cm} centimeters`);
    if (crop.seeds.seed_rate_kg_per_acre) sd.push(`Seed Rate: ${crop.seeds.seed_rate_kg_per_acre}`);
    if (crop.seeds.germination_days)      sd.push(`Germination: ${crop.seeds.germination_days} days`);
    if (crop.seeds.spacing_cm)            sd.push(`Spacing: ${crop.seeds.spacing_cm} centimeters`);
    if (sd.length) parts.push(`Seed Information: ${sd.join('. ')}.`);
  }
  if (crop.care_tips && crop.care_tips.length) parts.push(`Care Tips: ${crop.care_tips.join('. ')}.`);
  return parts.join(' ');
}

function generateHindiSpeechText(crop) {
  if (!crop) return '';
  // Ensure we have the Hindi crop data loaded
  const hindi = (typeof hindiCropData !== 'undefined') ? hindiCropData[crop.name] : null;
  if (!hindi) {
    console.warn(`[ReadAloud] No Hindi data found for ${crop.name}, falling back to English.`);
    return generateEnglishSpeechText(crop);
  }

  const parts = [];
  parts.push(`फसल का नाम ${hindi.name}.`);
  if (hindi.description) parts.push(`${hindi.description}`);
  if (hindi.category) parts.push(`श्रेणी: ${hindi.category}.`);
  if (hindi.season && hindi.season.length) parts.push(`इस फसल के लिए उपयुक्त मौसम ${hindi.season.join(' और ')} है।`);
  if (hindi.soil_types && hindi.soil_types.length) parts.push(`इस फसल के लिए उपयुक्त मिट्टी ${hindi.soil_types.join(' और ')} है।`);
  if (hindi.climate && hindi.climate.length) parts.push(`जलवायु और तापमान: ${hindi.climate.join(' और ')}.`);
  if (hindi.water) parts.push(`जल आवश्यकता: ${hindi.water}.`);
  if (hindi.duration) parts.push(`उगाने की अवधि: ${hindi.duration} दिन.`);
  if (hindi.sowing_months && hindi.sowing_months.length) parts.push(`बुवाई के महीने: ${hindi.sowing_months.join(', ')}.`);
  if (hindi.harvest_months && hindi.harvest_months.length) parts.push(`कटाई के महीने: ${hindi.harvest_months.join(', ')}.`);
  
  const sd = [];
  if (hindi.seed_type) sd.push(`बीज का प्रकार: ${hindi.seed_type}`);
  if (hindi.seed_depth) sd.push(`बुवाई की गहराई: ${hindi.seed_depth}`);
  if (hindi.seed_rate) sd.push(`बीज दर: ${hindi.seed_rate}`);
  if (hindi.germination) sd.push(`अंकुरण समय: ${hindi.germination}`);
  if (hindi.spacing) sd.push(`दूरी: ${hindi.spacing}`);
  if (sd.length) parts.push(`बीज की जानकारी: ${sd.join('. ')}.`);
  
  if (hindi.care_tips && hindi.care_tips.length) parts.push(`देखभाल के सुझाव: ${hindi.care_tips.join('. ')}.`);
  
  return parts.join(' ');
}

function generateGujaratiSpeechText(crop) {
  if (!crop) return '';
  const gujarati = (typeof gujaratiCropData !== 'undefined') ? gujaratiCropData[crop.name] : null;
  if (!gujarati) {
    console.warn(`[ReadAloud] No Gujarati data found for ${crop.name}, falling back to Hindi/English.`);
    return generateHindiSpeechText(crop) || generateEnglishSpeechText(crop);
  }

  const parts = [];
  parts.push(`પાકનું નામ ${gujarati.name}.`);
  if (gujarati.description) parts.push(`${gujarati.description}`);
  if (gujarati.category) parts.push(`શ્રેણી: ${gujarati.category}.`);
  if (gujarati.season && gujarati.season.length) parts.push(`આ પાક માટે અનુકૂળ ઋતુ ${gujarati.season.join(' અને ')} છે.`);
  if (gujarati.soil_types && gujarati.soil_types.length) parts.push(`આ પાક માટે અનુકૂળ જમીન ${gujarati.soil_types.join(' અને ')} છે.`);
  if (gujarati.climate && gujarati.climate.length) parts.push(`આબોહવા અને તાપમાન: ${gujarati.climate.join(' અને ')}.`);
  if (gujarati.water) parts.push(`પાણીની જરૂરિયાત: ${gujarati.water}.`);
  if (gujarati.duration) parts.push(`પાકનો સમયગાળો: ${gujarati.duration} દિવસ.`);
  if (gujarati.sowing_months && gujarati.sowing_months.length) parts.push(`વાવણીના મહિના: ${gujarati.sowing_months.join(', ')}.`);
  if (gujarati.harvest_months && gujarati.harvest_months.length) parts.push(`કાપણીના મહિના: ${gujarati.harvest_months.join(', ')}.`);

  const sd = [];
  if (gujarati.seed_type) sd.push(`બીજનો પ્રકાર: ${gujarati.seed_type}`);
  if (gujarati.seed_depth) sd.push(`વાવણીની ઊંડાઈ: ${gujarati.seed_depth}`);
  if (gujarati.seed_rate) sd.push(`બીજ દર: ${gujarati.seed_rate}`);
  if (gujarati.germination) sd.push(`અંકુરણ સમય: ${gujarati.germination}`);
  if (gujarati.spacing) sd.push(`અંતર: ${gujarati.spacing}`);
  if (sd.length) parts.push(`બીજની માહિતી: ${sd.join('. ')}.`);

  if (gujarati.care_tips && gujarati.care_tips.length) parts.push(`સંભાળ માટેની ટિપ્સ: ${gujarati.care_tips.join('. ')}.`);

  return parts.join(' ');
}

// ── Global audio state for ElevenLabs TTS ─────────────────────────────────────
let currentAudio = null;

// ── Stop all speech & reset ALL read-aloud buttons ───────────────────────────

function stopCropSpeech() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  activeSpeechCropId = null;
  activeSpeechLang   = null;
  document.querySelectorAll('.btn-read-aloud-en, .btn-read-aloud-hi, .btn-read-aloud-gu, .btn-stop-reading').forEach(btn => {
    btn.classList.remove('reading');
  });
  document.querySelectorAll('.btn-read-aloud-en').forEach(b => {
    b.innerHTML = '🔊 English';
    b.disabled  = false;
  });
  document.querySelectorAll('.btn-read-aloud-hi').forEach(b => {
    b.innerHTML = '🔊 हिंदी';
    b.disabled  = false;
  });
  document.querySelectorAll('.btn-read-aloud-gu').forEach(b => {
    b.innerHTML = '🔊 ગુજરાતી';
    b.disabled  = false;
  });
  document.querySelectorAll('.btn-stop-reading').forEach(b => {
    b.style.display = 'none';
  });
}



// ── Start / toggle speech for a given language (ElevenLabs / EdgeTTS) ─────────

async function toggleCropSpeech(crop, lang, btnElement, event) {
  if (event) event.stopPropagation();

  // If the same crop & same language is already playing, clicking stops it
  if (activeSpeechCropId === crop.id && activeSpeechLang === lang && currentAudio && !currentAudio.paused) {
    stopCropSpeech();
    return;
  }

  // Stop whatever is currently playing
  stopCropSpeech();

  // Choose the correct text based on language
  let text = '';
  if (lang === 'gu') {
    text = generateGujaratiSpeechText(crop);
  } else if (lang === 'hi') {
    text = generateHindiSpeechText(crop);
  } else {
    text = generateEnglishSpeechText(crop);
  }

  console.log(`[ReadAloud] lang: ${lang}, text:`, text);

  if (!text) {
    console.error('[ReadAloud] No text generated!');
    return;
  }

  activeSpeechCropId = crop.id;
  activeSpeechLang   = lang;

  // Update button states for this crop
  const cropBtnsEn = document.querySelectorAll(`.btn-read-aloud-en[data-crop-id="${crop.id}"]`);
  const cropBtnsHi = document.querySelectorAll(`.btn-read-aloud-hi[data-crop-id="${crop.id}"]`);
  const cropBtnsGu = document.querySelectorAll(`.btn-read-aloud-gu[data-crop-id="${crop.id}"]`);
  const stopBtns   = document.querySelectorAll(`.btn-stop-reading[data-crop-id="${crop.id}"]`);

  cropBtnsEn.forEach(b => { b.classList.toggle('reading', lang === 'en'); b.disabled = (lang !== 'en'); });
  cropBtnsHi.forEach(b => { b.classList.toggle('reading', lang === 'hi'); b.disabled = (lang !== 'hi'); });
  cropBtnsGu.forEach(b => { b.classList.toggle('reading', lang === 'gu'); b.disabled = (lang !== 'gu'); });
  stopBtns.forEach(b   => { b.style.display = 'inline-flex'; b.classList.add('reading'); });

  let activeBtn = cropBtnsEn[0];
  if (lang === 'hi') activeBtn = cropBtnsHi[0];
  if (lang === 'gu') activeBtn = cropBtnsGu[0];
  const originalText = activeBtn ? activeBtn.innerHTML : '';
  if (activeBtn) activeBtn.innerHTML = '⏳ Loading...';

  try {
    const endpoint = USE_LIVE_API ? `${API_BASE_URL}/api/tts` : '/api/tts';
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, lang })
    });

    if (!response.ok) {
      throw new Error(`TTS API failed with status ${response.status}`);
    }

    const blob = await response.blob();
    const audioUrl = URL.createObjectURL(blob);
    
    // Check if user clicked stop or another button while fetching
    if (activeSpeechCropId !== crop.id || activeSpeechLang !== lang) {
        URL.revokeObjectURL(audioUrl);
        return; 
    }

    currentAudio = new Audio(audioUrl);
    
    if (activeBtn) activeBtn.innerHTML = originalText;

    currentAudio.onended = () => {
      console.log('[ReadAloud] Speech ended');
      stopCropSpeech();
      URL.revokeObjectURL(audioUrl);
    };

    currentAudio.onerror = (e) => {
      console.error('[ReadAloud] Speech error:', e);
      stopCropSpeech();
      URL.revokeObjectURL(audioUrl);
    };

    await currentAudio.play();
    console.log('[ReadAloud] ElevenLabs speaking started ✅');

  } catch (err) {
    console.error('[ReadAloud] TTS fetch error:', err);
    if (activeBtn) activeBtn.innerHTML = originalText;
    stopCropSpeech();
    alert('Failed to generate speech via ElevenLabs. Please check server logs or API key.');
  }
}




// Back-to-top button
window.addEventListener('scroll', () => {
  const btn = document.getElementById('backToTop');
  if (!btn) return;
  btn.classList.toggle('visible', window.scrollY > 400);
});

// Scroll-reveal: elements with .reveal fade+slide in when they enter the viewport
document.addEventListener('DOMContentLoaded', () => {
  // Tag all major sections for reveal
  document.querySelectorAll(
    '.feature-card, .crop-card, .season-card, .soil-card, .care-card, .section-title, .filter-bar, .seed-table-wrap, .hero-stats .stat'
  ).forEach(el => el.classList.add('reveal'));

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // Stagger crop cards
  document.querySelectorAll('.crop-cards-grid').forEach(grid => {
    const mo = new MutationObserver(() => {
      grid.querySelectorAll('.crop-card').forEach((c, i) => { c.style.animationDelay = `${i * 0.06}s`; });
    });
    mo.observe(grid, { childList: true });
  });
});
