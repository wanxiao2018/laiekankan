(() => {
  'use strict';
  const cities = { spb: window.SPB_DATA, moscow: window.MOSCOW_DATA };
  const shareTools = window.ShareTools;
  const sharedPayload = shareTools?.readHash(window.location.hash);
  const cityPreferenceKey = 'qu-ekankan-active-city-v1';
  const knownCity = id => Object.hasOwn(cities, id);
  let preferredCity;
  try { preferredCity = localStorage.getItem(cityPreferenceKey); } catch (_) {}
  const requestedCity = new URLSearchParams(window.location.search).get('city');
  const sharedCity = sharedPayload?.city;
  let data = cities[knownCity(requestedCity) ? requestedCity : knownCity(sharedCity) ? sharedCity : knownCity(preferredCity) ? preferredCity : 'spb'];
  let core = window.PlanCore.createFor(data);
  const $ = id => document.getElementById(id);
  const esc = core.escape;
  let storageKey = data.city.storageKey;
  let plan;
  let saveAvailable = true;
  const cityHistories = { spb: [], moscow: [] };
  let history = cityHistories[data.city.id];
  let filter = 'all';
  let query = '';
  let mappedUrl = '';
  let mapView = 'day';
  let mapLoadTimer;
  let toastTimer;
  let pendingSharedPayload = sharedPayload;
  function loadPlan() {
    let restored;
    if (pendingSharedPayload) {
      const shared = core.restore(pendingSharedPayload);
      pendingSharedPayload = null;
      try { window.history.replaceState(null, '', shareTools.withoutShareHash(window.location.href)); } catch (_) {}
      if (shared) {
        let hasExisting = false;
        try { hasExisting = Boolean(localStorage.getItem(storageKey)); } catch (_) {}
        if (!hasExisting || window.confirm('这是一份分享行程，是否载入？载入后会加入当前行程。')) return shared;
      }
    }
    try { restored = core.restore(JSON.parse(localStorage.getItem(storageKey))); } catch (_) { saveAvailable = false; }
    return restored || core.createPlan();
  }
  plan = loadPlan();
  const selectedDay = () => plan.days.find(day => day.id === plan.selectedDay);
  const assignment = id => {
    const current = plan.days.findIndex(day => day.id === plan.selectedDay && day.places.includes(id));
    return current >= 0 ? current : plan.days.findIndex(day => day.places.includes(id));
  };
  const aliases = { hermitage:'艾尔米塔什 冬宫博物馆', peterhof:'彼得霍夫 夏宫花园', catherine:'叶卡捷琳娜宫 皇村', isaac:'圣以撒 伊萨基耶夫', books:'辛格大楼 书店', park300:'300公园 三百周年', yelagin:'叶拉金岛', fortress:'彼得堡要塞 兔子岛' };
  function save() {
    try { localStorage.setItem(storageKey, JSON.stringify(plan)); saveAvailable = true; } catch (_) { saveAvailable = false; }
    try { localStorage.setItem(cityPreferenceKey, data.city.id); } catch (_) {}
    $('save-status').textContent = saveAvailable ? '已保存' : '保存受限';
  }
  function renderCity() {
    const city = data.city;
    document.title = '去俄看看';
    $('city-label').textContent = city.name;
    $('page-title').textContent = '去俄看看';
    $('intro-copy').textContent = city.id === 'moscow' ? '从参考路线出发，轻松打造属于你的俄罗斯行程。探索莫斯科的街巷，感受红场与河岸的故事。' : '从参考路线出发，轻松打造属于你的俄罗斯行程。探索圣彼得堡的浪漫，感受莫斯科的磅礴。';
    $('city-edition').textContent = city.edition;
    $('city-tagline').textContent = city.tagline;
    $('city-summary').textContent = data.attractions.length + ' 个地点 · 选一座城市，开始安排';
    $('hero-place-count').textContent = data.attractions.length;
    $('hero-route-count').textContent = Object.keys(data.presets).length;
    $('hero-route-label').textContent = '份参考路线';
    document.querySelectorAll('[data-city]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.city === city.id)));
    $('preset-select').innerHTML = Object.entries(data.presets).map(([id, preset]) => '<option value="' + id + '"' + (id === 'classic' ? ' selected' : '') + '>' + esc(preset.label) + '</option>').join('');
    renderPresetDescription();
    $('category-filters').innerHTML = data.categories.filter(([id]) => id !== 'food').map(([id, label]) => '<button type="button" data-category="' + id + '" aria-pressed="' + (id === filter) + '">' + esc(label) + '</button>').join('');
    $('place-search').placeholder = '搜索景点、俄语名';
    $('place-search').setAttribute('aria-label', '搜索景点');
    $('catalog-note').textContent = '挑选想去的景点，在地图下方加入当天。';
    document.querySelector('[data-view="discover"]').textContent = '景点';
  }
  function renderPresetDescription() {
    const description = data.presets[$('preset-select').value]?.description;
    $('preset-description').textContent = description ? '这份参考路线：' + description : '';
    $('preset-description').hidden = !description;
    const label = data.presets[$('preset-select').value]?.label || '参考路线';
    $('hero-start-label').textContent = '从 ' + label.split(' · ')[0] + '路线开始';
  }
  function switchCity(id) {
    if (!knownCity(id) || id === data.city.id) return;
    save();
    data = cities[id];
    core = window.PlanCore.createFor(data);
    storageKey = data.city.storageKey;
    history = cityHistories[id];
    plan = loadPlan();
    filter = 'all'; query = '';
    $('place-search').value = '';
    mapView = 'day';
    if ($('info-dialog').open) $('info-dialog').close();
    if ($('place-dialog').open) $('place-dialog').close();
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('city', id);
      window.history.replaceState(null, '', url);
    } catch (_) {}
    renderCity(); save(); render(); switchView('overview');
    toast('已切换到' + data.city.name + '，两座城市的行程分别保存');
  }
  function toast(message) {
    clearTimeout(toastTimer);
    $('toast').textContent = message;
    $('toast').hidden = false;
    toastTimer = setTimeout(() => { $('toast').hidden = true; }, 3300);
  }
  function commit(next, message) {
    history.push(core.copy(plan));
    if (history.length > 25) history.shift();
    plan = next;
    mapView = 'day';
    const day = selectedDay();
    if (day.places.length && !day.places.includes(plan.selectedPlace)) plan.selectedPlace = day.places[0];
    save();
    render();
    if (message) toast(message);
  }
  function switchView(view) {
    if (view === 'overview') delete $('workspace').dataset.activeView;
    else $('workspace').dataset.activeView = view;
    document.querySelectorAll('[data-view]').forEach(button => {
      const active = button.dataset.view === view;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    document.querySelectorAll('[data-pane]').forEach(pane => pane.classList.toggle('pane-active', view === 'overview' || pane.dataset.pane === view));
  }
  function selectPlace(id, context = 'catalog') {
    if (!core.place(id)) return;
    plan.selectedPlace = id;
    mapView = context === 'route' ? 'day' : 'place';
    save(); renderCatalog(); renderDetail(); renderMap();
    if (!$('place-dialog').open) $('place-dialog').showModal();
  }
  function selectDay(id) {
    const day = plan.days.find(d => d.id === id);
    if (!day) return;
    plan.selectedDay = id;
    if (day.places.length && !day.places.includes(plan.selectedPlace)) plan.selectedPlace = day.places[0];
    mapView = 'day';
    save(); render();
  }
  function setNavigationLink(link, label, href, dialog = '') {
    link.textContent = label;
    link.setAttribute('aria-disabled', String(!href));
    link.dataset.dialog = dialog;
    if (dialog) { link.setAttribute('aria-haspopup', 'dialog'); link.setAttribute('aria-controls', 'info-dialog'); }
    else { link.removeAttribute('aria-haspopup'); link.removeAttribute('aria-controls'); }
    if (!href) { link.removeAttribute('href'); link.setAttribute('tabindex', '-1'); }
    else { link.href = href; link.removeAttribute('tabindex'); }
  }
  function setYandexNavigationLink(link) {
    const day = selectedDay();
    const places = day.places.map(core.place);
    const label = places.length === 1 ? '查看地图位置 ↗' : link.id === 'map-external' ? '地图导航' : '分段导航';
    setNavigationLink(link, label, !places.length ? null : places.length === 1 ? core.yandexPlaceUrl(places[0]) : '#segment-navigation', places.length > 1 ? 'segments' : '');
  }
  function setWalkingNavigationLink(link) {
    const places = selectedDay().places.map(core.place);
    const groups = core.routeGroups(places, 'walking');
    setNavigationLink(link, (places.length === 1 ? '查看位置' : '整天步行导航') + ' ↗', !places.length ? null : groups.length === 1 ? groups[0].url : '#whole-day-navigation', groups.length > 1 ? 'walking' : '');
  }
  function renderMap() {
    const day = selectedDay();
    const places = day.places.map(core.place);
    const p = core.place(plan.selectedPlace);
    const mode = core.mapMode(day);
    const dayView = mapView === 'day';
    const empty = dayView && !places.length;
    const route = dayView && mode === 'walking' ? core.routeEmbedUrl(places, 'walking') : null;
    const grouped = dayView && mode === 'walking' && places.length > 1 && !route;
    const overview = dayView && !empty && (mode === 'overview' || grouped);
    const url = empty ? null : !dayView ? core.embedUrl(p) : overview ? core.overviewEmbedUrl(places) : route;
    document.querySelectorAll('[data-map-view]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mapView === mapView)));
    $('map-display-mode').value = mode;
    $('map-display-mode').disabled = !dayView || !places.length;
    $('place-map').hidden = empty;
    $('map-empty').hidden = !empty;
    $('reload-map').disabled = empty;
    $('map-heading-name').textContent = dayView ? '第 ' + (plan.days.indexOf(day) + 1) + ' 天 · ' + places.length + ' 个地点 · 地图' + (places.length > 1 ? ' ' + (overview ? '位置总览' : '步行') : '') : p.name + ' · 地图';
    if (dayView && mode === 'walking') setWalkingNavigationLink($('map-external'));
    else if (dayView) setNavigationLink($('map-external'), '在地图中打开 ↗', core.overviewUrl(places));
    else setNavigationLink($('map-external'), '地图位置 ↗', core.yandexPlaceUrl(p));
    if (url !== mappedUrl) {
      clearTimeout(mapLoadTimer);
      $('map-loading').hidden = !url;
      $('map-loading-label').textContent = dayView ? '正在加载当天地图…' : '正在加载地点位置…';
      $('place-map').setAttribute('aria-busy', String(Boolean(url)));
      if (url) {
        $('place-map').src = url;
        mapLoadTimer = setTimeout(() => { $('map-loading-label').textContent = '地图加载较慢，可刷新或点击下方链接打开。'; }, 12000);
      } else $('place-map').removeAttribute('src');
      mappedUrl = url;
    }
    $('place-map').title = dayView ? '第 ' + (plan.days.indexOf(day) + 1) + ' 天：' + places.map(p => p.name).join(' → ') + '，' + (overview || places.length < 2 ? '位置地图' : '步行路线') : p.name + '的位置地图';
    $('map-route-preview').hidden = !dayView || !places.length;
    $('map-route-preview').innerHTML = places.map((stop, i) => '<li><button type="button" data-map-place="' + stop.id + '" aria-pressed="' + (stop.id === plan.selectedPlace) + '" aria-label="查看第 ' + (i + 1) + ' 站：' + esc(stop.name) + '"><span class="map-stop-number">' + (i + 1) + '</span>' + esc(stop.name) + '</button></li>').join('');
    $('map-help-text').textContent = empty ? '加入地点后，地图会自动更新。' : !dayView ? '地图标记地点位置；看完可切回当天行程。' : places.length === 1 ? '当天只有一站，可在地图中选择出发地。' : grouped ? '地图标出全部地点；整天步行导航按连续分组打开，保留每一站。' : overview ? '地图标出当天各站，下方按游览顺序排列；可切换步行路线或打开分段导航。' : '紫色虚线为步行道路；交通时间不含游览停留。';
  }
  function renderCatalog() {
    const normal = text => text.normalize('NFKC').toLowerCase().replace(/\s/g, '');
    const needle = normal(query);
    const places = data.attractions.filter(p => (filter === 'all' || p.category === filter) && normal([p.name,p.ru,p.address,p.tag,p.aliases || '',aliases[p.id] || ''].join(' ')).includes(needle));
    $('place-count').textContent = places.length + ' / ' + data.attractions.length + ' 处';
    $('place-list').innerHTML = places.length ? places.map(p => {
      const dayIndex = assignment(p.id);
      const active = p.id === plan.selectedPlace;
      const assignedLabel = '第 ' + (dayIndex+1) + ' 天';
      const summary = p.intro || p.routeHint || '';
      const image = window.PLACE_IMAGES?.[p.id];
      const thumbnail = image ? '<img class="place-thumbnail" src="' + esc(image.src) + '" alt="" loading="lazy" decoding="async">' : '<span class="place-initial" aria-hidden="true">' + esc(p.name[0]) + '</span>';
      return '<button type="button" class="place-item place-' + esc(p.category || 'other') + (active ? ' active' : '') + '" data-place="' + p.id + '" aria-pressed="' + active + '">' + thumbnail + '<span class="place-item-copy"><span class="place-item-name">' + esc(p.name) + '</span><span class="place-item-tag">' + esc(p.tag) + '</span><span class="place-item-intro">' + esc(summary) + '</span></span>' + (dayIndex >= 0 ? '<span class="place-day">' + assignedLabel + '</span>' : '') + '</button>';
    }).join('') : '<p class="empty-state">没有找到这个地方。<br>试试中文名、俄语名或其他分类。</p>';
  }
  function renderDetail() {
    const p = core.place(plan.selectedPlace);
    const day = selectedDay();
    const dayIndex = plan.days.indexOf(day);
    const existing = assignment(p.id);
    const sameDay = existing === dayIndex;
    const action = sameDay ? '已在第 ' + (dayIndex+1) + ' 天' : existing >= 0 ? '移到第 ' + (dayIndex+1) + ' 天' : '＋ 加入第 ' + (dayIndex+1) + ' 天';
    const visit = core.visitDetails(p);
    const image = window.PLACE_IMAGES?.[p.id];
    const detailImage = image ? '<img class="detail-image" src="' + esc(image.src) + '" alt="' + esc(p.name) + '" decoding="async">' : '';
    const imageSource = image ? '<a href="' + esc(image.source) + '" target="_blank" rel="noopener noreferrer">图片：' + esc(image.credit) + ' · ' + esc(image.license) + '</a>' : '';
    $('place-dialog-title').textContent = p.name;
    $('place-detail').innerHTML = '<div class="place-card-heading">' + detailImage + '<div><p class="russian-name" lang="ru">' + esc(p.ru) + '</p><div class="detail-top"><span class="detail-tag">' + esc(p.tag) + '</span><span class="detail-duration">' + esc(p.time) + '</span></div><p class="detail-intro">' + esc(p.intro || '') + '</p></div></div>' +
      '<dl class="place-facts"><div><dt>开放时间</dt><dd>' + esc(visit.hours) + '</dd></div><div><dt>门票与预约</dt><dd>' + esc(visit.ticket) + '</dd></div><div><dt>地址</dt><dd lang="ru">' + esc(p.address) + '</dd></div></dl>' +
      '<a class="place-official" href="' + esc(visit.url) + '" target="_blank" rel="noopener noreferrer">' + esc(visit.label) + ' ↗</a>' + (visit.checkedAt ? '<span class="visit-checked">核对日期：' + esc(visit.checkedAt) + '</span>' : '') +
      '<div class="detail-actions"><button id="assign-place" class="button" type="button"' + (sameDay ? ' disabled' : '') + '>' + action + '</button><button id="detail-show-map" class="button outline" type="button">在地图上查看</button><button id="copy-address" class="text-button" type="button">复制地址</button></div>' +
      '<details class="place-extra"><summary>游览提醒与图片来源</summary><p>' + esc(p.note || '') + '</p>' + imageSource + '</details>';
  }

  function dayDate(index) {
    if (!core.validStartDate(plan.startDate)) return '';
    const [year, month, day] = plan.startDate.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day + index));
    return date.getUTCFullYear() + '年' + String(date.getUTCMonth() + 1).padStart(2, '0') + '月' + String(date.getUTCDate()).padStart(2, '0') + '日';
  }
  function renderTrip() {
    const day = selectedDay();
    const dayIndex = plan.days.indexOf(day);
    $('trip-count').textContent = plan.days.reduce((n, d) => n + d.places.length, 0) + ' 个地点';
    $('trip-start-date').value = core.validStartDate(plan.startDate) ? plan.startDate : '';
    const dayOptions = plan.days.map((d,i) => '<option value="' + d.id + '"' + (d.id === day.id ? ' selected' : '') + '>第 ' + (i+1) + (dayDate(i) ? ' · ' + dayDate(i) : '') + ' · ' + esc(d.title) + '</option>').join('');
    $('day-select').innerHTML = dayOptions;
    $('day-tabs').innerHTML = plan.days.map((d, i) => '<button type="button" data-day-id="' + esc(d.id) + '" aria-pressed="' + (d.id === day.id) + '"><strong>第 ' + (i + 1) + ' 天</strong><span>' + esc(d.title) + '</span></button>').join('');
    $('map-day-select').innerHTML = dayOptions;
    $('day-kicker').textContent = '第 ' + String(dayIndex+1).padStart(2, '0') + ' 天' + (dayDate(dayIndex) ? ' · ' + dayDate(dayIndex) : '');
    $('day-title').textContent = day.title;
    $('delete-day').disabled = plan.days.length === 1;
    $('add-day').disabled = plan.days.length >= 14;
    $('route-list').innerHTML = day.places.length ? day.places.map((id,i) => {
      const p = core.place(id);
      return '<li class="route-item">' + (window.PLACE_IMAGES?.[id] ? '<img class="route-thumbnail" src="' + esc(window.PLACE_IMAGES[id].src) + '" alt="" loading="lazy">' : '') + '<span class="route-number">' + String(i+1).padStart(2,'0') + '</span><div><button class="route-place" type="button" data-route-action="select" data-id="' + id + '">' + esc(p.name) + '</button><span class="route-time">' + esc(p.time) + '</span><div class="route-item-controls"><button type="button" data-route-action="up" data-id="' + id + '" aria-label="将' + esc(p.name) + '上移"' + (i === 0 ? ' disabled' : '') + '>↑ 上移</button><button type="button" data-route-action="down" data-id="' + id + '" aria-label="将' + esc(p.name) + '下移"' + (i === day.places.length-1 ? ' disabled' : '') + '>↓ 下移</button><button class="remove-place" type="button" data-route-action="remove" data-id="' + id + '" aria-label="从行程移除' + esc(p.name) + '">移除</button></div></div></li>';
    }).join('') : '<li class="empty-state">这一天，留给你的选择。<br>挑一个景点加入吧。</li>';
    let note = '可以调整顺序，留点时间慢慢走。';
    if (data.city.id === 'moscow') {
      if (day.places.includes('msk-vdnh')) note = day.places.length > 1 ? 'ВДНХ 园区很大，建议单独留出半天到一天。与市中心景点组合时，请给地铁往返留足时间。' : '先选想看的展馆，再决定园内步行范围。喷泉和其他季节活动请按具体出行日期复核。';
      else if (day.places.includes('msk-kremlin')) note = '先按预约票种确认克里姆林宫入口，留出安检时间。若还要入内参观圣瓦西里大教堂，可减少其他停留或移到另一天。';
      else if (day.places.includes('msk-bolshoi')) note = '白天可以看剧院外观；若安排演出，请按票面场馆和开演时间调整晚餐与交通。';
      else if (day.places.includes('msk-sparrow') || day.places.includes('msk-moscow-city')) note = '麻雀山、老阿尔巴特与莫斯科城之间需要交通衔接，优先比较地铁／公交。麻雀山上下有高差，别只按地图直线距离估时。';
      else if (day.places.includes('msk-armed-cathedral')) note = '武装力量大教堂位于莫斯科郊外的爱国者公园，建议单独安排半天到一天，并提前确认往返交通和园区开放安排。';
      else if (day.places.includes('msk-tretyakov') && day.places.includes('msk-gorky')) note = '先把参观时间留给特列季亚科夫老馆；高尔基公园的河岸散步可按兴趣、天气和体力调整。';
      else if (day.places.length > 4) note = '今天安排得比较充实。可以把一两个地点移到其他天，走得更从容。';
    }
    else if (day.places.filter(id => core.place(id).area === 'outside').length > 1) note = '夏宫和叶宫在不同方向，建议分开两天安排，给游览和往返留足时间。';
    else if (day.places.some(id => core.place(id).area === 'outside')) note = '郊外行程请为往返留足时间。宫殿、花园与交通的季节安排需要分别确认。';
    else if (day.places.includes('russian-museum')) note = day.places.includes('hermitage') ? '冬宫和俄罗斯博物馆都适合留出较长参观时间，建议分开两天。花园和战神广场可作为俄罗斯博物馆之后的散步。' : '俄罗斯博物馆主馆建议留出 2–3 小时，再到米哈伊洛夫花园和战神广场散步。主馆与花园的开放安排分别确认。';
    else if (day.places.includes('mariinsky')) note = '剧院之夜请按票面场馆和开演时间安排，给晚餐和交通留些余地。';
    else if (day.places.includes('park300') && day.places.includes('yelagin')) note = '岛屿与海边之间需要交通衔接。遇到风雨，可以只保留其中一处。';
    else if (day.places.includes('blood') && day.places.includes('mikhailovsky-garden') && day.places.includes('field-mars')) note = '滴血教堂、米哈伊洛夫花园与战神广场可以步行串联。教堂入内、花园和河岸散步按兴趣取舍；想看俄罗斯博物馆，可替换部分停留，给馆内留出 2–3 小时。';
    else if (day.places.length > 4) note = '今天安排得比较充实。可以把一两个地点移到其他天，走得更从容。';
    $('route-note').textContent = note;
    $('trip-map-mode').value = core.mapMode(day);
    $('trip-map-mode').disabled = day.places.length === 0;
    $('navigation-note').textContent = day.places.length === 1 ? '在地图中点击路线，选择出发地与步行或公交。' : '相近地点可串联步行；每段都可选择步行或公交／地铁。';
    setYandexNavigationLink($('navigate-day'));
    setWalkingNavigationLink($('navigate-full-day'));
  }
  function render() {
    renderCatalog(); renderDetail(); renderTrip(); renderMap();
    $('undo-button').disabled = history.length === 0;
  }
  function openDialog(title, content) {
    $('dialog-title').textContent = title;
    $('dialog-content').innerHTML = content;
    $('info-dialog').showModal();
  }
  function showAbout() {
    openDialog('一份可以改动的城市手册', '<p>' + esc(data.city.introduction) + '先选一份参考路线，再把每一天改成自己喜欢的样子。</p><ul><li>从页面上方切换圣彼得堡与莫斯科，两座城市的行程分别管理，改动也分别撤销。</li><li>当天总览标出全部地点，地图下方按游览顺序排列中文地名。</li><li>打开「分段导航」，每段都能选择步行或公交／地铁；具体道路、站点和班次可在地图中查看。</li><li>地图也能切换成整天步行路线；上移、下移地点后会同步更新，改动可以撤销。较长路线按连续分组打开。</li></ul><p>导出的手册可离线查看文字和俄语地址；地图导航需要联网。</p>');
  }
  function showSources() {
    const sources = data.sources.map(([label, url]) => '<li><a href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">' + esc(label) + '</a></li>').join('');
    const imageCredits = Object.entries(window.PLACE_IMAGES || {}).map(([id, image]) => {
      const place = data.places.find(item => item.id === id);
      return place ? '<li>' + esc(place.name) + '：' + esc(image.credit) + ' · <a href="' + esc(image.source) + '" target="_blank" rel="noopener noreferrer">' + esc(image.license) + '</a></li>' : '';
    }).filter(Boolean).join('');
    const imageInfo = imageCredits ? '<h3 class="sources-subheading">展示图片</h3><ul>' + imageCredits + '</ul>' : '';
    openDialog(data.city.name + ' · 信息与来源', '<p>景点详情提供场馆官网或公开资料入口，新增资料核对于 2026-09-14。开放日期、临时限制、门票和演出请按具体出行日期复核。</p><p>停留时长与参考路线是规划建议，请结合兴趣、住宿和预约时间调整。</p><ul>' + sources + '</ul>' + imageInfo + '<p>地图与导航由地图服务提供。当天总览标出全部地点，中文列表显示游览顺序；切换步行路线后，紫色虚线表示实际步行道路。位置标记用于找到场馆、建筑或街区，实际入口请在到达前确认。步行初选依据常见散步组合，具体道路、站点与班次在地图中查看。地图服务需要联网；加载不畅时可使用地图下方的链接。</p>');
  }
  function showFullNavigation() {
    const day = selectedDay();
    const places = day.places.map(core.place);
    if (!places.length) return;
    const groups = core.routeGroups(places, 'walking');
    let content = '<p>第 ' + (plan.days.indexOf(day) + 1) + ' 天 · ' + places.length + ' 站 · 步行。当天地图仍会显示全部地点。</p>';
    if (groups.length > 1) {
      content += '<p>较长行程按每组最多 8 站打开地图。以下 ' + groups.length + ' 组按顺序衔接，相邻组共用一站，覆盖完整行程。</p>';
    }
    content += groups.map((g, i) => '<a class="navigation-leg" href="' + esc(g.url) + '" target="_blank" rel="noopener noreferrer"><span><strong>' + (groups.length > 1 ? '第 ' + (i + 1) + ' 组 · 第 ' + g.start + '–' + g.end + ' 站' : '打开整天路线') + '</strong><small>' + g.places.map(p => esc(p.name)).join(' → ') + '</small></span><span>↗</span></a>').join('');
    content += '<p>需要分段选择步行或公交时，可打开「分段导航」。</p>';
    openDialog('整天步行导航', content);
  }
  function handleDayNavigation(event) {
    const link = event.currentTarget;
    if (link.getAttribute('aria-disabled') === 'true') { event.preventDefault(); return; }
    if (link.dataset.dialog) {
      event.preventDefault();
      if (link.dataset.dialog === 'segments') showNavigation();
      else showFullNavigation();
    }
  }
  function navigationHint(day, from, to) {
    const suggested = core.suggestedLegMode(from, to);
    if (core.legMode(day, from, to) !== suggested) return '已按你的选择设置；打开地图后也能切换。';
    return suggested === 'walking' ? '这段可以串联步行，也可按体力和天气调整。' : '可先比较公交／地铁方案，也能改选步行。';
  }
  function showNavigation() {
    const day = selectedDay();
    const places = day.places.map(core.place);
    if (places.length < 2) return;
    const links = places.slice(1).map((to, i) => {
      const from = places[i];
      const mode = core.legMode(day, from, to);
      const routeLabel = esc(from.name + '到' + to.name);
      return '<div class="transport-leg" data-from="' + from.id + '" data-to="' + to.id + '"><h3><span>第 ' + (i + 1) + ' 段 · ' + (i + 1) + ' → ' + (i + 2) + '</span>' + esc(from.name) + ' → ' + esc(to.name) + '</h3><p class="transport-hint">' + navigationHint(day, from, to) + '</p><div class="transport-actions"><label><span class="sr-only">' + routeLabel + '的出行方式</span><select data-leg-mode><option value="walking"' + (mode === 'walking' ? ' selected' : '') + '>步行</option><option value="transit"' + (mode === 'transit' ? ' selected' : '') + '>公交／地铁</option></select></label><a class="yandex-navigation" href="' + esc(core.yandexUrl(from, to, mode)) + '" aria-label="' + routeLabel + '，地图导航" target="_blank" rel="noopener noreferrer">地图导航 ↗</a></div></div>';
    }).join('');
    openDialog('第 ' + (plan.days.indexOf(day) + 1) + ' 天 · 分段导航', '<p>相近地点先选步行，每段都能单独调整。打开地图后，也能切换步行、公交和出发时间。</p>' + links);
  }
  function exportPlan() {
    const blob = new Blob([core.exportHtml(plan)], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '我的' + data.city.shortName + '行程-' + plan.days.length + '天.html';
    document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    toast('已导出，可离线查看文字和俄语地址');
  }
  function openShareDialog() {
    if (!shareTools) { toast('分享功能加载失败，请刷新页面后重试'); return; }
    const url = shareTools.buildUrl(window.location.href, plan, data.city.id);
    $('share-url').value = url;
    const canvas = $('share-qr');
    const note = $('share-qr-note');
    note.textContent = '扫描二维码打开这份行程。';
    canvas.hidden = false;
    if (window.QRCode?.toCanvas) {
      window.QRCode.toCanvas(canvas, url, { width: 220, margin: 2, errorCorrectionLevel: 'M', color: { dark: '#26352d', light: '#faf7ee' } }, error => {
        if (error) { canvas.hidden = true; note.textContent = '二维码暂时生成失败，请复制上方链接。'; }
      });
    } else {
      canvas.hidden = true;
      note.textContent = '当前未加载二维码组件，请复制上方链接。';
    }
    $('native-share').hidden = typeof navigator.share !== 'function';
    $('share-dialog').showModal();
  }
  async function copyShareLink() {
    const input = $('share-url');
    try { await navigator.clipboard.writeText(input.value); toast('分享链接已复制'); }
    catch (_) { input.focus(); input.select(); document.execCommand('copy'); toast('分享链接已选中，请复制'); }
  }
  function chooseCategory(id) {
    filter = id;
    $('category-filters').querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.category === filter)));
    renderCatalog();
  }
  $('city-switch').addEventListener('click', event => {
    const button = event.target.closest('[data-city]');
    if (button) switchCity(button.dataset.city);
  });
  $('category-filters').addEventListener('click', event => {
    const button = event.target.closest('[data-category]');
    if (!button) return;
    chooseCategory(button.dataset.category);
  });
  $('place-search').addEventListener('input', event => { query = event.target.value; renderCatalog(); });
  $('place-list').addEventListener('click', event => { const button = event.target.closest('[data-place]'); if (button) selectPlace(button.dataset.place); });
  $('day-tabs').addEventListener('click', event => { const button = event.target.closest('[data-day-id]'); if (button) selectDay(button.dataset.dayId); });
  ['day-select', 'map-day-select'].forEach(id => $(id).addEventListener('change', event => selectDay(event.target.value)));
  $('trip-start-date').addEventListener('change', event => commit(core.setStartDate(plan, event.target.value), event.target.value ? '已设置出发日期' : '已清除出发日期'));
  ['map-display-mode', 'trip-map-mode'].forEach(id => $(id).addEventListener('change', event => commit(core.setMapMode(plan, plan.selectedDay, event.target.value))));
  $('dialog-content').addEventListener('change', event => {
    const select = event.target.closest('[data-leg-mode]');
    if (!select) return;
    const row = select.closest('.transport-leg');
    const from = core.place(row.dataset.from);
    const to = core.place(row.dataset.to);
    commit(core.setLegMode(plan, plan.selectedDay, from.id, to.id, select.value));
    const mode = core.legMode(selectedDay(), from, to);
    row.querySelector('.yandex-navigation').href = core.yandexUrl(from, to, mode);
    row.querySelector('.transport-hint').textContent = navigationHint(selectedDay(), from, to);
  });
  document.querySelectorAll('[data-map-view]').forEach(button => button.addEventListener('click', () => { mapView = button.dataset.mapView; renderMap(); }));
  $('map-route-preview').addEventListener('click', event => {
    const button = event.target.closest('[data-map-place]');
    if (!button) return;
    selectPlace(button.dataset.mapPlace, 'route');

  });
  $('map-pick-place').addEventListener('click', () => { switchView('discover'); $('place-search').focus(); });
  $('view-day-map').addEventListener('click', () => { mapView = 'day'; renderMap(); switchView('map'); document.querySelector('.map-pane').scrollIntoView({ block: 'start' }); });
  $('reload-map').addEventListener('click', () => { mappedUrl = ''; renderMap(); });
  $('place-map').addEventListener('load', () => { clearTimeout(mapLoadTimer); $('map-loading').hidden = true; $('place-map').setAttribute('aria-busy', 'false'); });
  $('map-external').addEventListener('click', handleDayNavigation);
  $('navigate-full-day').addEventListener('click', handleDayNavigation);
  $('navigate-day').addEventListener('click', handleDayNavigation);
  $('close-place-dialog').addEventListener('click', () => $('place-dialog').close());
  $('place-dialog').addEventListener('click', event => {
    if (event.target !== $('place-dialog')) return;
    const r = $('place-dialog').getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) $('place-dialog').close();
  });
  $('place-detail').addEventListener('click', async event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.id === 'detail-show-map') {
      $('place-dialog').close(); mapView = 'place'; renderMap(); switchView('map');
      $('workspace').scrollIntoView({ block: 'start' });
    }
    if (button.id === 'assign-place') {
      const existing = assignment(plan.selectedPlace);
      const p = core.place(plan.selectedPlace);
      commit(core.assign(plan, plan.selectedPlace, plan.selectedDay), (existing >= 0 ? '已移动到' : '已加入') + '第 ' + (plan.days.indexOf(selectedDay())+1) + ' 天');
    }
    if (button.id === 'copy-address') {
      const p = core.place(plan.selectedPlace);
      const address = p.ru + '\n' + p.address;
      try { await navigator.clipboard.writeText(address); toast('俄语名称和地址已复制'); }
      catch (_) {
        openDialog('俄语名称与地址', '<p>可以选中下面的文字，复制或直接出示。</p><p lang="ru" class="russian-copy">' + esc(p.ru) + '<br>' + esc(p.address) + '</p>');
      }
    }
  });
  $('route-list').addEventListener('click', event => {
    const button = event.target.closest('[data-route-action]');
    if (!button) return;
    const id = button.dataset.id;
    const action = button.dataset.routeAction;
    if (action === 'select') { selectPlace(id, 'route'); return; }
    if (action === 'remove') commit(core.remove(plan,id,plan.selectedDay), '已从当天移除，可以撤销');
    else {
      commit(core.reorder(plan,plan.selectedDay,id,action === 'up' ? -1 : 1));
      const updated = $('route-list').querySelector('[data-id="' + id + '"][data-route-action="' + action + '"]');
      if (updated && !updated.disabled) updated.focus();
      else $('route-list').querySelector('[data-id="' + id + '"][data-route-action="select"]')?.focus();
    }
  });
  $('preset-select').addEventListener('change', renderPresetDescription);
  $('apply-preset').addEventListener('click', () => { commit(core.createPlan($('preset-select').value), '已换用参考路线，原计划可以撤销恢复'); });
  $('hero-start').addEventListener('click', () => { $('apply-preset').click(); $('workspace').scrollIntoView({ behavior: 'smooth', block: 'start' }); });
  $('hero-explore').addEventListener('click', () => { switchView('discover'); $('workspace').scrollIntoView({ behavior: 'smooth', block: 'start' }); });
  $('undo-button').addEventListener('click', () => { if (!history.length) return; plan = history.pop(); mapView = 'day'; save(); render(); toast('已恢复上一步'); });
  $('add-day').addEventListener('click', () => commit(core.addDay(plan), '增加了一天，挑些喜欢的地方加入吧'));
  $('delete-day').addEventListener('click', () => commit(core.deleteDay(plan,plan.selectedDay), '已删除当天，地点仍在清单中，可以撤销'));
  document.querySelectorAll('.export-button').forEach(button => button.addEventListener('click', exportPlan));
  document.querySelectorAll('[data-share-plan]').forEach(button => button.addEventListener('click', openShareDialog));
  document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => switchView(button.dataset.view)));
  document.querySelectorAll('[data-nav-view]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    switchView(link.dataset.navView);
    $('workspace').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));
  document.querySelector('.header-icon-button')?.addEventListener('click', () => {
    $('place-search').scrollIntoView({ behavior: 'smooth', block: 'center' });
    $('place-search').focus({ preventScroll: true });
  });
  $('about-button').addEventListener('click', showAbout);
  $('sources-button').addEventListener('click', showSources);
  $('close-dialog').addEventListener('click', () => $('info-dialog').close());
  $('close-share-dialog').addEventListener('click', () => $('share-dialog').close());
  $('copy-share-link').addEventListener('click', copyShareLink);
  $('share-url').addEventListener('click', event => event.target.select());
  $('native-share').addEventListener('click', async () => {
    try { await navigator.share({ title: '去俄看看 · ' + data.city.shortName + '行程', url: $('share-url').value }); }
    catch (_) {}
  });
  $('info-dialog').addEventListener('click', event => { if (event.target === $('info-dialog')) { const r = $('info-dialog').getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) $('info-dialog').close(); } });
  renderCity(); save(); render(); switchView('overview');
})();
