# strapi-graphql-transform

Transform strapi's graphql responses to a simpler Object structure.

```js
// Response example from Strapi graphql
const StrapiSampleResponse = {
  document: {
    __typename: 'DocumentResponse',
    data: [
      {
        __typename: 'Document',
        id: '2',
        attributes: {
          title: 'Sample title',
          description: 'Sample description',
          tags: ['tag1', 'tag2'],
          author: {
            data: {
              id: '34',
              attributes: {
                name: 'Author',
                roles: ['admin'],
              },
            },
          },
          images: {
            data: [
              {
                id: '54',
                attributes: {
                  src: 'source',
                  alt: 'alt',
                },
              },
              {
                id: '55',
                attributes: {
                  src: 'source',
                  alt: 'alt',
                },
              },
            ],
          },
        },
      },
    ],
    meta: {
      pagination: {
        page: 1,
        pageSize: 2,
        total: 6,
        pageCount: 3,
      },
    },
  },
};

// Transformed object
const TransformedResults = {
  data: [
    {
      id: '2',
      title: 'Sample title',
      description: 'Sample description',
      tags: ['tag1', 'tag2'],
      author: {
        id: '34',
        name: 'Author',
        roles: ['admin'],
      },
      images: [
        {
          id: '54',
          src: 'source',
          alt: 'alt',
        },
        {
          id: '55',
          src: 'source',
          alt: 'alt',
        },
      ],
    },
  ],
  pagination: {
    page: 1,
    pageSize: 2,
    total: 6,
    pageCount: 3,
  },
};
```

### Installation

```bash
npm install --save strapi-graphql-transform

#or

yarn add strapi-graphql-transform
```

### Usage

```typescript
// Multiple responses (find)
import { transformResults } from 'strapi-graphql-transform';

const { result } = useQuery(DOCUMENTS_QUERY);
const { data, pagination } = transformResults<DocumentModel>(result);
console.log(data);
console.log(pagination);
// => [{ ...DocumentModel }, { ...DocumentModel }]
// => { page: 1, pageSize: 2, total: 6, pageCount: 3, }

// Single response (get)
import { transformResult } from 'strapi-graphql-transform';

const { result } = useQuery(DOCUMENTS_QUERY);
const data = transformResult<DocumentModel>(result);
console.log(data);
// => { ...DocumentModel }
```
