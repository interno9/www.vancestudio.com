import {defineField, defineType} from 'sanity'

export const contentDocument = defineType({
  name: 'contentDocument',
  title: 'Content Document',
  type: 'document',
  fields: [
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'items',
      title: 'Items',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'imageTextItem',
          title: 'Media + Text Item',
          validation: (Rule) =>
            Rule.custom((item) => {
              const hasFile = Boolean(item?.file)

              if (!hasFile) {
                return 'Add a file.'
              }

              return true
            }),
          fields: [
            defineField({
              name: 'file',
              title: 'File',
              type: 'file',
              options: {
                accept: 'image/*,video/*',
              },
            }),
            defineField({
              name: 'text',
              title: 'Text',
              type: 'text',
              rows: 4,
            }),
          ],
          preview: {
            select: {
              title: 'text',
              fileName: 'file.asset.originalFilename',
              mimeType: 'file.asset.mimeType',
            },
            prepare({title, fileName, mimeType}) {
              const fileType = mimeType?.startsWith('video/')
                ? 'Video'
                : mimeType?.startsWith('image/')
                  ? 'Image'
                  : 'File'

              return {
                title: title || 'Untitled item',
                subtitle: fileName ? `${fileType}: ${fileName}` : 'No file selected',
              }
            },
          },
        },
      ],
    }),
  ],
})
