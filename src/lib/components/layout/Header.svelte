<script lang="ts">
    import { onMount } from 'svelte';
    import { Github, Linkedin, Terminal } from 'lucide-svelte';
    import { Button } from '$lib/components/ui/button';

    let isTerminalMode = $state(false)

    function toggleTerminalMode() {
        isTerminalMode = !isTerminalMode;
        if (!isTerminalMode) {
            document.body.classList.add('terminal');
            localStorage.setItem('theme', 'terminal');
            updateHighlightTheme('sunburst');
        } else {
            document.body.classList.remove('terminal');
            localStorage.setItem('theme', 'light');
            updateHighlightTheme('github');
        }
    }

    function updateHighlightTheme(theme: string) {
        // Remove existing highlight.js stylesheets
        const existingLinks = document.querySelectorAll('link[href*="highlight.js/styles"]');
        existingLinks.forEach(link => link.remove());
        
        // Add new theme stylesheet
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/${theme}.min.css`;
        document.head.appendChild(link);
    }

    onMount(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'terminal') {
            isTerminalMode = true;
            document.body.classList.add('terminal');
            updateHighlightTheme('xt256');
        } else {
            updateHighlightTheme('github');
        }
    });
</script>

<nav class="bg-card/90 backdrop-blur-sm sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
            <div class="flex items-center">
                <a href="/" class="text-2xl font-bold gradient-text">vnavarro.dev</a>
                <div class="hidden md:block">
                    <div class="ml-10 flex items-baseline space-x-4">
                        <a href="/#about" class="px-3 py-2 rounded-md text-sm font-medium text-foreground/80 hover:text-foreground">About</a>
                        <a href="/blog" class="px-3 py-2 rounded-md text-sm font-medium text-foreground/80 hover:text-foreground">Blog</a>
                    </div>
                </div>
            </div>
            <div class="hidden md:block">
                <div class="ml-4 flex items-center md:ml-6 space-x-2">
                    <Button onclick={toggleTerminalMode} variant="outline" size="icon">
                        <Terminal class="h-5 w-5" />
                    </Button>
                    <Button variant="outline" size="icon">
                        <a href="https://github.com/Vokturx" target="_blank" rel="noopener noreferrer">
                            <Github class="h-5 w-5" />
                        </a>
                    </Button>
                    <Button variant="outline" size="icon">
                        <a href="https://linkedin.com/in/vnavarroaranguix" target="_blank" rel="noopener noreferrer">
                            <Linkedin class="h-5 w-5" />
                        </a>
                    </Button>
                </div>
            </div>
        </div>
    </div>
</nav>
