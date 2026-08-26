# 결과 페이지 피그마 코드 레퍼런스

> 이 파일은 피그마에서 추출한 결과 페이지 코드야.
> 클코한테 이 코드를 기반으로 결과 페이지를 교체하라고 지시하면 돼.

## 핵심 차이점 (기존 vs 피그마 시안)

### 가입 전 (미가입 상태)
- 상단: 히어로 카드 (캐릭터 + 직업명 + 희소성) 그대로 보여줌
- 하단: 상세 결과가 **blur 처리** (흐리게) → "登録して詳細を見る" 툴팁 + 가입 버튼
- 가입 버튼: "SOCRA Tutor に登録する" (그라디언트 보라~파랑)

### 가입 후 (가입 완료)
- 상단: 동일
- 하단: blur 해제, 상세 결과 전부 보임
- 섹션 순서 변경:
  - AI타입 + 연봉 (2열) → AI대체확률 → 필요스킬 → 쌓아야할스펙 → 튜터한마디 → 부업추천

## 디자인 수치 (1080px 기준)

### 폰트
- 제목: IBM Plex Sans JP SemiBold 65px, #464A65
- 희소성 뱃지: Inter SemiBold 34px, 흰색, 배경 #3A82DB, 라운드 40
- 별점: Inter SemiBold 50px, #F5B041
- 직업명: Inter SemiBold 45px, 흰색, 배경 그라디언트(#2766C4→#0E2759), 라운드 16
- 직업설명: IBM Plex Sans JP SemiBold 40px, #555, 줄간격 55px
- 섹션 제목: IBM Plex Sans JP SemiBold/Medium 30px, #333
- 본문: IBM Plex Sans JP Regular 26px, #444, letter-spacing -1.04px
- 연봉 숫자: Inter Bold 48px, #333
- AI 대체 퍼센트: Inter Bold 56px, #168852 (초록)

### 색상
- 페이지 배경: 그라디언트 #D1EBFF → #E8F4FF
- 카드: #FFFFFF, 라운드 40, 테두리 흰색 18px
- 캐릭터 영역 배경: 그라디언트 #DADAE2 → #B3E0FF
- 하단 상세 배경: blur(10px) 처리 (가입 전) / blur 없음 (가입 후)
- 각 박스: #FAFAFA, 라운드 28
- 포춘쿠키: 흰색 배경 (#FFFFFF), 라운드 28
- 스킬 칩: 흰색, 테두리 #E0E0E0, 라운드 40
- 투두 넘버: #1B478E, 라운드 20
- 유형 뱃지: #E6F1FB, 라운드 20
- 가입 버튼: 그라디언트 #B7A3FF → #4C9EF3 → #82C0F9, 라운드 34
- Footer: #060E20

### 간격 (px)
- 카드 좌우 마진: 103
- 카드 패딩 하단: 48
- 캐릭터 이미지 높이: 720
- 하단 상세 패딩: 상 56, 좌우 40
- 각 박스 패딩: 32
- 각 박스 간격: 32
- AI타입+연봉 박스 패딩: 28
- 투두 넘버 크기: 40×40
- 부업 아이템 패딩: 상하 16, 좌우 24

### 후광 효과
- 캐릭터 뒤에 원형+방사형 광선 SVG
- 피그마 에셋 URL에서 다운로드 필요 (아래 참조)

## 에셋 URL (7일 유효)

배경 이미지: https://www.figma.com/api/mcp/asset/0ddc14d9-50f4-4d54-afef-b6968fd9b0ec.png
뒤로가기 아이콘: https://www.figma.com/api/mcp/asset/5671b49d-fe7c-4283-a6d4-c76a15b86dda.svg
후광 효과 (원): https://www.figma.com/api/mcp/asset/e8d09a82-1b3a-412b-8e97-4da53a5bd5d7.svg
후광 광선들: 
  https://www.figma.com/api/mcp/asset/e5a20ec2-b3bd-4d6d-9f4f-97dd769ceb3d.svg
  https://www.figma.com/api/mcp/asset/ac283df9-6bd6-4fd3-942e-1cc77428af2a.svg
  https://www.figma.com/api/mcp/asset/b8959512-32dd-47e0-9aa2-c2de591baf45.svg
  https://www.figma.com/api/mcp/asset/73f39d6f-6304-4453-870f-7aa201e3cf74.svg
  https://www.figma.com/api/mcp/asset/0ecbcca9-4633-47e1-ac9d-ed8bec854cc3.svg
  https://www.figma.com/api/mcp/asset/b613a907-90a6-4436-b175-90b911462c10.svg
  https://www.figma.com/api/mcp/asset/6926a517-1f86-4da5-b01c-e14078070332.svg
  https://www.figma.com/api/mcp/asset/a6bdf164-c416-4902-a995-836357a5ce58.svg
  https://www.figma.com/api/mcp/asset/7b60826b-77c2-4ff9-aad7-4eaf2618a198.svg
  https://www.figma.com/api/mcp/asset/0140cdbb-0cbc-40a9-82c9-0f39642e462c.svg
  https://www.figma.com/api/mcp/asset/80c43f49-f588-4845-ba8f-64abd24d418b.svg
로고: https://www.figma.com/api/mcp/asset/89808af2-2a50-49a3-9510-10c569a33970.svg
로고 (푸터): https://www.figma.com/api/mcp/asset/4bfccc4d-6254-4e74-a2fc-434f7710c27c.svg
다운로드 아이콘: https://www.figma.com/api/mcp/asset/a914b8c6-cd15-43b7-aa6c-e079bd5dc919.svg
카카오 공유 아이콘: https://www.figma.com/api/mcp/asset/1165a7c6-e3c9-4d70-9e65-8642322ecf81.png
툴팁 화살표: https://www.figma.com/api/mcp/asset/f011b17a-ee01-496d-a628-ff4396707ea2.svg

## 클코에게 전달할 명령어

"이 파일(figma_result_reference.md)에 있는 디자인 수치와 에셋 URL을 기반으로 결과 페이지를 수정해줘. 
가입 전/가입 후 2개 상태가 있어:
- 가입 전: 상단 히어로 카드는 보이고, 하단 상세 결과는 blur(10px) 처리 + '登録して詳細を見る' 툴팁 + 가입 버튼
- 가입 후: blur 해제, 상세 결과 전부 보임
에셋 URL에서 SVG/PNG 다운로드해서 public/assets/에 저장해.
폰트는 IBM Plex Sans JP, Inter 사용.
1080px 기준 디자인이니 모바일에서는 비례 축소해."
