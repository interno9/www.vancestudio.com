// https://www.sanity.io/docs/structure-builder-cheat-sheet
const singletonTypes = new Set(["navContent"]);

export const structure = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Navigation Content")
        .id("navContent")
        .child(
          S.document()
            .schemaType("navContent")
            .documentId("navContent"),
        ),
      ...S.documentTypeListItems().filter(
        (listItem) => !singletonTypes.has(listItem.getId()),
      ),
    ]);
