(function (root, factory) {
  const visit = factory();
  if (typeof module === 'object' && module.exports) module.exports = visit;
  else root.VISIT_DATA = visit;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const spb = {
    hermitage: { status: '分时段购票', statusTone: 'ticket', ticket: '主馆按日期和入场时段购票，可在官网预订；闭馆前 1 小时停止售票。', hours: '主馆：周三、周四、周日 11:00–18:00；周二、周五、周六 11:00–20:00。周一、1 月 1 日及 5 月 9 日闭馆。临时调整以官网为准。', url: 'https://www.hermitagemuseum.org/visitus?lng=en', label: '官网 · 开放时间与购票', checkedAt: '2026-09-19' },
    peterhof: { status: '季节与票务 · 按日期确认', statusTone: 'ticket', ticket: '宫殿、花园和季节项目的票务可能分别安排。', hours: '喷泉、花园和水上交通有季节性，出发前确认。', label: '查看夏宫官网' },
    catherine: { status: '需购票 · 按日期确认', statusTone: 'ticket', ticket: '宫殿、琥珀厅和花园按所选项目查看票务与预约。', hours: '开放日期、入口和参观时段以皇村官网为准。', label: '查看皇村官网' },
    kazan: { status: '开放安排 · 按日期确认', statusTone: 'check', ticket: '教堂外部和礼拜安排不同，内部参观以现场信息为准。', hours: '宗教活动可能影响参观时段，出发前确认。', label: '查看教堂官网' },
    bronze: { status: '公共空间', statusTone: 'free', ticket: '室外城市地标，通常不需要景点门票。', hours: '开放空间；天气、活动和现场管控以当天为准。', label: '查看彼得堡旅游资料' },
    aurora: { status: '登舰需购票 · 按日期确认', statusTone: 'ticket', ticket: '外观拍照与登舰参观是不同体验，登舰按票务安排。', hours: '开放日期和登舰时段以海军博物馆官网为准。', label: '查看海军博物馆官网' },
    blood: { status: '需购票 · 按日期确认', statusTone: 'ticket', ticket: '内部参观按博物馆票务安排，宗教活动可能影响开放。', hours: '开放时间、临时闭馆和入口以官网为准。', label: '查看教堂博物馆官网' },
    isaac: { status: '需购票 · 按日期确认', statusTone: 'ticket', ticket: '教堂内部和柱廊可能对应不同票种。', hours: '开放时间、礼拜和登高安排以官网为准。', label: '查看教堂博物馆官网' },
    books: { status: '营业时间确认', statusTone: 'check', ticket: '书店和建筑外观通常不需要景点门票。', hours: '店铺营业时间和活动安排以书之家官网为准。', label: '查看书之家官网' },
    park300: { status: '公共空间 · 按日期确认', statusTone: 'free', ticket: '海边公园通常不需要景点门票；活动项目另行确认。', hours: '天气、活动和园区安排以出发日期为准。', label: '查看彼得堡旅游资料' },
    literary: { status: '营业时间确认', statusTone: 'check', ticket: '作为餐饮停留，消费和座位以店家当天安排为准。', hours: '营业时间、菜单和座位建议出发前确认。', label: '查看彼得堡旅游资料' },
    yelagin: { status: '公园与园内项目分别确认', statusTone: 'check', ticket: '公园、宫殿和园内活动可能有不同票务规则。', hours: '开放时间和季节安排以公园官网为准。', label: '查看耶拉金岛官网' },
    mariinsky: { status: '按场次购票', statusTone: 'ticket', ticket: '演出需要按具体场次购票；不同场馆入口不同。', hours: '以票面场馆、演出时间和官网临时通知为准。', label: '查看马林斯基官网' },
    fortress: { status: '部分项目需购票 · 按日期确认', statusTone: 'ticket', ticket: '要塞区域和内部展馆的票务安排不同。', hours: '各展馆开放时间和临时安排以城市历史博物馆官网为准。', label: '查看城市历史博物馆官网' },
    'russian-museum': { status: '需购票 · 按日期确认', statusTone: 'ticket', ticket: '主馆和其他场馆分别核对票种、入口与预约安排。', hours: '主馆开放日和临时展览以俄罗斯博物馆官网为准。', label: '查看俄罗斯博物馆官网' },
    'mikhailovsky-garden': { status: '开放时段 · 按日期确认', statusTone: 'check', ticket: '城市花园的参观规则与俄罗斯博物馆场馆分开确认。', hours: '开放时段、季节养护和入口以官网为准。', label: '查看米哈伊洛夫花园官网' },
    'field-mars': { status: '公共空间', statusTone: 'free', ticket: '室外城市广场，通常不需要景点门票。', hours: '开放空间；天气和临时活动以当天为准。', label: '查看战神广场资料' }
  };

  const moscow = {
    'msk-red-square': { status: '公共空间 · 可能临时管控', statusTone: 'check', ticket: '广场本身通常不需要门票；周边建筑分别购票。', hours: '大型活动、安保和临时安排可能影响进入。', label: '查看红场资料' },
    'msk-kremlin': { status: '需预约 / 购票 · 按日期确认', statusTone: 'ticket', ticket: '教堂广场、军械库等项目的票种和入口不同。', hours: '开放日、预约时段、入口和安检以官网为准。', label: '查看克里姆林宫官网' },
    'msk-basil': { status: '入内需购票 · 按日期确认', statusTone: 'ticket', ticket: '外观可与红场一起参观；入内按博物馆票务安排。', hours: '开放日期和临时闭馆以历史博物馆官网为准。', label: '查看圣瓦西里大教堂信息' },
    'msk-gum': { status: '营业时间确认', statusTone: 'check', ticket: '商场外观和公共区域通常不需要景点门票。', hours: '商场、店铺和餐饮的营业时间可能不同。', label: '查看古姆官网' },
    'msk-alexander-garden': { status: '公共空间 · 按日期确认', statusTone: 'free', ticket: '城市花园通常不需要景点门票。', hours: '大型活动或安保安排可能影响通行。', label: '查看亚历山大花园资料' },
    'msk-zaryadye': { status: '公园开放 · 活动另行确认', statusTone: 'check', ticket: '公园散步通常不需要门票；展馆、活动和观景设施另计。', hours: '公园及各展馆开放时间分别确认。', label: '查看扎里亚季耶资料' },
    'msk-tretyakov': { status: '需购票 · 按日期确认', statusTone: 'ticket', ticket: '展览和入场时段按画廊官网票务安排。', hours: '开放日、临时展览和入口以官网为准。', label: '查看特列季亚科夫画廊官网' },
    'msk-arbat': { status: '公共空间', statusTone: 'free', ticket: '步行街本身通常不需要景点门票。', hours: '店铺、演出和临时活动按各自安排确认。', label: '查看阿尔巴特街资料' },
    'msk-bolshoi': { status: '按场次购票', statusTone: 'ticket', ticket: '观看演出需要按场次购票；外观参观不等于进入剧场。', hours: '票面场馆、开演时间和入场规则以官网为准。', label: '查看莫斯科大剧院官网' },
    'msk-gorky': { status: '公共空间 · 活动另行确认', statusTone: 'free', ticket: '公园散步通常不需要门票；展览、活动和租赁项目另计。', hours: '园区和当期活动的开放时间以官网为准。', label: '查看高尔基公园官网' },
    'msk-sparrow': { status: '公共空间 · 按天气确认', statusTone: 'free', ticket: '观景区域通常不需要景点门票；缆车、展馆等另行确认。', hours: '天气、能见度和临时活动会影响体验。', label: '查看麻雀山资料' },
    'msk-vdnh': { status: '园区开放 · 各展馆分别确认', statusTone: 'check', ticket: '园区与各展馆、展览的票务安排不同。', hours: '园区、展馆和季节项目的开放时间以官网为准。', label: '查看 ВДНХ 官网' },
    'msk-moscow-city': { status: '公共空间 · 观景台另购票', statusTone: 'check', ticket: '商务区河岸可散步；具体观景台按运营方购票。', hours: '商场、观景台和活动安排分别确认。', label: '查看莫斯科城资料' },
    'msk-armed-cathedral': { status: '通常开放 · 按日期确认', statusTone: 'check', ticket: '官网联系人页目前列入场免费；园区和其他展馆安排另行确认。', hours: '官网联系人页目前列每日 08:00–21:00；临时礼拜、活动和园区管控以官网为准。', label: '查看武装力量大教堂官网', checkedAt: '2026-09-18' }
  };

  return { spb, moscow };
});
