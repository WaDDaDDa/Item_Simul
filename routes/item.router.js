import express from "express";
import bcrypt from "bcrypt";
import { prisma } from "../utils/prisma/index.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config(); // .env 파일에 있는 내용을 불러옵니다.
const router = express.Router(); // express.Router()를 이용해 라우터를 생성합니다.

// 아이템 생성 API
router.post("/item", async (req, res) => {
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

const SECRET_KEY = process.env.SECRET_KEY; // 엑세스 토큰을 서명할 비밀키

// JWT 인증 미들웨어
const jwtMiddle = (req, res, next) => {
  const token = req.cookies.token; // 쿠키에서 JWT 토큰 추출

  if (!token) {
    return next();
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return next();
    }

    req.user = user; // 유효한 토큰일 경우 사용자 정보 저장
    next(); // 다음 미들웨어 또는 라우트로 이동
  });
};

export default router;
