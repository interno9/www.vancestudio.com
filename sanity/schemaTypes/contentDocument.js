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
            defineField({
              name: 'videoPreviewImage',
              title: 'Video Preview Image',
              type: 'image',
              options: {hotspot: true},
              hidden: ({parent}) => {
                const ref = parent?.file?.asset?._ref || ''
                const ext = ref.split('-').pop()?.toLowerCase()
                const videoExts = ['mp4', 'mov', 'webm', 'm4v', 'avi', 'mkv', 'wmv']
                return !videoExts.includes(ext)
              },
            }),
          ],
          preview: {
            select: {
              title: 'text',
              fileName: 'file.asset.originalFilename',
              mimeType: 'file.asset.mimeType',
              fileUrl: 'file.asset.url',
              videoPreviewImage: 'videoPreviewImage',
            },
            prepare({title, fileName, mimeType, fileUrl, videoPreviewImage}) {
              const fileType = mimeType?.startsWith('video/')
                ? 'Video'
                : mimeType?.startsWith('image/')
                  ? 'Image'
                  : 'File'

              return {
                title: title || 'Untitled item',
                subtitle: fileName ? `${fileType}: ${fileName}` : 'No file selected',
                media:
                  mimeType?.startsWith('video/') && videoPreviewImage
                    ? videoPreviewImage
                    : mimeType?.startsWith('image/') && fileUrl
                      ? () => (
                          <img
                            src={fileUrl}
                            alt={fileName || 'Preview'}
                            style={{width: '100%', height: '100%', objectFit: 'cover'}}
                          />
                        )
                      : undefined,
              }
            },
          },
        },
      ],
    }),
  ],
})
