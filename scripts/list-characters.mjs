// 필요한 캐릭터 파일명을 뽑고, 아직 없는 것만 표시한다.
//   node scripts/list-characters.mjs          전체 목록
//   node scripts/list-characters.mjs --missing 없는 것만
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const careers = JSON.parse(readFileSync(join(root, 'data/careers.json'), 'utf8'))
const onlyMissing = process.argv.includes('--missing')

let missing = 0
for (const c of careers) {
  const file = `${c['#']}-${c.RIASEC}.png`
  const exists = existsSync(join(root, 'public/characters', file))
  if (!exists) missing += 1
  if (onlyMissing && exists) continue
  console.log(`${exists ? '✓' : ' '} ${file.padEnd(14)} ${c['직업명_JP']}`)
}
console.log(`\n${careers.length - missing}/${careers.length} 준비됨, ${missing}개 필요`)
