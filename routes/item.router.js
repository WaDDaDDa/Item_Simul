import express from "express";
import bcrypt from "bcrypt";
import { prisma } from "../utils/prisma/index.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config(); // .env 파일에 있는 내용을 불러옵니다.
const router = express.Router(); // express.Router()를 이용해 라우터를 생성합니다.

// 아이템 생성 API
router.post("/item/create", async (req, res) => {
  const { item_name, item_stat, item_price, item_content } = req.body;

  try {
    const newItem = await prisma.item.create({
      data: {
        item_name: item_name,
        item_stat: item_stat, // JSON 형식으로 저장
        item_price: item_price,
        item_content: item_content,
      },
    });

    res
      .status(201)
      .json({ message: "아이템이 성공적으로 생성되었습니다.", newItem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "아이템 생성 중 오류가 발생했습니다." });
  }
});

// 아이템 수정 API (아이템 가격은 수정 불가)
router.put("/item/update/:item_name", async (req, res) => {
  const { item_name } = req.params;
  const { new_item_name, new_item_stat, new_item_content } = req.body;

  try {
    const updatedItem = await prisma.item.update({
      where: { item_name: item_name },
      data: {
        item_name: new_item_name,
        item_stat: new_item_stat, // 기존 능력을 덮어씌움
        item_content: new_item_content,
      },
    });

    res
      .status(200)
      .json({ message: "아이템이 성공적으로 수정되었습니다.", updatedItem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "아이템 수정 중 오류가 발생했습니다." });
  }
});

// 아이템 목록 조회 API
router.get("/item", async (req, res) => {
  try {
    const items = await prisma.item.findMany({
      select: {
        item_name: true,
        item_price: true,
      },
    });

    res.status(200).json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "아이템 목록 조회 중 오류가 발생했습니다." });
  }
});

// 아이템 상세 조회 API
router.get('/item/:item_name', async (req, res) => {
    const { item_name } = req.params;
  
    try {
      const item = await prisma.item.findUnique({
        where: { item_name: item_name },
        select: {
          item_name: true,
          item_stat: true,
          item_price: true,
          item_content: true,
        }
      });
  
      if (!item) {
        return res.status(404).json({ error: '해당 아이템을 찾을 수 없습니다.' });
      }
  
      res.status(200).json(item);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: '아이템 조회 중 오류가 발생했습니다.' });
    }
  });
  

const SECRET_KEY = process.env.SECRET_KEY; // 엑세스 토큰을 서명할 비밀키

export default router;
