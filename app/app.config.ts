export default defineAppConfig({
  ui: {
    button: {
      defaultVariants: {
        size: 'lg'
      },
      compoundVariants: [
        {
          variant: 'outline',
          class: 'border'
        }
      ]
    }
  }
})
