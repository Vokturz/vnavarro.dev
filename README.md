# vnavarro.dev

My personal website built with SvelteKit, featuring a blog and projects showcase.

## Features

- **Personal Portfolio**: About me section with profile and introduction
- **Blog System**: Markdown-based blog posts with support for interactive content
- **Projects Showcase**: Featured projects with descriptions and technology stacks
- **Interactive Python Execution**: Run Python code directly in the browser using Pyodide
- **Responsive Design**: Built with TailwindCSS for a modern, mobile-friendly interface
- **TypeScript**: Full type safety throughout the application

## Tech Stack

- **Framework**: SvelteKit
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Python Runtime**: Pyodide for in-browser Python execution
- **Deployment**: Vercel

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/vokturz/vnavarro.dev.git
cd vnavarro.dev
```

2. Install dependencies:
```bash
pnpm install
```

3. Start the development server:
```bash
pnpm dev
```

4. Build for production:
```bash
pnpm build
```

## Project Structure

```
src/
├── lib/           # Components and utilities
├── routes/        # SvelteKit routes
└── app.html       # Main app template

data/
├── posts/         # Blog posts in Markdown
└── projects.json  # Projects data
```
