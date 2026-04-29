// src/data/cities.js

/**
 * Popular travel destinations in India
 * Organized for better suggestions and filtering
 */

// All popular Indian cities in one array (no duplicates)
export const popularIndianCities = [
  // Northern India - Himalayas & Plains
  'Manali',
  'Shimla',
  'Dharamshala',
  'McLeod Ganj',
  'Mussoorie',
  'Nainital',
  'Rishikesh',
  'Haridwar',
  'Varanasi',
  'Agra',
  'Jaipur',
  'Udaipur',
  'Jodhpur',
  'Jaisalmer',
  'Pushkar',
  'Amritsar',
  'Chandigarh',
  'Leh',
  'Ladakh',
  'Srinagar',
  'Gulmarg',
  'Pahalgam',
  'Katra',
  'Patnitop',

  // Southern India - Beaches, Hills & Backwaters
  'Bangalore',
  'Mysore',
  'Coorg',
  'Ooty',
  'Munnar',
  'Kochi',
  'Alleppey',
  'Kumarakom',
  'Thekkady',
  'Wayanad',
  'Kodaikanal',
  'Chennai',
  'Pondicherry',
  'Mahabalipuram',
  'Hampi',
  'Gokarna',
  'Hyderabad',
  'Visakhapatnam',
  'Tirupati',
  'Kanyakumari',
  'Madurai',
  'Rameswaram',

  // Western India - Goa, Maharashtra, Gujarat
  'Goa',
  'Mumbai',
  'Pune',
  'Mahableshwar',
  'Lonavala',
  'Khandala',
  'Ahmedabad',
  'Surat',
  'Vadodara',
  'Dwarka',
  'Somnath',
  'Saputara',
  'Ajanta',
  'Ellora',

  // Eastern India - West Bengal, Sikkim, Assam
  'Kolkata',
  'Darjeeling',
  'Gangtok',
  'Kalimpong',
  'Shillong',
  'Guwahati',
  'Kaziranga',
  'Puri',
  'Konark',
  'Bhubaneswar',
  'Jamshedpur',
  'Digha',
  'Mandarmani',

  // Central India - Madhya Pradesh, Chhattisgarh
  'Khajuraho',
  'Bhopal',
  'Indore',
  'Gwalior',
  'Orchha',
  'Sanchi',
  'Pachmarhi',
  'Kanha',
  'Bandhavgarh',

  // Union Territories & Islands
  'Delhi',
  'New Delhi',
  'Andaman',
  'Nicobar',
  'Lakshadweep',
  'Diu',
  'Daman',
  'Kavaratti',
  'Port Blair',
  'Havelock',

  // Popular Hill Stations
  'Matheran',
  'Panchgani',
  'Lavasa',
  'Auli',
  'Kasauli',
  'Kullu',
  'Kasol',
  'Tosh',
  'Malana',
  'Bir',
  'Billing',

  // Wildlife & Nature Destinations
  'Corbett',
  'Ranthambore',
  'Bandhavgarh',
  'Kanha',
  'Periyar',
  'Sundarbans',
  'Gir',
  'Kaziranga',
  'Nagarhole',
  'Bandipur',

  // Pilgrimage & Spiritual Sites
  'Tirupati',
  'Shirdi',
  'Ajmer',
  'Vrindavan',
  'Mathura',
  'Badrinath',
  'Kedarnath',
  'Gangotri',
  'Yamunotri',
  'Sarnath',
  'Bodh Gaya',
  'Amarnath',
  'Vaishno Devi',

  // Adventure Destinations
  'Spiti',
  'Zanskar',
  'Chopta',
  'Tungnath',
  'Valley of Flowers',
  'Amarkantak',

  // Beach Destinations
  'Goa',
  'Kovalam',
  'Varkala',
  'Marari',
  'Mahabalipuram',
  'Diu',
  'Gokarna',
  'Murudeshwar',
  'Tarkarli',
]

// Group cities by region/category for better organization
export const citiesByCategory = {
  hillStations: [
    'Manali',
    'Shimla',
    'Munnar',
    'Ooty',
    'Darjeeling',
    'Mussoorie',
    'Nainital',
    'Coorg',
    'Kodaikanal',
    'Mahabaleshwar',
    'Lonavala',
    'Khandala',
    'Auli',
    'Kasauli',
    'Kullu',
  ],

  beaches: [
    'Goa',
    'Kovalam',
    'Varkala',
    'Gokarna',
    'Pondicherry',
    'Andaman',
    'Diu',
    'Mahabalipuram',
    'Murudeshwar',
    'Tarkarli',
    'Digha',
    'Mandarmani',
  ],

  spiritual: [
    'Varanasi',
    'Rishikesh',
    'Haridwar',
    'Amritsar',
    'Tirupati',
    'Shirdi',
    'Ajmer',
    'Vrindavan',
    'Mathura',
    'Badrinath',
    'Kedarnath',
    'Gangotri',
    'Yamunotri',
    'Sarnath',
    'Bodh Gaya',
    'Amarnath',
    'Vaishno Devi',
  ],

  adventure: ['Leh', 'Ladakh', 'Rishikesh', 'Manali', 'Kasol', 'Bir', 'Billing', 'Spiti', 'Zanskar', 'Auli', 'Chopta'],

  wildlife: ['Corbett', 'Ranthambore', 'Bandhavgarh', 'Kanha', 'Periyar', 'Sundarbans', 'Kaziranga', 'Gir', 'Nagarhole', 'Bandipur'],

  heritage: ['Agra', 'Jaipur', 'Udaipur', 'Jodhpur', 'Jaisalmer', 'Khajuraho', 'Hampi', 'Mahabalipuram', 'Ajanta', 'Ellora', 'Sanchi', 'Konark'],

  metropolitan: ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad', 'Chandigarh'],
}

// Get unique cities (remove any duplicates)
export const allCities = [...new Set(popularIndianCities)]

/**
 * Get most popular cities for suggestions
 * @param {number} count - Number of cities to return
 * @returns {Array} Array of popular city names
 */
export const getPopularCities = (count = 8) => {
  const mostPopular = [
    'Manali',
    'Goa',
    'Rishikesh',
    'Jaipur',
    'Varanasi',
    'Munnar',
    'Leh',
    'Darjeeling',
    'Kochi',
    'Udaipur',
    'Shimla',
    'Ooty',
    'Agra',
    'Amritsar',
    'Kodaikanal',
    'Andaman',
  ]
  return mostPopular.slice(0, count)
}

/**
 * Search cities by query
 * @param {string} query - Search term
 * @param {number} limit - Maximum results to return
 * @returns {Array} Filtered city names
 */
export const searchCities = (query, limit = 10) => {
  if (!query || query.trim().length < 2) return []

  const searchTerm = query.toLowerCase().trim()
  const results = allCities.filter((city) => city.toLowerCase().includes(searchTerm))

  // Sort by relevance (exact matches first)
  return results
    .sort((a, b) => {
      const aStartsWith = a.toLowerCase().startsWith(searchTerm)
      const bStartsWith = b.toLowerCase().startsWith(searchTerm)
      if (aStartsWith && !bStartsWith) return -1
      if (!aStartsWith && bStartsWith) return 1
      return 0
    })
    .slice(0, limit)
}

/**
 * Get cities by category
 * @param {string} category - Category name
 * @returns {Array} Cities in that category
 */
export const getCitiesByCategory = (category) => {
  return citiesByCategory[category] || []
}

/**
 * Get all categories
 * @returns {Array} All category names
 */
export const getAllCategories = () => {
  return Object.keys(citiesByCategory)
}

/**
 * Get random cities for suggestions
 * @param {number} count - Number of random cities
 * @returns {Array} Random city names
 */
export const getRandomCities = (count = 6) => {
  const shuffled = [...allCities].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

// City metadata (can be expanded later)
export const cityMetadata = {
  Manali: { state: 'Himachal Pradesh', region: 'North', type: 'hillStation' },
  Goa: { state: 'Goa', region: 'West', type: 'beach' },
  Rishikesh: { state: 'Uttarakhand', region: 'North', type: 'spiritual' },
  Jaipur: { state: 'Rajasthan', region: 'North', type: 'heritage' },
  Varanasi: { state: 'Uttar Pradesh', region: 'North', type: 'spiritual' },
  Munnar: { state: 'Kerala', region: 'South', type: 'hillStation' },
  Leh: { state: 'Ladakh', region: 'North', type: 'adventure' },
  Darjeeling: { state: 'West Bengal', region: 'East', type: 'hillStation' },
  // Add more as needed
}

export default {
  allCities,
  popularIndianCities,
  citiesByCategory,
  getPopularCities,
  searchCities,
  getCitiesByCategory,
  getAllCategories,
  getRandomCities,
  cityMetadata,
}
