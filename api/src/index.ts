/*import express from "express";
import cors from "cors";
import morgan from "morgan";
// @ts-ignore
import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.resolve(".env"),
});

import { AppRoutes } from "@config";
import {
  beforeCheckClientMiddleware,
  errorHandlingMiddleware,
} from "@middlewares";

const port = process.env.PORT || 7200;
const app = express();

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms")
);
app.use(cors());
app.use(beforeCheckClientMiddleware);
app.use(AppRoutes);
app.use(errorHandlingMiddleware);
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
*/


//------------------------------

import express from "express";
import cors from "cors";
import morgan from "morgan";
// @ts-ignore
import dotenv from "dotenv";
import path from "path";
import axios from "axios"; // <-- novo
dotenv.config({
  path: path.resolve(".env"),
});

import { AppRoutes } from "@config";
import {
  beforeCheckClientMiddleware,
  errorHandlingMiddleware,
} from "@middlewares";

const port = process.env.PORT || 7200;
const app = express();

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms")
);
app.use(cors());
app.use(beforeCheckClientMiddleware);
app.use(AppRoutes);

// 🔹 Rota simples para testar integração com TikTok
app.get("/tiktok/test", async (req, res) => {
  try {
    // Exemplo: pegar apenas 1 produto fixo
    const payload = {
      title: "Produto teste",
      description: "Enviado da Nuvemshop para TikTok",
      images: ["https://via.placeholder.com/300"], // imagem fake só pra teste
      price: 99.9,
      inventory: 10,
    };

    const response = await axios.post(
      "https://business-api.tiktokglobalshop.com/product/add",
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.TIKTOK_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({ success: true, data: response.data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.use(errorHandlingMiddleware);

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
