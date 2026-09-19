(function (root, factory) {
  const visit = typeof module === 'object' && module.exports ? require('./visit-data.js') : root.VISIT_DATA;
  const data = factory(visit?.moscow || {});
  if (typeof module === 'object' && module.exports) module.exports = data;
  else root.MOSCOW_DATA = data;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (visitInfo) {
  const places = [
    {
      id: 'msk-red-square', name: '红场', ru: 'Красная площадь', address: 'Красная площадь, Москва',
      category: 'landmark', area: 'center', tag: '第一次认识莫斯科', time: '建议 40–60 分钟',
      intro: '红场周围集中了克里姆林宫城墙、圣瓦西里大教堂和古姆，是看莫斯科地标最集中的地方。',
      note: '广场可能因活动临时限制进入。克里姆林宫博物馆、教堂和商场各有入口与参观安排。',
      source: 'https://en.wikipedia.org/wiki/Red_Square', sourceLabel: '红场资料', aliases: 'Red Square 红场广场'
    },
    {
      id: 'msk-kremlin', name: '克里姆林宫', ru: 'Музеи Московского Кремля', address: 'Московский Кремль, Москва',
      category: 'museum', area: 'center', tag: '宫墙内的历史与艺术', time: '建议 2–3 小时起',
      intro: '克里姆林宫的教堂建筑群和军械库馆藏，是了解俄罗斯宫廷历史的主要看点。',
      note: '教堂广场通常经库塔菲亚塔进入，军械库经博罗维茨基门；以预约信息为准。地图标记为宫区位置，请按票种找入口并留出安检时间。开放日和临时调整请按具体出行日期核对。',
      source: 'https://www.kreml.ru/', sourceLabel: '克里姆林宫博物馆官网', aliases: 'Kremlin 军械库 教堂广场 库塔菲亚塔'
    },
    {
      id: 'msk-basil', name: '圣瓦西里大教堂', ru: 'Храм Василия Блаженного', address: 'Красная площадь, 7, Москва',
      category: 'museum', area: 'center', tag: '红场上的彩色穹顶', time: '外观约 20 分钟；入内另留 1–1.5 小时',
      intro: '圣瓦西里大教堂以彩色穹顶著称，内部由多个小教堂组成，与外观很不一样。',
      note: '正式名称也称波克罗夫大教堂。入内需另查门票和开放日期，每月第一个周三等闭馆安排请按出行日期核对。',
      source: 'https://shm.ru/museum/hvb/', sourceLabel: '历史博物馆 · 圣瓦西里大教堂', aliases: '圣巴西尔 瓦西里大教堂 波克罗夫大教堂 Покровский собор St Basil'
    },
    {
      id: 'msk-gum', name: '古姆商场', ru: 'ГУМ', address: 'Красная площадь, 3, Москва',
      category: 'life', area: 'center', tag: '拱廊、橱窗与休息时间', time: '建议 45–60 分钟',
      intro: '古姆的玻璃顶拱廊值得一看，不购物也适合在红场游览途中进来休息。',
      note: '商场、餐饮和店铺的营业安排可能不同；消费按实际菜单和标价选择。',
      source: 'https://gum.ru/', sourceLabel: '古姆官网', aliases: 'GUM 国立百货商店 ГУМ商场'
    },
    {
      id: 'msk-alexander-garden', name: '亚历山大花园', ru: 'Александровский сад', address: 'Александровский сад, Москва',
      category: 'nature', area: 'center', tag: '克里姆林宫外的步道', time: '建议 30–45 分钟',
      intro: '亚历山大花园位于克里姆林宫西侧，无名烈士墓是这里的主要参观点。',
      note: '参观纪念设施请遵守现场秩序。换岗和临时管制以当天安排为准，不把等候换岗作为固定行程。',
      source: 'https://en.wikipedia.org/wiki/Alexander_Garden', sourceLabel: '亚历山大花园资料', aliases: 'Alexander Garden 无名烈士墓 亚历山大公园'
    },
    {
      id: 'msk-zaryadye', name: '扎里亚季耶公园', ru: 'Парк Зарядье', address: 'Парк Зарядье, улица Варварка, Москва',
      category: 'nature', area: 'center', tag: '红场旁的河景与悬浮桥', time: '建议 1–1.5 小时',
      intro: '扎里亚季耶公园的悬浮桥可以看莫斯科河景，离红场也近。',
      note: '公园、悬浮桥和园内展馆的开放安排不同；天气或活动可能影响通行，按现场指引游览。',
      source: 'https://en.wikipedia.org/wiki/Zaryadye_Park', sourceLabel: '扎里亚季耶公园资料', aliases: '扎里亚季公园 扎里亚季耶 悬浮桥 漂浮桥 Zaryadye Зарядье'
    },
    {
      id: 'msk-tretyakov', name: '特列季亚科夫画廊', ru: 'Третьяковская галерея, Лаврушинский переулок', address: 'Лаврушинский переулок, 10, Москва',
      category: 'museum', area: 'south-center', tag: '俄罗斯绘画馆藏', time: '建议 2–3 小时',
      intro: '特列季亚科夫画廊老馆以俄罗斯绘画馆藏见长，适合安排一次集中看画的参观。',
      note: '老馆、新特列季亚科夫画廊及卡达舍夫斯卡娅河岸馆区地址不同。购票时核对展览、馆区与开放日期，地图对应拉夫鲁申斯基巷 10 号。',
      source: 'https://www.tretyakovgallery.ru/about/contacts/', sourceLabel: '特列季亚科夫画廊馆区信息', aliases: '特列季亚科夫美术馆 特列恰科夫 老特列季亚科夫 Tretyakov'
    },
    {
      id: 'msk-arbat', name: '老阿尔巴特街', ru: 'Улица Арбат', address: 'Улица Арбат, Москва',
      category: 'life', area: 'west', tag: '老街与街角闲逛', time: '建议 1–1.5 小时',
      intro: '老阿尔巴特街集中了老建筑、小店和街头表演，适合步行逛街。',
      note: '这里是老阿尔巴特步行街，与新阿尔巴特大街不同。街区较长，导航落点代表街区位置，可按行程选择两端地铁站。',
      source: 'https://en.wikipedia.org/wiki/Arbat_Street', sourceLabel: '阿尔巴特街资料', aliases: '阿尔巴特大街 老阿巴特 Old Arbat Старый Арбат'
    },
    {
      id: 'msk-bolshoi', name: '莫斯科大剧院', ru: 'Большой театр, Историческая сцена', address: 'Театральная площадь, 1, Москва',
      category: 'life', area: 'center', tag: '剧院广场与演出之夜', time: '外观约 20–30 分钟；演出依剧目',
      intro: '莫斯科大剧院以芭蕾和歌剧演出著称，没有演出票也可以看历史舞台的建筑外观。',
      note: '这里定位历史舞台。大剧院有不同演出场馆，请以票面地址为准；看外观不代表可以进入剧院内部。',
      source: 'https://bolshoi.ru/', sourceLabel: '莫斯科大剧院官网', aliases: '波修瓦剧院 博尔绍伊 Bolshoi Theatre 大剧院'
    },
    {
      id: 'msk-gorky', name: '高尔基公园', ru: 'Парк Горького', address: 'Крымский Вал, 9, Москва',
      category: 'nature', area: 'south', tag: '河岸散步与城市日常', time: '建议 1.5–2 小时',
      intro: '高尔基公园有连续的河岸步道，适合散步和户外休息。',
      note: '园区面积较大，地图是公园区域位置。临时活动、设施和步道开放请查官网；不默认包含游船或租车体验。',
      source: 'https://parkgorkogo.ru/', sourceLabel: '高尔基公园官网', aliases: 'Gorky Park Горького'
    },
    {
      id: 'msk-sparrow', name: '麻雀山', ru: 'Воробьёвы горы', address: 'Воробьёвы горы, Москва',
      category: 'nature', area: 'west', tag: '城市远景与莫斯科大学外观', time: '建议 1–2 小时',
      intro: '麻雀山观景区可以俯瞰莫斯科河与卢日尼基，并看莫斯科大学主楼外观。',
      note: '山上观景区与河边地铁站有高差，需要另算步行时间；地图标记为山上区域。大学内部及缆车不包含在这段散步中。',
      source: 'https://en.wikipedia.org/wiki/Sparrow_Hills', sourceLabel: '麻雀山资料', aliases: '列宁山 莫斯科大学观景台 Sparrow Hills Vorobyovy Gory'
    },
    {
      id: 'msk-vdnh', name: '全俄展览中心', ru: 'ВДНХ', address: 'Проспект Мира, 119, Москва',
      category: 'landmark', area: 'north', tag: '展馆建筑与开阔园区', time: '建议半天；多馆参观可留一天',
      intro: '全俄展览中心集中了展馆建筑、广场和喷泉群，适合对建筑和展览感兴趣的人。',
      note: '也称国民经济成就展。园区与各展馆票务分开，喷泉和其他季节项目需按日期核对；从市中心往返优先比较地铁方案。',
      source: 'https://vdnh.ru/', sourceLabel: 'ВДНХ 官网', aliases: 'VDNH ВВЦ 国民经济成就展 经济成就展 全俄会展中心'
    },
    {
      id: 'msk-moscow-city', name: '莫斯科城', ru: 'Московский международный деловой центр «Москва-Сити»', address: 'Москва-Сити, Пресненская набережная, Москва',
      category: 'landmark', area: 'west', tag: '高楼群与现代城市河岸', time: '建议 1–1.5 小时',
      intro: '莫斯科城的高楼群与老城区风格不同，河岸和收费观景台是主要看点。',
      note: '这里标记商务区，未指定某个观景台。登楼需另选运营方、入口和门票；从老阿尔巴特或麻雀山前往请比较公共交通。',
      source: 'https://en.wikipedia.org/wiki/Moscow_International_Business_Center', sourceLabel: '莫斯科城资料', aliases: 'Moscow City Москва Сити 国际商务中心 莫斯科国际商务中心'
    },
    {
      id: 'msk-armed-cathedral', name: '武装力量大教堂', ru: 'Главный храм Вооружённых Сил России', address: 'Московская область, Одинцовский городской округ, Минское шоссе, 55 км',
      category: 'landmark', area: 'outside', tag: '莫斯科郊外的纪念性建筑', time: '建议半天至一天',
      intro: '武装力量大教堂位于爱国者公园，适合对军事纪念建筑感兴趣、能安排郊外交通的人。',
      note: '距离莫斯科市中心较远，需要单独安排往返交通。大教堂、爱国者公园和“记忆之路”博物馆的开放与进入规则分别确认。',
      source: 'https://www.ghvs.ru/', sourceLabel: '武装力量大教堂官网', aliases: 'Главный храм ВС РФ 武装力量主教座堂 俄罗斯武装力量主教座堂 Patriot Park 爱国者公园'
    }
  ];
  // Geographic records locate each attraction or area, not every admission gate.
  const coordinates = {
    'msk-red-square': [55.75417, 37.62000, 'https://en.wikipedia.org/wiki/Red_Square'],
    'msk-kremlin': [55.75167, 37.61778, 'https://en.wikipedia.org/wiki/Moscow_Kremlin'],
    'msk-basil': [55.75250, 37.62306, 'https://en.wikipedia.org/wiki/Saint_Basil%27s_Cathedral'],
    'msk-gum': [55.75472, 37.62139, 'https://en.wikipedia.org/wiki/GUM_(department_store)'],
    'msk-alexander-garden': [55.75250, 37.61389, 'https://en.wikipedia.org/wiki/Alexander_Garden'],
    'msk-zaryadye': [55.751, 37.629, 'https://en.wikipedia.org/wiki/Zaryadye_Park'],
    'msk-tretyakov': [55.741389, 37.620864, 'https://en.wikipedia.org/wiki/Tretyakov_Gallery'],
    'msk-arbat': [55.75111, 37.59611, 'https://en.wikipedia.org/wiki/Arbat_Street'],
    'msk-bolshoi': [55.76028, 37.61861, 'https://en.wikipedia.org/wiki/Bolshoi_Theatre'],
    'msk-gorky': [55.72833, 37.60000, 'https://en.wikipedia.org/wiki/Gorky_Park_(Moscow)'],
    'msk-sparrow': [55.710, 37.543, 'https://en.wikipedia.org/wiki/Sparrow_Hills'],
    'msk-vdnh': [55.82972, 37.63222, 'https://en.wikipedia.org/wiki/Exhibition_of_Achievements_of_National_Economy'],
    'msk-moscow-city': [55.74667, 37.53694, 'https://en.wikipedia.org/wiki/Moscow_International_Business_Center'],
    'msk-armed-cathedral': [55.57917, 36.82194, 'https://www.ghvs.ru/contacts/']
  };
  places.forEach(p => {
    p.latLng = coordinates[p.id].slice(0, 2);
    p.coordinateSource = coordinates[p.id][2];
    p.checkedAt = p.checkedAt || '2026-09-14';
  });
  const presets = {
  "short": {
    "label": "2 日 · 市区重点",
    "description": "第一天集中红场周边，第二天看画廊与河岸；圣瓦西里大教堂以外观为主，入内可减少同日其他停留。",
    "days": [
      {
        "title": "克里姆林宫与红场",
        "places": [
          "msk-alexander-garden",
          "msk-kremlin",
          "msk-red-square",
          "msk-basil",
          "msk-gum"
        ]
      },
      {
        "title": "画廊、河岸与老街",
        "places": [
          "msk-tretyakov",
          "msk-gorky",
          "msk-arbat"
        ]
      }
    ]
  },
  "classic": {
    "label": "3 日 · 市区经典",
    "description": "红场、画廊河岸与西部城区分三天安排；跨区路段使用公共交通，教堂可选外观。",
    "days": [
      {
        "title": "克里姆林宫与红场",
        "places": [
          "msk-alexander-garden",
          "msk-kremlin",
          "msk-red-square",
          "msk-basil",
          "msk-gum"
        ]
      },
      {
        "title": "画廊、河岸与剧院广场",
        "places": [
          "msk-tretyakov",
          "msk-zaryadye",
          "msk-bolshoi"
        ]
      },
      {
        "title": "麻雀山、老街与莫斯科城",
        "places": [
          "msk-sparrow",
          "msk-arbat",
          "msk-moscow-city"
        ]
      }
    ]
  },
  "four": {
    "label": "4 日 · 市区与展览中心",
    "description": "前三天按区域游览，第四天上午参观全俄展览中心，下午返回剧院广场；园区选少量展馆，剧院默认看外观。",
    "days": [
      {
        "title": "克里姆林宫与红场",
        "places": [
          "msk-alexander-garden",
          "msk-kremlin",
          "msk-red-square",
          "msk-basil",
          "msk-gum"
        ]
      },
      {
        "title": "画廊与河岸公园",
        "places": [
          "msk-tretyakov",
          "msk-gorky",
          "msk-zaryadye"
        ]
      },
      {
        "title": "麻雀山、老街与莫斯科城",
        "places": [
          "msk-sparrow",
          "msk-arbat",
          "msk-moscow-city"
        ]
      },
      {
        "title": "全俄展览中心与剧院广场",
        "places": [
          "msk-vdnh",
          "msk-bolshoi"
        ]
      }
    ]
  }
};
  return {
    city: { id: 'moscow', name: '莫斯科', shortName: '莫斯科', englishName: 'MOSCOW', edition: '02 / 莫斯科', tagline: '红场 · 艺术 · 老街 · 郊外', introduction: '从红场、宫墙与画廊，到河岸公园和莫斯科郊外。', defaultPlace: 'msk-alexander-garden', storageKey: 'qu-ekankan-moscow-plan-v1' },
    places, attractions: places.slice(), foodPlaces: [], foodTypes: [], presets, visitInfo,
    walkingGroups: [
      ['msk-alexander-garden','msk-kremlin','msk-red-square','msk-basil','msk-gum'],
      ['msk-red-square','msk-basil','msk-gum','msk-zaryadye','msk-bolshoi'],
      ['msk-tretyakov','msk-gorky']
    ],
    categories: [ ['all','全部'], ['museum','博物馆'], ['landmark','地标'], ['life','城市生活'], ['nature','公园河岸'] ],
    sources: [ ['克里姆林宫博物馆','https://www.kreml.ru/'], ['武装力量大教堂','https://www.ghvs.ru/'], ['Discover Russia · 莫斯科','https://discover-russia.cn/cities/moscow'], ['Russiable 莫斯科旅行指南','https://russiable.com/what-see-do-moscow/'], ['特列季亚科夫画廊','https://www.tretyakovgallery.ru/'] ]
  };
});
