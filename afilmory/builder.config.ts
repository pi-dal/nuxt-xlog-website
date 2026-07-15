import { defineBuilderConfig } from '@afilmory/builder'

function requireEnv(name: 'R2_ACCESS_KEY_ID' | 'R2_SECRET_ACCESS_KEY'): string {
  const value = process.env[name]

  if (!value)
    throw new Error(`Missing required environment variable: ${name}`)

  return value
}

export default defineBuilderConfig(() => ({
  storage: {
    provider: 's3',
    bucket: 'photography',
    region: 'auto',
    endpoint: 'https://50f43c735bfc5ded3bfb8578b3000169.r2.cloudflarestorage.com',
    customDomain: 'https://photography-source.pi-dal.com',
    prefix: 'photos/',
    excludeRegex: '\\.(DS_Store|thumbs\\.db)$',
    accessKeyId: requireEnv('R2_ACCESS_KEY_ID'),
    secretAccessKey: requireEnv('R2_SECRET_ACCESS_KEY'),
  },
  system: {
    processing: {
      defaultConcurrency: 4,
      enableLivePhotoDetection: true,
      digestSuffixLength: 0,
    },
    observability: {
      showProgress: true,
      showDetailedStats: true,
      logging: {
        verbose: false,
        level: 'info',
        outputToFile: false,
      },
      performance: {
        worker: {
          workerCount: 4,
          workerConcurrency: 2,
          timeout: 30_000,
          useClusterMode: false,
        },
      },
    },
  },
  plugins: [],
}))
