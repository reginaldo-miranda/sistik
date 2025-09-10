import axios from "axios";
import { tiendanubeApiClient } from "@config";
import { IProductResponse } from "@features/product";

interface ITikTokProduct {
  title: string;
  description: string;
  images: string[];
  price: number;
  inventory: number;
  category_id?: string;
  brand?: string;
  sku?: string;
}

interface ITikTokResponse {
  success: boolean;
  data?: any;
  error?: string;
}

class TikTokService {
  private readonly tiktokApiUrl = "https://business-api.tiktokglobalshop.com";
  private readonly accessToken = process.env.TIKTOK_ACCESS_TOKEN;

  /**
   * Busca produtos da Nuvem Shop que estão marcados para exibição
   * @param user_id ID do usuário na Nuvem Shop
   * @returns Lista de produtos filtrados
   */
  async getProductsFromNuvemShop(user_id: number): Promise<IProductResponse[]> {
    try {
      // Busca todos os produtos da loja
      const allProducts: IProductResponse[] = await tiendanubeApiClient.get(
        `${user_id}/products`
      );

      // Filtra apenas produtos que estão publicados/visíveis
      const visibleProducts = allProducts.filter(
        (product) => product.published === true && product.free_shipping === true
      );

      return visibleProducts;
    } catch (error: any) {
      throw new Error(`Erro ao buscar produtos da Nuvem Shop: ${error.message}`);
    }
  }

  /**
   * Converte produto da Nuvem Shop para formato do TikTok
   * @param nuvemShopProduct Produto da Nuvem Shop
   * @returns Produto formatado para TikTok
   */
  private convertToTikTokFormat(nuvemShopProduct: IProductResponse): ITikTokProduct {
    // Extrai o nome do produto
    let productName = "Produto sem nome";
    if (typeof nuvemShopProduct.name === "string") {
      productName = nuvemShopProduct.name;
    } else if (nuvemShopProduct.name && typeof nuvemShopProduct.name === "object") {
      productName = nuvemShopProduct.name.pt || nuvemShopProduct.name.en || nuvemShopProduct.name.es || "Produto sem nome";
    }

    // Extrai a descrição do produto
    let productDescription = "Sem descrição";
    if (typeof nuvemShopProduct.description === "string") {
      productDescription = nuvemShopProduct.description;
    } else if (nuvemShopProduct.description && typeof nuvemShopProduct.description === "object") {
      const desc = nuvemShopProduct.description as { pt?: string; en?: string; es?: string };
      productDescription = desc.pt || desc.en || desc.es || "Sem descrição";
    }

    return {
      title: productName,
      description: productDescription,
      images: nuvemShopProduct.images?.map(img => img.src) || [],
      price: parseFloat(nuvemShopProduct.price || "0"),
      inventory: nuvemShopProduct.stock || 0,
      sku: nuvemShopProduct.sku,
      brand: nuvemShopProduct.brand
    };
  }

  /**
   * Envia um produto para o TikTok Shop
   * @param product Produto formatado para TikTok
   * @returns Resposta da API do TikTok
   */
  async sendProductToTikTok(product: ITikTokProduct): Promise<ITikTokResponse> {
    try {
      if (!this.accessToken) {
        throw new Error("Token de acesso do TikTok não configurado");
      }

      const response = await axios.post(
        `${this.tiktokApiUrl}/product/add`,
        product,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Sincroniza produtos da Nuvem Shop com TikTok Shop
   * @param user_id ID do usuário na Nuvem Shop
   * @returns Resultado da sincronização
   */
  async syncProductsToTikTok(user_id: number): Promise<{
    total: number;
    success: number;
    failed: number;
    results: Array<{ product: string; success: boolean; error?: string }>;
  }> {
    try {
      // Busca produtos da Nuvem Shop
      const nuvemShopProducts = await this.getProductsFromNuvemShop(user_id);
      
      const results = [];
      let successCount = 0;
      let failedCount = 0;

      // Processa cada produto
      for (const nuvemProduct of nuvemShopProducts) {
        const tiktokProduct = this.convertToTikTokFormat(nuvemProduct);
        const result = await this.sendProductToTikTok(tiktokProduct);
        
        if (result.success) {
          successCount++;
        } else {
          failedCount++;
        }

        results.push({
          product: tiktokProduct.title,
          success: result.success,
          error: result.error,
        });
      }

      return {
        total: nuvemShopProducts.length,
        success: successCount,
        failed: failedCount,
        results,
      };
    } catch (error: any) {
      throw new Error(`Erro na sincronização: ${error.message}`);
    }
  }
}

export default new TikTokService();