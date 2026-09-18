(function (root, factory) {
  const food = typeof module === 'object' && module.exports ? require('./food-data.js') : root.SPB_FOOD;
  const visit = typeof module === 'object' && module.exports ? require('./visit-data.js') : root.VISIT_DATA;
  const data = factory(food || [], visit?.spb || {});
  if (typeof module === 'object' && module.exports) module.exports = data;
  else root.SPB_DATA = data;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (foodPlaces, visitInfo) {
  const places = [
    { id: 'hermitage', name: '冬宫', ru: 'Государственный Эрмитаж', address: 'Дворцовая площадь, 2, Санкт-Петербург', category: 'museum', area: 'center', tag: '艺术与宫殿', time: '建议半天', intro: '把半天留给冬宫。挑出最想看的展厅，再走到宫殿广场，慢慢认识这座城市。', note: '提前核对参观日期、入口与票种；大型博物馆适合单独留出时间。', source: 'https://www.hermitagemuseum.org/', sourceLabel: '冬宫官网' },
    { id: 'peterhof', name: '夏宫', ru: 'Петергоф', address: 'Разводная улица, 2, Петергоф', category: 'palace', area: 'outside', tag: '花园与喷泉', time: '建议一天', intro: '把花园、喷泉与芬兰湾一起留给这一天。往返市区需要时间，行程可以从容一些。', note: '喷泉、花园与水上交通有季节安排，请按具体出行日期核对官网。', source: 'https://peterhofmuseum.ru/', sourceLabel: '夏宫官网' },
    { id: 'catherine', name: '叶宫', ru: 'Екатерининский дворец', address: 'Садовая улица, 7, Пушкин', category: 'palace', area: 'outside', tag: '宫殿与琥珀厅', time: '建议一天', intro: '去普希金市看叶卡捷琳娜宫。宫殿之外，也给花园和往返路程留些时间。', note: '宫殿、花园及不同参观项目的票务安排请以官网为准。', source: 'https://tzar.ru/', sourceLabel: '皇村博物馆官网' },
    { id: 'kazan', name: '喀山教堂', ru: 'Казанский собор', address: 'Казанская площадь, 2, Санкт-Петербург', category: 'landmark', area: 'center', tag: '城市地标', time: '建议 30–45 分钟', intro: '从涅瓦大街走到柱廊前，再去对面的书之家。两处可以安排在同一段散步里。', note: '教堂有宗教活动，内部参观以现场安排为准。', source: 'https://kazansky-spb.ru/', sourceLabel: '喀山教堂官网' },
    { id: 'bronze', name: '青铜骑士像', ru: 'Медный всадник', address: 'Сенатская площадь, Санкт-Петербург', category: 'landmark', area: 'center', tag: '涅瓦河畔', time: '建议 20–30 分钟', intro: '在元老院广场看看彼得大帝的骑马像，沿涅瓦河走一段，再继续去以撒教堂。', note: '室外停留点，可以根据风雨和体力灵活缩短。', source: 'https://visit-petersburg.ru/en/leisure/places/', sourceLabel: '彼得堡旅游资料' },
    { id: 'aurora', name: '阿芙乐尔号', ru: 'Крейсер Аврора', address: 'Петроградская набережная, Санкт-Петербург', category: 'museum', area: 'river', tag: '历史与河岸', time: '建议 1–1.5 小时', intro: '沿河走到阿芙乐尔号前，看看这艘历史军舰。可以与彼得保罗要塞安排在同一天。', note: '外观拍照和登舰参观是不同体验，登舰前核对开放与票务。', source: 'https://navalmuseum.ru/', sourceLabel: '中央海军博物馆官网' },
    { id: 'blood', name: '滴血教堂', ru: 'Спас на Крови', address: 'набережная канала Грибоедова, 2Б, Санкт-Петербург', category: 'landmark', area: 'center', tag: '马赛克与运河', time: '建议 45–90 分钟', intro: '沿格里博耶多夫运河走到彩色穹顶下。对建筑和艺术感兴趣，可以留时间看看内部马赛克。', note: '内部参观需核对博物馆开放时间与票务。', source: 'https://cathedral.ru/', sourceLabel: '教堂博物馆官网' },
    { id: 'isaac', name: '以撒教堂', ru: 'Исаакиевский собор', address: 'Исаакиевская площадь, 4, Санкт-Петербург', category: 'landmark', area: 'center', tag: '建筑与城市视野', time: '建议 1–2 小时', intro: '看看金色穹顶下的教堂内部，也可以按体力选择柱廊。与青铜骑士像相邻，适合连着逛。', note: '内部与柱廊请分别核对票种；登高安排随天气调整。', source: 'https://cathedral.ru/', sourceLabel: '教堂博物馆官网' },
    { id: 'books', name: '书之家', ru: 'Дом книги', address: 'Невский проспект, 28, Санкт-Петербург', category: 'life', area: 'center', tag: '书店与建筑', time: '建议 30–60 分钟', intro: '走进辛格大楼里的书店，翻翻明信片和画册。门外就是涅瓦大街，适合当作散步中的停留点。', note: '书店、建筑外观与消费项目可按兴趣自由选择。', source: 'https://spbdk.ru/', sourceLabel: '书之家官网' },
    { id: 'park300', name: '300 周年公园', ru: 'Парк 300-летия Санкт-Петербурга', address: 'Приморский проспект, 74, Санкт-Петербург', category: 'nature', area: 'coast', tag: '芬兰湾海风', time: '建议 1–2 小时', intro: '给芬兰湾留一个下午。开阔的海岸和城市天际线，让旅行从宫殿与博物馆切换到海边。', note: '离传统市中心较远；海边风力和体感随日期变化，按当天预报安排。', source: 'https://visit-petersburg.ru/en/leisure/places/', sourceLabel: '彼得堡旅游资料' },
    { id: 'literary', name: '文学咖啡馆', ru: 'Литературное кафе', address: 'Невский проспект, 18, Санкт-Петербург', category: 'life', area: 'center', tag: '文学与午后', time: '建议 1 小时', intro: '在涅瓦大街给自己留一段坐下来的时间。把文学咖啡馆作为一顿饭或一杯咖啡的停留。', note: '餐位、菜单与消费以店家当天信息为准。', source: 'https://visit-petersburg.ru/en/leisure/places/', sourceLabel: '彼得堡旅游资料' },
    { id: 'yelagin', name: '耶拉金岛', ru: 'ЦПКиО имени С. М. Кирова', address: 'Елагин остров, Санкт-Петербург', category: 'nature', area: 'island', tag: '岛屿与秋日散步', time: '建议半天', intro: '把节奏放慢，在河道与树荫之间散步。适合加入一趟想多看看城市日常的旅行。', note: '公园、宫殿和园内活动的开放及收费规则可能不同。', source: 'https://elaginpark.org/', sourceLabel: '耶拉金岛公园官网' },
    { id: 'mariinsky', name: '马林斯基剧院', ru: 'Мариинский театр', address: 'Театральная площадь, 1, Санкт-Петербург', category: 'life', area: 'center', tag: '给夜晚一场演出', time: '依所选剧目', intro: '选一场感兴趣的芭蕾、歌剧或音乐会，为旅行留一个剧院之夜。白天安排可以随演出时间调整。', note: '有多个演出场馆；这里定位历史主剧院，最终以票面场馆和地址为准。', source: 'https://www.mariinsky.ru/', sourceLabel: '马林斯基官网' },
    { id: 'fortress', name: '彼得保罗要塞', ru: 'Петропавловская крепость', address: 'Петропавловская крепость, Санкт-Петербург', category: 'museum', area: 'river', tag: '城市的起点', time: '建议 2–3 小时', intro: '从兔子岛认识彼得堡的起点。走城墙边、看河岸，再按兴趣选择教堂或博物馆。', note: '要塞区域和内部各展馆的参观安排不同，请核对想去的项目。', source: 'https://www.spbmuseum.ru/', sourceLabel: '城市历史博物馆官网' },
    { id: 'russian-museum', name: '俄罗斯博物馆', ru: 'Русский музей, Михайловский дворец', address: 'Инженерная улица, 4, Санкт-Петербург', category: 'museum', area: 'center', tag: '俄罗斯绘画与雕塑', time: '建议 2–3 小时', intro: '想多认识俄罗斯艺术，可以把时间留给这里。先看米哈伊洛夫宫的馆藏，再到旁边的花园和运河散步。', note: '这里定位米哈伊洛夫宫主馆。俄罗斯博物馆有多个场馆，请按所选展览核对地址与票种；主馆官网目前列周二休息，出行前复查。', source: 'https://rusmuseum.ru/museums/mikhailovsky-palace/', sourceLabel: '俄罗斯博物馆主馆官网', checkedAt: '2026-09-14', aliases: '俄博 俄国博物馆 国立俄罗斯博物馆 米哈伊洛夫宫 美术馆 Russian Museum' },
    { id: 'mikhailovsky-garden', name: '米哈伊洛夫花园', ru: 'Михайловский сад', address: 'Михайловский сад, Санкт-Петербург', category: 'nature', area: 'center', tag: '滴血教堂旁的城市花园', time: '建议 30–60 分钟', intro: '就在滴血教堂东侧、俄罗斯博物馆旁。看完教堂或展览，可以走进树荫与花园，给密集的市中心游览留一段放松时间。', note: '花园有开放时段和季节养护安排，请按出行日期查看官网，入口以现场为准。', source: 'https://rusmuseum.ru/museums/mikhailovsky-garden/', sourceLabel: '米哈伊洛夫花园官网', checkedAt: '2026-09-14', aliases: '米哈花园 米哈伊洛夫斯基花园 滴血教堂旁边的公园 米哈伊洛夫公园 Mikhailovsky Garden' },
    { id: 'field-mars', name: '战神广场', ru: 'Марсово поле', address: 'Марсово поле, Санкт-Петербург', category: 'nature', area: 'center', tag: '林荫步道与城市纪念地', time: '建议 20–40 分钟', intro: '米哈伊洛夫花园北面的开阔广场，有草地、林荫步道和纪念设施。可接在滴血教堂与花园之后，继续走向涅瓦河畔。', note: '以室外散步停留为主，遇到风雨可缩短时间；与博物馆参观分开预留时长。', source: 'https://en.wikipedia.org/wiki/Field_of_Mars_(Saint_Petersburg)', sourceLabel: '战神广场资料', checkedAt: '2026-09-14', aliases: '马尔斯广场 火星广场 玛尔斯广场 Field of Mars Marsovo Pole' }
  ];
  // Overview coordinates, checked against the linked public geographic records.
  // They locate the attraction, not a specific admission gate or transit stop.
  const coordinates = {
    hermitage: [59.9404, 30.3139, 'https://en.wikipedia.org/wiki/Winter_Palace'],
    peterhof: [59.88444, 29.90889, 'https://en.wikipedia.org/wiki/Peterhof_Palace'],
    catherine: [59.71611, 30.39556, 'https://en.wikipedia.org/wiki/Catherine_Palace'],
    kazan: [59.9343, 30.3245, 'https://en.wikipedia.org/wiki/Kazan_Cathedral,_Saint_Petersburg'],
    bronze: [59.9364, 30.3022, 'https://en.wikipedia.org/wiki/Bronze_Horseman'],
    aurora: [59.95528, 30.33806, 'https://en.wikipedia.org/wiki/Russian_cruiser_Aurora'],
    blood: [59.94000, 30.32861, 'https://en.wikipedia.org/wiki/Church_of_the_Savior_on_Spilled_Blood'],
    isaac: [59.9341, 30.3062, 'https://en.wikipedia.org/wiki/Saint_Isaac%27s_Cathedral'],
    books: [59.93583, 30.32556, 'https://en.wikipedia.org/wiki/Singer_House'],
    park300: [59.98389, 30.1925, 'https://ru.wikipedia.org/wiki/Парк_300-летия_Санкт-Петербурга'],
    literary: [59.936557, 30.318249, 'https://ru.wikipedia.org/wiki/Литературное_кафе_(Санкт-Петербург)'],
    yelagin: [59.97944, 30.26028, 'https://en.wikipedia.org/wiki/Yelagin_Island'],
    mariinsky: [59.925645, 30.295997, 'https://ru.wikipedia.org/wiki/Мариинский_театр'],
    fortress: [59.950, 30.317, 'https://en.wikipedia.org/wiki/Peter_and_Paul_Fortress'],
    'russian-museum': [59.938592, 30.332221, 'https://en.wikipedia.org/wiki/Russian_Museum'],
    'mikhailovsky-garden': [59.93972, 30.33278, 'https://en.wikipedia.org/wiki/Mikhailovsky_Garden'],
    'field-mars': [59.9436, 30.3318, 'https://en.wikipedia.org/wiki/Field_of_Mars_(Saint_Petersburg)']
  };
  places.forEach(p => { p.latLng = coordinates[p.id].slice(0, 2); p.coordinateSource = coordinates[p.id][2]; });
  const attractions = places.slice();
  places.push(...foodPlaces);
  // Common walking clusters, used only to choose the initial navigation mode.
  // These are editorial suggestions, not measured walking distances or times.
  const walkingGroups = [
    ['hermitage', 'literary', 'kazan', 'books', 'blood', 'russian-museum', 'mikhailovsky-garden'],
    ['blood', 'russian-museum', 'mikhailovsky-garden', 'field-mars'],
    ['hermitage', 'literary', 'bronze', 'isaac'],
    ['isaac', 'mariinsky'],
    ['fortress', 'aurora']
  ];
  const presets = {
    short: { label: '3 日 · 市区精华', description: '3 天走市区经典：冬宫与地标、涅瓦大街与花园、要塞与河岸。咖啡馆和晚间演出按兴趣安排。', days: [
      { title: '冬宫与城市地标', places: ['hermitage','bronze','isaac'] },
      { title: '涅瓦大街与城市花园', places: ['literary','books','kazan','blood','mikhailovsky-garden','field-mars'] },
      { title: '河岸历史与剧院之夜', places: ['fortress','aurora','mariinsky'] }
    ] },
    four: { label: '4 日 · 市区与夏宫', description: '3 天市区＋1 天夏宫；更喜欢宫殿内部，可以把夏宫换成叶宫。', days: [
      { title: '冬宫与城市地标', places: ['hermitage','bronze','isaac'] },
      { title: '涅瓦大街与城市花园', places: ['literary','books','kazan','blood','mikhailovsky-garden','field-mars'] },
      { title: '把一天留给夏宫', places: ['peterhof'] },
      { title: '河岸历史与剧院之夜', places: ['fortress','aurora','mariinsky'] }
    ] },
    classic: { label: '5 日 · 市区与双宫', description: '3 天市区＋夏宫、叶宫各 1 天，两座郊外宫殿分开安排。喜欢艺术可选五日「艺术与花园」路线。', days: [
      { title: '冬宫与城市地标', places: ['hermitage','bronze','isaac'] },
      { title: '涅瓦大街与城市花园', places: ['literary','books','kazan','blood','mikhailovsky-garden','field-mars'] },
      { title: '把一天留给夏宫', places: ['peterhof'] },
      { title: '叶宫与皇村', places: ['catherine'] },
      { title: '河岸历史与剧院之夜', places: ['fortress','aurora','mariinsky'] }
    ] },
    art: { label: '5 日 · 艺术与花园', description: '4 天市区＋1 天夏宫。俄罗斯博物馆留半天，与花园和战神广场一起走；夏宫也可换成叶宫。', days: [
      { title: '冬宫与城市地标', places: ['hermitage','bronze','isaac'] },
      { title: '涅瓦大街与运河', places: ['literary','books','kazan','blood'] },
      { title: '俄罗斯艺术与城市花园', places: ['russian-museum','mikhailovsky-garden','field-mars'] },
      { title: '把一天留给夏宫', places: ['peterhof'] },
      { title: '河岸历史与剧院之夜', places: ['fortress','aurora','mariinsky'] }
    ] }
  };
  return {
    city: { id: 'spb', name: '圣彼得堡', shortName: '彼得堡', englishName: 'SAINT PETERSBURG', edition: '01 / 彼得堡', tagline: '宫殿 · 街巷 · 河岸 · 海风', introduction: '从冬宫、涅瓦大街，到城市花园和芬兰湾。', defaultPlace: 'hermitage', storageKey: 'qu-ekankan-spb-plan-v1' },
    places, attractions, foodPlaces, presets, walkingGroups, visitInfo,
    sources: [ ['圣彼得堡旅游信息局','https://visit-petersburg.ru/en/'], ['俄罗斯博物馆与花园','https://rusmuseum.ru/museums/'], ['Russiable 彼得堡旅行指南','https://russiable.com/what-see-do-st-petersburg/'] ],
    categories: [ ['all','全部'], ['food','吃什么'], ['museum','博物馆'], ['landmark','地标'], ['palace','郊外宫殿'], ['life','城市生活'], ['nature','公园海边'] ],
    foodTypes: [ ['all','全部餐饮'], ['restaurant','坐下吃正餐'], ['everyday','日常便餐'], ['chinese','中餐'], ['bakery','面包与早餐'], ['snack','甜点小吃'] ]
  };
});
