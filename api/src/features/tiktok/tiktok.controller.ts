import { NextFunction, Request, Response } from "express";
import { StatusCode } from "@utils";
import TikTokService from "./tiktok.service";

class TikTokController {
  /**
   * Busca produtos da Nuvem Shop que estão marcados para exibição
   */
  async getProductsFromNuvemShop(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const products = await TikTokService.getProductsFromNuvemShop(
        +req.params.user_id
      );
      return res.status(StatusCode.OK).json({
        success: true,
        total: products.length,
        products,
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Sincroniza produtos da Nuvem Shop com TikTok Shop
   */
  async syncProductsToTikTok(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const result = await TikTokService.syncProductsToTikTok(
        +req.params.user_id
      );
      
      return res.status(StatusCode.OK).json({
        message: `Sincronização concluída: ${result.success} produtos enviados com sucesso, ${result.failed} falharam`,
        ...result,
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Rota de teste para verificar a integração
   */
  async testIntegration(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      // Produto de teste
      const testProduct = {
        title: "Produto Teste - Nuvem Shop para TikTok",
        description: "Este é um produto de teste da integração Nuvem Shop -> TikTok",
        images: ["https://via.placeholder.com/300x300?text=Produto+Teste"],
        price: 99.99,
        inventory: 10,
        sku: "TEST-001",
        brand: "Teste Brand"
      };

      const result = await TikTokService.sendProductToTikTok(testProduct);
      
      return res.status(StatusCode.OK).json({
        success: result.success,
        message: result.success 
          ? "Teste de integração realizado com sucesso!" 
          : "Falha no teste de integração",
        data: result.data,
        error: result.error,
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Verifica o status da configuração do TikTok
   */
  async checkConfiguration(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const hasToken = !!process.env.TIKTOK_ACCESS_TOKEN;
      const hasClientKey = !!process.env.TIKTOK_CLIENT_KEY;
      const hasClientSecret = !!process.env.TIKTOK_CLIENT_SECRET;
      const hasPartnerId = !!process.env.TIKTOK_PARTNER_ID;
      
      return res.status(StatusCode.OK).json({
        success: true,
        configuration: {
          hasAccessToken: hasToken,
          hasClientKey: hasClientKey,
          hasClientSecret: hasClientSecret,
          hasPartnerId: hasPartnerId,
          isConfigured: hasToken && hasClientKey && hasClientSecret && hasPartnerId,
        },
        message: hasToken && hasClientKey && hasClientSecret && hasPartnerId
          ? "Configuração do TikTok está completa" 
          : "Configuração do TikTok está incompleta. Verifique as variáveis: TIKTOK_ACCESS_TOKEN, TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET, TIKTOK_PARTNER_ID"
      });
    } catch (error: any) {
      next(error);
    }
  }
}

export default new TikTokController();