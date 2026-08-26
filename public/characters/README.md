# キャラクター画像 / 캐릭터 이미지

파일명 규칙: `{직업번호}-{RIASEC코드}.png` (예: `1-IR.png`, `50-AE.png`, `105-IA.png`)

- 직업번호 = `data/careers.json`의 `#`
- RIASEC코드 = 같은 행의 `RIASEC` 값 (대문자 2글자)
- 포맷: PNG (투명 배경), 권장 1024×1024 이상
- 파일이 없으면 `placeholder.svg`가 자동으로 표시된다.

새 이미지를 이 폴더에 넣고 `git push` 하면 Vercel에 바로 반영된다 (정적 파일이라 재빌드 로직 불필요).

전체 파일명 목록은 아래로 생성할 수 있다.

```bash
node -e "require('./data/careers.json').forEach(c=>console.log(\`\${c['#']}-\${c.RIASEC}.png\`))"
```
