export type Publications = {
  authors: string
  href: string
  title: string
  year: number
  journal: string
  other: string
}

export type Skill = {
  name: string
  iconName: string
  color?: string
  level?: number
  description?: string
}

export type Skills = {
  [category: string]: Skill[]
}

export type TeachingExperience = {
  title: string
  institution: string
  period: string
  description: string[]
}

export type Education = {
  degree: string
  institution: string
  year: number
}

export type Experience = {
  title: string
  company: string
  period: string
  description: string[]
}
