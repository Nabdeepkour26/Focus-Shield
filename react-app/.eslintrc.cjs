{
  "root": true,
  "env": {
    "browser": true,
    "es2021": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:react-refresh/recommended"
  ],
  "ignorePatterns": [
    "dist",
    ".eslintrc.cjs"
  ],
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "settings": {
    "react": {
      "version": "18.2"
    }
  },
  "rules": {
    "react-refresh/only-export-components": [
      "warn",
      {
        "allowConstantExport": true
      }
    ],
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "warn",
    "no-unused-vars": [
      "warn",
      {
        "argsIgnorePattern": "^_"
      }
    ]
  }
}
