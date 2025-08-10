import { createConfigForNuxt } from "@nuxt/eslint-config/flat"

export default createConfigForNuxt().append({
  rules: {
    "vue/html-self-closing": [
      "warn",
      {
        html: {
          void: "any",
          normal: "any",
          component: "always",
        },
        svg: "always",
        math: "always",
      },
    ],
  },
})
