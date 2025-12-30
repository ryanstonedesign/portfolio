# Ryan Stone Portfolio

A modern, minimal portfolio site showcasing UX design, art, photography, and print projects.

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Framer Motion** - Animations
- **CSS Variables** - Theming and design tokens

## Getting Started

### Install dependencies

```bash
npm install
```

### Start development server

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── Header.jsx
│   ├── Footer.jsx
│   ├── ProjectCard.jsx
│   └── ProjectGrid.jsx
├── pages/           # Route pages
│   ├── Home.jsx
│   ├── About.jsx
│   ├── Category.jsx
│   └── ProjectDetail.jsx
├── data/            # Project data and content
│   └── projects.js
├── styles/          # Global styles
│   └── globals.css
├── App.jsx          # Main app with routing
└── main.jsx         # Entry point
```

## Adding Projects

Edit `src/data/projects.js` to add your projects. Each project should include:

```javascript
{
  id: 1,
  slug: 'project-slug',
  title: 'Project Title',
  category: 'ux', // ux, art, photography, or print
  year: '2024',
  thumbnail: '/images/projects/image.jpg',
  description: 'Project description...',
  featured: true, // Show on homepage
  // Optional fields based on category
  role: 'Lead Designer',
  tools: ['Figma', 'Photoshop'],
  medium: 'Acrylic on canvas',
  camera: 'Sony A7IV',
}
```

## Customization

### Colors & Typography

Edit CSS variables in `src/styles/globals.css`:

```css
:root {
  --color-bg: #F5F2ED;
  --color-accent: #C45C3E;
  --font-display: 'Instrument Serif', Georgia, serif;
  --font-body: 'Syne', system-ui, sans-serif;
}
```

## License

All rights reserved.

