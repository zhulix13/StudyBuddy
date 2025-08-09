import { Extension } from "@tiptap/core"

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (size: string) => ReturnType
      unsetFontSize: () => ReturnType
    }
  }
}

// Adds a fontSize attribute to the built-in textStyle mark.
export const FontSize = Extension.create({
  name: "fontSize",

  addOptions() {
    return {
      types: ["textStyle"],
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => {
              const style = (element as HTMLElement).style.fontSize
              return style || null
            },
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {}
              return { style: `font-size: ${attributes.fontSize}` }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setFontSize:
        (size: string) =>
        ({ chain }) => {
          return chain().setMark("textStyle", { fontSize: size }).run()
        },
      unsetFontSize:
        () =>
        ({ chain }) => {
          // Remove only the fontSize attribute while keeping others on textStyle
          return chain().setMark("textStyle", { fontSize: null }).removeEmptyTextStyle().run()
        },
    }
  },
})
