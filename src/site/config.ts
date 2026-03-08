import type { SiteConfig } from '~/types/content'

export const siteConfig: SiteConfig = {
  title: 'pi-dal',
  description: 'Notes, experiments, and life updates from pi-dal.',
  url: 'https://pi-dal.com',
  avatar: '/avatar.webp',
  author: {
    name: 'pi-dal',
    handle: 'pi-dal',
  },
  socialLinks: [
    { platform: 'github', url: 'https://github.com/pi-dal' },
    { platform: 'x', url: 'https://x.com/pidal20' },
    { platform: 'photos', url: 'https://photography.pi-dal.com' },
  ],
}
