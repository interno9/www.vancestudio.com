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
              const hasImage = Boolean(item?.image)
              const hasVideo = Boolean(item?.video)

              if (!hasImage && !hasVideo) {
                return 'Add either an image or a video.'
              }

              if (hasImage && hasVideo) {
                return 'Use either an image or a video, not both.'
              }

              return true
            }),
          fields: [
            defineField({
              name: 'image',
              title: 'Image',
              type: 'image',
              options: {hotspot: true},
            }),
            defineField({
              name: 'video',
              title: 'Video',
              type: 'file',
              options: {
                accept: 'video/*',
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
              image: 'image',
              videoName: 'video.asset.originalFilename',
            },
            prepare({title, image, videoName}) {
              return {
                title: title || 'Untitled item',
                subtitle: videoName ? `Video: ${videoName}` : 'Image',
                media: image,
              }
            },
          },
        },
      ],
    }),
  ],
})
