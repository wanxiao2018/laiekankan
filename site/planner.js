(function (root, factory) {
  const data = typeof module === 'object' && module.exports ? require('./data.js') : root.SPB_DATA;
  const core = factory(data);
  core.createFor = factory;
  if (typeof module === 'object' && module.exports) module.exports = core;
  else root.PlanCore = core;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (data) {
  const ids = new Set(data.places.map(p => p.id));
  const cityId = data.city.id;
  const defaultPlace = data.city.defaultPlace;
  const copy = value => JSON.parse(JSON.stringify(value));
  function validStartDate(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  }
  function createPlan(preset = 'classic') {
    const template = data.presets[preset] || data.presets.classic;
    return { version: 1, city: cityId, startDate: '', days: template.days.map((day, i) => ({ id: 'day-' + (i + 1), title: day.title, places: day.places.slice() })), selectedDay: 'day-1', selectedPlace: defaultPlace };
  }
  function restore(value) {
    if (!value || value.version !== 1 || !Array.isArray(value.days) || !value.days.length || value.days.length > 14) return null;
    // Untagged version-1 plans belong to the original Petersburg release.
    if (value.city !== cityId && !(cityId === 'spb' && value.city === undefined)) return null;
    const seen = new Set();
    const days = value.days.map((day, i) => {
      const withinDay = new Set();
      return {
      id: 'day-' + (i + 1),
      title: typeof day?.title === 'string' && day.title.trim() ? day.title.trim().slice(0, 50) : '自由安排',
      mapMode: mapMode(day),
      ...(day?.legModes && typeof day.legModes === 'object' ? { legModes: Object.fromEntries(Object.entries(day.legModes).filter(([key, mode]) => {
        const pair = key.split('>');
        return pair.length === 2 && pair[0] !== pair[1] && pair.every(id => ids.has(id)) && ['walking', 'transit'].includes(mode);
      })) } : {}),
      places: (Array.isArray(day?.places) ? day.places : []).filter(id => {
        if (!ids.has(id) || withinDay.has(id) || (place(id).kind !== 'food' && seen.has(id))) return false;
        withinDay.add(id); seen.add(id); return true;
      })
    }; });
    const selectedIndex = value.days.findIndex(day => day?.id === value.selectedDay);
    return { version: 1, city: cityId, startDate: validStartDate(value.startDate) ? value.startDate : '', days, selectedDay: days[Math.max(0, selectedIndex)].id, selectedPlace: ids.has(value.selectedPlace) ? value.selectedPlace : defaultPlace };
  }
  function assign(plan, placeId, dayId, afterId) {
    if (!ids.has(placeId) || !plan.days.some(day => day.id === dayId)) return copy(plan);
    const next = copy(plan);
    // A restaurant can be visited on more than one day. Attractions keep the
    // existing move-between-days behavior; duplicates within a day are removed.
    next.days.forEach(day => {
      if (place(placeId).kind !== 'food' || day.id === dayId) day.places = day.places.filter(id => id !== placeId);
    });
    const day = next.days.find(day => day.id === dayId);
    const afterIndex = day.places.indexOf(afterId);
    if (afterId === 'start') day.places.unshift(placeId);
    else if (afterIndex >= 0) day.places.splice(afterIndex + 1, 0, placeId);
    else day.places.push(placeId);
    return next;
  }
  function remove(plan, placeId, dayId) {
    const next = copy(plan);
    next.days.forEach(day => { if (!dayId || day.id === dayId) day.places = day.places.filter(id => id !== placeId); });
    return next;
  }
  function reorder(plan, dayId, placeId, delta) {
    const next = copy(plan);
    const day = next.days.find(day => day.id === dayId);
    if (!day) return next;
    const index = day.places.indexOf(placeId);
    const target = index + delta;
    if (index < 0 || target < 0 || target >= day.places.length) return next;
    [day.places[index], day.places[target]] = [day.places[target], day.places[index]];
    return next;
  }
  function addDay(plan) {
    const next = copy(plan);
    if (next.days.length >= 14) return next;
    let n = 1;
    while (next.days.some(day => day.id === 'day-' + n)) n++;
    const id = 'day-' + n;
    next.days.push({ id, title: '自由安排', places: [] });
    next.selectedDay = id;
    return next;
  }
  function deleteDay(plan, dayId) {
    const next = copy(plan);
    if (next.days.length <= 1) return next;
    const index = next.days.findIndex(day => day.id === dayId);
    if (index < 0) return next;
    next.days.splice(index, 1);
    if (next.selectedDay === dayId) next.selectedDay = next.days[Math.min(index, next.days.length - 1)].id;
    return next;
  }
  function place(id) { return data.places.find(p => p.id === id); }
  function visitDetails(p) {
    const value = data.visitInfo?.[p.id] || {};
    const food = p.kind === 'food';
    return {
      status: value.status || (food ? '营业信息 · 按日期确认' : '按出行日期确认'),
      ticket: value.ticket || (food ? '菜单、价格和分店安排以门店当天信息为准。' : '门票、预约和入场规则以官方页面为准。'),
      hours: value.hours || (food ? '营业时间和临时休息请在出发前确认。' : '开放时间、临时闭馆和季节安排请在出发前确认。'),
      url: value.url || p.source,
      label: value.label || p.sourceLabel,
      checkedAt: value.checkedAt || p.checkedAt || ''
    };
  }
  function exportPlace(p) {
    const visit = visitDetails(p);
    const food = p.kind === 'food';
    return '<li><h3>' + (food ? '用餐 · ' : '') + escape(p.name) + '</h3>' + (food ? '<p>' + escape(p.branch) + ' · ' + escape(p.tag) + '</p>' : '') + '<p lang="ru">' + escape(p.ru) + '<br>' + escape(p.address) + '</p><p>' + escape(p.time) + ' · ' + escape(p.note) + '</p>' + (food ? '<p>' + escape(p.routeHint) + '</p>' : '') + '<div class="visit-info"><strong>访问准备</strong><p>状态：' + escape(visit.status) + '</p><p>门票 / 预约：' + escape(visit.ticket) + '</p><p>开放 / 营业：' + escape(visit.hours) + '</p><a href="' + escape(visit.url) + '">' + escape(visit.label) + ' ↗</a>' + (visit.checkedAt ? '<small> · 信息核对：' + escape(visit.checkedAt) + '</small>' : '') + '</div><p><a href="' + escape(p.source) + '">' + escape(p.sourceLabel) + '</a>' + (p.checkedAt ? ' · 资料核对：' + escape(p.checkedAt) : '') + '</p><a href="' + escape(yandexPlaceUrl(p)) + '">Yandex 查看位置</a></li>';
  }
  function mapMode(day) {
    if (['overview', 'walking'].includes(day?.mapMode)) return day.mapMode;
    return day?.travelMode === 'walking' ? 'walking' : 'overview';
  }
  function modeLabel(mode) { return mode === 'walking' ? '步行' : '公交／地铁'; }
  function setMapMode(plan, dayId, mode) {
    const next = copy(plan);
    const day = next.days.find(d => d.id === dayId);
    if (day && ['overview', 'walking'].includes(mode)) day.mapMode = mode;
    return next;
  }
  function setStartDate(plan, startDate) {
    const next = copy(plan);
    next.startDate = validStartDate(startDate) ? startDate : '';
    return next;
  }
  function suggestedLegMode(from, to) {
    const walkable = from.walkWith?.includes(to.id) || to.walkWith?.includes(from.id) || data.walkingGroups.some(group => group.includes(from.id) && group.includes(to.id));
    return walkable ? 'walking' : 'transit';
  }
  function diningSuggestions(day) {
    return data.foodPlaces.filter(p => !day.places.includes(p.id) && p.pairWith.some(id => day.places.includes(id))).slice(0, 3).map(p => ({
      place: p,
      afterId: day.places.filter(id => p.pairWith.includes(id)).at(-1)
    }));
  }
  function legMode(day, from, to) {
    const saved = day.legModes?.[from.id + '>' + to.id];
    return ['walking', 'transit'].includes(saved) ? saved : suggestedLegMode(from, to);
  }
  function setLegMode(plan, dayId, fromId, toId, mode) {
    const next = copy(plan);
    const day = next.days.find(d => d.id === dayId);
    const index = day?.places.indexOf(fromId) ?? -1;
    if (index >= 0 && day.places[index + 1] === toId && ['walking', 'transit'].includes(mode)) {
      day.legModes = { ...day.legModes, [fromId + '>' + toId]: mode };
    }
    return next;
  }
  function location(p) { return p.ru + ', ' + p.address; }
  const yandexMaps = 'https://yandex.ru/maps/';
  const yandexWidget = 'https://yandex.ru/map-widget/v1/';
  const maxRouteStops = 8;
  const point = p => [p.latLng[1], p.latLng[0]].join(',');
  function mapsUrl(p) { return yandexPlaceUrl(p); }
  function embedUrl(p) { return overviewEmbedUrl([p]); }
  function legUrl(from, to, mode = suggestedLegMode(from, to)) { return yandexUrl(from, to, mode); }
  function yandexPlaceUrl(p) {
    if (p.kind === 'food') {
      if (p.yandexMap) return p.yandexMap;
      // Brand-only searches can pick a different branch or even another city.
      // A fixed marker keeps the verified food stop in the intended location.
      return yandexMaps + '?' + new URLSearchParams({ ll: point(p), pt: point(p), z: '17', lang: 'ru_RU' });
    }
    const params = new URLSearchParams({ text: location(p), ll: point(p), z: p.area === 'outside' ? '13' : '15', lang: 'ru_RU' });
    return yandexMaps + '?' + params;
  }
  function overviewParams(places) {
    const params = new URLSearchParams({ lang: 'ru_RU', l: 'map', pt: places.map(point).join('~') });
    if (places.length === 1) {
      const p = places[0];
      params.set('ll', point(p));
      params.set('z', p.area === 'outside' ? '13' : p.kind === 'food' ? '17' : '16');
    } else {
      const latitudes = places.map(p => p.latLng[0]);
      const longitudes = places.map(p => p.latLng[1]);
      const south = Math.min(...latitudes), north = Math.max(...latitudes);
      const west = Math.min(...longitudes), east = Math.max(...longitudes);
      const fixed = value => Number(value.toFixed(6));
      params.set('ll', [fixed((west + east) / 2), fixed((south + north) / 2)].join(','));
      // spn lets the widget fit both extents to its own desktop/mobile size.
      // Padding leaves room for pins and Yandex controls around the edges.
      params.set('spn', [fixed(Math.max((east - west) * 1.8, 0.006)), fixed(Math.max((north - south) * 1.8, 0.004))].join(','));
    }
    return params;
  }
  function overviewUrl(places) { return places.length ? yandexMaps + '?' + overviewParams(places) : null; }
  function overviewEmbedUrl(places) { return places.length ? yandexWidget + '?' + overviewParams(places) : null; }
  function routeParams(places, mode) {
    // Route points are latitude,longitude; map markers use longitude,latitude.
    // Always specify rtt so a previous driving preference is never reused.
    return new URLSearchParams({ lang: 'ru_RU', rtext: places.map(p => p.latLng.join(',')).join('~'), rtt: mode === 'walking' ? 'pd' : 'mt' });
  }
  function yandexUrl(from, to, mode = suggestedLegMode(from, to)) {
    return yandexMaps + '?' + routeParams([from, to], mode);
  }
  function routeEmbedUrl(places, mode = 'walking') {
    if (!places.length || !['walking', 'transit'].includes(mode)) return null;
    if (places.length === 1) return embedUrl(places[0]);
    if (places.length > maxRouteStops || (mode === 'transit' && places.length > 2)) return null;
    return yandexWidget + '?' + routeParams(places, mode);
  }
  function routeUrl(places, mode = 'walking') {
    // Keep shared routes to eight stops. Longer days use overlapping groups.
    if (!places.length || places.length > maxRouteStops || !['walking', 'transit'].includes(mode)) return null;
    // Transit is queried leg by leg so each segment retains its chosen mode.
    if (mode === 'transit' && places.length > 2) return null;
    if (places.length === 1) return yandexPlaceUrl(places[0]);
    return yandexMaps + '?' + routeParams(places, mode);
  }
  function routeGroups(places, mode = 'walking', maxStops = maxRouteStops) {
    // Adjacent groups share an endpoint, so every leg remains navigable.
    if (!places.length) return [];
    const limit = mode === 'transit' ? 2 : Math.max(2, Math.min(maxRouteStops, Math.floor(maxStops) || maxRouteStops));
    const groups = [];
    let start = 0;
    do {
      let end = Math.min(start + limit - 1, places.length - 1);
      let url = routeUrl(places.slice(start, end + 1), mode);
      while (!url && end > start + 1) {
        end--;
        url = routeUrl(places.slice(start, end + 1), mode);
      }
      if (!url) throw new RangeError('The route cannot be opened with this travel mode.');
      groups.push({ start: start + 1, end: end + 1, places: places.slice(start, end + 1), url });
      start = end;
    } while (start < places.length - 1);
    return groups;
  }
  function escape(value) { return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function exportHtml(plan) {
    const title = escape('我的' + data.city.shortName + '行程');
    const dateText = validStartDate(plan.startDate) ? ' · 出发日 ' + escape(plan.startDate) : '';
    const sections = plan.days.map((day, i) => {
      const places = day.places.map(place);
      let navigation = '';
      if (places.length) {
        navigation = '<p>' + places.length + ' 个地点</p>';
        if (places.length > 1) {
          navigation += '<p>分段导航：按需选择步行或公交／地铁，打开 Yandex 后也能切换。每段排在前面的方式与你在网站中的选择一致。</p>';
          navigation += places.slice(1).map((to, j) => {
            const from = places[j];
            const mode = legMode(day, from, to);
            const alternative = mode === 'walking' ? 'transit' : 'walking';
            return '<div class="transport-leg"><h3>第 ' + (j + 1) + ' 段 · ' + escape(from.name) + ' → ' + escape(to.name) + '</h3><div class="navigation"><a href="' + escape(yandexUrl(from, to, mode)) + '">Yandex ' + modeLabel(mode) + ' ↗</a><a href="' + escape(yandexUrl(from, to, alternative)) + '">Yandex ' + modeLabel(alternative) + ' ↗</a></div></div>';
          }).join('');
          const groups = routeGroups(places, 'walking');
          navigation += '<p><a href="' + escape(overviewUrl(places)) + '">Yandex 查看当天全部地点 ↗</a></p><details><summary>整天步行导航 · Yandex</summary><p>按当天顺序连接全部地点，仅用于全程步行。</p>';
          if (groups.length > 1) navigation += '<p>长路线分为 ' + groups.length + ' 组连续导航，保留全部地点。相邻组共用一站，请按顺序打开。</p>';
          navigation += '<div class="navigation">' + groups.map((g, j) => '<a href="' + escape(g.url) + '">' + (groups.length === 1 ? '整天步行导航' : '第 ' + (j + 1) + ' 组 · 第 ' + g.start + '–' + g.end + ' 站') + ' ↗</a>').join('') + '</div></details>';
        } else {
          navigation += '<p><a href="' + escape(yandexPlaceUrl(places[0])) + '">Yandex 查看位置 ↗</a> · 在地图中选择出发地和出行方式。</p>';
        }
      }
      return '<section><h2>第 ' + (i + 1) + ' 天 · ' + escape(day.title) + '</h2>' + navigation + (places.length ? '<ol>' + places.map(exportPlace).join('') + '</ol>' : '<p>这一天留给自由探索。</p>') + '</section>';
    }).join('');
    return '<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + title + ' · 去俄看看</title><style>body{font:16px/1.8 system-ui,sans-serif;max-width:760px;margin:40px auto;padding:0 22px;color:#302d29;background:#faf8f3}section{border-top:1px solid #ded8ca;margin-top:28px}li{padding:0 0 16px}h1,h2,h3{font-weight:600}p{margin:6px 0}a{color:#813c40}.navigation{display:flex;gap:12px;flex-wrap:wrap;margin:14px 0}.navigation a{border:1px solid #ded8ca;border-radius:6px;padding:8px 14px}details{margin:14px 0}summary{cursor:pointer}.visit-info{padding:10px 12px;background:#f4efe7;border-radius:6px;margin:14px 0}footer{color:#656059;margin-top:36px}@media print{body{background:white;margin:0}section{break-inside:avoid}}</style><h1>' + title + '</h1><p>去俄看看 · ' + plan.days.length + ' 天' + dateText + ' · 可离线查看文字与地址</p>' + sections + '<footer>停留时长是规划建议，地图中的交通时间不含游览。营业、门票、演出场馆与季节项目请在出发前复核。地图链接需要联网。</footer></html>';
  }
  return { cityId, copy, createPlan, restore, assign, remove, reorder, addDay, deleteDay, place, visitDetails, mapMode, modeLabel, setMapMode, setStartDate, validStartDate, suggestedLegMode, diningSuggestions, legMode, setLegMode, mapsUrl, embedUrl, legUrl, yandexPlaceUrl, yandexUrl, overviewUrl, overviewEmbedUrl, routeEmbedUrl, routeUrl, routeGroups, escape, exportHtml };
});
