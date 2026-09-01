"""
쏘냥이 직업 캐릭터 v4
- 몸 전체 유지 (ssonyang.png)
- 얼굴 변형 금지 (ssonyang_face.png)
- 퀘스트 마커 없음
- 레트로 PS1/복셀 스타일
- 흰 배경 + 소품만
"""
import os, base64, time
from openai import OpenAI

API_KEY = os.environ.get("OPENAI_API_KEY", "")
REF_IMAGE_PATH = "ssonyang.png"
STYLE_IMAGE_PATH = "style_ref.png"
FACE_IMAGE_PATH = "ssonyang_face.png"
OUTPUT_DIR = "characters"
SLEEP_BETWEEN = 3

BASE_STYLE = "Three reference images: Image 1 = cat BODY (use exactly as-is, do not reshape or redesign the body), Image 2 = TARGET ART STYLE to match, Image 3 = cat FACE close-up (copy exactly, zero changes to eyes, nose, whiskers, mouth). Dress the cat in job-appropriate costume and place job-related props around it. DO NOT add any marker, icon, or symbol above the cat's head. Render in retro PS1/voxel game style matching Image 2: chunky 3D geometry, low-res textures, pixel grain. Bright vivid saturated colors. Clean white background, NO environment, NO floor, NO walls. Only the cat + costume + nearby props. NOT modern low-poly art. NOT papercraft."

PROMPTS = [
# ═══ AI 공생형 (1-6) ═══
("1-IR", "The cat wears a lab coat, typing on a chunky retro keyboard. A blocky CRT monitor showing code sits on a small desk beside it. Server rack prop nearby."),
("2-IC", "The cat wears glasses and a sweater vest, pointing at a chunky whiteboard with colorful bar charts. A stack of data printouts and a coffee mug beside it."),
("3-IS", "The cat wears a formal suit with a badge, holding a gavel. A scale of justice and a small robot figurine on the desk prop beside it."),
("4-RI", "The cat wears a mechanic jumpsuit with oil stains, holding a wrench. A half-built robot arm, scattered gears, and circuit boards around it."),
("5-IC", "The cat wears a hoodie, sitting at a laptop showing scatter plots. Coffee cup, sticky notes, and data notebooks piled around."),
("6-CI", "The cat wears a teacher outfit with glasses, holding flashcards labeled GOOD and BAD. A small robot student sits on a tiny chair nearby."),

# ═══ AI 강화형 (7-32) ═══
("7-IC", "The cat wears a hoodie with hood up, typing on a keyboard. Dual CRT monitors show green scrolling code. Energy drink cans stacked high around it."),
("8-AI", "The cat wears a beret and turtleneck, drawing on a big tablet with a stylus. Colorful post-it notes stuck around it. A pen holder and sketchbook nearby."),
("9-EA", "The cat wears a sharp business suit and tie, pointing at a presentation board showing a rising sales graph. A megaphone and briefcase prop."),
("10-AE", "The cat holds a chunky video camera on its shoulder. A director chair with clapperboard, a boom mic, and a spotlight prop around it."),
("11-IS", "The cat wears a white doctor coat with stethoscope, examining a teddy bear patient. Medical clipboard, pill bottles, and an anatomy chart prop."),
("12-IC", "The cat wears a pharmacist coat, measuring powder with a tiny spoon into a jar. Medicine bottles on wooden shelf prop. Mortar and pestle nearby."),
("13-EI", "The cat wears a suit and tie, slamming paw on desk. Thick law books stacked, a gavel, and reading glasses prop."),
("14-RA", "The cat wears a hard hat, unrolling blueprints on a drafting table. A small building model and a pencil holder prop."),
("15-SA", "The cat wears glasses and a cardigan, writing equations on a small chalkboard. An apple, textbooks, and a globe prop."),
("16-IR", "The cat wears safety goggles and lab coat, pouring bubbling liquid between beakers. Test tubes in a rack, Bunsen burner prop. Colorful smoke puffs."),
("17-EA", "The cat wears a press vest with PRESS badge, running with notepad and pen. A camera hanging from neck, newspaper roll prop."),
("18-RI", "The cat wears a green hard hat with leaf logo, holding a water sample test tube. A small solar panel model and potted plant prop."),
("19-SI", "The cat wears nurse scrubs and cap, taking a teddy bear's temperature with thermometer. First aid kit, clipboard, and medicine tray prop."),
("20-SA", "The cat wears glasses and a cozy cardigan, sitting in a small armchair holding a notebook. Tissue box, tea cup, and bookshelf prop."),
("21-AI", "The cat wears a gaming headset, placing tiny game pieces on a paper map. Pixel art mushroom and coin figurines. A game controller prop."),
("22-AE", "The cat wears oversized headphones, adjusting faders on a small mixing console. Musical note props floating. Vinyl records stacked."),
("23-SE", "The cat wears a professional blazer with UN-style earpiece, speaking into a microphone. Small country flags on stands prop."),
("24-IS", "The cat wears a vet coat, bandaging a small puppy's paw. Pet treats, a pet carrier, and medicine bottles prop."),
("25-AI", "The cat wears a beret and scarf, hanging a small framed painting. Other artworks leaning, a paint palette and easel prop."),
("26-AE", "The cat wears a team jersey, mashing buttons on a game controller. A chunky monitor showing a game. RGB keyboard and energy drink prop."),
("27-AI", "The cat wears a beret, drawing manga panels on a big tablet with stylus. Finished comic page props floating. Ink pots nearby."),
("28-AE", "The cat wears headphones, performing dramatically into a studio microphone. A script sheet and soundproof panel prop. Red recording light."),
("29-RI", "The cat wears a jeweler apron, examining a diamond through a loupe. Gemstones scattered on velvet cloth. Tiny tools prop."),
("30-EI", "The cat wears a monocle and vintage vest, inspecting an antique vase. Old clock, pottery, and a magnifying glass prop."),
("31-IR", "The cat wears a rumpled lab coat with wild hair, scribbling E=mc2 on a small chalkboard. Atom model orbiting. Stack of papers prop."),
("32-IA", "The cat wears reading glasses and a cozy sweater, typing on a vintage typewriter. Crumpled paper balls, coffee mug, and stacked books prop."),

# ═══ AI 대체위험형 (33-43) ═══
("33-CE", "The cat wears a bank uniform, counting coin stacks behind a small counter window. Stamp pad, forms, and a name tag prop."),
("34-CE", "The cat wears a store apron and name tag, scanning a grocery item with a barcode reader. Shopping bags and product boxes prop."),
("35-CE", "The cat wears a neat blouse, juggling a phone, coffee cup, and folder stack simultaneously. A planner and pen cup prop."),
("36-CS", "The cat wears a postal uniform and cap, stuffing letters into a small red mailbox. A bulging mailbag and packages prop."),
("37-CI", "The cat wears glasses and tie, punching numbers on a big calculator. Ledger books, receipt stacks, and a green desk lamp prop."),
("38-AI", "The cat wears a black turtleneck, drawing on a pen tablet. Pantone color swatches scattered. A big monitor showing design software prop."),
("39-RC", "The cat wears an ink-stained apron, pulling a sheet from a small printing press. CMYK ink cans and printed posters prop."),
("40-RC", "The cat wears a safety vest and hard hat, driving a tiny forklift carrying boxes. Stacked shipping boxes and a clipboard prop."),
("41-SE", "The cat wears a polo shirt and headset, typing while on a call. A monitor showing chat windows. Notepad prop."),
("42-IA", "The cat wears reading glasses, marking a manuscript with a red pen. Thick dictionaries stacked, tea cup, and bookmarks prop."),
("43-ES", "The cat wears a business suit, showing a chart with umbrella icon to a small client cat across a tiny table. Insurance docs prop."),

# ═══ AI 무관형 — 일반 (44-69) ═══
("44-RC", "The cat wears a straw hat and overalls, planting a seedling with muddy paws. Watering can, vegetable basket, and garden tools prop."),
("45-RE", "The cat wears a yellow raincoat, reeling in a big fish on a rod. A tackle box, net, and bucket of fish prop."),
("46-RE", "The cat wears farm overalls, bottle-feeding a tiny calf. A hay bale, milk bucket, and barn lantern prop."),
("47-RI", "The cat wears a ranger uniform and hat, planting a tree sapling. Binoculars, walkie-talkie, and a watering can prop."),
("48-RA", "The cat wears a chef hat and apron, flipping food in a flaming wok. Spices, vegetables, and a kitchen knife set prop."),
("49-RA", "The cat wears a pastry chef toque, piping frosting on a tiered cake. Macarons, croissants, and a rolling pin prop."),
("50-RA", "The cat wears a carpenter apron, sawing a plank on a workbench. Wood shavings, a hammer, and hand saw prop."),
("51-RC", "The cat wears work overalls, tightening a pipe with a big wrench. Water dripping. Toolbox and pipe pieces prop."),
("52-RS", "The cat wears a firefighter helmet and jacket, blasting a fire hose. An axe, fire extinguisher, and hydrant prop."),
("53-RE", "The cat wears a police uniform and cap, blowing a whistle and holding a baton. A walkie-talkie and badge prop."),
("54-RE", "The cat wears camouflage fatigues and helmet, saluting. Dog tags, canteen, and binoculars prop."),
("55-RC", "The cat wears a delivery uniform and cap, carrying a tower of stacked boxes. A hand scanner and delivery receipt prop."),
("56-RE", "The cat wears a hard hat and reflective vest, shoveling cement. Bricks, steel beams, and a wheelbarrow prop."),
("57-AE", "The cat wears a polka-dot clown suit with red nose, juggling colorful balls. Oversized shoes, a tiny unicycle, and confetti prop."),
("58-RS", "The cat wears a sports jersey and sneakers, holding a trophy overhead. A gold medal, sports ball, and a finish line ribbon prop."),
("59-IA", "The cat wears a silk scarf, mixing oils with a dropper into a perfume bottle. Rose petals, lavender sprigs, and tiny glass bottles prop."),
("60-RA", "The cat wears a messy clay apron, shaping a vase on a pottery wheel. Finished pots and clay tools prop."),
("61-AS", "The cat wears a gardening apron, arranging flowers into a bouquet. Scissors, ribbon, and buckets of flowers prop."),
("62-AS", "The cat wears a salon apron, cutting another small cat's hair with scissors and comb. Hair dryer and product bottles prop."),
("63-EC", "The cat wears a fish market cap, pointing at a giant tuna and shouting. Price tags, styrofoam boxes, and a rubber boot prop."),
("64-SR", "The cat wears a zookeeper khaki uniform, feeding bamboo to a small panda. A bucket of feed and animal treats prop."),
("65-SE", "The cat wears a formal black suit, gently placing a white flower on a small ceremonial stand. Incense stick with smoke curling prop."),
("66-RA", "The cat wears traditional craftsman clothes, painting fine patterns on a lacquer bowl with a tiny brush. Traditional tools lined up prop."),
("67-RS", "The cat wears climbing gear and helmet, holding a rescue rope and carabiner. A first aid kit and ice axe prop."),
("68-RE", "The cat wears a full diving suit with mask and oxygen tank. A welding tool, fins, and underwater camera prop."),
("69-RC", "The cat wears a captain hat and navy uniform, gripping a ship's wheel. A nautical map, compass, and binoculars prop."),

# ═══ AI 무관형 — 이색 (70-92) ═══
("70-AS", "The cat wears a starry wizard robe and pointed hat, gazing into a crystal ball. Tarot cards spread, zodiac chart, and candles prop."),
("71-AS", "The cat wears traditional East Asian robes, shaking fortune sticks from a bamboo cylinder. Yin-yang symbol and I Ching book prop."),
("72-AE", "The cat wears a tuxedo and cape, pulling a rabbit from a top hat. Playing cards, magic wand, and sparkles prop."),
("73-RE", "The cat wears a leather stunt jacket and helmet, mid-leap with arms spread. A movie clapperboard and fire ring prop."),
("74-AE", "The cat holds chopsticks eating from a giant ramen bowl, cheeks full. A camera on tripod and ring light filming. Steam rising prop."),
("75-RE", "The cat wears colorful jockey silks and helmet, riding a small horse figurine. A riding crop and trophy cup prop."),
("76-EI", "The cat wears a trench coat and deerstalker hat, peering through a magnifying glass. Case files, a camera, and footprint clues prop."),
("77-RE", "The cat wears a rustic vest and boots, digging with a small shovel. A truffle-hunting dog figurine and a basket of truffles prop."),
("78-IR", "The cat wears an enormous puffy parka and goggles, holding an ice core sample. A penguin figurine, research equipment, and thermometer prop."),
("79-RE", "The cat wears aviator goggles and a scarf, standing in a hot air balloon basket. A flame burner and sandbag prop."),
("80-RS", "The cat wears a wool poncho and floppy hat, holding a shepherd's crook. Small fluffy sheep figurines gathered around. A bell prop."),
("81-RA", "The cat wears a Japanese gardening apron, trimming a tiny bonsai tree with miniature scissors. A watering can and bonsai pots prop."),
("82-RA", "The cat wears a blacksmith headband and leather apron, hammering a glowing red blade on an anvil. Sparks flying, tongs and forge fire prop."),
("83-SR", "The cat wears a wetsuit, blowing a whistle and tossing a fish. A small dolphin figurine jumping. A bucket and pool lane prop."),
("84-RC", "The cat wears a Japanese yukata with towel on head, testing water with a thermometer. Steam rising. A wooden bucket and bamboo ladle prop."),
("85-RA", "The cat wears a traditional white headband, carefully pressing nigiri sushi with both paws. Fresh fish, wasabi, and a wooden board prop."),
("86-EI", "The cat wears traditional Chinese silk clothes, holding a luopan compass. A bagua chart, feng shui figurines, and incense prop."),
("87-IA", "The cat wears a sommelier vest with tastevin chain, swirling a glass of red wine. Wine bottles, a corkscrew, and a cheese board prop."),
("88-EA", "The cat wears a vest and bow tie, shaking a cocktail shaker overhead. Colorful bottles, cocktail glasses, and a lemon slice prop."),
("89-RI", "The cat wears a neat work shirt, leaning into an open grand piano adjusting pins with a wrench. A tuning fork and sheet music prop."),
("90-AS", "The cat wears a cute apron, painting a tiny flower on another cat's nail with a micro brush. UV lamp, polish bottles, and rhinestones prop."),
("91-RE", "The cat wears a safari hat and khaki outfit, looking through binoculars. A small giraffe figurine, a canteen, and a map prop."),
("92-IR", "The cat wears a white astronaut suit with helmet visor up, floating pose. A small Earth globe, oxygen tank, and space tool prop."),

# ═══ 미래신생형 (93-105) ═══
("93-RI", "The cat wears a futuristic space suit, operating a robotic claw arm. Broken satellite debris, floating bolts, and a control panel prop."),
("94-RE", "The cat wears a heavy mining suit, drilling into a glowing rock with a futuristic pickaxe. Glowing crystals and a moon rover prop."),
("95-RI", "The cat wears a futuristic architect outfit, holding a holographic city blueprint tablet. Flood barrier model and green roof sample prop."),
("96-IR", "The cat wears a biotech lab coat, looking at a tiny mammoth in a glass pod. DNA helix model and petri dishes prop."),
("97-RE", "The cat wears a captain hat and waterproof jacket, holding a ship wheel. A net full of plastic bottles and a sea turtle figurine prop."),
("98-RA", "The cat wears a chef outfit, plating a gourmet dish. Containers labeled CRICKET FLOUR and protein bar boxes prop."),
("99-SE", "The cat wears a neat blazer, drawing on a small whiteboard showing a life timeline 20s-100s. Health and career chart props."),
("100-AI", "The cat wears glasses and hoodie, typing on keyboard. Small NPC game characters standing on the desk coming alive. Dialogue bubble props."),
("101-SI", "The cat wears a formal dark outfit, organizing small holographic profile cards. A digital flower arrangement and cloud icon prop."),
("102-SE", "The cat wears a cozy sweater, handing a tea cup to a small lonely cat. Board games, photo album, and a warm blanket prop."),
("103-SA", "The cat wears a sleep mask pushed up on forehead, holding a sleep chart clipboard. A pillow, alarm clock, and lavender diffuser prop."),
("104-SE", "The cat wears a space tourism uniform, holding a small flag. A rocket model, luggage with MARS sticker, and boarding pass prop."),
("105-AE", "The cat wears a flashy comedy costume with bow tie, holding a microphone doing a silly pose. A spotlight prop and a laughing emoji sign."),
]

def main():
    if not API_KEY:
        print("❌ export OPENAI_API_KEY='sk-...'"); return
    client = OpenAI(api_key=API_KEY)
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    for p in [REF_IMAGE_PATH, STYLE_IMAGE_PATH, FACE_IMAGE_PATH]:
        if not os.path.exists(p): print(f"❌ {p} 없음"); return
    with open(REF_IMAGE_PATH,"rb") as f: ref=base64.b64encode(f.read()).decode()
    with open(STYLE_IMAGE_PATH,"rb") as f: sty=base64.b64encode(f.read()).decode()
    with open(FACE_IMAGE_PATH,"rb") as f: face=base64.b64encode(f.read()).decode()
    print(f"🐱 전신 + 🎮 스타일 + 😺 얼굴 로드 완료")
    print(f"📦 {len(PROMPTS)}개 생성 시작\n")
    ok=skip=fail=0
    for i,(fn,sc) in enumerate(PROMPTS):
        path=os.path.join(OUTPUT_DIR,f"{fn}.png")
        if os.path.exists(path):
            print(f"⏭️ [{i+1}/105] {fn} — 건너뜀"); skip+=1; continue
        print(f"🎨 [{i+1}/105] {fn}...",end=" ",flush=True)
        try:
            r=client.responses.create(model="gpt-4o",input=[{"role":"user","content":[
                {"type":"input_image","image_url":f"data:image/png;base64,{ref}"},
                {"type":"input_image","image_url":f"data:image/png;base64,{sty}"},
                {"type":"input_image","image_url":f"data:image/png;base64,{face}"},
                {"type":"input_text","text":f"{BASE_STYLE} {sc}"},
            ]}],tools=[{"type":"image_generation","quality":"medium","size":"1024x1024"}])
            img=None
            for o in r.output:
                if o.type=="image_generation_call": img=o.result; break
            if img:
                with open(path,"wb") as f: f.write(base64.b64decode(img))
                print("✅"); ok+=1
            else: print("⚠️"); fail+=1
        except Exception as e:
            print(f"❌ {str(e)[:60]}"); fail+=1
            if "rate" in str(e).lower(): print("  ⏳ 30s..."); time.sleep(30)
        time.sleep(SLEEP_BETWEEN)
    print(f"\n{'='*40}\n✅{ok} ⏭️{skip} ❌{fail}\n📁 ./{OUTPUT_DIR}/")

if __name__=="__main__": main()
