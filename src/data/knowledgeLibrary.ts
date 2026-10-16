import type { KnowledgeArticle } from '../types';

export const KNOWLEDGE_ARTICLES: KnowledgeArticle[] = [
  // --- 1. Basic Crop Care ---
  {
    id: 'crop-care-paddy',
    title: 'Paddy / Rice: Complete Cultivation & Crop Care',
    category: 'crop-care',
    crops: ['Paddy', 'Rice'],
    summary: 'Standard practices for nursery management, puddle transplanting, water regime, and blast prevention.',
    keyPoints: [
      'Nursery age: Transplant 20 to 25 day old seedlings at 2-3 seedlings per hill.',
      'Spacing: Maintain 20 cm x 15 cm spacing for optimal tillering and air circulation.',
      'Water regime: Maintain 2-3 cm shallow water during initial tillering; drain field 7-10 days before harvest.',
      'Weed management: Cono-weeder or hand weeding at 15 and 30 days after transplanting (DAT).',
    ],
    fullGuide: `
### Soil and Field Preparation
Rice thrives in clay loam or alluvial soils with high water-holding capacity. Puddle the soil thoroughly 2 to 3 times to break clods, incorporate organic matter, and reduce water percolation. Level the field precisely to avoid uneven water stagnation.

### Nursery Management
- Prepare raised seedbeds of 1 meter width.
- Treat seeds with Trichoderma viride (4g/kg) or carbendazim to prevent seed-borne blast and seedling blight.
- Use healthy, pre-sprouted seeds.

### Transplanting & Spacing
- Transplant 20-25 day old seedlings (4-leaf stage).
- Spacing: 20 cm x 15 cm in normal soils; 15 cm x 10 cm in late plantings.
- Avoid deep planting; plant at 2 to 3 cm depth for vigorous root aeration.

### Water Management
- Keep shallow water depth (2-3 cm) for the first 10 days to encourage seedling establishment.
- Alternate wetting and drying (AWD) can save 25-30% irrigation water without yield penalty.
- Critical stages requiring moisture: Panicle initiation and flowering.
- Drain field completely 10-14 days before harvest to hasten uniform grain ripening.
    `,
    safetyNote: 'Avoid prolonged stagnation in cold weather which promotes sheath rot and bacterial leaf blight.',
    tags: ['paddy', 'rice', 'transplanting', 'water regime', 'nursery'],
  },
  {
    id: 'crop-care-tomato',
    title: 'Tomato: Staking, Pruning, & Blight Protection',
    category: 'crop-care',
    crops: ['Tomato'],
    summary: 'Essential guidelines for nursery sowing, trellis staking, blossom-end rot prevention, and blight scouting.',
    keyPoints: [
      'Raised beds with drip lines prevent soil-borne Phytophthora and root rot.',
      'Staking with bamboo sticks or twine keeps foliage off the soil and cuts disease incidence by 40%.',
      'Blossom-end rot is caused by calcium deficiency aggravated by erratic watering—maintain consistent moisture.',
      'Prune lower sucker leaves up to 20 cm above soil line to maximize airflow.',
    ],
    fullGuide: `
### Nursery & Transplanting
Tomato seeds should be sown on raised nursery beds or 98-cell pro-trays filled with sterile cocopeat. Transplant after 25-30 days when seedlings are 10-15 cm tall with 4-5 true leaves.

### Trellising and Staking
Indeterminate tomato varieties require bamboo stakes or wire trellising within 20 days of transplanting. Staking prevents fruits and lower leaves from touching damp soil, which is the primary route for fungal spores (Alternaria, Septoria).

### Calcium & Blossom-End Rot Prevention
Blossom-end rot shows up as dark, sunken, leathery spots at the bottom of ripening tomatoes. It is caused by poor calcium translocation during rapid cell expansion. 
- Never allow soil to alternate between bone dry and waterlogged.
- Apply gypsum or agricultural lime during land prep if soil test shows low calcium.

### Scouting for Blight
Scout leaves weekly:
- Early Blight: Brown concentric ring "target spots" starting on bottom leaves.
- Late Blight: Water-soaked dark brown greasy lesions with white mold on underside in cool damp weather.
Remove affected bottom leaves immediately and dispose far from the field.
    `,
    safetyNote: 'Do not work in tomato fields when foliage is wet from morning dew or rain, as bacteria spread rapidly through water droplets.',
    tags: ['tomato', 'staking', 'blossom end rot', 'blight', 'vegetables'],
  },
  {
    id: 'crop-care-wheat',
    title: 'Wheat: Critical Irrigation Stages & Rust Management',
    category: 'crop-care',
    crops: ['Wheat'],
    summary: 'Crown root initiation, optimal sowing dates, zero-till practices, and stripe/leaf rust protection.',
    keyPoints: [
      'Optimal sowing window: First fortnight of November (1st to 15th Nov in northern plains).',
      'Crown Root Initiation (CRI) at 21 days after sowing is the single most critical irrigation stage.',
      'Yellow/Stripe Rust: Monitor for bright yellow powdery pustules arranged in linear stripes on leaf blades.',
      'Balanced fertilizer: 120 kg N, 60 kg P2O5, 40 kg K2O per hectare with split nitrogen.',
    ],
    fullGuide: `
### Sowing & Seed Treatment
Seed rate: 100 kg/ha for timely sown irrigated wheat; 125 kg/ha for late sown conditions.
Treat seeds with Azotobacter and PSB biofertilizers (200g each per 10kg seed) to enhance nitrogen fixation and phosphorus solubilization.

### 5 Critical Irrigation Stages
1. Crown Root Initiation (CRI): 20-25 days after sowing (DO NOT MISS).
2. Tillering stage: 40-45 days after sowing.
3. Late jointing: 60-65 days after sowing.
4. Flowering: 80-85 days after sowing.
5. Milking/Dough stage: 100-105 days after sowing.

### Rust Management
Stripe rust (Puccinia striiformis) thrives in cool humid winds. Scout field borders facing prevailing winds. If localized spots appear, notify agricultural extension immediately and avoid excess nitrogen fertilization which makes foliage succulent and prone to attack.
    `,
    safetyNote: 'Delayed sowing after Nov 25 cuts grain yield by 35-40 kg per hectare per day due to terminal heat stress at grain filling.',
    tags: ['wheat', 'CRI', 'rust', 'irrigation', 'rabi'],
  },
  {
    id: 'crop-care-cotton',
    title: 'Cotton: Bollworm Management & Canopy Architecture',
    category: 'crop-care',
    crops: ['Cotton'],
    summary: 'Square formation care, sucking pest control, pink bollworm monitoring with pheromone traps.',
    keyPoints: [
      'Square initiation (35-45 DAS) is critical: avoid water stress or waterlogging.',
      'Install 5 pheromone traps per hectare at 45 DAS to monitor pink bollworm moth flights.',
      'Use border crops: Sow 2 rows of maize, sorghum, or castor around cotton field to trap sucking pests.',
      'Avoid synthetic pyrethroid sprays early in season to preserve beneficial predatory insects.',
    ],
    fullGuide: `
### Soil Preparation & Sowing
Cotton requires deep, well-drained black clay soils or fertile alluvial loams. Sow seeds at 90 cm x 60 cm (hybrids) or 60 cm x 15 cm (high-density).

### Sucking Pest Management
During the first 60 days, cotton is susceptible to aphids, jassids, thrips, and whiteflies.
- Intercrop with cowpea or green gram to boost ladybird beetles and lacewing predators.
- Spray 5% Neem Kernel Aqueous Extract (NSKE) at the first sighting of leaf hopper nymphs.
- Erect yellow sticky traps (10 traps/acre) for whiteflies and aphids.

### Pink Bollworm Integrated Strategy
- Hang pheromone traps at canopy height. If catches exceed 8 moths/trap/day for 3 consecutive days, ETL is reached.
- Manually collect and destroy rosetted flowers (which harbor young larvae).
- Terminate the crop by late January; avoid ratoon cotton which carries over pupae into the next season.
    `,
    safetyNote: 'Always observe the recommended pre-harvest interval (PHI) and do not spray unapproved insecticide mixtures.',
    tags: ['cotton', 'bollworm', 'whitefly', 'pheromones', 'cash crops'],
  },
  {
    id: 'crop-care-maize',
    title: 'Maize: Fall Armyworm Scouting & Fertilizer Schedule',
    category: 'crop-care',
    crops: ['Maize', 'Corn'],
    summary: 'Early detection of Spodoptera frugiperda in leaf whorls, high-yield plant populations, and split nitrogen.',
    keyPoints: [
      'Scout the central whorl of maize seedlings weekly from 10 to 40 days after emergence.',
      'Window-pane leaf feeding with sawdust-like frass indicates Fall Armyworm (FAW) presence.',
      'Apply dry fine sand mixed with wood ash (9:1 ratio) into the whorl to choke young caterpillars naturally.',
      'Split nitrogen into 3 doses: 1/3 at sowing, 1/3 at knee-high stage (30 DAS), 1/3 at tasseling.',
    ],
    fullGuide: `
### Crop Establishment
Maintain plant population of 65,000 to 70,000 plants/ha (spacing 60 cm x 20 cm). Sow seeds at 4-5 cm depth. Ensure adequate moisture at sowing for uniform germination.

### Fall Armyworm (FAW) Protocol
- Pheromone traps: 4 traps/acre for adult monitoring.
- Cultural method: Hand-pick egg masses (covered in cream-colored scales) and destroy them.
- Biological: Spray Bacillus thuringiensis (Bt) kurstaki @ 2g/liter or Metarhizium anisopliae @ 5g/liter in the late afternoon.
- Physical whorl drop: Dropping a pinch of dry fine river sand into the whorl lacerates the caterpillars cuticle.

### Water & Fertilizer
Maize cannot tolerate water stagnation even for 24 hours. Ensure drainage channels. Tasseling and silking are the most water-sensitive stages; moisture stress at pollination causes incomplete kernel set.
    `,
    safetyNote: 'Never allow standing water in maize fields; waterlogging leads to stalk rot and severe yellowing.',
    tags: ['maize', 'corn', 'fall armyworm', 'tasseling', 'coarse grains'],
  },

  // --- 2. Soil Preparation & Health ---
  {
    id: 'soil-health-prep',
    title: 'Soil Health: Organic Matter, pH Correction & Soil Structure',
    category: 'soil',
    crops: ['All Crops', 'Vegetables', 'Grains'],
    summary: 'Techniques to build living topsoil, test pH in the field, use green manuring, and restore degraded land.',
    keyPoints: [
      'Healthy soil needs at least 0.75% to 1.0% Organic Carbon for optimal nutrient cycling.',
      'Soil pH range 6.5 to 7.5 provides the highest availability of essential plant nutrients.',
      'Green manuring: Grow Sunnhemp (Crotalaria juncea) or Dhaincha (Sesbania aculeata) for 45 days and plough under.',
      'Avoid deep summer ploughing if soil is excessively dry, to prevent erosion of topsoil.',
    ],
    fullGuide: `
### Diagnosing Soil Health
Good soil should be crumbly, smell fresh and earthy (geosmin), have visible earthworm burrows, and absorb water without capping or surface pooling.

### Soil pH & Correction
- Acidic Soils (pH < 6.0): Essential nutrients like phosphorus, calcium, and magnesium become locked up; aluminum toxicity increases. Apply agricultural limestone (calcium carbonate) or dolomite according to soil test recommendations.
- Alkaline / Sodic Soils (pH > 8.0): Micronutrients (Zinc, Iron, Manganese) become insoluble. Apply agricultural gypsum (calcium sulphate) accompanied by deep leaching with fresh water. Add organic compost to buffer pH.

### Green Manuring Step-by-Step
1. Sow Dhaincha or Sunhemp with the pre-monsoon rains at 40-50 kg seed per hectare.
2. Allow crop to grow for 45 to 50 days until early flowering stage when succulent biomass is highest.
3. Incorporate the green biomass into the soil with a disc plough.
4. Keep the soil moist for 10-14 days to allow microorganisms to decompose the green matter, releasing 60-80 kg organic nitrogen per hectare.
    `,
    safetyNote: 'Do not apply uncomposted, fresh raw animal dung directly to crops; heat generated during raw decomposition burns tender roots and introduces weed seeds.',
    tags: ['soil', 'organic matter', 'pH', 'green manure', 'gypsum', 'compost'],
  },

  // --- 3. Irrigation & Water Management ---
  {
    id: 'irrigation-management',
    title: 'Smart Irrigation: Critical Stages, Drip Systems & Moisture Sensing',
    category: 'irrigation',
    crops: ['Paddy', 'Wheat', 'Tomato', 'Cotton', 'Vegetables'],
    summary: 'How to save water with drip irrigation, perform the hand-feel soil test, and schedule watering by crop growth stage.',
    keyPoints: [
      'The "Hand-Feel Test": Squeeze a handful of soil from 15 cm depth. If it forms a ball that crumbles under gentle pressure, moisture is optimal.',
      'Drip irrigation reduces weed proliferation by only wetting the crop root zone.',
      'Always irrigate during early morning or late afternoon to minimize evaporation losses.',
      'Mulching with dry crop residue (straw, husk) reduces surface evaporation by up to 50%.',
    ],
    fullGuide: `
### Critical Moisture Windows
Plants are not equally sensitive to water shortages throughout their lifecycle. Moisture stress during reproductive phases causes irreversible yield penalties:
- Cereals: Boot leaf, flowering, and milk stages.
- Pulses: Branching and pod initiation.
- Vegetables: Fruit set and fruit enlargement.

### Drip System Maintenance
1. Filter flushing: Clean screen and disc filters weekly to prevent emitter clogging.
2. Acid treatment: Flush lines annually with dilute acid if hard water causes calcium carbonate encrustation.
3. Pressure gauge check: Maintain 1.0 to 1.5 kg/cm2 pressure at the field manifold.

### The Hand-Feel Moisture Matrix
- Dry: Soil feels powdery or hard clods; cannot form a ball -> Irrigate immediately.
- 50% Moisture: Soil forms a ball under pressure, but leaves no water on palm; cracks slightly when pressed -> Ready for irrigation.
- Optimal (75-80%): Soil forms a durable, pliable ball; leaves slight moisture film on fingers -> No irrigation needed.
- Waterlogged: Free water oozes out when ball is squeezed -> Stop irrigation, clear drainage channels.
    `,
    safetyNote: 'Overwatering kills roots by displacing oxygen, leading to root rot (Pythium/Fusarium) and false symptoms of nitrogen deficiency.',
    tags: ['irrigation', 'drip', 'water saving', 'critical stages', 'mulching'],
  },

  // --- 4. Common Crop Symptoms Matrix ---
  {
    id: 'symptoms-matrix',
    title: 'Visual Diagnostic Matrix: Deciphering Leaf Symptoms',
    category: 'symptoms',
    crops: ['All Crops'],
    summary: 'A field guide to distinguishing between nutrient deficiencies, fungal spots, virus symptoms, and pest injury.',
    keyPoints: [
      'Older bottom leaves yellowing first: Indicates mobile nutrient deficiency (Nitrogen, Potassium, Magnesium).',
      'Young top leaves yellowing first: Indicates immobile nutrient deficiency (Iron, Zinc, Calcium, Sulphur).',
      'Concentric target-board rings on spots: Hallmarks of fungal blights (Alternaria).',
      'Mosaic pattern of light and dark green with leaf puckering: Sign of viral infection spread by sucking insects.',
    ],
    fullGuide: `
### How to Diagnose Leaf Symptoms
Before concluding a crop has a disease, examine where on the plant the problem began:

| Symptom Appearance | Likely Location | Probable Cause | Action |
| :--- | :--- | :--- | :--- |
| Uniform pale yellowing, starting from bottom leaves moving upward | Lower / Older leaves | Nitrogen Deficiency | Apply balanced compost or split urea in moist soil |
| Yellowing between leaf veins; veins stay dark green | Lower leaves | Magnesium Deficiency | Apply Magnesium Sulphate (0.5% spray) |
| Interveinal bleaching/yellowing of newest top growth | New / Upper leaves | Iron Deficiency (common in alkaline soils) | Foliar spray with Ferrous Sulphate + citric acid |
| Yellowing with V-shaped necrotic tip burning | Lower leaf margins | Potassium Deficiency | Soil application of Muriate of Potash (MOP) |
| Dark brown / black spots with yellow halo and concentric circles | Lower & middle leaves | Fungal Blight (Alternaria / Cercospora) | Improve air circulation, remove lower leaves, spray organic copper or bio-fungicide |
| Leaf margin scorching, upward cupping | Tender shoots | Thrips or Broad Mites | Inspect leaf undersides with a hand lens |
| Wrinkling, shoe-stringing, yellow vein clearing | Whole plant / shoots | Viral Infection | Uproot and burn diseased plants; control vector (whitefly/aphid) |
    `,
    safetyNote: 'Never apply chemical treatments without first checking whether the root zone is waterlogged or damaged by soil insects (termites or white grubs).',
    tags: ['symptoms', 'diagnosis', 'yellowing', 'deficiency', 'blight', 'matrix'],
  },

  // --- 5. Pest Prevention & Integrated Pest Management ---
  {
    id: 'pest-prevention-ipm',
    title: 'Integrated Pest Management (IPM): Natural & Low-Risk Defenses',
    category: 'pests',
    crops: ['All Crops', 'Cotton', 'Vegetables', 'Pulses'],
    summary: 'Physical traps, botanical sprays (neem extract recipe), trap crops, and preserving natural predator insects.',
    keyPoints: [
      'IPM pyramid: Cultural control at base, mechanical/physical second, biological third, chemical as last resort.',
      'Neem Kernel Aqueous Extract (NSKE 5%): Safe, natural repellent that prevents insect feeding without killing honeybees.',
      'Yellow sticky traps attract whiteflies and aphids; blue traps attract thrips.',
      'Marigold as a trap crop: Attracts Helicoverpa caterpillars away from tomatoes and cotton, while suppressing root-knot nematodes.',
    ],
    fullGuide: `
### Recipe: Home-Made NSKE 5% (Neem Seed Kernel Extract)
1. Collect 5 kg of clean, dried neem seed kernels.
2. Pound the kernels gently into a coarse powder (do not make fine flour).
3. Tie the powder into a porous muslin or cotton cloth pouch.
4. Soak the pouch in 10 liters of clean water overnight.
5. In the morning, squeeze the pouch repeatedly until the water turns milky brown.
6. Add 100 grams of dissolved soap flakes or liquid detergent (acts as surfactant/sticker).
7. Dilute this extract to 100 liters of water. Spray thoroughly on crop foliage, particularly on leaf undersides.

### Mechanical & Physical Traps
- Yellow Sticky Sheets: Install 15-20 traps per acre at crop canopy level. Coat sheets with castor oil or sticky glue.
- Pheromone Traps: Essential for monitoring moths of Fruit borer, Pink bollworm, and Spodoptera.
- Light Traps: Install 1 solar light trap per 2 acres to catch night-flying adult moths and beetles.

### Encouraging Predator Allies
- Ladybird Beetles: Both larvae and adults consume 50-60 aphids per day.
- Spiders: Web and hunting spiders feed on leaf hoppers, moths, and caterpillars.
- Avoid spraying synthetic broad-spectrum insecticides which kill 95% of natural predator allies.
    `,
    safetyNote: 'Always spray botanical extracts in late evening after 4:30 PM when honeybees and pollinators have returned to their hives.',
    tags: ['ipm', 'neem', 'nske', 'sticky traps', 'biological control', 'predators'],
  },

  // --- 6. Nutrient Deficiency Guide ---
  {
    id: 'nutrient-deficiencies',
    title: 'Plant Nutrition Guide: Macro & Micronutrient Essentials',
    category: 'nutrients',
    crops: ['All Crops'],
    summary: 'Visual identification of Nitrogen, Phosphorus, Potassium, Zinc, Boron, and Iron deficiencies and corrections.',
    keyPoints: [
      'Nitrogen (N): Essential for green vegetative foliage. Deficiency causes pale yellowing from older leaves up.',
      'Phosphorus (P): Needed for root development and energy transfer. Deficiency causes dark purple or bronze stems and leaves.',
      'Potassium (K): Regulates stomata and disease resistance. Deficiency causes edge scorch and weak lodging stems.',
      'Zinc (Zn): Most common micronutrient deficiency in alkaline soils. Causes "khaira" rusty spots and bleached bands.',
    ],
    fullGuide: `
### Primary Macronutrients (N-P-K)
- **Nitrogen**: Mobile. Symptoms appear on oldest leaves. Leaves turn pale green, then yellow from the tip along the midrib in a V-pattern.
  - *Correction*: Top-dress with balanced compost, vermicompost, or split urea in damp soil.
- **Phosphorus**: Mobile. Poor root growth, stunted slender stems. Leaves become abnormally dark green, with dull purple or reddish pigment along stems and veins.
  - *Correction*: Apply Single Super Phosphate (SSP) or rock phosphate at basal land prep; foliar spray of DAP (2%).
- **Potassium**: Mobile. Margins and tips of older leaves turn yellow, then brown and dry as if scorched by fire. Weak lodging stalks.
  - *Correction*: Apply Muriate of Potash (MOP) or wood ash rich in potash.

### Critical Micronutrients
- **Zinc Deficiency**:
  - Very common in rice (Khaira disease), maize, and citrus in calcareous soils.
  - White or bleached bands on either side of the midrib in young leaves; rusty bronzed spotting.
  - *Correction*: Foliar spray of 0.5% Zinc Sulphate (5g/L) neutralized with 0.25% slaked lime.
- **Boron Deficiency**:
  - Brittle stems, hollow stems in cauliflower, cracked fruits in tomato, poor grain filling.
  - *Correction*: Soil application of Borax (10 kg/ha) or foliar spray of 0.1% Solubor at pre-flowering.
    `,
    safetyNote: 'Never mix zinc sulphate directly with phosphorus fertilizers (DAP/SSP) in the same tank; they react to form insoluble zinc phosphate precipitates.',
    tags: ['nutrients', 'nitrogen', 'phosphorus', 'potassium', 'zinc', 'boron', 'fertilizer'],
  },

  // --- 7. Safe Fertilizer Practices ---
  {
    id: 'safe-fertilizer-practices',
    title: 'Safe Fertilizer Practices: Application Timing & Storage',
    category: 'fertilizer',
    crops: ['All Crops'],
    summary: 'The 4R Nutrient Stewardship framework: Right Source, Right Rate, Right Time, and Right Place.',
    keyPoints: [
      'The 4R Framework ensures high fertilizer efficiency and avoids nutrient loss into groundwater.',
      'Never broadcast urea onto dry soil or standing water on sunny afternoons to prevent ammonia volatilization.',
      'Neem-coated urea slows nitrogen release and improves nutrient recovery by 15-20%.',
      'Store fertilizers on raised wooden pallets in a dry, ventilated shed away from livestock and drinking water wells.',
    ],
    fullGuide: `
### The 4R Nutrient Stewardship
1. **Right Source**: Match fertilizer type to soil test properties (e.g., avoid ammonium sulphate in already acidic soils; use SSP which also provides calcium and sulphur).
2. **Right Rate**: Calculate dosage based on soil fertility tests rather than guesswork. Excess nitrogen attracts insect pests and makes plants prone to fungal blights.
3. **Right Time**: Split nitrogen application across growth phases (basal, tillering, flowering) instead of one large single dump.
4. **Right Place**: Place fertilizer 5-7 cm below and beside the seed row (deep placement) rather than spreading on the surface.

### Safety & Health Protocols for Farmers
- Wear cotton masks or clean cloths over mouth and nose when handling powdered fertilizers or mixing chemicals.
- Wash hands thoroughly with soap and water after handling fertilizers before eating, drinking, or touching face.
- Never reuse empty fertilizer sacks as cattle feed storage or domestic food containers without thorough decontamination.
    `,
    safetyNote: 'Excessive chemical fertilizer salts harden the soil, destroy beneficial mycorrhizal fungi, and kill earthworms.',
    tags: ['fertilizer', 'safety', '4R', 'neem coated urea', 'storage', 'application'],
  },

  // --- 8. Seasonal Farming Checklists ---
  {
    id: 'seasonal-checklists',
    title: 'Seasonal Agricultural Checklists: Kharif, Rabi & Zaid',
    category: 'seasonal',
    crops: ['Paddy', 'Cotton', 'Wheat', 'Mustard', 'Vegetables', 'Pulses'],
    summary: 'Month-by-month planning, land prep, pre-monsoon seed treatment, and storage hygiene.',
    keyPoints: [
      'Kharif (Monsoon Season, June-Oct): Paddy, Cotton, Maize, Soyabean, Groundnut.',
      'Rabi (Winter Season, Oct-March): Wheat, Mustard, Gram/Chickpea, Potato, Barley.',
      'Zaid (Summer Season, March-June): Watermelon, Cucumber, Bitter gourd, Moong bean, Fodder crops.',
      'Clean and dry storage bins (Pusa bins / metallic drums) before storing harvested grains.',
    ],
    fullGuide: `
### Kharif Pre-Season Checklist (May - June)
- [ ] Deep summer ploughing to expose hibernating insect pupae and weed rhizomes to scorching sun.
- [ ] Clean and deepen field drainage channels before the onset of monsoon rains.
- [ ] Procure certified seeds from government seed corporations or trusted cooperatives.
- [ ] Perform germination percentage test on a sample of 100 seeds in moist cloth.
- [ ] Treat seeds with biofertilizers (Rhizobium for pulses, Azotobacter for cereals).

### Rabi Season Checklist (October - November)
- [ ] Test soil after harvesting Kharif crops to plan balanced basal NPK application.
- [ ] Ensure timely sowing of wheat by November 15 to escape high summer temperatures at grain filling.
- [ ] Treat gram/chickpea seeds with Trichoderma viride to protect against Fusarium wilt.
- [ ] Install bird perches in pulse fields to facilitate insectivorous birds feeding on pod borer larvae.

### Post-Harvest Grain Storage Hygiene
- Dry grains to below 10-12% moisture content before bagging to prevent Aspergillus fungus and aflatoxin contamination.
- Clean storage godowns; seal cracks with mud or cement.
- Place dried neem leaves or pongamia leaves inside grain bins as natural pest deterrents.
    `,
    safetyNote: 'Never store grains in damp basements or directly against cold concrete walls where condensation triggers mold growth.',
    tags: ['seasonal', 'kharif', 'rabi', 'zaid', 'checklist', 'storage'],
  },

  // --- 9. Photo Guide for Crop Diagnosis ---
  {
    id: 'photo-guide-diagnosis',
    title: 'How to Take Clear Crop Photos for Accurate AI Diagnosis',
    category: 'photo-guide',
    crops: ['All Crops'],
    summary: '5 golden rules for taking clear, well-lit crop photos that help AI models and agronomists diagnose problems accurately.',
    keyPoints: [
      'Rule 1: Natural daylight is best. Avoid harsh glare or deep shadows.',
      'Rule 2: Capture both the diseased part AND the transition zone to healthy green tissue.',
      'Rule 3: Photograph the underside of the leaf where spider mites, thrips, and fungal spores hide.',
      'Rule 4: Keep camera 15-25 cm away and tap the screen to ensure sharp focus on the symptom.',
      'Rule 5: Take a second context photo showing the entire plant and whole row.',
    ],
    fullGuide: `
### Why Photo Quality Dictates Diagnostic Accuracy
Both local AI vision models and human agricultural scientists rely on visual cues: leaf venation, spore pustule texture, lesion borders (water-soaked, chlorotic halo, necrotic center), and insect traces. A blurry or dark photo makes accurate identification impossible.

### 5 Golden Photographing Rules
1. **Lighting**: Photograph in the morning or late afternoon when light is soft and even. If sun is too bright, shade the leaf with your hand or body to prevent bleached highlights.
2. **The Transition Zone**: Focus on the edge between healthy green tissue and the diseased spot. The pathogen is most active at this growing margin.
3. **Turn the Leaf Over**: 80% of sucking pests (aphids, thrips, mites) and fungal fruiting bodies (downy mildew, rust pustules) reside on the underside of the leaf blade.
4. **Sharp Focus & Stillness**: Hold the leaf stem gently with one hand to stop it waving in the wind. Hold phone steady with the other. Tap the diseased spot on your screen to lock focus.
5. **Context Picture**: Take one close-up of the symptom, and a second photo showing the whole plant or field row. This shows whether the issue is isolated or affecting the whole field.
    `,
    safetyNote: 'Wash hands after handling leaves infected with viral mosaics or bacterial canker so you do not spread pathogens to adjacent healthy plants.',
    tags: ['photo guide', 'camera', 'diagnosis', 'leaf photography', 'ai tips'],
  },
];
