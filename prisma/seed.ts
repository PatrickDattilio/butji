import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Seed companies (using upsert to avoid deleting existing data)
  const companies = [
    {
      name: 'OpenAI',
      description: 'The company behind ChatGPT, GPT-4, DALL-E, and other AI systems. Founded by Sam Altman, Elon Musk, and others. Known for massive data scraping without consent, displacing creative workers, and aggressive commercialization of stolen content.',
      website: 'https://openai.com',
      founders: JSON.stringify(['Sam Altman', 'Elon Musk', 'Greg Brockman', 'Ilya Sutskever']),
      ceo: 'Sam Altman',
      foundedYear: 2015,
      funding: JSON.stringify({
        total: '$11.3B',
        latestRound: '$10B from Microsoft',
        investors: ['Microsoft', 'Khosla Ventures', 'Reid Hoffman']
      }),
      valuation: '$80B+',
      products: JSON.stringify(['ChatGPT', 'GPT-4', 'DALL-E', 'Sora', 'Whisper', 'Codex']),
      controversies: 'Massive data scraping without consent from websites, books, and creative works. Trained on stolen content from millions of creators. Laid off content moderators while expanding AI capabilities. Accused of creating tools that directly replace human writers, artists, and developers.',
      layoffs: JSON.stringify([
        {
          date: '2023-01',
          count: 50,
          reason: 'Content moderation team replaced by AI',
          source: 'https://example.com'
        }
      ]),
      tags: JSON.stringify(['llm', 'image-generation', 'code-generation', 'chatbot', 'data-scraping', 'controversy', 'billionaire-owned', 'major-player']),
      featured: true,
      approved: true,
    },
    {
      name: 'Anthropic',
      description: 'AI safety company founded by former OpenAI employees. Created Claude AI. Despite "safety" branding, still trains on scraped data and competes with human creators.',
      website: 'https://anthropic.com',
      founders: JSON.stringify(['Dario Amodei', 'Daniela Amodei']),
      ceo: 'Dario Amodei',
      foundedYear: 2021,
      funding: JSON.stringify({
        total: '$7.3B',
        latestRound: '$4B from Amazon',
        investors: ['Amazon', 'Google', 'Salesforce']
      }),
      valuation: '$18B',
      products: JSON.stringify(['Claude', 'Claude API']),
      controversies: 'Despite "AI safety" messaging, still relies on data scraping. Funded by Amazon and Google, two of the largest tech companies. Creates tools that compete with human writers and researchers.',
      tags: JSON.stringify(['llm', 'chatbot', 'data-scraping', 'billionaire-owned', 'major-player']),
      featured: true,
      approved: true,
    },
    {
      name: 'Midjourney',
      description: 'AI image generation company that creates images from text prompts. Trained on millions of images scraped without permission from artists worldwide.',
      website: 'https://midjourney.com',
      founders: JSON.stringify(['David Holz']),
      ceo: 'David Holz',
      foundedYear: 2022,
      funding: 'Undisclosed',
      products: JSON.stringify(['Midjourney AI']),
      controversies: 'Trained entirely on scraped images from artists without consent. Directly competes with and replaces human illustrators, graphic designers, and artists. Refuses to disclose training data sources. Multiple lawsuits from artists.',
      tags: JSON.stringify(['image-generation', 'data-scraping', 'controversy', 'major-player']),
      featured: true,
      approved: true,
    },
    {
      name: 'Google (AI Division)',
      description: 'Google\'s AI division responsible for Gemini, Bard, and other AI systems. One of the largest data scrapers on the internet, using YouTube, Google Books, and web content without proper consent.',
      website: 'https://ai.google',
      founders: JSON.stringify(['Larry Page', 'Sergey Brin']),
      ceo: 'Sundar Pichai',
      foundedYear: 1998,
      funding: 'Public company',
      valuation: '$1.5T+',
      products: JSON.stringify(['Gemini', 'Bard', 'Google Search AI', 'YouTube AI', 'Imagen']),
      controversies: 'Scraped YouTube videos, Google Books, and entire web without consent. Used copyrighted material in training. Massive layoffs while investing billions in AI. Surveillance capitalism model.',
      layoffs: JSON.stringify([
        {
          date: '2023-01',
          count: 12000,
          reason: 'Restructuring to focus on AI',
          source: 'https://example.com'
        },
        {
          date: '2024-01',
          count: 1200,
          reason: 'AI automation replacing workers',
          source: 'https://example.com'
        }
      ]),
      tags: JSON.stringify(['llm', 'image-generation', 'chatbot', 'surveillance', 'data-scraping', 'layoffs', 'billionaire-owned', 'major-player']),
      featured: true,
      approved: true,
    },
    {
      name: 'Meta (AI Research)',
      description: 'Meta\'s AI division creating LLaMA, image generation tools, and AI systems. Uses Facebook and Instagram user data, along with scraped web content.',
      website: 'https://ai.meta.com',
      founders: JSON.stringify(['Mark Zuckerberg']),
      ceo: 'Mark Zuckerberg',
      foundedYear: 2004,
      funding: 'Public company',
      valuation: '$1T+',
      products: JSON.stringify(['LLaMA', 'Llama 2', 'Image Generation', 'Code Llama']),
      controversies: 'Uses user data from Facebook and Instagram without explicit consent for AI training. Scraped web content. Surveillance and data collection on unprecedented scale. Multiple privacy violations.',
      layoffs: JSON.stringify([
        {
          date: '2023-11',
          count: 11000,
          reason: 'AI investment and restructuring',
          source: 'https://example.com'
        }
      ]),
      tags: JSON.stringify(['llm', 'image-generation', 'surveillance', 'data-scraping', 'layoffs', 'billionaire-owned', 'major-player']),
      featured: true,
      approved: true,
    },
    {
      name: 'Stability AI',
      description: 'Creator of Stable Diffusion, an open-source image generation model. Despite being "open", still trained on scraped data without consent.',
      website: 'https://stability.ai',
      founders: JSON.stringify(['Emad Mostaque']),
      ceo: 'Emad Mostaque',
      foundedYear: 2020,
      funding: '$101M',
      products: JSON.stringify(['Stable Diffusion', 'Stable Diffusion XL', 'StableLM']),
      controversies: 'Trained on LAION dataset containing billions of scraped images without permission. Multiple lawsuits from artists. Despite "open source" claims, still based on stolen content.',
      tags: JSON.stringify(['image-generation', 'llm', 'data-scraping', 'controversy']),
      approved: true,
    },
  ]

  for (const company of companies) {
    // Check if company already exists by name
    const existing = await prisma.company.findFirst({
      where: { name: company.name },
    })

    if (!existing) {
      await prisma.company.create({
        data: company,
      })
      console.log(`Created company: ${company.name}`)
    } else {
      console.log(`Company already exists: ${company.name}`)
    }
  }

  // Seed news sources
  const newsSources = [
    {
      name: 'TechCrunch AI',
      url: 'https://techcrunch.com/tag/artificial-intelligence/feed/',
      type: 'rss',
      enabled: true,
    },
    {
      name: 'The Verge AI',
      url: 'https://www.theverge.com/ai-artificial-intelligence/rss/index.xml',
      type: 'rss',
      enabled: true,
    },
    {
      name: 'Ars Technica AI',
      url: 'https://feeds.arstechnica.com/arstechnica/index/category/artificial-intelligence',
      type: 'rss',
      enabled: true,
    },
  ]

  for (const source of newsSources) {
    // Check if news source already exists by URL
    const existing = await prisma.newsSource.findFirst({
      where: { url: source.url },
    })

    if (!existing) {
      await prisma.newsSource.create({
        data: source,
      })
      console.log(`Created news source: ${source.name}`)
    } else {
      console.log(`News source already exists: ${source.name}`)
    }
  }

  // Seed resources
  const resources = [
    {
      title: 'Cara.app',
      description: 'Portfolio platform for artists that actively blocks AI scrapers and protects creators\' work from unauthorized AI training.',
      url: 'https://cara.app',
      category: 'website',
      tags: JSON.stringify(['protection', 'privacy']),
      featured: true,
      approved: true,
    },
    {
      title: 'r/antiai',
      description: 'Reddit community dedicated to discussing anti-AI efforts, sharing resources, and organizing resistance against unauthorized AI data scraping.',
      url: 'https://reddit.com/r/antiai',
      category: 'community',
      tags: JSON.stringify(['advocacy', 'education']),
      featured: false,
      approved: true,
    },
    {
      title: 'Butlerian Jihad',
      description: 'An anti-AI and privacy focused financial planner and ledger.',
      url: 'https://butlerianjihad.io',
      category: 'website',
      tags: JSON.stringify(['education', 'advocacy']),
      featured: false,
      approved: true,
    },
    {
      title: 'Nightshade',
      description: 'A tool from the University of Chicago that "poisons" images to disrupt AI training, helping artists protect their work from being used without consent.',
      url: 'https://nightshade.cs.uchicago.edu/',
      category: 'tool',
      tags: JSON.stringify(['protection']),
      featured: true,
      approved: true,
    },
  ]

  for (const resource of resources) {
    // Check if resource already exists by URL
    const existing = await prisma.resource.findFirst({
      where: { url: resource.url },
    })

    if (!existing) {
      await prisma.resource.create({
        data: resource,
      })
      console.log(`Created resource: ${resource.title}`)
    } else {
      console.log(`Resource already exists: ${resource.title}`)
    }
  }

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


