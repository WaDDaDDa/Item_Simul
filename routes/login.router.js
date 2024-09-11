import express from 'express';
import bcrypt from 'bcrypt';
import { prisma } from "../utils/prisma/index.js";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

dotenv.config(); // .env 파일에 있는 내용을 불러옵니다.
const router = express.Router(); // express.Router()를 이용해 라우터를 생성합니다.


const SECRET_KEY = process.env.SECRET_KEY;  // 엑세스 토큰을 서명할 비밀키

router.use(cookieParser());

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


    // 쿠키 설정 (HTTP-Only 속성 포함) // res가 두번발생하는것이 아니라 res에 쿠키를 담은것 뿐이다.
    res.cookie('token', token, {
        httpOnly: true,  // 클라이언트 측에서 접근 불가능 (보안)
        secure: process.env.NODE_ENV === 'production',  // HTTPS 연결에서만 전송 (프로덕션 모드에서)
        maxAge: 3600000,  // 쿠키의 만료 시간 (1시간)
      });
    
    // 로그인 성공 응답 (토큰 반환)
    res.status(200).json({ message: "로그인 성공!!", accessToken: token });

  } catch (error) {
    res.status(500).json({ error: "로그인 중 오류가 발생했습니다." });
  }
});

export default router;
