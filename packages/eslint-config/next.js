import base from './index.js'
import next from '@next/eslint-plugin-next'

export default [
  ...base,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { '@next/next': next },
    rules: {
      ...next.configs.recommended.rules,
      ...next.configs['core-web-vitals'].rules,
    },
  },
]
