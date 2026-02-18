import { defineField, defineType } from "sanity";

export const navContent = defineType({
  name: "navContent",
  title: "Nav",
  type: "document",
  fields: [
    defineField({
      name: "aboutText",
      title: "About Text",
      type: "text",
      rows: 24,
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "aboutText",
    },
    prepare({ title }) {
      return {
        title: "",
      };
    },
  },
});
