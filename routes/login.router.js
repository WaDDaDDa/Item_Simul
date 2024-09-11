import express from 'express';
import bcrypt from 'bcrypt';
import { prisma } from "../utils/prisma/index.js";
import jwt from 'jsonwebtoken';

const router = express.Router(); // express.Router()를 이용해 라우터를 생성합니다.


const SECRET_KEY = "mysecretkey";  // 엑세스 토큰을 서명할 비밀키

router.post('/login', async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { username }
    });

    // 사용자 존재 여부 확인
    if (!user) {
      return res.status(404).json({ error: "존재하지 않는 아이디입니다." });
    }

    // 비밀번호 확인 요청받은 평문 비밀번호와 저장된 해시 비밀번호가 일치하는지 비교하여 true false 반환
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "비밀번호가 일치하지 않습니다." });
    }

    // jwt 토큰에 userid담아 만들기 1시간 유지
    const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });

    // 로그인 성공 응답 (토큰 반환)
    res.status(200).json({ message: "로그인 성공!!", accessToken: token });

  } catch (error) {
    res.status(500).json({ error: "로그인 중 오류가 발생했습니다." });
  }
});

export default router;
