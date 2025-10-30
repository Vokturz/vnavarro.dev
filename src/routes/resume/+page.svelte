<script lang="ts">
  /* eslint svelte/no-at-html-tags: "off" */
  import { scrollIntoView } from '$lib/actions'
  import { Mail, Phone, Download, Dot, ChevronRight } from 'lucide-svelte'
  import { Button } from '$lib/components/ui/button'
  import SkillCard from '$lib/components/SkillCard.svelte'
  import type {
    Publications,
    Skills,
    TeachingExperience,
    Education,
    Experience
  } from '$lib/types/resume'
  import { marked } from '$lib/markdown'

  function downloadCV() {
    window.open('/VNavarro_CV.pdf', '_blank')
  }

  export let data: {
    publications: Publications[]
    skills: Skills
    teaching: TeachingExperience[]
    education: Education[]
    experience: Experience[]
  }

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
        class="text-muted-foreground mt-6 flex flex-col items-center justify-center space-y-2 space-x-6 lg:flex-row"
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
      <div class="mt-8">
        <Button variant="outline" onclick={downloadCV} class="cursor-pointer">
          <Download class="mr-2 h-5 w-5" />
          Download CV
        </Button>
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
              {#each experience.description as item, index (index)}
                <span class="mt-2 flex items-start gap-x-1">
                  <ChevronRight class="mt-1.5 size-4 flex-shrink-0" />
                  <div>{@html marked.parseInline(item)}</div>
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
              {#each experience.description as item, index (index)}
                <span class="flex items-center gap-x-1">
                  <ChevronRight class="size-4 flex-shrink-0" />
                  {item}
                </span>
              {/each}
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

<style>
  strong {
    font-weight: 600;
    /*color: var(--secondary);*/
  }
</style>
