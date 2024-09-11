// app.js
import express from "express";
import cookieParser from "cookie-parser";
import PostsRouter from "./routes/posts.router.js";
import SignupRouter from "./routes/signup.router.js"
import LoginRouter from "./routes/login.router.js"
import CharacterRouter from "./routes/character.router.js"
import jwt from "jsonwebtoken";
import { prisma } from "./utils/prisma/index.js";
import dotenv from 'dotenv';

dotenv.config(); // .env 파일에 있는 내용을 불러옵니다.

const app = express();
const PORT = 3017;

app.use(express.json());
app.use(cookieParser());
app.use("/api", [PostsRouter, SignupRouter, LoginRouter, CharacterRouter]);

// 'res.cookie()'를 이용하여 쿠키를 할당하는 API
app.get("/set-cookie", (req, res) => {
  let expires = new Date();
  expires.setMinutes(expires.getMinutes() + 60); // 만료 시간을 60분으로 설정합니다.

  res.cookie("name", "sparta", {
    expires: expires,
  });
  return res.end();
});

// 'req.headers.cookie'를 이용하여 클라이언트의 모든 쿠키를 조회하는 API
app.get("/get-cookie", (req, res) => {
  const cookie = req.cookies;
  console.log(cookie); // {name : sparta}
  return res.status(200).json({ cookie });
});

// 세션 만들기
let session = {};
app.get("/set-session", function (req, res, next) {
  // 현재는 sparta라는 이름으로 저장하지만, 나중에는 복잡한 사용자의 정보로 변경될 수 있습니다.
  const name = "sparta";
  const uniqueInt = Date.now();
  // 세션에 사용자의 시간 정보 저장
  session[uniqueInt] = { name };

  res.cookie("sessionKey", uniqueInt);
  return res.status(200).end();
});

// 세션 조회
app.get("/get-session", function (req, res, next) {
  const { sessionKey } = req.cookies;
  // 클라이언트의 쿠키에 저장된 세션키로 서버의 세션 정보를 조회합니다.
  const name = session[sessionKey];
  return res.status(200).json({ name });
});

////////
// res로 쿠키
app.get("/set", (req, res, next) => {
  res.cookie("name", "nodejs");
  return res.status(200).end();
});

app.get("/get", (req, res, next) => {
  const cookies = req.cookies;
  return res.status(200).json({ cookies });
});

// 로그인 API jwt X
// app.post("/login", function (req, res, next) {
//   const user = {
//     userId: 203,
//     email: "aaaa@aaa",
//     name: "TEST",
//   };
//   res.cookie("sparta", user);
//   return res.status(200).end();
// });

// 로그인 API jwt O
app.post('/login', async (req, res, next) => {
  // 사용자 정보
  // jwt에 담을 정보. 민감정보는 담으면 안된다.
  const user = {
    userId: 203,
    email: 'archepro84@gmail.com',
    name: '이용우',
  };

  // 사용자 정보를 JWT로 생성
  const userJWT = jwt.sign(
    user, // user 변수의 데이터를 payload에 할당
    'secretOrPrivateKey', // JWT의 비밀키를 secretOrPrivateKey라는 문자열로 할당
    { expiresIn: '12h' }, // JWT의 인증 만료시간을 1시간으로 설정
  );

  res.cookie("jwt-express", userJWT);
  return res.status(200).end();
  // userJWT 변수를 sparta 라는 이름을 가진 쿠키에 Bearer 토큰 형식으로 할당
  // res.cookie('sparta', `Bearer ${userJWT}`);
  // return res.status(200).end();
});

app.listen(PORT, () => {
  console.log(PORT, "포트로 서버가 열렸어요!");
});
