import dayjs from 'dayjs'

/**
 * 文字列を指定した長さで区切る
 */
export const truncate = (str: string, len: number, line?: number) => {
  if (!str) return '-'
  if (line) {
    const splits = str.split('\n')
    const lines = splits.length
    if (lines > line) return splits.slice(0, line).join('\n') + '...'
  }
  return str.length <= len ? str : str.substr(0, len) + '...'
}

/**
 * 指定文字で囲まれた文字列をマスキングする
 * [[MASK: text]] -> *****
 */
export const mask = (text: string) => {
  const pattern = /\[\[MASK:\s*(.*?)\]\]/g
  return text.replace(pattern, '*****')
}

/**
 * 指定の日時からどのぐらい経過しているかの文字列を返す
 * ex.) "1日前" "3ヶ月前"
 */
export const getLastModified = (updated: string) => {
  const hour = dayjs().diff(dayjs(updated), 'hour', false)
  const day = dayjs().diff(dayjs(updated), 'day', false)
  const month = dayjs().diff(dayjs(updated), 'month', false)
  const year = dayjs().diff(dayjs(updated), 'year', false)
  if (hour === 0) {
    return 'ちょっと前'
  }
  if (day === 0) {
    return hour + '時間前'
  }
  if (month === 0) {
    return day + '日前'
  }
  if (year === 0) {
    return month + 'ヶ月前'
  }
  return year + '年前'
}

export const randomStr = (length = 4) => {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let string = ''
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length)
    string += characters[randomIndex]
  }
  return string
}

export const getUniqueStr = (strong = 1000) => {
  return (
    new Date().getTime().toString(16) +
    Math.floor(strong * Math.random()).toString(16)
  )
}

/**
 * ランダムで名前を取得
 */
export function randomName() {
  // prettier-ignore
  const myoujiAry = ['佐藤', '鈴木', '高橋', '田中', '渡辺', '伊藤', '山本', '中村', '小林', '加藤', '吉田', '山田', '佐々木', '山口', '斎藤', '松本', '井上', '木村', '林', '清水', '山崎', '森', '阿部', '池田', '橋本', '山下', '石川', '中島', '前田', '藤田', '小川', '後藤', '岡田', '長谷川', '村上', '近藤', '石井', '齊藤', '坂本', '遠藤', '青木', '藤井', '西村', '福田', '太田', '三浦', '岡本', '松田', '中川', '中野', '原田', '小野', '田村', '竹内', '金子', '和田', '中山', '藤原', '石田', '上田', '森田', '原', '柴田', '酒井', '工藤', '横山', '宮崎', '宮本', '内田', '高木', '安藤', '谷口', '大野', '丸山', '今井', '高田', '藤本', '武田', '村田', '上野', '杉山', '増田', '平野', '大塚', '千葉', '久保', '松井', '小島', '岩崎', '桜井', '野口', '松尾', '野村', '木下', '菊地', '佐野', '大西', '杉本', '新井', '浜田', '菅原', '市川', '水野', '小松', '島田', '古川', '小山', '高野', '西田', '菊池', '山内', '西川', '五十嵐', '北村', '安田', '中田', '川口', '平田', '川崎', '飯田', '吉川', '本田', '久保田', '沢田', '辻', '関', '吉村', '渡部', '岩田', '中西', '服部', '樋口', '福島', '川上', '永井', '松岡', '田口', '山中', '森本', '土屋', '矢野', '広瀬', '秋山', '石原', '松下', '大橋', '松浦', '吉岡', '小池', '馬場', '浅野', '荒木', '大久保', '野田', '小沢', '田辺', '川村', '星野', '黒田', '堀', '尾崎', '望月', '永田', '熊谷', '内藤', '松村', '西山', '大谷', '平井', '大島', '岩本', '片山', '本間', '早川', '横田', '岡崎', '荒井', '大石', '鎌田', '成田', '宮田', '小田', '石橋', '篠原', '須藤', '河野', '大沢', '小西', '南', '高山', '栗原', '伊東', '松原', '三宅', '福井', '大森', '奥村', '岡', '内山', '片岡',]
  // prettier-ignore
  const namaeAry = ['大輔', '誠', '直樹', '亮', '剛', '大介', '学', '健一', '健', '哲也', '聡', '健太郎', '洋平', '淳', '竜也', '崇', '翔太', '拓也', '健太', '翔', '達也', '雄太', '翔平', '大樹', '大輔', '和也', '達也', '翔太', '徹', '哲也', '秀樹', '英樹', '浩二', '健一', '博', '博之', '修', '大輝', '拓海', '海斗', '大輔', '大樹', '翔太', '大輝', '翼', '拓海', '直人', '康平', '達也', '駿', '雄大', '亮太', '拓也', '大貴', '亮太', '拓哉', '雄大', '誠', '隆', '茂', '豊', '明', '浩', '進', '勝', '洋子', '恵子', '京子', '幸子', '和子', '久美子', '由美子', '裕子', '美智子', '悦子', '智子', '久美子', '陽子', '理恵', '真由美', '香織', '恵', '愛', '優子', '智子', '裕美', '真由美', 'めぐみ', '美穂', '純子', '美紀', '彩', '美穂', '成美', '沙織', '麻衣', '舞', '愛美', '瞳', '彩香', '麻美', '沙織', '麻衣', '由佳', 'あゆみ', '友美', '麻美', '裕子', '美香', '恵美', '直美', '由美', '陽子', '直子', '未来', '萌', '美咲', '亜美', '里奈', '菜々子', '彩花', '遥', '美咲', '明日香', '真由', '楓', '奈々', '彩花', '優花', '桃子', '美咲', '佳奈', '葵', '菜摘', '桃子', '茜', '明美', '京子', '恵子', '洋子', '順子', '典子',]
  const myouji = myoujiAry[Math.floor(Math.random() * myoujiAry.length)]
  const namae = namaeAry[Math.floor(Math.random() * namaeAry.length)]
  return myouji + ' ' + namae
}
