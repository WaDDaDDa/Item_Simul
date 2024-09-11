import jwt from 'jsonwebtoken';

// jwt 생성
const token = jwt.sign({ myPayloadData: 1234 }, 'mysecretkey');
console.log(token);


// jwt 페이로드 복호화
const decodedValue = jwt.decode(token);

// 변조되지 않은 데이터인지 검증
// const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJteVBheWxvYWREYXRhIjoxMjM0LCJpYXQiOjE2OTA4NzM4ODV9.YUmYY9aef9HOO8f2d6Umh2gtWRXJjDkzjm5FPhsQEA0";
const decodedValueByVerify = jwt.verify(token, "mysecretkey");

console.log(decodedValueByVerify); // { myPayloadData: 1234, iat: 1690873885 }