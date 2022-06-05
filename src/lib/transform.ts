import {
  StrapiItem,
  StrapiKeys,
  StrapiPagination,
  StrapiResponseResult,
  StrapiResponseResultArray,
  StrapiResponseResults,
  StrapiResponseResultSingle,
  StrapiResponseRoot,
  StrapiResponseRootArray,
  StrapiResponseRootSingle,
  StrapiTransformedItems,
} from '../types/transform';

/**
 * Transform response from Strapi GraphQL for list of Types with pagination.
 *
 * ### Example (es module)
 * ```typescript
 * import { transformResults } from '@cbtirj/strapi-graphql-transform';
 *
 * const { result } = useQuery(DOCUMENTS_QUERY);
 * const { data, pagination } = transformResults<DocumentModel>(result);
 * // => [{ ...DocumentModel }, { ...DocumentModel }]
 * ```
 *
 * @param {StrapiResponseRootArray} result - GraphQL result from strapi array query.
 * @returns The `data` as an array of Documents<T> and the `pagination`
 */
export const transformResults = <T extends Record<string, unknown>>(
  result: StrapiResponseRootArray
): StrapiTransformedItems<T> => {
  const data: T[] = transformResult<T>(result);
  const pagination: StrapiPagination = transformPagination(result);
  return { data, pagination };
};

/**
 * Transform response from Strapi GraphQL for single Type.
 *
 * ### Example (es module)
 * ```typescript
 * import { transformResult } from '@cbtirj/strapi-graphql-transform';
 *
 * const { result } = useQuery(SINGLE_DOCUMENT_QUERY);
 * const data = transformResult<DocumentModel>(result);
 * // => { ...DocumentModel }
 * ```
 *
 * @param {StrapiResponseRootSingle | StrapiResponseRootArray} result - GraphQL result from strapi array query.
 * @returns The `data` of Document<T>
 */
export function transformResult<T extends Record<string, unknown>>(
  result: StrapiResponseRootSingle
): T;
export function transformResult<T extends Record<string, unknown>>(
  result: StrapiResponseRootArray
): T[];
export function transformResult<T extends Record<string, unknown>>(
  result: StrapiResponseRoot
): T | T[] {
  const firstKey: string = Object.keys(result)[0];
  const data = result[firstKey];
  if (Array.isArray(data.data)) {
    return transformObject<T>(data as StrapiResponseResultArray);
  } else {
    return transformObject<T>(data as StrapiResponseResultSingle);
  }
}

/** @ignore */
const transformPagination = (
  result: StrapiResponseRootArray
): StrapiPagination => {
  const firstKey: string = Object.keys(result)[0];
  if ('meta' in result[firstKey]) {
    const data = result[firstKey] as StrapiResponseResults;
    const pagination: StrapiPagination = data.meta.pagination;
    return pagination;
  } else {
    throw new Error('No pagination found');
  }
};

export function transformObject<T extends Record<string, unknown>>(
  obj: StrapiResponseResultSingle
): T;
export function transformObject<T extends Record<string, unknown>>(
  obj: StrapiResponseResultArray
): T[];
/** @ignore */
export function transformObject<
  T extends Record<string, unknown>,
  G extends StrapiResponseResult
>(obj: G): T | T[] {
  if (Array.isArray(obj.data)) {
    const data: T[] = obj.data.map((o: StrapiItem) => {
      const newObject = {} as T;
      Object.keys(o.attributes).forEach((attr: string): void =>
        transformKey(attr, o, newObject)
      );
      return newObject;
    });
    return data;
  } else {
    const newObject = {} as T;
    Object.keys(obj.data.attributes).forEach((attr: string): void =>
      transformKey(attr, obj.data as StrapiItem, newObject)
    );
    return newObject;
  }
}

/** @ignore */
const transformKey = (
  attr: string,
  obj: StrapiItem | StrapiItem[],
  newObject: Record<string, unknown>
): void => {
  if (attr.includes('__')) {
    return;
  }
  if (Array.isArray(obj)) {
    newObject[attr] = obj.map((a) => {
      return transformObject({ data: a } as StrapiResponseResultSingle);
    });
  } else {
    if (!newObject.id && obj.id) {
      newObject.id = obj.id;
    }
    const value: StrapiKeys = obj.attributes[attr];
    execKeyScenarios(attr, value, newObject);
  }
};

/** @ignore */
const execKeyScenarios = (
  attr: string,
  value: StrapiKeys,
  newObject: Record<string, unknown>
): void => {
  if (typeof value === 'object' && 'data' in value) {
    if (Array.isArray(value.data)) {
      newObject[attr] = transformObject(value as StrapiResponseResultArray);
    } else {
      newObject[attr] = transformObject(value as StrapiResponseResultSingle);
    }
  } else {
    newObject[attr] = value;
  }
};
