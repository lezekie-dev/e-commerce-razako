import base from './index.js'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'

export default [
  ...base,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { react, 'react-hooks': reactHooks },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
    },
  },
]
