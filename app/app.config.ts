export default defineAppConfig({
  firebase: {
    emulators: false as boolean | { auth?: boolean; firestore?: boolean },
    webAppConfig: {} as Record<string, string>,
  },
  ui: {
    button: {
      defaultVariants: {
        size: 'lg'
      },
      compoundVariants: [
        {
          variant: 'outline',
          class: 'border'
        },
        {
          variant: 'solid',
          class: 'text-gray-900'
        }
      ]
    }
  }
})
