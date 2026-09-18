(function (root, factory) {
  const food = factory();
  if (typeof module === 'object' && module.exports) module.exports = food;
  else root.SPB_FOOD = food;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  // One specific branch per entry. Pairings are planning suggestions, not
  // measured detours. Prices and live opening status are left to the venues.
  const food = [
    {
      id: 'food-porto19', name: 'Porto 19', ru: 'Porto 19', branch: 'Большая Зеленина 街店',
      address: 'Большая Зеленина улица, 19, Санкт-Петербург', area: 'petrograd', foodType: 'restaurant', tag: '鱼类与海鲜', time: '用餐预留 1–1.5 小时',
      intro: '以鱼类和海鲜为主的餐厅，可以留一顿饭坐下来慢慢吃。位于彼得格勒一侧，与涅瓦大街的餐饮分开安排更从容。',
      note: '官网目前列周一休息；按出行日期查看营业与订位安排。',
      routeHint: '可搭配彼得格勒一侧的游览，前往用餐需另留交通时间。',
      pairWith: ['fortress', 'yelagin'], walkWith: [], aliases: 'Porto19 波尔图 海鲜 鱼 餐厅',
      latLng: [59.9623674, 30.2903402], coordinateSource: 'https://porto19.com/',
      source: 'https://porto19.com/', sourceLabel: 'Porto 19 官网'
    },
    {
      id: 'food-bull-nevsky', name: 'The Бык', ru: 'THE БЫК', branch: '涅瓦大街 55 号店',
      address: 'Невский проспект, 55, Санкт-Петербург', area: 'center-east', foodType: 'restaurant', tag: '牛排与肉类正餐', time: '用餐预留 1–1.5 小时',
      intro: '以肉类菜品为主的连锁餐厅。这一站选在涅瓦大街 55 号，适合作为逛街后的一顿正餐。',
      note: '本页固定涅瓦大街分店，其他分店的菜单和营业安排请分别查看。',
      routeHint: '位于涅瓦大街东段。若接着去马林斯基剧院，请给用餐与交通留足时间。',
      pairWith: ['books', 'kazan'], walkWith: ['food-ilu', 'food-spar-passage'], aliases: 'The Byk The Bull 牛 牛排 肉餐厅',
      latLng: [59.932031, 30.350184], coordinateSource: 'https://nevsky.thebull.ru/',
      source: 'https://nevsky.thebull.ru/', sourceLabel: 'The Бык 涅瓦店官网',
      yandexMap: 'https://yandex.ru/maps/-/CDanuNiM'
    },
    {
      id: 'food-meat-kievskaya', name: 'Мясо & Хлеб', ru: 'Мясо & Хлеб', branch: 'Киевская 街店',
      address: 'Киевская улица, 5, корпус 6, Санкт-Петербург', area: 'south', foodType: 'restaurant', tag: '烤肉与家庭正餐', time: '用餐预留 1–1.5 小时',
      intro: '主打肉类和烤制菜品的连锁餐厅，可以留作一顿坐下来慢慢吃的正餐。这家分店位于 Киевская 街。',
      note: '位于传统景点区以南，适合住在这一带或专程前往时选择。门店较多，请核对地址。',
      routeHint: '这家分店需要单独安排交通，可放在回住处前的一顿饭里。',
      pairWith: [], walkWith: [], aliases: 'Myaso Khleb Мясо и Хлеб 肉与面包 肉和面包 烤肉',
      latLng: [59.902962, 30.326406], coordinateSource: 'https://myasohleb.ru/kievskaya/',
      source: 'https://myasohleb.ru/kievskaya/', sourceLabel: 'Мясо & Хлеб Киевская 店官网',
      yandexMap: 'https://yandex.ru/maps/org/myaso_khleb/134721224854/'
    },
    {
      id: 'food-stolovaya-nevsky', name: 'Столовая № 1', ru: 'Столовая №1', branch: '涅瓦大街 25 号店',
      address: 'Невский проспект, 25, Санкт-Петербург', area: 'center', foodType: 'everyday', tag: '俄式食堂便餐', time: '用餐预留 30–45 分钟',
      intro: '想吃一顿日常便餐时，可以看看俄式食堂。按现场供应和标价选择菜品，适合安排在市中心游览中途。',
      note: '按所选菜品结账；同名食堂较多，导航时以涅瓦大街 25 号为准。',
      routeHint: '靠近喀山教堂与书之家，可以放进涅瓦大街散步这一天。',
      pairWith: ['kazan', 'books', 'blood', 'literary', 'russian-museum'], walkWith: ['kazan', 'books', 'blood', 'literary', 'russian-museum', 'mikhailovsky-garden', 'food-spar-passage', 'food-teremok-morskaya', 'food-pyshki'], aliases: 'Stolovaya 1 一号食堂 一号餐厅 俄餐 食堂 便餐 午饭',
      latLng: [59.9354669, 30.3235552], coordinateSource: 'https://www.afisha.ru/spb/restaurant/stolovaia-no-1-kopeika-346345/',
      source: 'https://www.afisha.ru/spb/restaurant/stolovaia-no-1-kopeika-346345/', sourceLabel: 'Афиша 门店资料'
    },
    {
      id: 'food-spar-passage', name: 'EUROSPAR', ru: 'EUROSPAR', branch: 'Пассаж · 涅瓦大街 48 号店',
      address: 'Невский проспект, 48, ТД Пассаж, Санкт-Петербург', area: 'center', foodType: 'everyday', tag: '超市熟食与补给', time: '用餐或采购预留 30–45 分钟',
      intro: 'Пассаж 商场内的超市，提供熟食、汤、沙拉、烘焙和饮品。可以吃一顿简单的饭，也能顺便买水和路上吃的东西。',
      note: '位于商场 0 层，按超市熟食与补给点收录；现场菜品和用餐区域以门店为准。',
      routeHint: '可搭配喀山教堂、书之家与滴血教堂这一带的游览。',
      pairWith: ['kazan', 'books', 'blood', 'russian-museum'], walkWith: ['kazan', 'books', 'blood', 'russian-museum', 'mikhailovsky-garden', 'food-stolovaya-nevsky', 'food-pyshki', 'food-bull-nevsky'], aliases: 'Euro Spar Eurospar Spar 斯帕 超市 熟食 早餐 便餐',
      latLng: [59.934754, 30.334265], coordinateSource: 'https://passage.spb.ru/contact/',
      source: 'https://passage.spb.ru/shops/restorany-i-kafe/supermarket-eurospar/', sourceLabel: 'Пассаж 商场官方门店页'
    },
    {
      id: 'food-ilu', name: 'Илу 中餐厅', ru: 'Илу', branch: '利戈夫斯基大街店',
      address: 'Лиговский проспект, 57-59, Санкт-Петербург', area: 'center-east', foodType: 'chinese', tag: '市中心中餐', time: '用餐预留 1 小时',
      intro: '想吃中餐时的一处选择。位于利戈夫斯基大街、靠近莫斯科火车站，适合住在涅瓦大街东段或火车抵达、离开当天安排。',
      note: '门店位置依据 2GIS 核对；用餐与菜单以现场为准。',
      routeHint: '靠近莫斯科火车站，与冬宫等景点之间需要留出交通时间。',
      pairWith: [], walkWith: ['food-bull-nevsky'], aliases: 'Ilu Yilu 伊路 伊卢 一路 中餐 中国菜 Chinese',
      latLng: [59.928629, 30.358449], coordinateSource: 'https://2gis.ru/spb/firm/70000001089080289',
      source: 'https://2gis.ru/spb/firm/70000001089080289', sourceLabel: '2GIS 门店资料'
    },
    {
      id: 'food-teremok-morskaya', name: 'Теремок', ru: 'Теремок', branch: 'Большая Морская 街 11 号店',
      address: 'Большая Морская улица, 11, Санкт-Петербург', area: 'center', foodType: 'everyday', tag: '俄式薄饼便餐', time: '用餐预留 30–45 分钟',
      intro: '以俄式薄饼为特色的连锁便餐店，可以按口味选择咸味或甜味馅料。这家分店适合放在冬宫周边的行程里。',
      note: '门店供应与菜单请现场确认，导航固定 Большая Морская 街 11 号。',
      routeHint: '靠近文学咖啡馆与海军部一带，可搭配冬宫或以撒教堂的游览。',
      pairWith: ['hermitage', 'literary', 'isaac', 'bronze'], walkWith: ['hermitage', 'literary', 'isaac', 'bronze', 'kazan', 'books', 'food-stolovaya-nevsky', 'food-pyshki'], aliases: 'Teremok 俄罗斯薄饼 俄式煎饼 布林饼 блины 快餐',
      latLng: [59.9357201, 30.3166011], coordinateSource: 'https://www.afisha.ru/spb/restaurant/teremok-43049/',
      source: 'https://www.afisha.ru/spb/restaurant/teremok-43049/', sourceLabel: 'Афиша 门店资料',
      website: 'https://teremok.ru/'
    },
    {
      id: 'food-pyshki', name: 'Пышечная', ru: 'Ленинградские пышки', branch: 'Большая Конюшенная 街 25 号店',
      address: 'Большая Конюшенная улица, 25, Санкт-Петербург', area: 'center', foodType: 'snack', tag: '糖粉炸面圈与咖啡', time: '小吃预留 20–30 分钟',
      intro: '在散步途中尝尝彼得堡的 пышки：撒糖粉的炸面圈，可以配一杯炼乳咖啡。适合作为一段小吃停留。',
      note: '以甜点小吃为主，适合加餐；具体价格和营业安排可查看店方页面。',
      routeHint: '可放在冬宫、书之家或滴血教堂之间的散步途中。',
      pairWith: ['hermitage', 'books', 'blood', 'literary', 'russian-museum', 'mikhailovsky-garden', 'field-mars'], walkWith: ['hermitage', 'books', 'blood', 'literary', 'kazan', 'russian-museum', 'mikhailovsky-garden', 'field-mars', 'food-stolovaya-nevsky', 'food-teremok-morskaya', 'food-spar-passage'], aliases: 'Pyshki Pyshechnaya 甜甜圈 炸面圈 糖粉 咖啡 甜点 小吃',
      latLng: [59.9375319, 30.3224787], coordinateSource: 'https://www.afisha.ru/spb/restaurant/pyshechnaia-23329/',
      source: 'https://pyshki1958.ru/', sourceLabel: 'Пышечная 官网',
      yandexMap: 'https://yandex.ru/maps/org/pyshki/1036708171/'
    },
    {
      id: 'food-volchek-nevsky', name: 'Булочная Ф. Вольчека', ru: 'Булочная Ф. Вольчека', branch: '涅瓦大街 15 号店',
      address: 'Невский проспект, 15, Санкт-Петербург', area: 'center', foodType: 'bakery', tag: '面包、烘焙与咖啡', time: '早餐或加餐预留 20–40 分钟',
      intro: '彼得堡的连锁面包店。可以选些面包、烘焙点心，配咖啡作早餐，或买好带走，留在逛城途中吃。',
      note: '这一条固定涅瓦大街 15 号分店。早出门时先核对开门时间，品种与座位以门店现场为准。',
      routeHint: '靠近文学咖啡馆，可衔接书之家或冬宫。早餐可以放在当天第一站，也可作为散步途中的加餐。',
      pairWith: ['hermitage', 'literary', 'books', 'kazan'], walkWith: ['hermitage', 'literary', 'books', 'kazan', 'isaac', 'bronze', 'food-teremok-morskaya', 'food-stolovaya-nevsky', 'food-pyshki'], aliases: 'булочная булочные Вольчека Bulochnaya Volchek Fvolchek 面包店 面包 早餐 烘焙 咖啡',
      latLng: [59.936104, 30.318927], coordinateSource: 'https://2gis.ru/spb/firm/70000001030248661',
      source: 'https://fvolchek.ru/', sourceLabel: 'Булочные Ф. Вольчека 官网'
    }
  ];
  return food.map(p => ({ kind: 'food', category: 'food', checkedAt: '2026-09-14', ...p }));
});
