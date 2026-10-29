// Project data - sorted by year (newest first), original order within same year
// Filename structure: [type1]_[type2]..._[name]_[year].[ext]
// Types match tab names: ux, dev, photo, art, brand

// Media files - sorted by year at export, order here controls sequence within same year
const orderedFiles = [
  'ux_dev_stufflog_mar_2026.mov',
  'ux_ShopLocations_2026.mov',
  'ux_dev_stufflog_2025.mp4',
  'brand_spclogo_2021.png',
  'art_ship_2014.jpg',
  'photo_rubybeach_2020.jpg',
  'ux_seatmap_2019.mov',
  'art_fruit_2015.jpg',
  'brand_spcpatches_2021.JPG',
  'photo_sanfran_2018.jpg',
  'ux_dev_noodles_2025.mp4',
  'art_hidden_2012.jpg',
  'brand_greateast_2020.jpg',
  'photo_olympic_2018.jpg',
  'ux_marketsConditions_2024.mp4',
  'art_sunset_2015.jpg',
  'brand_blashsheep_2021.jpg',
  'photo_teahouse_2018.jpg',
  'ux_dutiesResponder_2025.mp4',
  'brand_bcc_2024.jpg',
  'brand_carwash_2021.jpg',
  'photo_odin_2019.jpg',
  'ux_marketsRefactor_2023.jpg',
  'art_candy_2012.jpg',
  'brand_lmt_2024.jpg',
  'photo_longexposure1_2018.jpg',
  'ux_WILDR_2018.mov',
  'art_mountains_2015.jpg',
  'art_selfPortrait_2009.jpg',
  'photo_longexposure2_2021.jpg',
  'art_sisters_2011.jpg',
  'brand_weddingInvites_2017.jpg',
  'photo_capemay_2017.jpg',
  'brand_DesignStandup_2018.jpg',
  'photo_critter_2017.jpg',
  'photo_museum_2017.jpg',
  'ux_QVCiOSapp_2017.mov',
  'ux_ServiceElectric_2016.mov',
]

const validTypes = ['ux', 'dev', 'photo', 'art', 'brand']

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

// Cloudflare R2 config for video hosting
const R2_PUBLIC_URL = 'https://pub-5ffdb96dde9f461f9964cb58f3746161.r2.dev'
const getVideoUrl = (filename) => `${R2_PUBLIC_URL}/${filename}`

// Build a project from a filename and its media URL
export const createProject = (filename, src, index) => {
  const { categories, title, year } = parseFilename(filename)
  const isVideo = filename.endsWith('.mp4') || filename.endsWith('.mov')

  return {
    id: index + 1,
    title,
    year,
    categories,
    image: src,
    isVideo,
  }
}

// Sort by year (newest first); within the same year, original order is preserved (stable sort)
export const sortByYear = (list) => [...list].sort((a, b) => parseInt(b.year) - parseInt(a.year))

// Generate projects from ordered files
export const projects = sortByYear(orderedFiles.map((filename, index) => {
  const isVideo = filename.endsWith('.mp4') || filename.endsWith('.mov')

  // Use Cloudflare R2 for videos, local path for images
  const src = isVideo
    ? getVideoUrl(filename)
    : `${import.meta.env.BASE_URL}images/${filename}`

  return createProject(filename, src, index)
}))
