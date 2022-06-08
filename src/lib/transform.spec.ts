import test from 'ava';

import type {
  StrapiResponseRootArray,
  StrapiResponseRootSingle,
} from './../types/transform.d';
import { transformResult, transformResults } from './transform';

type Author = {
  name: string;
  roles: string[];
};

type Image = {
  src: string;
  alt: string;
};

type Document = {
  title: string;
  description: string;
  tags: string[];
  author: Author;
  images: Image[];
};

const StrapiSampleDocument = {
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
    dynamicZone: [
      {
        id: '3',
        text: 'Some text',
        __typename: 'ComponentText',
      },
      {
        id: '4',
        scr: 'source',
        __typename: 'ComponentImage',
      },
    ],
  },
};

const TransformedSampleDocument = {
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
  dynamicZone: [
    {
      id: '3',
      text: 'Some text',
      __typename: 'ComponentText',
    },
    {
      id: '4',
      scr: 'source',
      __typename: 'ComponentImage',
    },
  ],
};

const TransformedResults = {
  data: [TransformedSampleDocument, TransformedSampleDocument],
  pagination: {
    page: 1,
    pageSize: 2,
    total: 6,
    pageCount: 3,
  },
};

const StrapiSingleResponse: unknown = {
  document: {
    __typename: 'DocumentResponse',
    data: StrapiSampleDocument,
  },
};

const StrapiMultiResponse: unknown = {
  documents: {
    __typename: 'DocumentsResponse',
    data: [StrapiSampleDocument, StrapiSampleDocument],
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

test('test transformResult', (t) => {
  const transformedData = transformResult<Document>(
    StrapiSingleResponse as StrapiResponseRootSingle
  );
  t.deepEqual(transformedData, TransformedSampleDocument);
});

test('test transformResults', (t) => {
  const transformedData = transformResults<Document>(
    StrapiMultiResponse as StrapiResponseRootArray
  );
  transformedData.data;
  t.deepEqual(transformedData, TransformedResults);
});

test('test pagination error', (t) => {
  const error = t.throws(() =>
    transformResults<Document>(StrapiSingleResponse as StrapiResponseRootArray)
  );
  t.is(error.message, 'No pagination found');
});
