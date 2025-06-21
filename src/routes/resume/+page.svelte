<script lang="ts">
  import { scrollIntoView } from '$lib/actions'
  import { Mail, Phone, MapPin, Download } from 'lucide-svelte'
  import { Badge } from '$lib/components/ui/badge'
  import { Button } from '$lib/components/ui/button'
  import * as langIcons from 'simple-icons'
  import TechIcon from '$lib/components/TechIcon.svelte'

  function downloadCV() {
    window.open('/VNavarro_CV.pdf', '_blank')
  }
</script>

<div class="star-bg">
  <main class="text-foreground container mx-auto px-4 py-12">
    <header class="mb-16 text-center">
      <h1 class="gradient-text text-5xl font-extrabold tracking-tight lg:text-6xl">
        Víctor Navarro Aránguiz
      </h1>
      <p class="text-muted-foreground mt-4 text-xl">Software Engineer</p>
      <div class="text-muted-foreground mt-6 flex items-center justify-center space-x-6">
        <div class="flex items-center">
          <MapPin class="mr-2 h-5 w-5" />
          <span>Dublin, Ireland</span>
        </div>
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
        <Button variant="outline" onclick={downloadCV}>
          <Download class="mr-2 h-5 w-5" />
          Download CV
        </Button>
      </div>
    </header>

    <!-- <section class="mb-16" use:scrollIntoView>
            <h2 class="text-3xl font-bold border-b-2 border-primary pb-2 mb-6 gradient-text">Objective</h2>
            <p class="text-lg text-muted-foreground">
                Highly motivated Software Engineer seeking an opportunity to utilize my broad technical experience in software development and system design. I am enthusiastic about contributing to innovative development efforts, focusing on building robust and scalable applications and solving practical challenges. I am also eager to continuously learn and grow within a dynamic technical environment.
            </p>
        </section> -->

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
        <div>
          <h3 class="text-2xl font-semibold">Programming Languages</h3>
          <div class="mt-2 flex flex-wrap gap-4">
            <Badge variant="secondary" class="flex items-center gap-2">
              <TechIcon name="python" />
              Python
            </Badge>
            <Badge variant="secondary" class="flex items-center gap-2">
              <TechIcon name="typescript" />
              Typescript
            </Badge>
            <Badge variant="secondary" class="flex items-center gap-2">
              <TechIcon name="javascript" />
              Javascript
            </Badge>
            <Badge variant="secondary" class="flex items-center gap-2">
              <TechIcon name="c" />
              C
            </Badge>
            <Badge variant="secondary" class="flex items-center gap-2">
              <TechIcon name="go" />
              Go
            </Badge>
            <Badge variant="secondary" class="flex items-center gap-2">
              <TechIcon name="gnubash" />
              bash
            </Badge>
            <Badge variant="secondary" class="flex items-center gap-2">
              <TechIcon name="postgresql" />
              SQL
            </Badge>
            <Badge variant="secondary" class="flex items-center gap-2">
              <TechIcon name="sharp" />
              C#
            </Badge>
            <Badge variant="secondary" class="flex items-center gap-2">
              <TechIcon name="r" />
              R
            </Badge>
          </div>
        </div>
        <div>
          <h3 class="text-2xl font-semibold">Web Technologies</h3>
          <div class="mt-2 flex flex-wrap gap-4">
            <Badge variant="secondary" class="flex items-center gap-2">
              <TechIcon name="nextdotjs" />
              Next.js
            </Badge>
            <Badge variant="secondary" class="flex items-center gap-2">
              <TechIcon name="svelte" />
              Svelte
            </Badge>
          </div>
        </div>
        <div>
          <h3 class="text-2xl font-semibold">Data Science & Machine Learning</h3>
          <div class="mt-2 flex flex-wrap gap-4">
            <Badge variant="secondary" class="flex items-center gap-2">
              <TechIcon name="Googlebigquery" />
              Google BigQuery
            </Badge>
            <Badge variant="secondary" class="flex items-center gap-2">
              <TechIcon name="apachespark" />
              Spark
            </Badge>
            <Badge variant="secondary" class="flex items-center gap-2">
              <TechIcon name="pytorch" />
              PyTorch
            </Badge>
          </div>
        </div>
        <div>
          <h3 class="text-2xl font-semibold">Cloud Technologies</h3>
          <div class="mt-2 flex flex-wrap gap-4">
            <Badge variant="secondary" class="flex items-center gap-2">
              <TechIcon name="aws" />
              AWS
            </Badge>
            <Badge variant="secondary" class="flex items-center gap-2">
              <TechIcon name="supabase" />
              Supabase
            </Badge>
            <Badge variant="secondary" class="flex items-center gap-2">
              <TechIcon name="googlecloud" />
              Google Cloud
            </Badge>
            <Badge variant="secondary" class="flex items-center gap-2">
              <TechIcon name="azure" />
              Azure
            </Badge>
          </div>
        </div>
        <div>
          <h3 class="text-2xl font-semibold">DevOps & Version Control</h3>
          <div class="mt-2 flex flex-wrap gap-4">
            <Badge variant="secondary" class="flex items-center gap-2">
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d={langIcons.siGithub.path} />
              </svg>
              GitHub
            </Badge>
            <Badge variant="secondary" class="flex items-center gap-2">
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d={langIcons.siDocker.path} />
              </svg>
              Docker
            </Badge>
          </div>
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
              E. Elejalde, L. Ferres, <strong>V. Navarro</strong>, L. Bravo and E. Zagheni. (2024).
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
              L. Pappalardo, G. Cornacchia, <strong>V. Navarro</strong>, L. Bravo and L. Ferres.
              (2023).
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
              <strong>V. Navarro-Aranguiz</strong>, M. Backes, U. Barres de Almeida, J.
              Becerra-Gonzalez, G. Cotter, O. Hervet, J.-P. Lenain, E. Lindfors, H. Sol and S.
              Wagner. (2021).
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
              S. Casassus, H. Avenhaus, S. Perez, <strong>V. Navarro</strong>, M. Carcamo, S.
              Marino, L. Cieza, S. P. Quanz, F. Alarcon, A. Zurlo, A. Osses, F. R. Rannou, P. E.
              Roman and M. Barraza. (2018).
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
