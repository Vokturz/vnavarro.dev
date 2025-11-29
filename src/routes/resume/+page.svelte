<script lang="ts">
  /* eslint svelte/no-at-html-tags: "off" */
  import { scrollIntoView } from '$lib/actions'
  import { Mail, Phone, Download, ChevronRight, Eye } from 'lucide-svelte'
  import * as ButtonGroup from '$lib/components/ui/button-group'
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
  import { Button } from '$lib/components/ui/button'
  import SkillCard from '$lib/components/SkillCard.svelte'
  import type {
    Publications,
    Skills,
    TeachingExperience,
    Education,
    Experience,
    Summaries,
    Category,
    Awards
  } from '$lib/types/resume'
  import { marked } from '$lib/markdown'
  import type { Project } from '$lib/types'

  let isGeneratingPDF = $state(false)

  async function downloadResumePDF(category: Category, language: 'EN' | 'ES' = 'EN') {
    isGeneratingPDF = true
    try {
      const endpoint = language === 'ES' ? '/resume/pdf_es' : '/resume/pdf'
      const body = language === 'ES' ? { category } : { data, category }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `VNavarro_Resume${language === 'ES' ? '_ES' : ''}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    } finally {
      isGeneratingPDF = false
    }
  }

  async function openResumeLatex() {
    isGeneratingPDF = true
    try {
      const response = await fetch('/resume/latex', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data })
      })

      if (!response.ok) {
        throw new Error('Failed to generate LaTeX')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)

      window.open(url, '_blank')

      setTimeout(() => {
        window.URL.revokeObjectURL(url)
      }, 5000)
    } catch (error) {
      console.error('Error opening LaTeX:', error)
      alert('Failed to generate LaTeX. Please try again.')
    } finally {
      isGeneratingPDF = false
    }
  }

  interface Props {
    data: {
      publications: Publications[]
      skills: Skills
      teaching: TeachingExperience[]
      education: Education[]
      experience: Experience[]
      projects: Project[]
      summaries: Summaries
      awards: Awards[]
    }
  }

  let { data }: Props = $props()

  function highlightAuthor(authors: string): string {
    return authors
      .replace(/(V\. Navarro-Aranguiz)/g, '<span class=" font-semibold text-secondary">$1</span>')
      .replace(/(V\. Navarro)/g, '<span class="font-semibold text-secondary">$1</span>')
  }
</script>

<div class="star-bg">
  <!-- <div class="absolute inset-x-0 top-0 h-screen w-full overflow-hidden max-h-150">
    <ConstellationBackground useWindowMouse={true} />
  </div> -->
  <main class="text-foreground container mx-auto px-4 py-12">
    <header class="mb-16 text-center">
      <h1
        class="gradient-text pointer-events-none text-5xl font-extrabold tracking-tight lg:text-6xl"
      >
        Víctor Navarro Aránguiz
      </h1>
      <div class="bg-primary mx-auto mt-4 h-1 w-40 rounded-full"></div>

      <div
        class="text-muted-foreground mt-6 flex flex-col items-center justify-center gap-y-2 lg:flex-row lg:gap-x-6"
      >
        <a href="mailto:vnavarroaranguiz@gmail.com" class="hover:text-primary flex items-center">
          <Mail class="mr-2 h-5 w-5" />
          <span>vnavarroaranguiz@gmail.com</span>
        </a>
        <a href="tel:+353838631200" class="hover:text-primary flex items-center">
          <Phone class="mr-2 h-5 w-5" />
          <span>(+353) 83 863 1200</span>
        </a>
      </div>
      <div class="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <ButtonGroup.Root>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              {#snippet child({ props })}
                <Button
                  {...props}
                  variant="outline"
                  disabled={isGeneratingPDF}
                  class="cursor-pointer"
                >
                  <Download class="mr-2 h-5 w-5" />
                  AI Engineer PDF
                </Button>
              {/snippet}
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Group>
                <DropdownMenu.Item onclick={() => downloadResumePDF('ai-engineer', 'EN')}>
                  English (EN)
                </DropdownMenu.Item>
                <DropdownMenu.Item onclick={() => downloadResumePDF('ai-engineer', 'ES')}>
                  Español (ES)
                </DropdownMenu.Item>
              </DropdownMenu.Group>
            </DropdownMenu.Content>
          </DropdownMenu.Root>

          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              {#snippet child({ props })}
                <Button
                  {...props}
                  variant="outline"
                  disabled={isGeneratingPDF}
                  class="cursor-pointer"
                >
                  <Download class="mr-2 h-5 w-5" />
                  Software Engineer PDF
                </Button>
              {/snippet}
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Group>
                <DropdownMenu.Item onclick={() => downloadResumePDF('software-engineer', 'EN')}>
                  English (EN)
                </DropdownMenu.Item>
                <DropdownMenu.Item onclick={() => downloadResumePDF('software-engineer', 'ES')}>
                  Español (ES)
                </DropdownMenu.Item>
              </DropdownMenu.Group>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </ButtonGroup.Root>
        <ButtonGroup.Root>
          <Button variant="outline" onclick={openResumeLatex} class="cursor-pointer">
            <Eye class="mr-2 h-5 w-5" />
            View CV (LaTeX)
          </Button>
        </ButtonGroup.Root>
      </div>
    </header>

    <section class="mb-16" use:scrollIntoView>
      <h2 class="border-primary gradient-text mb-6 border-b-2 pb-2 text-3xl font-bold">
        Experience
      </h2>
      <div class="space-y-8">
        {#each data.experience as experience (experience.title)}
          <div>
            <h3 class="text-2xl font-semibold">{experience.title}</h3>
            <p class="text-muted-foreground">{experience.company} | {experience.period}</p>
            <div class="mt-2 text-lg">
              {#each experience.items as item, index (index)}
                <span class="mt-2 flex items-start gap-x-1">
                  <ChevronRight class="mt-1.5 size-4 flex-shrink-0" />
                  <div>{@html marked.parseInline(item.description)}</div>
                </span>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    </section>

    <section class="mb-16" use:scrollIntoView>
      <h2 class="border-primary gradient-text mb-6 border-b-2 pb-2 text-3xl font-bold">
        Education
      </h2>
      <div class="space-y-6">
        {#each data.education as education (education.degree)}
          <div>
            <h3 class="text-2xl font-semibold">{education.degree}</h3>
            <p class="text-muted-foreground">
              {education.institution} | {education.year}
            </p>
          </div>
        {/each}
      </div>
    </section>

    <section class="mb-16" use:scrollIntoView>
      <h2 class="border-primary gradient-text mb-6 border-b-2 pb-2 text-3xl font-bold">Skills</h2>
      <div class="grid grid-cols-1 gap-4 space-y-2 lg:grid-cols-2">
        {#each Object.entries(data.skills) as [category, skills] (category)}
          <div>
            <h3 class="text-2xl font-semibold">{category}</h3>
            <div class="mt-1 flex flex-wrap gap-2">
              {#each skills as skill (skill.name)}
                <SkillCard {skill} />
              {/each}
            </div>
          </div>
        {/each}
      </div>
    </section>

    <section class="mb-16" use:scrollIntoView>
      <h2 class="border-primary gradient-text mb-6 border-b-2 pb-2 text-3xl font-bold">
        Teaching Experience
      </h2>
      <div class="space-y-8">
        {#each data.teaching as experience (experience.title)}
          <div>
            <h3 class="text-2xl font-semibold">{experience.title}</h3>
            <p class="text-muted-foreground">{experience.institution} | {experience.period}</p>
            <div class="mt-2 text-lg">
              <span class="flex items-center gap-x-1">
                <ChevronRight class="size-4 flex-shrink-0" />
                {experience.description}
              </span>
            </div>
          </div>
        {/each}
      </div>
    </section>

    <section use:scrollIntoView>
      <h2 class="border-primary gradient-text mb-6 border-b-2 pb-2 text-3xl font-bold">
        Publications
      </h2>
      <div class="space-y-6">
        {#each data.publications as publication, index (index)}
          <div class="flex">
            <span class="text-primary mr-4 font-bold">[{index + 1}]</span>
            <div>
              <p class="text-lg">
                {@html highlightAuthor(publication.authors)} ({publication.year})
                <a
                  href={publication.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="hover:text-primary font-semibold underline decoration-2 underline-offset-2"
                >
                  {publication.title}
                </a>.
                <em>{publication.journal}</em>, {publication.other}
              </p>
            </div>
          </div>
        {/each}
      </div>
    </section>
  </main>
</div>
