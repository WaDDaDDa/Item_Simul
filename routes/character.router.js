import express from 'express';
import bcrypt from 'bcrypt';
import { prisma } from "../utils/prisma/index.js";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config(); // .env 파일에 있는 내용을 불러옵니다.
const router = express.Router(); // express.Router()를 이용해 라우터를 생성합니다.


const SECRET_KEY = process.env.SECRET_KEY;  // 엑세스 토큰을 서명할 비밀키

// JWT 인증 미들웨어
const jwtMiddle = (req, res, next) => {
    const token = req.cookies.token;  // 쿠키에서 JWT 토큰 추출

    if (!token) {
      return res.status(401).json({ error: '인증 토큰이 없습니다.' });
    }
  
    jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) {
        return res.status(403).json({ error: '유효하지 않은 토큰입니다.' });
      }
  
      req.user = user;  // 유효한 토큰일 경우 사용자 정보 저장
      next();  // 다음 미들웨어 또는 라우트로 이동
    });
  };

// 캐릭터 post = 생성, 캐릭터 get = 캐릭터 조회, 캐릭터 delete = 캐릭터 삭제
router.post('/character', jwtMiddle, async (req, res) => {
    const { name } = req.body;
  
    try {
      // 캐릭터명 중복 확인
      const existingCharacter = await prisma.character.findUnique({
        where: { name }
      });
  
      if (existingCharacter) {
        return res.status(409).json({ error: "이미 존재하는 캐릭터명입니다." });
      }
  
      // JWT 토큰에서 사용자 ID 가져오기
      const userId = req.user.userId;
  
      // 캐릭터 생성 (기본 스탯 및 게임 머니 포함)
      const newCharacter = await prisma.character.create({
        data: {
          name,
          health: 500,
          power: 100,
          money: 10000,
          userId: userId
        }
      });
  
      // 캐릭터 ID를 응답으로 반환
      res.status(201).json({ characterId: newCharacter.id, message: "캐릭터가 성공적으로 생성되었습니다." });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "캐릭터 생성 중 오류가 발생했습니다." });
    }
  });

export default router;
