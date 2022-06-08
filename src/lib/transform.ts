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

export const defaultPagination: StrapiPagination = {
  page: 0,
  pageSize: 0,
  total: 0,
  pageCount: 0,
};

/**
 * Transform response from Strapi GraphQL for list of Types with pagination.
 *
 * ### Example (es module)
 * ```typescript
 * import { transformResults } from 'strapi-graphql-transform';
 *
 * const { result } = useQuery(DOCUMENTS_QUERY);
 * const { data, pagination } = transformResults<DocumentModel>(result);
 * console.log(data);
 * console.log(pagination);
 * // => [{ ...DocumentModel }, { ...DocumentModel }]
 * // => { page: 1, pageSize: 2, total: 6, pageCount: 3, }
 * ```
 *
 * @param {StrapiResponseRootArray} result - GraphQL result from strapi array query.
 * @returns The `data` as an array of Documents<T> and the `pagination`
 */
export const transformResults = <T extends Record<string, unknown>>(
  result: StrapiResponseRootArray
): {
  data: T[];
  pagination: StrapiPagination;
} => {
  const data: T[] = transformResult<T>(result);
  const pagination: StrapiPagination = transformPagination(result);
  return { data, pagination };
};

/**
 * Transform response from Strapi GraphQL for single Type.
 *
 * ### Example (es module)
 * ```typescript
 * import { transformResult } from 'strapi-graphql-transform';
 *
 * const { result } = useQuery(SINGLE_DOCUMENT_QUERY);
 * const data = transformResult<DocumentModel>(result);
 * console.log(data);
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
    return defaultPagination;
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
  } else if (obj.data) {
    const newObject = {} as T;
    Object.keys(obj.data.attributes).forEach((attr: string): void =>
      transformKey(attr, obj.data as StrapiItem, newObject)
    );
    return newObject;
  } else {
    return {} as T;
  }
}

/** @ignore */
const transformKey = (
  attr: string,
  obj: StrapiItem,
  newObject: Record<string, unknown>
): void => {
  if (!newObject.id && obj.id) {
    newObject.id = obj.id;
  }
  const value: StrapiKeys = obj.attributes[attr];
  execKeyScenarios(attr, value, newObject);
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

export type {
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
};
