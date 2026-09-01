"""
캐릭터 파일명 검증 스크립트
careers.json의 RIASEC 코드 vs 실제 파일명 100% 대조
불일치 0건이면 안전!
"""
import os, json

CAREERS_PATH = "data/careers.json"
CHARACTERS_DIR = "public/characters"

with open(CAREERS_PATH, "r", encoding="utf-8") as f:
    careers = json.load(f)

errors = []
ok = 0

print(f"📋 careers.json: {len(careers)}개 직업")
print(f"📁 검증 폴더: {CHARACTERS_DIR}/\n")

for c in careers:
    num = c["#"]
    riasec = c.get("RIASEC", "")
    name = c.get("직업명_KR", "")
    expected_file = f"{num}-{riasec}.png"
    expected_path = os.path.join(CHARACTERS_DIR, expected_file)
    
    if os.path.exists(expected_path):
        print(f"  ✅ #{num} {name} → {expected_file}")
        ok += 1
    else:
        # 혹시 다른 코드로 된 파일이 있는지 찾기
        found = None
        for f_name in os.listdir(CHARACTERS_DIR):
            if f_name.startswith(f"{num}-") and f_name.endswith(".png"):
                found = f_name
                break
        
        if found:
            errors.append(f"❌ #{num} {name}: 있어야 할 파일={expected_file}, 실제 파일={found} → 이름 변경 필요!")
        else:
            errors.append(f"⚠️ #{num} {name}: {expected_file} 파일 자체가 없음")

print(f"\n{'='*50}")
print(f"✅ 일치: {ok}/105")
print(f"❌ 불일치: {len(errors)}/105")

if errors:
    print(f"\n🚨 수정 필요:\n")
    for e in errors:
        print(f"  {e}")
    
    # 자동 수정 여부
    print(f"\n자동으로 파일명을 수정하시겠습니까?")
    answer = input("y/n: ").strip().lower()
    if answer == "y":
        fixed = 0
        for c in careers:
            num = c["#"]
            riasec = c.get("RIASEC", "")
            expected = f"{num}-{riasec}.png"
            expected_path = os.path.join(CHARACTERS_DIR, expected)
            
            if not os.path.exists(expected_path):
                for f_name in os.listdir(CHARACTERS_DIR):
                    if f_name.startswith(f"{num}-") and f_name.endswith(".png"):
                        old_path = os.path.join(CHARACTERS_DIR, f_name)
                        os.rename(old_path, expected_path)
                        print(f"  🔧 {f_name} → {expected}")
                        fixed += 1
                        break
        print(f"\n✅ {fixed}개 파일명 자동 수정 완료!")
    else:
        print("취소됨.")
else:
    print(f"\n🎉 105개 전부 정확! 배포해도 안전합니다!")
