// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface StrapiBasicItem extends Record<string, any> {
  __typename: string;
}

export interface StrapiDynamicZoneItem extends StrapiBasicItem {
  [key: string]: StrapiKeys;
}

export type StrapiResponseRoot =
  | StrapiResponseRootSingle
  | StrapiResponseRootArray;

export interface StrapiResponseRootSingle {
  [key: string]: StrapiResponseResultSingle;
}

export interface StrapiResponseRootArray {
  [key: string]: StrapiResponseResults;
}

export interface StrapiItem {
  id: string;
  attributes: {
    [key: string]: StrapiKeys;
  };
}

export interface StrapiResponseResultSingle extends StrapiBasicItem {
  data: StrapiItem;
}

export interface StrapiResponseResultArray extends StrapiBasicItem {
  data: StrapiItem[];
}

export type StrapiResponseResult =
  | StrapiResponseResultSingle
  | StrapiResponseResultArray;

export interface StrapiResponseResults extends StrapiResponseResultArray {
  meta: {
    pagination: StrapiPagination;
  };
}

export interface StrapiPagination {
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
}

export interface StrapiTransformedItems<T extends Record<string, unknown>> {
  data: T[];
  pagination: StrapiPagination;
}

export type StrapiResponse = StrapiResponseResult | StrapiResponseResults;

export type StrapiKeys =
  | string
  | string[]
  | StrapiItem
  | StrapiItem[]
  | StrapiDynamicZoneItem
  | StrapiDynamicZoneItem[];

export type StrapiRecord = Record<string, StrapiKeys>;
