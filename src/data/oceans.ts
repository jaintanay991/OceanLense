export interface SeaData {
  id: string;
  name: string;
  description: string;
  coordinates: [number, number];
  area: string;
}

export interface OceanData {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  geographicExtent: string;
  area: string;
  averageDepth: string;
  maximumDepth: string;
  surroundingContinents: string[];
  majorSeas: SeaData[];
  majorCurrents: string[];
  climate: string;
  ecosystem: string;
  scientificImportance: string;
  highlights: string[];
  coordinates: [number, number]; // lat, lon
  bounds: [number, number, number, number]; // minLat, maxLat, minLon, maxLon
}

export const OCEANS: Record<string, OceanData> = {
  pacific: {
    id: 'pacific',
    name: 'Pacific Ocean',
    subtitle: 'The Largest and Deepest Ocean',
    description: 'The Pacific Ocean is the largest and deepest of Earth\'s oceanic divisions. It extends from the Arctic Ocean in the north to the Southern Ocean in the south and is bounded by the continents of Asia and Australia in the west and the Americas in the east.',
    geographicExtent: 'From the Arctic to the Southern Ocean',
    area: '165.25 million km²',
    averageDepth: '4,000 meters',
    maximumDepth: '10,928 meters (Mariana Trench)',
    surroundingContinents: ['Asia', 'Australia', 'North America', 'South America'],
    majorCurrents: ['Kuroshio Current', 'California Current', 'Equatorial Currents', 'East Australian Current'],
    climate: 'Highly varied, driving major global climate patterns such as the El Niño-Southern Oscillation (ENSO).',
    ecosystem: 'Incredibly diverse, featuring extensive coral reefs, pelagic zones, and deep-sea trench communities.',
    scientificImportance: 'Central to understanding global heat distribution, tectonic activity (Ring of Fire), and major climate cycles.',
    highlights: ['Pacific Ring of Fire', 'Great Barrier Reef', 'Mariana Trench', 'ENSO Climate Cycle'],
    coordinates: [0, -150],
    bounds: [-60, 60, 110, -70], // Approx bounds; handled via custom logic for crossing antimeridian
    majorSeas: [
      { id: 'bering', name: 'Bering Sea', description: 'A marginal sea of the Pacific Ocean separating Russia and Alaska.', coordinates: [58, -178], area: '2.0 million km²' },
      { id: 'south_china', name: 'South China Sea', description: 'A marginal sea bounded by Southeast Asia.', coordinates: [12, 114], area: '3.5 million km²' },
      { id: 'coral', name: 'Coral Sea', description: 'A marginal sea off the northeast coast of Australia.', coordinates: [-18, 150], area: '4.79 million km²' },
      { id: 'tasman', name: 'Tasman Sea', description: 'Situated between Australia and New Zealand.', coordinates: [-40, 160], area: '2.3 million km²' },
      { id: 'philippine', name: 'Philippine Sea', description: 'A marginal sea east and north of the Philippines.', coordinates: [20, 130], area: '5.0 million km²' }
    ]
  },
  atlantic: {
    id: 'atlantic',
    name: 'Atlantic Ocean',
    subtitle: 'The S-Shaped Ocean Basin',
    description: 'The Atlantic Ocean is the second-largest of the world\'s oceans. It separates the "Old World" from the "New World" and features the Mid-Atlantic Ridge running down its center.',
    geographicExtent: 'From the Arctic Ocean to the Southern Ocean',
    area: '106.46 million km²',
    averageDepth: '3,646 meters',
    maximumDepth: '8,376 meters (Puerto Rico Trench)',
    surroundingContinents: ['Europe', 'Africa', 'North America', 'South America'],
    majorCurrents: ['Gulf Stream', 'North Atlantic Drift', 'Canary Current', 'Brazil Current'],
    climate: 'Plays a critical role in the Atlantic Meridional Overturning Circulation (AMOC) which regulates the climate of North America and Europe.',
    ecosystem: 'Rich fishing grounds, expansive Sargasso Sea, and complex coastal estuaries.',
    scientificImportance: 'Key region for studying thermohaline circulation and historical ocean floor spreading.',
    highlights: ['Mid-Atlantic Ridge', 'Gulf Stream', 'Sargasso Sea', 'AMOC'],
    coordinates: [10, -30],
    bounds: [-60, 60, -90, 20],
    majorSeas: [
      { id: 'caribbean', name: 'Caribbean Sea', description: 'A tropical sea bounded by Central and South America.', coordinates: [15, -75], area: '2.75 million km²' },
      { id: 'mediterranean', name: 'Mediterranean Sea', description: 'An almost completely enclosed sea between Europe, Africa, and Asia.', coordinates: [35, 18], area: '2.5 million km²' },
      { id: 'north_sea', name: 'North Sea', description: 'A marginal sea located between Great Britain and northwestern Europe.', coordinates: [56, 3], area: '0.57 million km²' },
      { id: 'baltic', name: 'Baltic Sea', description: 'An arm of the Atlantic Ocean, enclosed by Scandinavia and mainland Europe.', coordinates: [58, 20], area: '0.37 million km²' },
      { id: 'labrador', name: 'Labrador Sea', description: 'An arm of the North Atlantic Ocean between the Labrador Peninsula and Greenland.', coordinates: [60, -55], area: '0.84 million km²' }
    ]
  },
  indian: {
    id: 'indian',
    name: 'Indian Ocean',
    subtitle: 'The Warmest Ocean',
    description: 'The Indian Ocean is the third-largest of the world\'s oceanic divisions, bounded by Asia to the north, Africa to the west, and Australia to the east.',
    geographicExtent: 'From South Asia to the Southern Ocean',
    area: '70.56 million km²',
    averageDepth: '3,741 meters',
    maximumDepth: '7,258 meters (Sunda Trench)',
    surroundingContinents: ['Asia', 'Africa', 'Australia'],
    majorCurrents: ['Agulhas Current', 'Somali Current', 'Leeuwin Current'],
    climate: 'Dominated by the monsoon wind system, which causes seasonal reversal of surface currents.',
    ecosystem: 'Contains some of the most extensive mangrove forests and biologically productive coastal zones.',
    scientificImportance: 'Crucial for understanding monsoon dynamics and their impact on billions of people.',
    highlights: ['Monsoon Circulation', 'Sunda Trench', 'Maldives Ridge', 'Chagos-Laccadive Plateau'],
    coordinates: [-20, 80],
    bounds: [-60, 25, 30, 115],
    majorSeas: [
      { id: 'arabian', name: 'Arabian Sea', description: 'A region of the northern Indian Ocean bounded by India, Pakistan, and the Arabian Peninsula.', coordinates: [15, 65], area: '3.86 million km²' },
      { id: 'bay_of_bengal', name: 'Bay of Bengal', description: 'The northeastern part of the Indian Ocean, bordered by India and Southeast Asia.', coordinates: [15, 88], area: '2.17 million km²' },
      { id: 'red_sea', name: 'Red Sea', description: 'A seawater inlet of the Indian Ocean, lying between Africa and Asia.', coordinates: [22, 38], area: '0.43 million km²' },
      { id: 'andaman', name: 'Andaman Sea', description: 'A marginal sea of the eastern Indian Ocean.', coordinates: [10, 96], area: '0.79 million km²' }
    ]
  },
  southern: {
    id: 'southern',
    name: 'Southern Ocean',
    subtitle: 'The Circumpolar Ocean',
    description: 'The Southern Ocean comprises the southernmost waters of the World Ocean, generally taken to be south of 60° S latitude and encircling Antarctica.',
    geographicExtent: 'South of 60°S latitude',
    area: '20.32 million km²',
    averageDepth: '3,270 meters',
    maximumDepth: '7,434 meters (South Sandwich Trench)',
    surroundingContinents: ['Antarctica'],
    majorCurrents: ['Antarctic Circumpolar Current', 'Weddell Gyre'],
    climate: 'Extremely cold and windy, featuring the largest wind-driven ocean current on Earth.',
    ecosystem: 'Supports unique marine life including krill, penguins, and whales adapted to extreme cold.',
    scientificImportance: 'The primary connector of the world\'s oceans and a major driver of global carbon and heat uptake.',
    highlights: ['Antarctic Circumpolar Current', 'Sea Ice Extent', 'Deep Water Formation'],
    coordinates: [-65, 0],
    bounds: [-90, -60, -180, 180],
    majorSeas: [
      { id: 'weddell', name: 'Weddell Sea', description: 'Contains the Weddell Gyre, known for deep water formation.', coordinates: [-73, -45], area: '2.8 million km²' },
      { id: 'ross', name: 'Ross Sea', description: 'A deep bay of the Southern Ocean in Antarctica.', coordinates: [-75, -175], area: '0.95 million km²' },
      { id: 'amundsen', name: 'Amundsen Sea', description: 'An arm of the Southern Ocean off Marie Byrd Land.', coordinates: [-73, -112], area: '0.098 million km²' },
      { id: 'bellingshausen', name: 'Bellingshausen Sea', description: 'Located along the west side of the Antarctic Peninsula.', coordinates: [-71, -85], area: '0.48 million km²' }
    ]
  },
  arctic: {
    id: 'arctic',
    name: 'Arctic Ocean',
    subtitle: 'The Polar Basin',
    description: 'The Arctic Ocean is the smallest and shallowest of the world\'s five major oceans. It is recognized as the coldest of all the oceans and is partially covered by sea ice throughout the year.',
    geographicExtent: 'North polar region',
    area: '14.05 million km²',
    averageDepth: '1,038 meters',
    maximumDepth: '5,450 meters (Molloy Deep)',
    surroundingContinents: ['Eurasia', 'North America'],
    majorCurrents: ['Transpolar Drift Stream', 'Beaufort Gyre'],
    climate: 'Polar climate characterized by persistent cold and relatively narrow annual temperature ranges.',
    ecosystem: 'Fragile ecosystems relying on sea ice, supporting polar bears, walruses, and specialized microorganisms.',
    scientificImportance: 'Highly sensitive to climate change; acts as an early warning system for global warming (Arctic Amplification).',
    highlights: ['Permanent Sea Ice', 'Lomonosov Ridge', 'North Pole'],
    coordinates: [85, 0],
    bounds: [65, 90, -180, 180],
    majorSeas: [
      { id: 'beaufort', name: 'Beaufort Sea', description: 'A marginal sea located north of the Northwest Territories, the Yukon, and Alaska.', coordinates: [72, -137], area: '0.47 million km²' },
      { id: 'chukchi', name: 'Chukchi Sea', description: 'A marginal sea situated between the Chukchi Peninsula and northwest Alaska.', coordinates: [69, -166], area: '0.62 million km²' },
      { id: 'laptev', name: 'Laptev Sea', description: 'A marginal sea of the Arctic Ocean, located north of Siberia.', coordinates: [76, 125], area: '0.70 million km²' },
      { id: 'kara', name: 'Kara Sea', description: 'Part of the Arctic Ocean north of Siberia.', coordinates: [74, 71], area: '0.88 million km²' },
      { id: 'barents', name: 'Barents Sea', description: 'A marginal sea located off the northern coasts of Norway and Russia.', coordinates: [75, 40], area: '1.40 million km²' },
      { id: 'east_siberian', name: 'East Siberian Sea', description: 'A marginal sea in the Arctic Ocean.', coordinates: [72, 163], area: '0.98 million km²' }
    ]
  }
};
