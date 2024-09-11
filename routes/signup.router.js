import express from 'express';
import bcrypt from 'bcrypt';
import { prisma } from "../utils/prisma/index.js";

const router = express.Router(); // express.Router()를 이용해 라우터를 생성합니다.

// 회원가입 API
router.post('/signup', async (req, res, next) => {
  const { username, password, passwordConfirm, name } = req.body;

  // 길이 검사
  if (username.length < 4) {
    return res.status(400).json({ error: "아이디는 최소 4자 이상이어야 합니다." });
  }
  
  // 전체 문자열이 영어와 숫자로만 구성되어 있는지 확인
  if (!/^[a-zA-Z\d]+$/.test(username)) {
    return res.status(400).json({ error: "아이디는 영어 대소문자와 숫자만 포함할 수 있습니다." });
  }

  // 비밀번호 영어 소대문자 최소 1개 포함
  if (!/[a-zA-Z]/.test(password)) {
    return res.status(400).json({ error: "비밀번호는 최소 하나의 영어 대소문자를 포함해야 합니다." });
  }
  
  // 비밀번호 숫자 포함 여부 검사
  if (!/\d/.test(password)) {
    return res.status(400).json({ error: "비밀번호는 최소 하나의 숫자를 포함해야 합니다." });
  }

  // 비밀번호 6글자 이상
  if (password.length < 6) {
    return res.status(400).json({ error: "비밀번호는 최소 6자 이상이어야 합니다." });
  }
  // 비밀번호확인과 비밀번호 불일치
  if (password !== passwordConfirm) {
    return res.status(400).json({ error: "비밀번호 확인과 일치하지 않습니다." });
  }

  // 아이디 중복 확인
  const existingUser = await prisma.user.findUnique({
    where: { username : username}
  });

  if (existingUser) {
    return res.status(409).json({ error: "이미 사용 중인 아이디입니다." });
  }

  // 비밀번호 해싱
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // User 생성
    await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        name
      }
    });

    res.status(201).json({message: "회원가입 완료!!"});
  } catch (error) {
    res.status(500).json({ error: "회원가입 중 오류가 발생했습니다." });
  }
});

export default router;
