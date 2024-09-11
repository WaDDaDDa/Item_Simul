import express from "express";
import bcrypt from "bcrypt";
import { prisma } from "../utils/prisma/index.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config(); // .env 파일에 있는 내용을 불러옵니다.
const router = express.Router(); // express.Router()를 이용해 라우터를 생성합니다.

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

// 캐릭터 post = 생성, 캐릭터 get = 캐릭터 조회, 캐릭터 delete = 캐릭터 삭제
router.post("/character", jwtMiddle, async (req, res, next) => {
  const { name } = req.body;

  if (req.user === undefined) {
    return res.status(404).json({ message: "로그인 해주세요" });
  }

  try {
    // 캐릭터명 중복 확인
    const findCharacter = await prisma.character.findUnique({
      where: { name },
    });

    if (findCharacter) {
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
        userId: userId,
      },
    });

    // 캐릭터 ID를 응답으로 반환
    res.status(201).json({
      characterId: newCharacter.id,
      message: "캐릭터가 성공적으로 생성되었습니다.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "캐릭터 생성 중 오류가 발생했습니다." });
  }
});

// 삭제
router.delete(
  "/character/delete/:characterName",
  jwtMiddle,
  async (req, res, next) => {
    const { characterName } = req.params;

    if (!characterName) {
      return res
        .status(400)
        .json({ error: "캐릭터 이름이 제공되지 않았습니다." });
    }

    if (req.user === undefined) {
      return res.status(404).json({ message: "로그인 해주세요" });
    }

    try {
      // JWT 토큰에서 사용자 ID 가져오기
      const userId = req.user.userId;

      // 캐릭터명 중복 확인
      const character = await prisma.character.findUnique({
        where: { name: characterName },
      });

      if (!character) {
        return res
          .status(404)
          .json({ error: `${characterName}의 캐릭터는 존재하지 않습니다.` });
      }

      if (character.userId !== userId) {
        return res.status(403).json({
          error: `해당 ${characterName}캐릭터를 삭제할 권한이 없습니다.`,
        });
      }

      // 캐릭터 삭제
      await prisma.character.delete({
        where: { name: characterName },
      });

      res.status(200).json({ message: "캐릭터가 성공적으로 삭제되었습니다." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "캐릭터 삭제에 실패하였습니다." });
    }
  }
);

// 캐릭터 상세 조회 API
// jwtmiddle에서 인증토큰 없는사용자면 respon해버려서 여기까지 못와버린다.
// 방법 1. 다른 router로 관리. 2. 인증실패일경우 바로리스폰하지 않기.
router.get("/character/:characterName", jwtMiddle, async (req, res) => {
  const { characterName } = req.params;

  try {
    // 캐릭터 이름으로 캐릭터 조회
    const character = await prisma.character.findUnique({
      where: { name: characterName },
      select: {
        name: true,
        health: true,
        power: true,
        money: true, // money는 본인 캐릭터일 경우에만 포함
        userId: true, // 캐릭터 소유 여부 확인용으로 포함
      },
    });

    if (!character) {
      return res
        .status(404)
        .json({ error: `${characterName}해당 캐릭터를 찾을 수 없습니다.` });
    }

    // 캐릭터 소유 여부에 따라 응답 데이터 결정
    let response = {
      name: character.name,
      health: character.health,
      power: character.power,
    };

    if (req.user === undefined) {
      return res.status(200).json(response);
    }

    // JWT 토큰에서 사용자 ID 가져오기
    const userId = req.user.userId;

    // jwt통과한 유저와 캐릭터의 유저 비교
    if (character.userId === userId) {
      response.money = character.money;
    }

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "캐릭터 조회 중 오류가 발생했습니다." });
  }
});

export default router;
