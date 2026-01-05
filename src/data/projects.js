// Project data parsed from Featured folder
// Filename structure: [type1]_[type2]..._[name]_[year].[ext]
// Types match tab names: ux, dev, photo, art, print

const featuredFiles = [
  'art_candy_2012.jpg',
  'art_disney_2015.jpg',
  'art_dog_2012.jpg',
  'art_fatherAndSon_2011.jpg',
  'art_fruit_2015.jpg',
  'art_hidden_2012.jpg',
  'art_mountains_2015.jpg',
  'art_selfPortrait_2009.jpg',
  'art_ship_2014.jpg',
  'art_sisters_2011.jpg',
  'art_stJohn_2014.jpg',
  'art_sunset_2015.jpg',
  'print_weddingInvites_2017.jpg',
  'ux_DesignStandup_2018.jpg',
  'ux_dev_stufflog_2025.mp4',
  'ux_dutiesResponder_2025.jpg',
  'ux_marketsConditions_2024.jpg',
  'ux_marketsRefactor_2023.jpg',
  'ux_MM_2024.jpg',
]

const validTypes = ['ux', 'dev', 'photo', 'art', 'print']

// Parse filename to extract categories, title, and year
const parseFilename = (filename) => {
  // Remove extension
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '')
  const parts = nameWithoutExt.split('_')
  
  // Last part is year
  const year = parts[parts.length - 1]
  
  // Second to last part is the title
  const titlePart = parts[parts.length - 2]
  
  // Everything before that are types
  const typeParts = parts.slice(0, -2)
  
  // Filter to only valid types
  const categories = typeParts.filter(type => validTypes.includes(type.toLowerCase()))
  
  // Convert camelCase title to readable format
  const title = titlePart
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim()
  
  return { categories, title, year }
}

// Generate projects from featured files
export const projects = featuredFiles.map((filename, index) => {
  const { categories, title, year } = parseFilename(filename)
  const isVideo = filename.endsWith('.mp4') || filename.endsWith('.mov')
  
  return {
    id: index + 1,
    title,
    year,
    categories,
    image: `/images/${filename}`,
    isVideo,
  }
})

export const categories = ['all', 'ux', 'dev', 'photo', 'art', 'print']

// Fisher-Yates shuffle for randomizing project order
const shuffleArray = (array) => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Pre-shuffle all projects once on load for the "all" tab
const shuffledProjects = shuffleArray(projects)

export const getProjectsByCategory = (category) => {
  if (category === 'all') return shuffledProjects
  // Filter projects that include this category
  return projects.filter(p => p.categories.includes(category))
}
