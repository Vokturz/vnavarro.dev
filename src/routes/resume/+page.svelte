<script lang="ts">
  import { scrollIntoView } from '$lib/actions'
  import { Mail, Phone, Download } from 'lucide-svelte'
  import { Button } from '$lib/components/ui/button'
  import SkillCard from '$lib/components/SkillCard.svelte'

  function downloadCV() {
    window.open('/VNavarro_CV.pdf', '_blank')
  }

  const skillsData: {
    [key: string]: {
      name: string
      iconName: string
      level?: number
      color?: string
      description?: string
    }[]
  } = {
    'Programming Languages': [
      { name: 'Python', iconName: 'python', color: 'text-yellow-400' },
      { name: 'Typescript', iconName: 'typescript', color: 'text-blue-600' },
      { name: 'Javascript', iconName: 'javascript', color: 'text-yellow-500' },
      { name: 'C', iconName: 'c', color: 'text-blue-700' },
      // { name: 'Go', iconName: 'go', color: 'text-cyan-400' },
      { name: 'bash', iconName: 'gnubash' },
      { name: 'SQL', iconName: 'postgresql', color: 'text-blue-500' },
      { name: 'R', iconName: 'r', color: 'text-blue-400' },
      { name: 'C#', iconName: 'sharp', color: 'text-purple-600' }
    ],
    'Web Technologies': [
      { name: 'Next.js', iconName: 'nextdotjs' },
      { name: 'Svelte', iconName: 'svelte', color: 'text-orange-500' }
    ],
    'Data Science & Machine Learning': [
      { name: 'PyTorch', iconName: 'pytorch', color: 'text-red-500' },
      { name: 'Google BigQuery', iconName: 'Googlebigquery', color: 'text-blue-500' },
      { name: 'Spark', iconName: 'apachespark', color: 'text-orange-600' }
    ],
    'Cloud Technologies': [
      { name: 'AWS', iconName: 'aws', color: 'text-orange-400' },
      { name: 'Supabase', iconName: 'supabase', color: 'text-green-500' },
      { name: 'Google Cloud', iconName: 'googlecloud', color: 'text-blue-500' },
      { name: 'Azure', iconName: 'azure', color: 'text-blue-600' }
    ],
    'DevOps & Version Control': [
      { name: 'GitHub', iconName: 'github' },
      { name: 'Docker', iconName: 'docker', color: 'text-blue-500' }
    ]
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

      <!-- <p class="text-muted-foreground mt-4 text-xl">Software Engineer</p> -->
      <div class="text-muted-foreground mt-6 flex items-center justify-center space-x-6">
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
        <div>
          <h3 class="text-2xl font-semibold">AI Engineer</h3>
          <p class="text-muted-foreground">Judini Inc. (CodeGPT) | Dic 2023 - Present</p>
          <ul class="mt-2 list-inside list-disc space-y-1 text-lg">
            <li>Designed and implemented knowledge-graph algorithm for codebase understanding</li>
            <li>Deployed and managed production AI models on cloud providers</li>
            <li>Designed on-premise Docker solution for platform deployment</li>
            <li>Managed core AWS infrastructure via serverless compute</li>
            <li>Maintained backend systems</li>
          </ul>
        </div>
        <div>
          <h3 class="text-2xl font-semibold">Data Scientist</h3>
          <p class="text-muted-foreground">
            Data Science Institute, Universidad del Desarrollo | Apr 2020 - Nov 2023
          </p>
          <ul class="mt-2 list-inside list-disc space-y-1 text-lg">
            <li>Implemented algorithms to analyze human behavior from mobile XDR data</li>
            <li>Developed a recommendation system for Derco-Chile</li>
            <li>Implemented Customer Lifetime Value models using Bayesian inference</li>
          </ul>
        </div>
        <div>
          <h3 class="text-2xl font-semibold">Research Assistant</h3>
          <p class="text-muted-foreground">
            National Astronomical Observatory, University of Chile | Feb 2020 - Dic 2022
          </p>
          <ul class="mt-2 list-inside list-disc space-y-1 text-lg">
            <li>
              Assisted in acquiring and processing astronomical data for the Cherenkov Telescope
              Array
            </li>
            <li>
              Developed algorithm for characterizing Blazar variability using Approximate Bayesian
              Computation
            </li>
          </ul>
        </div>
        <div>
          <h3 class="text-2xl font-semibold">Developer</h3>
          <p class="text-muted-foreground">FONDECYT 11180913 | Jul 2019 - Jul 2020</p>
          <ul class="mt-2 list-inside list-disc space-y-1 text-lg">
            <li>
              Developed Topic-Supervised Non-Negative Matrix Factorization algorithm using sparse
              matrices
            </li>
          </ul>
        </div>
        <div>
          <h3 class="text-2xl font-semibold">Research Assistant</h3>
          <p class="text-muted-foreground">
            National Astronomical Observatory, University of Chile | Jan 2017 - Jul 2017
          </p>
          <ul class="mt-2 list-inside list-disc space-y-1 text-lg">
            <li>Collected astronomical data for the DoAr 44 T Tauri object</li>
            <li>Developed a draft radiative transfer model for DoAr 44 T Tauri object</li>
          </ul>
        </div>
        <div>
          <h3 class="text-2xl font-semibold">Web Developer</h3>
          <p class="text-muted-foreground">Correos de Chile | Jan 2018 - Feb 2018</p>
          <ul class="mt-2 list-inside list-disc space-y-1 text-lg">
            <li>Resolved bugs in .NET based platform</li>
            <li>Created UML diagrams for core platform components</li>
          </ul>
        </div>
      </div>
    </section>

    <section class="mb-16" use:scrollIntoView>
      <h2 class="border-primary gradient-text mb-6 border-b-2 pb-2 text-3xl font-bold">
        Education
      </h2>
      <div class="space-y-6">
        <div>
          <h3 class="text-2xl font-semibold">Master in Astronomy</h3>
          <p class="text-muted-foreground">
            University of Chile, Faculty of Physical and Mathematical Sciences | 2023
          </p>
        </div>
        <div>
          <h3 class="text-2xl font-semibold">
            Bachelor of Sciences in Engineering specializing in Computer Science
          </h3>
          <p class="text-muted-foreground">
            University of Chile, Faculty of Physical and Mathematical Sciences | 2021
          </p>
        </div>
        <div>
          <h3 class="text-2xl font-semibold">Bachelor of Sciences in Astronomy</h3>
          <p class="text-muted-foreground">
            University of Chile, Faculty of Physical and Mathematical Sciences | 2018
          </p>
        </div>
      </div>
    </section>

    <section class="mb-16" use:scrollIntoView>
      <h2 class="border-primary gradient-text mb-6 border-b-2 pb-2 text-3xl font-bold">Skills</h2>
      <div class="space-y-6">
        {#each Object.entries(skillsData) as [category, skills] (category)}
          <div>
            <h3 class="text-2xl font-semibold">{category}</h3>
            <div class="mt-2 flex flex-wrap gap-4">
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
        <div>
          <h3 class="text-2xl font-semibold">Python for Data Science course for Master students</h3>
          <p class="text-muted-foreground">Universidad del Desarrollo | Jun 2024 - Jul 2024</p>
          <ul class="mt-2 list-inside list-disc space-y-1 text-lg">
            <li>
              Designed and taught introductory programming course for Master in Data Science
              students
            </li>
          </ul>
        </div>
        <div>
          <h3 class="text-2xl font-semibold">
            Introduction to Programming for undergraduate students
          </h3>
          <p class="text-muted-foreground">Universidad del Desarrollo | Mar 2024 - Jul 2024</p>
          <ul class="mt-2 list-inside list-disc space-y-1 text-lg">
            <li>Designed and taught Introduction to Programming for first-year students</li>
          </ul>
        </div>
        <div>
          <h3 class="text-2xl font-semibold">Programming in Python course</h3>
          <p class="text-muted-foreground">Central Bank of Chile | Oct 2023</p>
          <ul class="mt-2 list-inside list-disc space-y-1 text-lg">
            <li>Designed and taught Python programming focused on data analytics</li>
          </ul>
        </div>
      </div>
    </section>

    <section use:scrollIntoView>
      <h2 class="border-primary gradient-text mb-6 border-b-2 pb-2 text-3xl font-bold">
        Publications
      </h2>
      <div class="space-y-6">
        <div class="flex">
          <span class="text-primary mr-4 font-bold">[1]</span>
          <div>
            <p class="text-lg">
              E. Elejalde, L. Ferres, <strong class="text-purple-500">V. Navarro</strong>, L. Bravo
              and E. Zagheni. (2024).
              <a
                href="https://doi.org/10.1038/s41598-024-63098-5"
                target="_blank"
                rel="noopener noreferrer"
                class="hover:text-primary font-semibold underline decoration-2 underline-offset-2"
              >
                The social stratification of internal migration and daily mobility during the
                COVID-19 pandemic
              </a>.
              <em>Scientific Reports</em>, 14(1):12140. DOI: 10.1038/s41598-024-63098-5
            </p>
          </div>
        </div>

        <div class="flex">
          <span class="text-primary mr-4 font-bold">[2]</span>
          <div>
            <p class="text-lg">
              L. Pappalardo, G. Cornacchia, <strong class="text-purple-500">V. Navarro</strong>, L.
              Bravo and L. Ferres. (2023).
              <a
                href="https://doi.org/10.1038/s41597-022-01893-3"
                target="_blank"
                rel="noopener noreferrer"
                class="hover:text-primary font-semibold underline decoration-2 underline-offset-2"
              >
                A dataset to assess mobility changes in Chile following local quarantines
              </a>.
              <em>Scientific Data</em>, 10:6. DOI: 10.1038/s41597-022-01893-3
            </p>
          </div>
        </div>

        <div class="flex">
          <span class="text-primary mr-4 font-bold">[3]</span>
          <div>
            <p class="text-lg">
              P. Goldoni, S. Pita, C. Boisson, W. Max-Moerbeck, E. Kasai, D. A. Williams, F.
              D'Ammando,
              <strong class="text-purple-500">V. Navarro-Aranguiz</strong>, M. Backes, U. Barres de
              Almeida, J. Becerra-Gonzalez, G. Cotter, O. Hervet, J.-P. Lenain, E. Lindfors, H. Sol
              and S. Wagner. (2021).
              <a
                href="https://doi.org/10.1051/0004-6361/202040134"
                target="_blank"
                rel="noopener noreferrer"
                class="hover:text-primary font-semibold underline decoration-2 underline-offset-2"
              >
                Optical spectroscopy of Blazars for the Cherenkov Telescope Array
              </a>.
              <em>Astronomy & Astrophysics (A&A)</em>, 650:A106. DOI: 10.1051/0004-6361/202040134
            </p>
          </div>
        </div>

        <div class="flex">
          <span class="text-primary mr-4 font-bold">[4]</span>
          <div>
            <p class="text-lg">
              S. Casassus, H. Avenhaus, S. Perez, <strong class="text-purple-500">V. Navarro</strong
              >, M. Carcamo, S. Marino, L. Cieza, S. P. Quanz, F. Alarcon, A. Zurlo, A. Osses, F. R.
              Rannou, P. E. Roman and M. Barraza. (2018).
              <a
                href="https://doi.org/10.1093/mnras/sty894"
                target="_blank"
                rel="noopener noreferrer"
                class="hover:text-primary font-semibold underline decoration-2 underline-offset-2"
              >
                An inner warp in the DoAr 44 T Tauri transition disk
              </a>.
              <em>Monthly Notices of the Royal Astronomical Society (MNRAS)</em>, 477(4):5104-5114.
              DOI: 10.1093/mnras/sty894
            </p>
          </div>
        </div>
      </div>
    </section>
  </main>
</div>
