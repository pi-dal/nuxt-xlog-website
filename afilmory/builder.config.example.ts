import { defineBuilderConfig } from '@afilmory/builder'

export default defineBuilderConfig(() => ({
  storage: {
    provider: 's3',
    bucket: 'your-photos-bucket',
    region: 'auto',
    endpoint: 'https://your-account-id.r2.cloudflarestorage.com',
    customDomain: 'https://your-custom-domain.com',
    prefix: 'photos/',
    excludeRegex: '\\.(DS_Store|thumbs\\.db)$',
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
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
