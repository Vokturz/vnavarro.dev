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
      { name: 'Rust', iconName: 'rust' },
      // { name: 'C', iconName: 'c', color: 'text-blue-700' },
      // { name: 'Go', iconName: 'go', color: 'text-cyan-400' },
      { name: 'SQL', iconName: 'postgresql', color: 'text-blue-500' },
      { name: 'Bash', iconName: 'gnubash' },
      { name: 'R', iconName: 'r', color: 'text-blue-400' }
      // { name: 'C#', iconName: 'sharp', color: 'text-purple-600' }
    ],
    'AI & MLOps': [
      { name: 'PyTorch', iconName: 'pytorch', color: 'text-red-500' },
      { name: 'Transformers', iconName: 'huggingface' },
      { name: 'Langchain', iconName: 'langchain', color: 'text-green-900' },
      { name: 'MCP', iconName: 'modelcontextprotocol' },
      { name: 'Scikit-learn', iconName: 'scikitlearn' },
      { name: 'Pandas / NumPy', iconName: 'pandas', color: 'text-blue-500' }
    ],
    'Web Development': [
      { name: 'Deno', iconName: 'deno' },
      { name: 'Node.js', iconName: 'nodedotjs', color: 'text-green-500' },
      { name: 'FastAPI', iconName: 'fastapi', color: 'text-green-800' },
      { name: 'Vite', iconName: 'vite', color: 'text-purple-600' },
      { name: 'SvelteKit', iconName: 'svelte', color: 'text-orange-500' },
      { name: 'Next.js', iconName: 'nextdotjs' }
    ],
    'Cloud & DevOps': [
      { name: 'Docker', iconName: 'docker', color: 'text-blue-500' },
      { name: 'AWS', iconName: 'aws' },
      { name: 'Google Cloud', iconName: 'googlecloud', color: 'text-blue-500' },
      { name: 'GitHub Actions', iconName: 'githubactions' },
      { name: 'Git', iconName: 'git', color: 'text-orange-500' }
    ],
    Databases: [
      { name: 'PostgreSQL', iconName: 'postgresql', color: 'text-gray-500' },
      { name: 'Supabase', iconName: 'supabase', color: 'text-green-500' },
      { name: 'SQLite', iconName: 'sqlite', color: 'text-gray-500' },
      { name: 'Google BigQuery', iconName: 'googlebigquery', color: 'text-blue-500' },
      { name: 'Apache Spark', iconName: 'apachespark', color: 'text-orange-600' }
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
        <div>
          <h3 class="text-2xl font-semibold">AI Engineer</h3>
          <p class="text-muted-foreground">CodeGPT | Dic 2023 - Jul 2025</p>
          <ul class="mt-2 list-inside list-disc space-y-1 text-lg">
            <li>
              Engineered a <strong>knowledge-graph algorithm</strong> to analyze codebase
              structures. You can try it out at
              <a class="italic hover:underline" href="https://www.deepgraph.co/">deepgraph.co</a>.
            </li>
            <li>
              Designed a scalable, asynchronous system to build knowledge graphs by orchestrating <strong
                >dynamic AWS ECS tasks</strong
              >, enabling on-demand processing of any size codebase.
            </li>
            <li>
              Architected the <strong>Deno API backend</strong> to integrate multiple LLMs with internal
              tools, serving a production-scale code assistant.
            </li>
            <li>
              Developed the core logic for <strong>autocomplete</strong>
              and
              <strong>code indexation</strong>
              features within the VS Code extension, including building the <code>mcp</code> client.
            </li>
            <li>
              Architected a <strong>containerized on-premise Docker solution</strong>, unlocking a
              new enterprise customer segment by guaranteeing 100% data privacy.
            </li>
            <li>
              Led the <strong>full infrastructure migration from Vercel to AWS</strong>, rebuilding
              the platform on <strong>AWS Fargate</strong> to improve scalability and reduce operational
              costs.
            </li>
            <li>
              Deployed a <strong>Qwen coder model on Google Cloud</strong>
              with GPU autoscaling, providing inline code completions to free users while optimizing
              inference costs.
            </li>
          </ul>
        </div>
        <div>
          <h3 class="text-2xl font-semibold">Data Scientist</h3>
          <p class="text-muted-foreground">
            Data Science Institute, Universidad del Desarrollo | Apr 2020 - Nov 2023
          </p>
          <ul class="mt-2 list-inside list-disc space-y-1 text-lg">
            <li>
              Developed a national <strong>"mobility index"</strong> by analyzing massive mobile XDR
              datasets, which
              <strong>directly informed Chilean government lockdown policies</strong>
              and led to 2 peer-reviewed publications.
            </li>
            <li>
              Developed a <strong>recommendation system</strong> for Derco-Chile to
              <strong>drive cross-sales</strong> by matching users with similar vehicles from the registration
              database
            </li>
            <li>
              Implemented <strong
                >Customer Lifetime Value and Customer Journey models using Bayesian inference</strong
              > for Derco-Chile, helping in the development of new products and services.
            </li>
          </ul>
        </div>
        <div>
          <h3 class="text-2xl font-semibold">Research Assistant</h3>
          <p class="text-muted-foreground">
            National Astronomical Observatory, University of Chile | Feb 2020 - Dic 2022
          </p>
          <ul class="mt-2 list-inside list-disc space-y-1 text-lg">
            <li>
              Developed a novel <strong>Approximate Bayesian Computation (ABC) algorithm</strong>
              to characterize Blazar variability,
              <strong>reducing model fitting time from hours to minutes</strong>.
            </li>
            <li>
              Contributed to the Cherenkov Telescope Array (CTA) project by acquiring data and
              performing <strong>redshift classification</strong> using
              <strong>astropy</strong>.
            </li>
          </ul>
        </div>
        <div>
          <h3 class="text-2xl font-semibold">Developer</h3>
          <p class="text-muted-foreground">FONDECYT 11180913 | Jul 2019 - Jul 2020</p>
          <ul class="mt-2 list-inside list-disc space-y-1 text-lg">
            <li>
              Developed and published <a href="https://github.com/Vokturz/tsnmf-sparse"
                ><code class="text-secondary hover:underline">tsnmf</code></a
              >, a
              <strong>Scikit-Learn compatible Python package</strong>
              for Topic-Supervised NMF, <strong>optimized for sparse matrices</strong>. It served as
              the core model for a published paper on
              <a
                class="italic hover:underline"
                href="https://epjdatascience.springeropen.com/articles/10.1140/epjds/s13688-018-0177-1"
                >inferring city-wide transportation modes</a
              > from mobile phone network data in Santiago.
            </li>
          </ul>
        </div>
        <!-- <div>
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
      </div> -->
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
      <div class="grid grid-cols-1 gap-4 space-y-2 lg:grid-cols-2">
        {#each Object.entries(skillsData) as [category, skills] (category)}
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
              E. Elejalde, L. Ferres, <strong class="text-secondary">V. Navarro</strong>, L. Bravo
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
              L. Pappalardo, G. Cornacchia, <strong class="text-secondary">V. Navarro</strong>, L.
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
              <strong class="text-secondary">V. Navarro-Aranguiz</strong>, M. Backes, U. Barres de
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
              S. Casassus, H. Avenhaus, S. Perez, <strong class="text-secondary">V. Navarro</strong
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

<style>
  strong {
    font-weight: 600;
    /*color: var(--secondary);*/
  }
</style>
