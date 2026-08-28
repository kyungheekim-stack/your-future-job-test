"""
쏘냥이 직업 캐릭터 자동 생성 스크립트
============================================
사용법:
1. pip install openai
2. 이 스크립트와 같은 폴더에 쏘냥이 레퍼런스 이미지를 넣기 (ssonyang.png)
3. API 키 설정 후 실행:
   
   export OPENAI_API_KEY="sk-여기에키붙여넣기"
   python generate_characters.py

4. 생성된 이미지는 ./characters/ 폴더에 저장됨
5. 중간에 끊겨도 다시 실행하면 이미 생성된 건 건너뜀
"""

import os
import base64
import time
import re
from openai import OpenAI

# ═══ 설정 ═══
API_KEY = os.environ.get("OPENAI_API_KEY", "")
REF_IMAGE_PATH = "ssonyang.png"  # 쏘냥이 캐릭터 레퍼런스
STYLE_IMAGE_PATH = "style_ref.png"  # EverQuest 쥐 스타일 레퍼런스
OUTPUT_DIR = "characters"
SLEEP_BETWEEN = 3  # 요청 사이 대기 (초) — 레이트 리밋 방지

# ═══ 105개 프롬프트 (번호-RIASEC, 프롬프트) ═══
PROMPTS = [
("1-IR", "The cat is typing rapidly on a chunky physical keyboard on a desk, wearing a lab coat and VR headset pushed up on its forehead. A crude blocky computer monitor sits on the desk."),
("2-IC", "The cat is pointing excitedly at a blocky bar chart drawn on a whiteboard, wearing glasses and a sweater vest. "),
("3-IS", "The cat is holding up a stop sign toward a small robot, wearing a formal suit with a badge. A scale of justice sits on the desk beside it."),
("4-RI", "The cat is soldering wires on a half-built robot arm, wearing a mechanic's jumpsuit with oil stains. Scattered gears and circuit boards on the floor."),
("5-IC", "The cat is drawing a regression line on a chart drawn on paper with its paw, wearing a hoodie. A laptop and coffee cup sit nearby."),
("6-CI", "The cat is showing flashcards to a small robot pupil, wearing a teacher's outfit. Labels reading 'good' and 'bad' float above sorted image piles."),
("7-IC", "The cat is furiously typing on a keyboard with green code scrolling on dual monitors, wearing a hoodie with the hood up. Energy drink cans stacked beside it."),
("8-AI", "The cat is dragging wireframe boxes on a giant tablet screen with a stylus, wearing a beret and turtleneck. Post-it notes stuck everywhere."),
("9-EA", "The cat is presenting a rising graph on a whiteboard while shouting into a megaphone, wearing a sharp business suit and sunglasses."),
("10-AE", "The cat is filming with a camera on its shoulder while giving a thumbs up, wearing a director's cap. A clapperboard and ring light beside it."),
("11-IS", "The cat is listening to a teddy bear patient's heartbeat with a stethoscope, wearing a white doctor's coat with a head mirror. Medical chart clipboard in the other paw."),
("12-IC", "The cat is measuring powder on a tiny scale and pouring it into a bottle, wearing a pharmacist's white coat. Shelves of colorful medicine bottles behind it."),
("13-EI", "The cat is slamming a paw on a desk while arguing passionately, wearing a suit and tie. A gavel and thick law books stacked beside it."),
("14-RA", "The cat is unrolling a large blueprint on a drafting table, wearing a hard hat and holding a pencil. A small building model sits on the corner of the table."),
("15-SA", "The cat is writing math equations on a chalkboard with chalk, wearing glasses and a cardigan. An apple and textbooks on the desk."),
("16-IR", "The cat is pouring a bubbling liquid from one beaker to another, wearing safety goggles and a lab coat. Colorful explosions of smoke puff out."),
("17-EA", "The cat is running while scribbling in a notepad, wearing a press vest with a 'PRESS' badge. A camera swinging from its neck."),
("18-RI", "The cat is examining a water sample in a test tube near a river, wearing a green hard hat with a leaf logo. A solar panel model under its arm."),
("19-SI", "The cat is taking the temperature of a small plush patient with a thermometer, wearing nurse scrubs and a cap with a red cross."),
("20-SA", "The cat is sitting in a cozy armchair listening attentively, wearing glasses and a cardigan. A tissue box and a notebook on the side table."),
("21-AI", "The cat is placing game pieces on a paper map spread on a table, wearing a gaming headset. Pixel art mushrooms and coins float around."),
("22-AE", "The cat is adjusting faders on a mixing console while bobbing its head, wearing oversized headphones. Musical notes and sound waves float in the air."),
("23-SE", "The cat is speaking into a microphone while listening to a UN-style earpiece, wearing a professional blazer. Speech bubbles in different languages float around."),
("24-IS", "The cat is bandaging a puppy's tiny paw with care, wearing a vet's coat. A pet carrier and pet treats on the exam table."),
("25-AI", "The cat is hanging a framed painting on a gallery wall, wearing a beret and scarf. Other artworks lean against the wall waiting to be placed."),
("26-AE", "The cat is mashing buttons on a game controller in a racing chair, wearing a team jersey with sponsor logos. RGB keyboard and energy drinks beside it."),
("27-AI", "The cat is drawing manga panels on a large digital tablet with a stylus, wearing a beret. Finished comic panels float around showing action scenes."),
("28-AE", "The cat is performing dramatically into a studio microphone with arms raised, wearing headphones. An anime character silhouette on the monitor behind it."),
("29-RI", "The cat is examining a sparkling diamond through a jeweler's loupe, wearing a jeweler's apron. Gemstones scattered on a velvet cloth."),
("30-EI", "The cat is inspecting an antique vase with a monocle, wearing a vintage vest and pocket watch. Old clocks and pottery surround it."),
("31-IR", "The cat is scribbling E=mc² on a chalkboard with wild hair like Einstein, wearing a rumpled lab coat. Atom models orbit around its head."),
("32-IA", "The cat is typing on a vintage typewriter with crumpled paper balls scattered around, wearing reading glasses and a cozy sweater. A steaming coffee mug beside it."),
("33-CE", "The cat is counting stacks of coins behind a bank counter window, wearing a bank uniform with a name tag. A stamp and forms on the desk."),
("34-CE", "The cat is scanning a barcode on a grocery item at a cash register, wearing a store apron and name tag. Shopping bags beside it."),
("35-CE", "The cat is juggling a phone, coffee cup, and stack of folders at once, wearing a neat blouse. A planner and pen on the desk."),
("36-CS", "The cat is stuffing letters into a red mailbox, wearing a postal uniform and cap. A bulging mailbag slung over its shoulder."),
("37-CI", "The cat is punching numbers on a big calculator while flipping through a ledger, wearing glasses and a tie. Stacks of receipts and spreadsheets around."),
("38-AI", "The cat is coloring a poster on a computer with a pen tablet, wearing a trendy black turtleneck. Pantone color swatches scattered around."),
("39-RC", "The cat is pulling a freshly printed sheet from a large printing press, wearing an ink-stained apron. CMYK ink cans beside the machine."),
("40-RC", "The cat is driving a tiny forklift carrying boxes, wearing a safety vest and hard hat. Warehouse shelves stacked with packages behind."),
("41-SE", "The cat is speaking into a headset while typing, wearing a polo shirt. Multiple chat windows open on the monitor screen."),
("42-IA", "The cat is writing with a red pen on a manuscript while checking a thick dictionary, wearing reading glasses. Japanese and English text floats around."),
("43-ES", "The cat is showing a chart with an umbrella icon to a small client cat, wearing a business suit. Insurance documents and a safety net icon beside them."),
("44-RC", "The cat is planting seedlings in soil with muddy paws, wearing a straw hat and overalls. A basket of fresh vegetables beside it."),
("45-RE", "The cat is reeling in a big fish on a fishing rod, struggling and leaning back, wearing a yellow raincoat and boots. Fish jumping out of water."),
("46-RE", "The cat is bottle-feeding a tiny calf, wearing farm overalls and rubber boots. A barn and hay bales in the background."),
("47-RI", "The cat is planting a small tree sapling, wearing a forest ranger uniform and hat. Binoculars and a walkie-talkie on its belt. Tall trees behind."),
("48-RA", "The cat is flipping food in a flaming wok with one paw, wearing a chef's hat and double-breasted jacket. Spices and ingredients flying through the air."),
("49-RA", "The cat is piping frosting onto a tiered wedding cake, wearing a pastry chef's outfit and toque. Macarons, croissants, and pastries displayed around."),
("50-RA", "The cat is sawing a plank of wood on a workbench, wearing a carpenter's apron with tools in the pockets. Wood shavings curling on the floor."),
("51-RC", "The cat is tightening a pipe joint with a massive wrench, wearing work overalls. Water dripping from pipes and a toolbox open beside it."),
("52-RS", "The cat is blasting a fire hose with water spraying powerfully, wearing a firefighter helmet, jacket, and boots. An axe strapped to its back."),
("53-RE", "The cat is blowing a whistle and directing traffic with a baton, wearing a police uniform and peaked cap. A police badge gleaming on its chest."),
("54-RE", "The cat is standing at attention and saluting, wearing camouflage fatigues and a helmet. Dog tags and a canteen on its belt."),
("55-RC", "The cat is running while carrying a tower of stacked delivery boxes that almost topple, wearing a delivery uniform and cap. A hand scanner clipped to its belt."),
("56-RE", "The cat is shoveling cement into a wheelbarrow, wearing a yellow hard hat and reflective vest. Steel beams and bricks stacked nearby."),
("57-AE", "The cat is juggling colorful balls while balancing on a unicycle, wearing a polka-dot clown suit, red nose, and oversized shoes. Confetti flying everywhere."),
("58-RS", "The cat is crossing a finish line with arms raised in triumph, wearing a sports jersey and sneakers. A gold medal bouncing on its chest and a trophy beside it."),
("59-IA", "The cat is mixing essential oils with a glass dropper into a perfume bottle, wearing a fancy silk scarf. Rose petals and lavender sprigs scattered around the work table."),
("60-RA", "The cat is shaping a vase on a spinning pottery wheel with clay-covered paws, wearing a messy apron. Finished pots drying on a shelf behind."),
("61-AS", "The cat is arranging a colorful bouquet in a vase, wearing a gardening apron. Flowers, ribbon, and scissors spread on the work table."),
("62-AS", "The cat is cutting another small cat's hair with scissors in one paw and a comb in the other, wearing a trendy salon apron. A blow dryer and hair products on the counter."),
("63-EC", "The cat is pointing dramatically at a giant tuna while yelling bids, wearing a fish market cap and rubber boots. Price tags flying in the air."),
("64-SR", "The cat is feeding bamboo to a small panda, wearing a zookeeper's khaki uniform and hat. A bucket of animal feed beside it."),
("65-SE", "The cat is gently placing a white flower on a ceremonial stand, wearing a formal black suit. Incense smoke curling gently upward."),
("66-RA", "The cat is carefully painting fine patterns on a lacquer bowl with a tiny brush, wearing traditional Japanese craftsman clothes. Traditional tools lined up neatly."),
("67-RS", "The cat is rappelling down a cliff holding a rescue rope, wearing climbing gear, helmet, and harness. A first aid kit strapped to its back."),
("68-RE", "The cat is swimming underwater with an oxygen tank and mask, wearing a full wetsuit. Fish and bubbles surround it, welding tool in one paw."),
("69-RC", "The cat is gripping a ship's wheel and looking through binoculars, wearing a captain's hat and navy uniform. A nautical map spread open nearby."),
("70-AS", "The cat is gazing into a bright crystal ball with zodiac symbols orbiting around, wearing a starry wizard robe and a pointed hat. Tarot cards spread on the table."),
("71-AS", "The cat is shaking fortune sticks out of a bamboo cylinder, wearing traditional East Asian robes. A yin-yang symbol and I Ching book on the table."),
("72-AE", "The cat is pulling a rabbit out of a top hat with a magic wand, wearing a tuxedo and cape. Playing cards and sparkles flying everywhere."),
("73-RE", "The cat is leaping through a ring of fire, wearing a leather stunt jacket and crash helmet. A movie clapperboard and explosion effects in the background."),
("74-AE", "The cat is stuffing its face with a giant bowl of ramen while a camera and ring light film it. Chopsticks in one paw, thumbs up with the other."),
("75-RE", "The cat is riding a galloping horse in racing position, wearing colorful jockey silks and a helmet. Riding crop in its paw, mud flying."),
("76-EI", "The cat is peering through a magnifying glass at footprints, wearing a trench coat and deerstalker hat. A camera and case files sticking out of its coat pocket."),
("77-RE", "The cat is digging at the base of an oak tree following a truffle-sniffing dog, wearing a rustic vest and boots. A basket with truffles beside it."),
("78-IR", "The cat is drilling an ice core sample from a glacier, wearing an enormous puffy parka, goggles, and thick gloves. A penguin watching curiously beside it."),
("79-RE", "The cat is pulling the flame lever in a hot air balloon basket while looking down, wearing aviator goggles and a scarf blowing in the wind."),
("80-RS", "The cat is walking with a wooden shepherd's crook, leading a flock of fluffy low-poly sheep. Wearing a wool poncho and a floppy hat."),
("81-RA", "The cat is carefully trimming a tiny bonsai tree with miniature scissors, wearing a Japanese gardening apron. A watering can and bonsai pots arranged neatly."),
("82-RA", "The cat is hammering a bright red-hot katana blade on an anvil, wearing a blacksmith's headband and leather apron. Sparks flying, forge fire bright orange."),
("83-SR", "The cat is blowing a whistle and tossing a fish to a jumping dolphin, wearing a wetsuit. Standing at the edge of a pool with a bucket of fish."),
("84-RC", "The cat is testing hot spring water temperature with a thermometer, wearing a traditional Japanese yukata with a towel on its head. Steam rising from the onsen."),
("85-RA", "The cat is carefully pressing a piece of salmon nigiri with both paws behind a wooden sushi counter, wearing a traditional white headband (hachimaki). Fresh fish and wasabi on the counter."),
("86-EI", "The cat is holding a luopan compass and pointing at a miniature room layout, wearing traditional Chinese-style silk clothes. A feng shui bagua map hanging behind."),
("87-IA", "The cat is swirling a glass of red wine and sniffing it elegantly, wearing a sommelier vest with a tastevin chain. Wine bottles in a rack behind."),
("88-EA", "The cat is shaking a cocktail shaker overhead with flair, wearing a vest, bow tie, and rolled-up sleeves. Colorful bottles lined up on the bar behind."),
("89-RI", "The cat is leaning inside an open grand piano adjusting a tuning pin with a wrench, wearing a neat work shirt. A tuning fork on the piano top."),
("90-AS", "The cat is painting a tiny flower design on another cat's nail with a micro brush, wearing a cute apron. UV lamp, nail polish bottles, and rhinestones on the desk."),
("91-RE", "The cat is standing on a jeep pointing at a giraffe in the distance, wearing a safari hat and khaki outfit. Binoculars around its neck and a canteen on its belt."),
("92-IR", "The cat is nearby in zero gravity with arms spread, wearing a full white astronaut suit with a helmet visor up. Earth visible as a small sphere in the background."),
("93-RI", "The cat is operating a robotic claw arm catching nearby space junk, wearing a futuristic space suit. Broken satellites and debris nearby around."),
("94-RE", "The cat is drilling into a bright asteroid rock with a futuristic pickaxe, wearing a heavy-duty space mining suit. Glowing mineral crystals popping out."),
("95-RI", "The cat is adjusting a physical blocky city model showing flood barriers and green roofs, wearing a futuristic architect outfit. A rising sea level indicator beside it."),
("96-IR", "The cat is looking at a tiny mammoth emerging from an incubation pod, wearing a biotech lab coat. A DNA double helix hologram spinning nearby."),
("97-RE", "The cat is steering a ship while a giant net scoops plastic bottles from the ocean, wearing a captain's hat and waterproof jacket. Sea turtles swimming free in the clean water behind."),
("98-RA", "The cat is plating a gourmet dish made of cricket flour pasta on a fancy plate, wearing a chef's outfit. Containers of dried insects and protein bars on the counter."),
("99-SE", "The cat is drawing a life roadmap on a physical blocky timeline showing '20s-30s-40s-100s', wearing a neat blazer. Charts of health, career, and finance beside it."),
("100-AI", "The cat is typing on a keyboard while game NPCs pop out of the screen and come alive, wearing glasses and a hoodie. Speech bubbles with character dialogue nearby around."),
("101-SI", "The cat is carefully organizing physical blocky social media profiles and cloud icons, wearing a formal dark outfit. A digital memorial flower arrangement on the screen."),
("102-SE", "The cat is handing a cup of tea to a small lonely cat in a cozy living room, wearing a casual sweater. Board games and photo albums on the coffee table."),
("103-SA", "The cat is showing a sleep cycle chart to a yawning patient cat, wearing a sleep mask pushed up on its forehead. A cozy pillow, alarm clock, and lavender diffuser beside it."),
("104-SE", "The cat is holding a flag and pointing at a rocket on a launchpad, wearing a space tourism uniform. Luggage with 'MARS' stickers and boarding passes scattered around."),
("105-AE", "The cat is doing a silly pose on stage holding a microphone, wearing a flashy comedy costume with a bow tie. Spotlight shining down, audience silhouettes laughing in the background."),
]

BASE_STYLE = "Two reference images are attached. Image 1 (white cat) = CHARACTER DESIGN to use. Image 2 (dark rat/hamster) = TARGET 3D STYLE to copy exactly. Transform the cat character into a job-themed version, but render it in the EXACT same crude 3D style as the rat — same polygon count, same rough texture quality, same chunky geometry. IMPORTANT: the costume, pose, and items are the main focus. The cat stands upright on 2 hind legs like a chibi mascot character, using its 2 front paws as hands. Total 4 limbs ONLY — 2 legs, 2 arms, absolutely NO extra limbs. The head should be BIGGER than the body — cute super-deformed proportions. After applying the costume and items, render in ULTRA low-poly 3D with ONLY 50-80 total polygons. The body is just 5-6 large flat triangular faces. Legs are simple pointed cones or triangular prisms. Head is a rough angular box shape, NOT round. Every polygon face must be LARGE enough to count by eye. Hard sharp edges between every face — ZERO smooth curves anywhere. Each polygon face has a crude low-resolution texture painted on it — like a rough hand-painted texture stretched across the flat face, slightly blurry and pixelated. Bright cheerful base colors but with visible brushstroke-like texture grain on each face, like PS1 texture mapping. Like the lowest-quality 3D model from a 1996 MMO. Absolutely NOT modern stylized low-poly art. White background, full body, centered."

def main():
    if not API_KEY:
        print("❌ API 키가 설정되지 않았습니다!")
        print("   export OPENAI_API_KEY='sk-여기에키붙여넣기'")
        print("   를 먼저 실행하세요.")
        return

    client = OpenAI(api_key=API_KEY)
    
    # 출력 폴더 생성
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # 레퍼런스 이미지 읽기
    if not os.path.exists(REF_IMAGE_PATH):
        print(f"❌ 쏘냥이 이미지를 찾을 수 없습니다: {REF_IMAGE_PATH}")
        return
    if not os.path.exists(STYLE_IMAGE_PATH):
        print(f"❌ 스타일 레퍼런스 이미지를 찾을 수 없습니다: {STYLE_IMAGE_PATH}")
        print("   EverQuest 쥐 이미지를 style_ref.png로 저장하세요.")
        return
    
    with open(REF_IMAGE_PATH, "rb") as f:
        ref_base64 = base64.b64encode(f.read()).decode()
    with open(STYLE_IMAGE_PATH, "rb") as f:
        style_base64 = base64.b64encode(f.read()).decode()
    
    print(f"🐱 쏘냥이 캐릭터 레퍼런스 로드 완료")
    print(f"🐀 스타일 레퍼런스(쥐) 로드 완료")
    print(f"📦 총 {len(PROMPTS)}개 캐릭터 생성 시작\n")
    
    success = 0
    skip = 0
    fail = 0
    
    for i, (filename, career_prompt) in enumerate(PROMPTS):
        output_path = os.path.join(OUTPUT_DIR, f"{filename}.png")
        
        # 이미 생성된 파일 건너뛰기
        if os.path.exists(output_path):
            print(f"⏭️  [{i+1}/105] {filename}.png — 이미 존재, 건너뜀")
            skip += 1
            continue
        
        full_prompt = f"{BASE_STYLE} {career_prompt}"
        
        print(f"🎨 [{i+1}/105] {filename}.png 생성 중...", end=" ", flush=True)
        
        try:
            response = client.responses.create(
                model="gpt-4o",
                input=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "input_image",
                                "image_url": f"data:image/png;base64,{ref_base64}",
                            },
                            {
                                "type": "input_image",
                                "image_url": f"data:image/png;base64,{style_base64}",
                            },
                            {
                                "type": "input_text",
                                "text": full_prompt,
                            },
                        ],
                    }
                ],
                tools=[{"type": "image_generation", "quality": "medium", "size": "1024x1024"}],
            )
            
            # 이미지 추출
            image_data = None
            for output in response.output:
                if output.type == "image_generation_call":
                    image_data = output.result
                    break
            
            if image_data:
                image_bytes = base64.b64decode(image_data)
                with open(output_path, "wb") as f:
                    f.write(image_bytes)
                print(f"✅ 저장 완료")
                success += 1
            else:
                print(f"⚠️ 이미지 생성 실패 (응답에 이미지 없음)")
                fail += 1
                
        except Exception as e:
            print(f"❌ 에러: {str(e)[:80]}")
            fail += 1
            
            # 레이트 리밋이면 좀 더 기다리기
            if "rate" in str(e).lower():
                print("   ⏳ 레이트 리밋 — 30초 대기 중...")
                time.sleep(30)
        
        # 요청 사이 대기
        time.sleep(SLEEP_BETWEEN)
    
    print(f"\n{'='*40}")
    print(f"🏁 완료!")
    print(f"   ✅ 성공: {success}개")
    print(f"   ⏭️  건너뜀: {skip}개")
    print(f"   ❌ 실패: {fail}개")
    print(f"   📁 저장 위치: ./{OUTPUT_DIR}/")

if __name__ == "__main__":
    main()
