# vnavarro.dev

## Project Overview

This is a personal portfolio website built with SvelteKit, featuring a blog system, projects showcase, and resume. The site supports both Markdown and Jupyter Notebook blog posts with interactive Python execution using Pyodide.

## Setup Commands

- Install dependencies: `pnpm install`
- Start dev server: `pnpm dev`
- Build for production: `pnpm build`
- Preview production build: `pnpm preview`

## Project Structure

```
vnavarro.dev/
├── data/
│   ├── posts/              # Blog posts (.md or .ipynb files)
│   ├── projects.json       # Projects data (English)
│   ├── projects_es.json    # Projects data (Spanish)
│   └── resume/             # Resume data files
│       ├── experience.json
│       ├── education.json
│       ├── skills.json
│       ├── publications.json
│       ├── teaching.json
│       ├── summaries.json
│       └── awards.json
├── src/
│   ├── lib/                # Reusable components and utilities
│   │   ├── markdown.ts     # Markdown parser with custom extensions
│   │   ├── notebook.ts     # Jupyter notebook parser
│   │   └── types/          # TypeScript type definitions
│   └── routes/             # SvelteKit routes
│       ├── blog/           # Blog pages
│       ├── projects/       # Projects showcase
│       └── resume/         # Resume page
└── static/                 # Static assets
```

## How to Create Blog Posts

Blog posts are stored in `/data/posts/` and can be either Markdown (`.md`) or Jupyter Notebook (`.ipynb`) files.

### Markdown Blog Posts

1. Create a new `.md` file in `/data/posts/` with a descriptive filename (e.g., `my-new-post.md`)
2. Add frontmatter at the top of the file with metadata:

```markdown
---
title: 'Your Post Title'
date: 'YYYY-MM-DD'
summary: 'A brief description of your post'
runnable: true  # Optional: enables Python code execution
icon: 'transformers'  # Optional: icon identifier
tags: ['tag1', 'tag2']  # Optional: post tags
image: '/path/to/image.jpg'  # Optional: post image
---

Your post content goes here...
```

3. Write your content using standard Markdown syntax
4. The post will automatically appear on the blog page, sorted by date

### Jupyter Notebook Blog Posts

1. Create a new `.ipynb` file in `/data/posts/`
2. Add frontmatter in the first markdown cell:

```markdown
---
title: 'Your Notebook Title'
date: 'YYYY-MM-DD'
summary: 'A brief description'
---
```

3. The notebook will automatically be processed and displayed with an icon set to `'jupyter'` and a tag of `'notebook'`

### Special Markdown Features

The blog supports several custom markdown extensions:

- **Math equations**: Use `$$...$$` for display math and `$...$` for inline math (KaTeX)
- **Code highlighting**: Fenced code blocks with language specification
- **Color highlights**: Use `[color:text]` syntax (e.g., `[green:important text]`)
- **Colorized code blocks**: Use `colorized` language for multi-color syntax highlighting
- **Interactive Python**: Code blocks in posts with `runnable: true` can execute Python via Pyodide

### Blog Post Loading

Blog posts are loaded in `/src/routes/blog/+page.server.ts`:
- Uses `import.meta.glob('/data/posts/*.{md,ipynb}')` to discover all posts
- Parses frontmatter using `gray-matter` for Markdown files
- Extracts metadata from the first markdown cell for Jupyter notebooks
- Sorts posts by date in descending order

## How to Add Projects

Projects are defined in JSON files at the root of `/data/`:

- `/data/projects.json` - English version
- `/data/projects_es.json` - Spanish version

### Project Schema

Each project is an object in the JSON array with the following structure:

```json
{
  "title": "Project Name",
  "description": "A brief description of the project",
  "technologies": ["Tech1", "Tech2", "Tech3"],
  "githubUrl": "https://github.com/username/repo",  // Optional
  "hfUrl": "https://huggingface.co/...",  // Optional: Hugging Face URL
  "featured": true,  // Whether to show on homepage and projects page
  "showImage": true,  // Whether to display project image
  "latexDescription": "Description for LaTeX resume"  // Optional
}
```

### Adding a New Project

1. Open `/data/projects.json` (and `/data/projects_es.json` for Spanish)
2. Add a new object to the array following the schema above
3. Set `"featured": true` if you want it to appear on the homepage and projects page
4. The project will automatically appear in the UI

### Project Loading

Projects are loaded in multiple places:
- `/src/routes/projects/+page.server.ts` - Loads and filters for featured projects
- `/src/routes/resume/+page.server.ts` - Loads all projects for resume page
- `/src/routes/+page.server.ts` - Loads projects for homepage

## How to Update the Resume

Resume data is split into multiple JSON files in `/data/resume/`, each with an English and Spanish version (suffix `_es.json`):

### Experience (`experience.json`)

Structure for work experience entries:

```json
[
  {
    "title": "Job Title",
    "company": "Company Name",
    "period": "Start Date - End Date",
    "summary": "Brief overview of the role",
    "items": [
      {
        "categories": ["ai-engineer", "software-engineer", "devops"],
        "description": "Specific achievement or responsibility"
      }
    ]
  }
]
```

### Education (`education.json`)

```json
[
  {
    "degree": "Degree Name",
    "institution": "University Name",
    "year": 2023,
    "gpa": "GPA (optional)",
    "thesis": "Thesis title (optional)"
  }
]
```

### Skills (`skills.json`)

```json
{
  "languages": ["Python", "JavaScript", "TypeScript"],
  "frameworks": ["SvelteKit", "React", "FastAPI"],
  "tools": ["Docker", "AWS", "Git"]
}
```

### Publications (`publications.json`)

```json
[
  {
    "title": "Publication Title",
    "authors": "Author names",
    "venue": "Conference/Journal name",
    "year": 2023,
    "url": "https://link-to-paper.com"
  }
]
```

### Teaching (`teaching.json`)

```json
[
  {
    "course": "Course Name",
    "institution": "Institution Name",
    "role": "Teaching Assistant/Instructor",
    "period": "Semester/Year"
  }
]
```

### Summaries (`summaries.json`)

```json
{
  "short": "One-line professional summary",
  "long": "Longer paragraph about background and expertise"
}
```

### Awards (`awards.json`)

```json
[
  {
    "title": "Award Name",
    "organization": "Awarding Organization",
    "year": 2023,
    "description": "Brief description (optional)"
  }
]
```

### Updating Resume Data

1. Locate the appropriate JSON file in `/data/resume/`
2. Edit the JSON following the schema for that section
3. Update both English and Spanish versions if applicable
4. The resume page will automatically reflect the changes
5. Publications and education are automatically sorted by year (descending)

### LaTeX Resume

The LaTeX version of the resume is generated dynamically in `/src/routes/resume/latex`. 

**Critical Rule:** When updating professional experience or projects, you MUST ensure the following fields are descriptive and well-formatted:
- **`summary`** in `experience.json`: This field is used as the main description for each job entry in the LaTeX resume.
- **`latexDescription`** in `projects.json`: This field provides the project description specifically for the LaTeX version.

Ensure these fields use LaTeX-safe characters or that any special formatting is handled by the `convertMarkdownToLatex` helper in `src/routes/resume/latex/+server.ts`.

## Code Style

- **TypeScript**: Use strict mode, prefer type safety
- **Formatting**: Follow Prettier configuration in `.prettierrc`
- **Components**: Use Svelte 5 components with TypeScript
- **Styling**: TailwindCSS for all styling
- **Imports**: Use `$lib` alias for library imports

## Important Notes

- All data files use JSON format for easy editing
- Blog posts support both `.md` and `.ipynb` formats
- The site is deployed on Netlify (see `netlify.toml`)
- Python code execution uses Pyodide (browser-based)
- Markdown parsing includes custom extensions for math, code highlighting, and color syntax
- Resume data is bilingual (English and Spanish versions)
