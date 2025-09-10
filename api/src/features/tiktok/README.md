# Integração TikTok Shop - Nuvem Shop

Esta funcionalidade permite sincronizar produtos da Nuvem Shop com o TikTok Shop automaticamente.

## Configuração

### Variáveis de Ambiente

Adicione as seguintes variáveis no arquivo `.env`:

```env
# TikTok Shop Integration Settings
TIKTOK_ACCESS_TOKEN=seu_token_de_acesso_aqui
TIKTOK_PARTNER_ID=7494145869864731987
TIKTOK_CLIENT_KEY=awv1wtxoq2w03dru
TIKTOK_CLIENT_SECRET=gkbWquo52966RuDuMcuxqivCYRBP1bIH
```

## Endpoints Disponíveis

### 1. Verificar Configuração
```
GET /tiktok/config
```
Verifica se todas as variáveis de ambiente estão configuradas corretamente.

**Resposta:**
```json
{
  "success": true,
  "configuration": {
    "hasAccessToken": true,
    "hasClientKey": true,
    "hasClientSecret": true,
    "hasPartnerId": true,
    "isConfigured": true
  },
  "message": "Configuração do TikTok está completa"
}
```

### 2. Teste de Integração
```
GET /tiktok/test
```
Envia um produto de teste para o TikTok Shop para verificar se a integração está funcionando.

### 3. Buscar Produtos da Nuvem Shop
```
GET /:user_id/tiktok/products
```
Busca todos os produtos da Nuvem Shop que estão marcados para exibição (publicados e com frete grátis).

**Parâmetros:**
- `user_id`: ID do usuário/loja na Nuvem Shop

**Resposta:**
```json
{
  "success": true,
  "total": 5,
  "products": [
    {
      "id": "123",
      "name": "Produto Exemplo",
      "price": "99.90",
      "stock": 10,
      "published": true,
      "images": [...]
    }
  ]
}
```

### 4. Sincronizar Produtos com TikTok
```
POST /:user_id/tiktok/sync
```
Sincroniza todos os produtos elegíveis da Nuvem Shop com o TikTok Shop.

**Parâmetros:**
- `user_id`: ID do usuário/loja na Nuvem Shop

**Resposta:**
```json
{
  "success": true,
  "message": "Sincronização concluída: 3 produtos enviados com sucesso, 2 falharam",
  "total": 5,
  "success": 3,
  "failed": 2,
  "results": [
    {
      "product": "Produto A",
      "success": true
    },
    {
      "product": "Produto B",
      "success": false,
      "error": "Erro específico"
    }
  ]
}
```

## Critérios de Seleção de Produtos

Os produtos são sincronizados com o TikTok apenas se:
- ✅ Estão publicados (`published: true`)
- ✅ Têm frete grátis habilitado (`free_shipping: true`)
- ✅ Possuem estoque disponível
- ✅ Têm pelo menos uma imagem

## Formato de Conversão

Os produtos da Nuvem Shop são convertidos para o formato do TikTok da seguinte forma:

| Nuvem Shop | TikTok Shop |
|------------|-------------|
| `name.pt` ou `name` | `title` |
| `description.pt` ou `description` | `description` |
| `images[].src` | `images[]` |
| `price` | `price` |
| `stock` | `inventory` |
| `sku` | `sku` |
| `brand` | `brand` |

## Tratamento de Erros

- **Token inválido**: Verifique se o `TIKTOK_ACCESS_TOKEN` está correto
- **Produto rejeitado**: Verifique se o produto atende aos critérios do TikTok Shop
- **Limite de API**: O TikTok pode ter limites de requisições por minuto

## Logs e Monitoramento

Todos os erros são logados e retornados na resposta da API para facilitar o debugging.