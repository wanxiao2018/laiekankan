(function (root, factory) {
  // The browser catalogue is attraction-only. The food fixture is retained for
  // Node-side planner compatibility, but is not shipped into the public UI.
  const browserCatalogueOnly = !(typeof module === 'object' && module.exports);
  const food = browserCatalogueOnly ? [] : require('./food-data.js');
  const visit = typeof module === 'object' && module.exports ? require('./visit-data.js') : root.VISIT_DATA;
  const data = factory(food || [], visit?.spb || {}, browserCatalogueOnly);
  if (typeof module === 'object' && module.exports) module.exports = data;
  else root.SPB_DATA = data;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (foodPlaces, visitInfo, browserCatalogueOnly) {
  const places = [
    { id: 'hermitage', name: '冬宫', ru: 'Государственный Эрмитаж', address: 'Дворцовая площадь, 2, Санкт-Петербург', category: 'museum', area: 'center', tag: '艺术与宫殿', time: '建议半天', intro: '冬宫的宫殿大厅和欧洲绘画馆藏，是彼得堡最值得花时间看的两部分。', note: '提前核对参观日期、入口与票种；大型博物馆适合单独留出时间。', source: 'https://www.hermitagemuseum.org/', sourceLabel: '冬宫官网' },
    { id: 'peterhof', name: '夏宫', ru: 'Петергоф', address: 'Разводная улица, 2, Петергоф', category: 'palace', area: 'outside', tag: '花园与喷泉', time: '建议一天', intro: '夏宫以大型喷泉群和临海花园见长，适合以户外游览为主的一天。', note: '喷泉、花园与水上交通有季节安排，请按具体出行日期核对官网。', source: 'https://peterhofmuseum.ru/', sourceLabel: '夏宫官网' },
    { id: 'catherine', name: '叶宫', ru: 'Екатерининский дворец', address: 'Садовая улица, 7, Пушкин', category: 'palace', area: 'outside', tag: '宫殿与琥珀厅', time: '建议一天', intro: '叶宫的琥珀厅和宫廷室内装饰，是前往皇村的主要看点。', note: '宫殿、花园及不同参观项目的票务安排请以官网为准。', source: 'https://tzar.ru/', sourceLabel: '皇村博物馆官网' },
    { id: 'kazan', name: '喀山教堂', ru: 'Казанский собор', address: 'Казанская площадь, 2, Санкт-Петербург', category: 'landmark', area: 'center', tag: '城市地标', time: '建议 30–45 分钟', intro: '喀山教堂的弧形柱廊是涅瓦大街的标志性景观，对面就是书之家。', note: '教堂有宗教活动，内部参观以现场安排为准。', source: 'https://kazansky-spb.ru/', sourceLabel: '喀山教堂官网' },
    { id: 'bronze', name: '青铜骑士像', ru: 'Медный всадник', address: 'Сенатская площадь, Санкт-Петербург', category: 'landmark', area: 'center', tag: '涅瓦河畔', time: '建议 20–30 分钟', intro: '青铜骑士像是彼得大帝的骑马雕像，位于涅瓦河畔的元老院广场。', note: '室外停留点，可以根据风雨和体力灵活缩短。', source: 'https://visit-petersburg.ru/en/leisure/places/', sourceLabel: '彼得堡旅游资料' },
    { id: 'aurora', name: '阿芙乐尔号', ru: 'Крейсер Аврора', address: 'Петроградская набережная, Санкт-Петербург', category: 'museum', area: 'river', tag: '历史与河岸', time: '建议 1–1.5 小时', intro: '阿芙乐尔号是一艘可登舰参观的历史巡洋舰，适合对海军和俄国历史感兴趣的人。', note: '外观拍照和登舰参观是不同体验，登舰前核对开放与票务。', source: 'https://navalmuseum.ru/', sourceLabel: '中央海军博物馆官网' },
    { id: 'blood', name: '滴血教堂', ru: 'Спас на Крови', address: 'набережная канала Грибоедова, 2Б, Санкт-Петербург', category: 'landmark', area: 'center', tag: '马赛克与运河', time: '建议 45–90 分钟', intro: '滴血教堂以彩色穹顶和内部马赛克闻名，外观和室内都值得看。', note: '内部参观需核对博物馆开放时间与票务。', source: 'https://cathedral.ru/', sourceLabel: '教堂博物馆官网' },
    { id: 'isaac', name: '以撒教堂', ru: 'Исаакиевский собор', address: 'Исаакиевская площадь, 4, Санкт-Петербург', category: 'landmark', area: 'center', tag: '建筑与城市视野', time: '建议 1–2 小时', intro: '以撒教堂的金色穹顶和柱廊观景台，是看建筑与俯瞰市中心的好去处。', note: '内部与柱廊请分别核对票种；登高安排随天气调整。', source: 'https://cathedral.ru/', sourceLabel: '教堂博物馆官网' },
    { id: 'books', name: '书之家', ru: 'Дом книги', address: 'Невский проспект, 28, Санкт-Петербург', category: 'life', area: 'center', tag: '书店与建筑', time: '建议 30–60 分钟', intro: '书之家位于辛格大楼，既能看建筑，也能买书、画册和明信片。', note: '书店、建筑外观与消费项目可按兴趣自由选择。', source: 'https://spbdk.ru/', sourceLabel: '书之家官网' },
    { id: 'park300', name: '300 周年公园', ru: 'Парк 300-летия Санкт-Петербурга', address: 'Приморский проспект, 74, Санкт-Петербург', category: 'nature', area: 'coast', tag: '芬兰湾海风', time: '建议 1–2 小时', intro: '300 周年公园有开阔的芬兰湾海岸，适合看海和城市天际线。', note: '离传统市中心较远；海边风力和体感随日期变化，按当天预报安排。', source: 'https://visit-petersburg.ru/en/leisure/places/', sourceLabel: '彼得堡旅游资料' },
    { id: 'literary', name: '文学咖啡馆', ru: 'Литературное кафе', address: 'Невский проспект, 18, Санкт-Петербург', category: 'life', area: 'center', tag: '文学与午后', time: '建议 1 小时', intro: '文学咖啡馆位于涅瓦大街，适合对文学主题餐厅感兴趣的游客。', note: '餐位、菜单与消费以店家当天信息为准。', source: 'https://visit-petersburg.ru/en/leisure/places/', sourceLabel: '彼得堡旅游资料' },
    { id: 'yelagin', name: '耶拉金岛', ru: 'ЦПКиО имени С. М. Кирова', address: 'Елагин остров, Санкт-Петербург', category: 'nature', area: 'island', tag: '岛屿与公园步道', time: '建议半天', intro: '耶拉金岛以河道、林荫步道和公园为主，适合想少逛展馆、多走户外的人。', note: '公园、宫殿和园内活动的开放及收费规则可能不同。', source: 'https://elaginpark.org/', sourceLabel: '耶拉金岛公园官网' },
    { id: 'mariinsky', name: '马林斯基剧院', ru: 'Мариинский театр', address: 'Театральная площадь, 1, Санкт-Петербург', category: 'life', area: 'center', tag: '芭蕾、歌剧与音乐会', time: '依所选剧目', intro: '马林斯基剧院的主要看点是芭蕾、歌剧和音乐会，值得按感兴趣的剧目选场次。', note: '有多个演出场馆；这里定位历史主剧院，最终以票面场馆和地址为准。', source: 'https://www.mariinsky.ru/', sourceLabel: '马林斯基官网' },
    { id: 'fortress', name: '彼得保罗要塞', ru: 'Петропавловская крепость', address: 'Петропавловская крепость, Санкт-Петербург', category: 'museum', area: 'river', tag: '城市的起点', time: '建议 2–3 小时', intro: '彼得保罗要塞集中了城堡、教堂和历史展馆，还能从河岸看市中心。', note: '要塞区域和内部各展馆的参观安排不同，请核对想去的项目。', source: 'https://www.spbmuseum.ru/', sourceLabel: '城市历史博物馆官网' },
    { id: 'russian-museum', name: '俄罗斯博物馆', ru: 'Русский музей, Михайловский дворец', address: 'Инженерная улица, 4, Санкт-Петербург', category: 'museum', area: 'center', tag: '俄罗斯绘画与雕塑', time: '建议 2–3 小时', intro: '俄罗斯博物馆主馆以俄罗斯绘画和雕塑为主，适合想集中了解本土艺术的人。', note: '这里定位米哈伊洛夫宫主馆。俄罗斯博物馆有多个场馆，请按所选展览核对地址与票种；主馆官网目前列周二休息，出行前复查。', source: 'https://rusmuseum.ru/museums/mikhailovsky-palace/', sourceLabel: '俄罗斯博物馆主馆官网', checkedAt: '2026-09-14', aliases: '俄博 俄国博物馆 国立俄罗斯博物馆 米哈伊洛夫宫 美术馆 Russian Museum' },
    { id: 'mikhailovsky-garden', name: '米哈伊洛夫花园', ru: 'Михайловский сад', address: 'Михайловский сад, Санкт-Петербург', category: 'nature', area: 'center', tag: '滴血教堂旁的城市花园', time: '建议 30–60 分钟', intro: '米哈伊洛夫花园紧邻滴血教堂和俄罗斯博物馆，适合参观间隙休息。', note: '花园有开放时段和季节养护安排，请按出行日期查看官网，入口以现场为准。', source: 'https://rusmuseum.ru/museums/mikhailovsky-garden/', sourceLabel: '米哈伊洛夫花园官网', checkedAt: '2026-09-14', aliases: '米哈花园 米哈伊洛夫斯基花园 滴血教堂旁边的公园 米哈伊洛夫公园 Mikhailovsky Garden' },
    { id: 'field-mars', name: '战神广场', ru: 'Марсово поле', address: 'Марсово поле, Санкт-Петербург', category: 'nature', area: 'center', tag: '林荫步道与城市纪念地', time: '建议 20–40 分钟', intro: '战神广场有开阔草地、林荫步道和纪念设施，可与附近花园一起游览。', note: '以室外散步停留为主，遇到风雨可缩短时间；与博物馆参观分开预留时长。', source: 'https://en.wikipedia.org/wiki/Field_of_Mars_(Saint_Petersburg)', sourceLabel: '战神广场资料', checkedAt: '2026-09-14', aliases: '马尔斯广场 火星广场 玛尔斯广场 Field of Mars Marsovo Pole' }
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
  const attractions = (browserCatalogueOnly ? places.filter(p => p.id !== 'literary') : places).slice();
  places.length = 0;
  places.push(...attractions);
  places.forEach(p => { p.latLng = coordinates[p.id].slice(0, 2); p.coordinateSource = coordinates[p.id][2]; });
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
  "short": {
    "label": "2 日 · 市区重点",
    "description": "冬宫、教堂和要塞分两天安排；第一天以冬宫参观为主，以撒教堂可选外观。",
    "days": [
      {
        "title": "冬宫、河岸与以撒教堂",
        "places": [
          "hermitage",
          "bronze",
          "isaac"
        ]
      },
      {
        "title": "涅瓦大街、滴血教堂与要塞",
        "places": [
          "kazan",
          "books",
          "blood",
          "fortress"
        ]
      }
    ]
  },
  "classic": {
    "label": "3 日 · 市区经典",
    "description": "按市中心、运河与花园、要塞河岸分区安排，每天 3–5 站；大型博物馆分开参观。",
    "days": [
      {
        "title": "冬宫、河岸与以撒教堂",
        "places": [
          "hermitage",
          "bronze",
          "isaac"
        ]
      },
      {
        "title": "涅瓦大街与滴血教堂",
        "places": [
          "kazan",
          "books",
          "blood",
          "mikhailovsky-garden"
        ]
      },
      {
        "title": "要塞、巡洋舰与战神广场",
        "places": [
          "fortress",
          "aurora",
          "field-mars"
        ]
      }
    ]
  },
  "four": {
    "label": "4 日 · 市区与艺术",
    "description": "在三日路线基础上增加俄罗斯博物馆，将教堂、花园和展馆分组；夏宫或叶宫可替换其中一天。",
    "days": [
      {
        "title": "冬宫、河岸与以撒教堂",
        "places": [
          "hermitage",
          "bronze",
          "isaac"
        ]
      },
      {
        "title": "涅瓦大街与滴血教堂",
        "places": [
          "kazan",
          "books",
          "blood"
        ]
      },
      {
        "title": "要塞、巡洋舰与剧院",
        "places": [
          "fortress",
          "aurora",
          "mariinsky"
        ]
      },
      {
        "title": "俄罗斯博物馆与花园",
        "places": [
          "russian-museum",
          "mikhailovsky-garden",
          "field-mars"
        ]
      }
    ]
  }
};
  const publicPresets = browserCatalogueOnly
    ? Object.fromEntries(Object.entries(presets).map(([id, preset]) => [id, {
      ...preset,
      days: preset.days.map(day => ({ ...day, places: day.places.filter(placeId => placeId !== 'literary') }))
    }]))
    : presets;
  return {
    city: { id: 'spb', name: '圣彼得堡', shortName: '彼得堡', englishName: 'SAINT PETERSBURG', edition: '01 / 彼得堡', tagline: '宫殿 · 街巷 · 河岸 · 海风', introduction: '从冬宫、涅瓦大街，到城市花园和芬兰湾。', defaultPlace: 'hermitage', storageKey: 'qu-ekankan-spb-plan-v1' },
    places, attractions, foodPlaces, presets: publicPresets, walkingGroups, visitInfo,
    sources: [ ['圣彼得堡旅游信息局','https://visit-petersburg.ru/en/'], ['俄罗斯博物馆与花园','https://rusmuseum.ru/museums/'], ['Russiable 彼得堡旅行指南','https://russiable.com/what-see-do-st-petersburg/'] ],
    categories: [ ['all','全部'], ['museum','博物馆'], ['landmark','地标'], ['palace','郊外宫殿'], ['life','城市生活'], ['nature','公园海边'] ],
    foodTypes: []
  };
});
