export function scrollIntoView(node: HTMLElement) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        node.classList.add('fade-in-up')
        observer.unobserve(node)
      }
    })
  })

  observer.observe(node)

  return {
    destroy() {
      observer.unobserve(node)
    }
  }
}
