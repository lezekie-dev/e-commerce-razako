import base from './index.js'

export default [
  ...base,
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
]
