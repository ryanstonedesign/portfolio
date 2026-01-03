// Project images with category tags
// Add your images here with their categories
export const projects = [
  {
    id: 1,
    title: 'Mobile Banking Redesign',
    category: 'ux',
    image: '/images/ux-01.jpg',
  },
  {
    id: 2,
    title: 'E-Commerce Checkout',
    category: 'ux',
    image: '/images/ux-02.jpg',
  },
  {
    id: 3,
    title: 'Dashboard Design',
    category: 'ux',
    image: '/images/ux-03.jpg',
  },
  {
    id: 4,
    title: 'Abstract Series I',
    category: 'art',
    image: '/images/art-01.jpg',
  },
  {
    id: 5,
    title: 'Abstract Series II',
    category: 'art',
    image: '/images/art-02.jpg',
  },
  {
    id: 6,
    title: 'Golden Hour',
    category: 'photo',
    image: '/images/photo-01.jpg',
  },
  {
    id: 7,
    title: 'Street Portraits',
    category: 'photo',
    image: '/images/photo-02.jpg',
  },
  {
    id: 8,
    title: 'Urban Landscapes',
    category: 'photo',
    image: '/images/photo-03.jpg',
  },
  {
    id: 9,
    title: 'Cultivate Magazine',
    category: 'print',
    image: '/images/print-01.jpg',
  },
  {
    id: 10,
    title: 'Brand Identity',
    category: 'print',
    image: '/images/print-02.jpg',
  },
]

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
  return projects.filter(p => p.category === category)
}
