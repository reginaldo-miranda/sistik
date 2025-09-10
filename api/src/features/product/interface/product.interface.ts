/**
 * To query all available attributes see https://tiendanube.github.io/api-documentation/resources/product
 */

export interface IProductRequest {
  images: [{ src: string }];
  name: { en?: string; pt?: string; es?: string } | string;
}

export interface IProductResponse extends IProductRequest {
  id: string;
  description?: { en?: string; pt?: string; es?: string } | string;
  price?: string;
  stock?: number;
  published?: boolean;
  free_shipping?: boolean;
  sku?: string;
  brand?: string;
  images?: Array<{ src: string }>;
}
