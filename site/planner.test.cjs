const test = require('node:test');
const assert = require('node:assert/strict');
const data = require('./data.js');
const core = require('./planner.js');
const moscow = require('./moscow-data.js');
const moscowCore = core.createFor(moscow);

test('Petersburg references fit three to five days while longer saved itineraries remain intact', () => {
  assert.equal(data.attractions.length, 17);
  assert.deepEqual(new Set(Object.values(data.presets).map(preset => preset.days.length)), new Set([3, 4, 5]));
  for (const preset of Object.keys(data.presets)) {
    const plan = core.createPlan(preset);
    assert.ok(plan.days.length >= 3 && plan.days.length <= 5);
    assert.match(data.presets[preset].label, new RegExp('^' + plan.days.length + ' 日'));
    for (const day of plan.days) {
      assert.ok(day.places.filter(id => core.place(id).area === 'outside').length <= 1);
      assert.ok(!(day.places.includes('hermitage') && day.places.includes('russian-museum')));
    }
  }
  const art = core.createPlan('art');
  assert.equal(art.days.length, 5);
  assert.deepEqual(art.days[2].places, ['russian-museum', 'mikhailovsky-garden', 'field-mars']);
  assert.ok(core.place('yelagin') && core.place('park300'));
  const saved = core.createPlan();
  saved.days.push({ id: 'day-6', title: '艺术', places: ['russian-museum'] }, { id: 'day-7', title: '海边', places: ['yelagin', 'park300'] });
  saved.selectedDay = 'day-7';
  saved.selectedPlace = 'park300';
  const restored = core.restore(saved);
  assert.equal(restored.days.length, 7);
  assert.deepEqual(restored.days.map(day => day.places), saved.days.map(day => day.places));
  assert.equal(restored.selectedDay, saved.selectedDay);
  assert.equal(restored.selectedPlace, saved.selectedPlace);
});

test('optional travel dates persist and roll forward across itinerary days', () => {
  const plan = core.setStartDate(core.createPlan('short'), '2026-10-01');
  assert.equal(plan.startDate, '2026-10-01');
  assert.equal(core.validStartDate('2026-02-29'), false);
  assert.equal(core.validStartDate('2028-02-29'), true);
  assert.equal(core.restore(plan).startDate, '2026-10-01');
  assert.equal(core.setStartDate(plan, '').startDate, '');
});

test('every place exposes visit preparation information for the detail card and export', () => {
  for (const [dataset, cityCore] of [[data, core], [moscow, moscowCore]]) {
    for (const place of dataset.places) {
      const visit = cityCore.visitDetails(place);
      assert.ok(visit.status && visit.ticket && visit.hours && visit.url && visit.label);
      assert.equal(new URL(visit.url).protocol, 'https:');
    }
  }
  assert.match(moscowCore.visitDetails(moscowCore.place('msk-armed-cathedral')).hours, /08:00/);
  assert.match(moscowCore.exportHtml(moscowCore.createPlan('slow')), /门票 \/ 预约/);
});
test('moving a place between days preserves other visits and the prior plan', () => {
  const before = core.createPlan();
  const snapshot = JSON.stringify(before);
  const after = core.assign(before, 'hermitage', 'day-3');
  assert.equal(JSON.stringify(before), snapshot);
  assert.equal(after.days.flatMap(d => d.places).filter(id => id === 'hermitage').length, 1);
  assert.equal(after.days[2].places.at(-1), 'hermitage');
  assert.deepEqual(new Set(after.days.flatMap(d => d.places)), new Set(before.days.flatMap(d => d.places)));
});
test('reordering keeps every visit and respects day boundaries', () => {
  const before = core.createPlan();
  const after = core.reorder(before, 'day-1', 'hermitage', 1);
  assert.deepEqual(after.days[0].places, ['bronze','hermitage','isaac']);
  assert.deepEqual(core.reorder(before, 'day-1', 'hermitage', -1), before);
  assert.deepEqual(after.days.slice(1), before.days.slice(1));
});
test('deleting a selected day leaves a valid selection and survives restoring', () => {
  const added = core.addDay(core.createPlan());
  const removed = core.deleteDay(added, added.selectedDay);
  assert.ok(removed.days.some(d => d.id === removed.selectedDay));
  const restored = core.restore(removed);
  assert.deepEqual(restored.days.flatMap(d => d.places), removed.days.flatMap(d => d.places));
  const single = { version:1, days:[{id:'day-1',title:'One',places:['hermitage']}], selectedDay:'day-1',selectedPlace:'hermitage' };
  assert.deepEqual(core.deleteDay(single,'day-1'), single);
});
test('restoring rejects unsupported data and removes unknown or duplicate places', () => {
  assert.equal(core.restore({version:2,days:[]}), null);
  assert.equal(core.restore(null), null);
  const restored = core.restore({version:1,days:[{id:'x',places:['hermitage','unknown']},{id:'y',title:'Next',places:['hermitage','books']}],selectedDay:'y',selectedPlace:'unknown'});
  assert.deepEqual(restored.days.map(d => d.places), [['hermitage'],['books']]);
  assert.equal(restored.selectedDay, 'day-2');
  assert.equal(restored.selectedPlace, 'hermitage');
});
test('Yandex place links and embeds preserve the selected venue or exact branch', () => {
  for (const place of data.places) {
    const url = new URL(core.mapsUrl(place));
    assert.equal(url.href, core.yandexPlaceUrl(place));
    if (place.kind !== 'food') assert.ok(url.searchParams.get('text').includes(place.address));
    const embed = new URL(core.embedUrl(place));
    assert.equal(embed.hostname, 'yandex.ru');
    assert.equal(embed.pathname, '/map-widget/v1/');
    assert.equal(embed.searchParams.get('pt'), place.latLng[1] + ',' + place.latLng[0]);
    assert.equal(embed.searchParams.get('lang'), 'ru_RU');
  }
  const link = new URL(core.legUrl(data.places[0],data.places[1]));
  assert.deepEqual(link.searchParams.get('rtext').split('~'), data.places.slice(0, 2).map(p => p.latLng.join(',')));
});
test('offline export includes every selected place and safely escapes saved titles', () => {
  const plan = core.createPlan('art');
  plan.days[0].title = '<script>alert("test")</script>';
  const html = core.exportHtml(plan);
  assert.ok(!html.includes('<script>'));
  assert.ok(html.includes('&lt;script&gt;'));
  for (const place of plan.days.flatMap(day => day.places.map(core.place))) {
    assert.ok(html.includes(place.name));
    assert.ok(html.includes(place.address));
  }
});

test('whole-day navigation preserves every stop, its order, and the chosen travel mode', () => {
  const plan = core.createPlan('art');
  const places = plan.days[1].places.map(core.place);
  const url = new URL(core.routeUrl(places, 'walking'));
  assert.equal(url.hostname, 'yandex.ru');
  assert.equal(url.searchParams.get('rtt'), 'pd');
  assert.deepEqual(url.searchParams.get('rtext').split('~'), places.map(p => p.latLng.join(',')));
  const changed = core.reorder(plan, 'day-2', 'books', 1);
  assert.notEqual(core.routeUrl(changed.days[1].places.map(core.place), 'walking'), url.href);
});

test('empty and single-stop days do not invent an origin or an extra waypoint', () => {
  assert.equal(core.routeEmbedUrl([]), null);
  assert.equal(core.overviewEmbedUrl([]), null);
  assert.equal(core.overviewUrl([]), null);
  assert.equal(core.routeUrl([]), null);
  assert.deepEqual(core.routeGroups([]), []);
  const p = core.place('peterhof');
  assert.equal(core.routeEmbedUrl([p]), core.embedUrl(p));
  const groups = core.routeGroups([p], 'transit');
  assert.equal(groups.length, 1);
  assert.equal(groups[0].start, 1);
  assert.equal(groups[0].end, 1);
  const url = new URL(groups[0].url);
  assert.equal(url.searchParams.has('rtext'), false);
  assert.equal(url.href, core.yandexPlaceUrl(p));
});

test('long routes retain every leg across overlapping Yandex navigation groups', () => {
  for (let count = 2; count <= data.places.length; count++) {
    const places = data.places.slice(0, count);
    const groups = core.routeGroups(places, 'walking');
    const reconstructed = groups.flatMap((g, i) => i ? g.places.slice(1) : g.places);
    assert.deepEqual(reconstructed.map(p => p.id), places.map(p => p.id));
    for (const [i, group] of groups.entries()) {
      assert.ok(group.places.length >= 2 && group.places.length <= 8);
      assert.ok(group.url.length <= 2048);
      assert.deepEqual(group.places, places.slice(group.start - 1, group.end));
      if (i) assert.equal(groups[i - 1].end, group.start);
      const url = new URL(group.url);
      assert.equal(url.hostname, 'yandex.ru');
      assert.deepEqual(url.searchParams.get('rtext').split('~'), group.places.map(p => p.latLng.join(',')));
    }
  }
});

test('shared routes enforce the eight-stop grouping without truncating an itinerary', () => {
  assert.equal(core.routeUrl(data.places), null);
  assert.equal(core.routeUrl(data.places.slice(0, 9)), null);
  assert.ok(core.routeUrl(data.places.slice(0, 8)));
  const groups = core.routeGroups(data.places, 'walking', 11);
  assert.ok(groups.length > 1);
  assert.deepEqual(groups.flatMap((g, i) => i ? g.places.slice(1) : g.places), data.places);
  assert.ok(groups.every(g => g.url.length <= 2048));
});

test('Yandex route embeds retain ordered coordinates and update with edits', () => {
  const places = data.attractions.slice(0, 8);
  const url = new URL(core.routeEmbedUrl(places, 'walking'));
  assert.equal(url.hostname, 'yandex.ru');
  assert.equal(url.pathname, '/map-widget/v1/');
  assert.deepEqual(url.searchParams.get('rtext').split('~'), places.map(p => p.latLng.join(',')));
  assert.equal(url.searchParams.get('rtt'), 'pd');
  assert.equal(core.routeEmbedUrl(data.attractions), null);
  assert.equal(core.routeEmbedUrl(places, 'driving'), null);
  const before = core.createPlan();
  const beforeUrl = core.routeEmbedUrl(before.days[0].places.map(core.place));
  const after = core.assign(before, 'hermitage', 'day-2');
  assert.notEqual(core.routeEmbedUrl(after.days[0].places.map(core.place)), beforeUrl);
  assert.equal(core.routeEmbedUrl(core.restore(before).days[0].places.map(core.place)), beforeUrl);
});

test('both city overviews include every stop and bounds enclosing all coordinates', () => {
  for (const [dataset, cityCore] of [[data, core], [moscow, moscowCore]]) {
    const places = dataset.places;
    const url = new URL(cityCore.overviewEmbedUrl(places));
    assert.equal(url.hostname, 'yandex.ru');
    assert.equal(url.pathname, '/map-widget/v1/');
    assert.deepEqual(url.searchParams.get('pt').split('~'), places.map(p => [p.latLng[1], p.latLng[0]].join(',')));
    assert.equal(url.searchParams.has('rtext'), false);
    assert.equal(url.searchParams.has('z'), false);
    const center = url.searchParams.get('ll').split(',').map(Number);
    const span = url.searchParams.get('spn').split(',').map(Number);
    assert.ok([...center, ...span].every(Number.isFinite));
    for (const p of places) {
      assert.ok(Math.abs(p.latLng[1] - center[0]) < span[0] / 2);
      assert.ok(Math.abs(p.latLng[0] - center[1]) < span[1] / 2);
    }
    assert.equal(new URL(cityCore.overviewUrl(places)).search, url.search);
  }
});

test('map display persists per day without imposing a transport mode on every leg', () => {
  const before = core.createPlan();
  const snapshot = JSON.stringify(before);
  assert.equal(core.mapMode(before.days[0]), 'overview');
  assert.equal(core.mapMode(before.days.at(-1)), 'overview');
  const changed = core.setMapMode(before, 'day-1', 'walking');
  assert.equal(core.mapMode(core.restore(changed).days[0]), 'walking');
  assert.equal(core.mapMode(core.restore(before).days[0]), 'overview');
  const walkingMap = core.setMapMode(before, before.days.at(-1).id, 'walking');
  assert.equal(core.legMode(walkingMap.days.at(-1), core.place('aurora'), core.place('mariinsky')), 'transit');
  assert.equal(JSON.stringify(before), snapshot);
  assert.deepEqual(core.setMapMode(before, 'day-1', 'invalid-mode'), before);
});

test('offline exports include whole-day and segment navigation, including all long-route groups', () => {
  const plan = { version:1, days:[{id:'day-1',title:'Long day',places:data.places.map(p => p.id),mapMode:'walking'}], selectedDay:'day-1', selectedPlace:'hermitage' };
  const html = core.exportHtml(plan);
  assert.ok(html.includes('分段导航'));
  for (const group of core.routeGroups(data.places, 'walking')) assert.ok(html.includes(core.escape(group.url)));
  for (let i = 1; i < data.places.length; i++) assert.ok(html.includes(core.escape(core.yandexUrl(data.places[i - 1], data.places[i], 'walking'))));
  const short = core.createPlan();
  assert.ok(core.exportHtml(short).includes('整天步行导航'));
});

test('public transit queries every consecutive pair and supports a two-point Yandex embed', () => {
  const places = data.places;
  const groups = core.routeGroups(places, 'transit', 11);
  assert.equal(groups.length, places.length - 1);
  groups.forEach((group, i) => {
    assert.deepEqual(group.places.map(p => p.id), [places[i].id, places[i + 1].id]);
    const url = new URL(group.url);
    assert.equal(url.searchParams.get('rtt'), 'mt');
    assert.deepEqual(url.searchParams.get('rtext').split('~'), group.places.map(p => p.latLng.join(',')));
    assert.equal(new URL(core.legUrl(places[i], places[i + 1], 'transit')).searchParams.get('rtt'), 'mt');
  });
  assert.equal(core.routeUrl(places.slice(0, 3), 'transit'), null);
  assert.equal(core.routeEmbedUrl(places, 'transit'), null);
  const embed = new URL(core.routeEmbedUrl(places.slice(0, 2), 'transit'));
  assert.equal(embed.pathname, '/map-widget/v1/');
  assert.equal(embed.searchParams.get('rtt'), 'mt');
  assert.deepEqual(embed.searchParams.get('rtext').split('~'), places.slice(0, 2).map(p => p.latLng.join(',')));
});

test('old day preferences migrate to map display without losing visits or forcing transit', () => {
  const old = core.createPlan();
  old.days[0].travelMode = 'driving';
  old.days[1].travelMode = 'walking';
  old.days[4].travelMode = 'transit';
  const restored = core.restore(old);
  assert.equal(core.mapMode(restored.days[0]), 'overview');
  assert.equal(core.mapMode(restored.days[1]), 'walking');
  assert.equal(core.mapMode(restored.days[4]), 'overview');
  assert.equal(core.legMode(restored.days[0], core.place('bronze'), core.place('isaac')), 'walking');
  assert.ok(restored.days.every(day => !('travelMode' in day)));
  assert.deepEqual(restored.days.map(d => d.places), old.days.map(d => d.places));
  assert.equal(restored.selectedDay, old.selectedDay);
});

test('Yandex links explicitly choose walking or transit and preserve provider coordinate order', () => {
  for (const p of data.places) {
    assert.equal(p.latLng.length, 2);
    assert.ok(p.latLng.every(Number.isFinite));
    assert.ok(p.latLng[0] > 59 && p.latLng[0] < 61);
    assert.ok(p.latLng[1] > 29 && p.latLng[1] < 31);
    assert.equal(new URL(p.coordinateSource).protocol, 'https:');
    if (p.kind === 'food') continue;
    const pointUrl = new URL(core.yandexPlaceUrl(p));
    assert.equal(pointUrl.hostname, 'yandex.ru');
    assert.equal(pointUrl.searchParams.get('ll'), p.latLng[1] + ',' + p.latLng[0]);
    assert.ok(pointUrl.searchParams.get('text').includes(p.address));
    assert.equal(pointUrl.searchParams.has('rtext'), false);
  }
  const [from, to] = data.places;
  for (const [mode, rtt] of [['walking', 'pd'], ['transit', 'mt']]) {
    const url = new URL(core.yandexUrl(from, to, mode));
    assert.equal(url.searchParams.get('rtt'), rtt);
    assert.equal(url.searchParams.get('rtext'), from.latLng.join(',') + '~' + to.latLng.join(','));
  }
});

test('offline handbooks preserve every leg and the chosen Yandex mode, with both alternatives', () => {
  const plan = core.setLegMode(core.createPlan(), 'day-2', 'kazan', 'blood', 'transit');
  const html = core.exportHtml(plan);
  assert.doesNotMatch(html, /Google|google\.com\/maps|maps\.google|OpenStreetMap|Leaflet/);
  assert.ok(html.includes('Yandex 公交／地铁'));
  assert.ok(html.includes('Yandex 步行'));
  for (const day of plan.days) {
    for (let i = 1; i < day.places.length; i++) {
      const from = core.place(day.places[i - 1]);
      const to = core.place(day.places[i]);
      assert.ok(html.includes(core.escape(core.legUrl(from, to, core.legMode(day, from, to)))));
      for (const mode of ['walking', 'transit']) assert.ok(html.includes(core.escape(core.yandexUrl(from, to, mode))));
    }
  }
  const from = core.place('kazan'), to = core.place('blood');
  assert.ok(html.indexOf(core.escape(core.yandexUrl(from, to, 'transit'))) < html.indexOf(core.escape(core.yandexUrl(from, to, 'walking'))));
  assert.ok(!html.includes('travelmode=driving'));
  assert.ok(!html.includes('rtt=auto'));
});

test('nearby central sights default to walking in both directions while outer trips can query transit', () => {
  const near = ['kazan', 'books', 'blood'];
  for (const fromId of near) for (const toId of near) {
    if (fromId === toId) continue;
    const from = core.place(fromId), to = core.place(toId);
    assert.equal(core.suggestedLegMode(from, to), 'walking');
    assert.equal(new URL(core.yandexUrl(from, to)).searchParams.get('rtt'), 'pd');
    assert.equal(new URL(core.legUrl(from, to)).searchParams.get('rtt'), 'pd');
  }
  for (const [fromId, toId] of [['hermitage', 'peterhof'], ['kazan', 'catherine'], ['blood', 'mariinsky'], ['yelagin', 'park300']]) {
    assert.equal(core.suggestedLegMode(core.place(fromId), core.place(toId)), 'transit');
  }
});

test('per-leg choices persist and remain attached to their endpoints after reordering', () => {
  const before = core.createPlan();
  const snapshot = JSON.stringify(before);
  const from = core.place('kazan'), to = core.place('blood');
  const changed = core.setLegMode(before, 'day-2', from.id, to.id, 'transit');
  const restored = core.restore(changed);
  assert.equal(core.legMode(restored.days[1], from, to), 'transit');
  assert.equal(core.legMode(restored.days[1], core.place('books'), from), 'walking');
  assert.equal(JSON.stringify(before), snapshot);
  const reordered = core.reorder(restored, 'day-2', 'kazan', -1);
  assert.equal(core.legMode(reordered.days[1], core.place('books'), to), 'walking');
  assert.deepEqual(core.setLegMode(before, 'day-2', 'kazan', 'mariinsky', 'walking'), before);
  assert.deepEqual(core.setLegMode(before, 'day-2', from.id, to.id, 'driving'), before);
  assert.equal(core.legMode(core.restore(before).days[1], from, to), 'walking');
});

test('restoring ignores invalid segment modes and unknown endpoint keys', () => {
  const plan = core.createPlan();
  plan.days[1].legModes = { 'kazan>blood': 'transit', 'books>kazan': 'driving', 'unknown>blood': 'walking', 'books>books': 'walking' };
  assert.deepEqual(core.restore(plan).days[1].legModes, { 'kazan>blood': 'transit' });
});

test('a meal can be inserted between visits and all Yandex routes retain its exact location', () => {
  const before = core.createPlan();
  const snapshot = JSON.stringify(before);
  const meal = core.place('food-teremok-morskaya');
  const after = core.assign(before, meal.id, 'day-1', 'hermitage');
  assert.deepEqual(after.days[0].places, ['hermitage', meal.id, 'bronze', 'isaac']);
  assert.equal(JSON.stringify(before), snapshot);
  assert.equal(core.suggestedLegMode(core.place('hermitage'), meal), 'walking');
  const full = new URL(core.routeUrl(after.days[0].places.map(core.place)));
  assert.equal(full.searchParams.get('rtext').split('~')[1], meal.latLng.join(','));
  const yandex = new URL(core.yandexUrl(core.place('hermitage'), meal));
  assert.equal(yandex.searchParams.get('rtext').split('~')[1], meal.latLng.join(','));
  assert.equal(yandex.searchParams.get('rtt'), 'pd');
  assert.equal(core.assign(before, meal.id, 'day-1', 'start').days[0].places[0], meal.id);
});

test('a food stop can recur on separate days and removal only affects the chosen day', () => {
  const foodId = 'food-spar-passage';
  const once = core.assign(core.createPlan(), foodId, 'day-1');
  const twice = core.assign(once, foodId, 'day-2', 'books');
  const snapshot = JSON.stringify(twice);
  const restored = core.restore(twice);
  assert.ok(restored.days[0].places.includes(foodId));
  assert.ok(restored.days[1].places.includes(foodId));
  const removed = core.remove(twice, foodId, 'day-1');
  assert.equal(removed.days[0].places.includes(foodId), false);
  assert.ok(removed.days[1].places.includes(foodId));
  assert.equal(JSON.stringify(twice), snapshot);
  const reassigned = core.assign(twice, foodId, 'day-1', 'start');
  assert.equal(reassigned.days[0].places.filter(id => id === foodId).length, 1);
  const duplicate = core.copy(twice);
  duplicate.days[0].places.push(foodId);
  duplicate.days[1].places.push('hermitage');
  const clean = core.restore(duplicate);
  assert.equal(clean.days[0].places.filter(id => id === foodId).length, 1);
  assert.equal(clean.days[1].places.includes('hermitage'), false);
  assert.ok(clean.days[1].places.includes(foodId));
});

test('dining suggestions match planned sights without assigning city meals to a suburban-only day', () => {
  const plan = core.createPlan();
  assert.deepEqual(core.diningSuggestions(plan.days[2]), []);
  const suggestions = core.diningSuggestions(plan.days[0]);
  assert.ok(suggestions.some(item => item.place.id === 'food-teremok-morskaya'));
  for (const {place, afterId} of suggestions) {
    assert.ok(plan.days[0].places.includes(afterId));
    assert.ok(place.pairWith.includes(afterId));
  }
  const added = core.assign(plan, 'food-teremok-morskaya', 'day-1');
  assert.equal(core.diningSuggestions(added.days[0]).some(item => item.place.id === 'food-teremok-morskaya'), false);
});

test('food map entries use sourced branch locations instead of ambiguous name searches', () => {
  assert.equal(data.foodPlaces.length, 9);
  assert.equal(new Set(data.places.map(p => p.id)).size, data.places.length);
  assert.equal(core.place('food-ilu').foodType, 'chinese');
  assert.equal(core.place('food-spar-passage').foodType, 'everyday');
  for (const food of data.foodPlaces) {
    assert.equal(new URL(food.source).protocol, 'https:');
    assert.ok(food.branch && food.address && food.checkedAt);
    assert.ok([...food.pairWith, ...food.walkWith].every(id => core.place(id)));
    const map = new URL(core.yandexPlaceUrl(food));
    assert.equal(map.searchParams.has('text'), false);
    if (!food.yandexMap) assert.deepEqual(map.searchParams.get('pt').split(',').slice(0, 2).map(Number), [food.latLng[1], food.latLng[0]]);
    assert.equal(new URL(core.embedUrl(food)).searchParams.get('pt'), food.latLng[1] + ',' + food.latLng[0]);
  }
});

test('offline handbooks include food branches, sources and repeated meal visits', () => {
  let plan = core.assign(core.createPlan(), 'food-meat-kievskaya', 'day-1');
  plan = core.assign(plan, 'food-spar-passage', 'day-1');
  plan = core.assign(plan, 'food-spar-passage', 'day-2');
  const html = core.exportHtml(plan);
  for (const id of ['food-meat-kievskaya', 'food-spar-passage']) {
    const food = core.place(id);
    assert.ok(html.includes(core.escape(food.branch)));
    assert.ok(html.includes(core.escape(food.address)));
    assert.ok(html.includes(core.escape(food.source)));
    assert.ok(html.includes(core.escape(core.yandexPlaceUrl(food))));
  }
  assert.ok(html.includes('Мясо &amp; Хлеб'));
  assert.equal(html.split('<h3>用餐 · EUROSPAR</h3>').length - 1, 2);
});

test('city cores keep their catalogues, initial selections and storage keys separate', () => {
  assert.notEqual(data.city.storageKey, moscow.city.storageKey);
  assert.equal(core.cityId, 'spb');
  assert.equal(moscowCore.cityId, 'moscow');
  assert.equal(core.place('msk-red-square'), undefined);
  assert.equal(moscowCore.place('hermitage'), undefined);
  for (const [dataset, cityCore] of [[data, core], [moscow, moscowCore]]) {
    const plan = cityCore.createPlan();
    assert.equal(plan.city, dataset.city.id);
    assert.ok(cityCore.place(plan.selectedPlace));
    assert.ok(plan.days[0].places.includes(plan.selectedPlace));
    for (const preset of Object.keys(dataset.presets)) {
      const ids = cityCore.createPlan(preset).days.flatMap(day => day.places);
      assert.equal(new Set(ids).size, ids.length);
      assert.ok(ids.every(id => cityCore.place(id)));
    }
  }
  const slow = moscowCore.createPlan('slow');
  assert.equal(slow.days.length, 5);
  assert.ok(!slow.days.flatMap(d => d.places).includes('msk-armed-cathedral'));
  const extended = moscowCore.createPlan('extended');
  assert.deepEqual(extended.days.flatMap(d => d.places).sort(), moscow.attractions.map(p => p.id).sort());
  assert.deepEqual(moscowCore.diningSuggestions(slow.days[0]), []);
});

test('legacy Petersburg plans preserve custom visits and preferences without being restored as Moscow', () => {
  let legacy = core.assign(core.createPlan('short'), 'food-volchek-nevsky', 'day-1', 'start');
  legacy = core.setMapMode(legacy, 'day-2', 'walking');
  legacy = core.setLegMode(legacy, 'day-2', 'kazan', 'blood', 'transit');
  legacy.selectedDay = 'day-2';
  legacy.selectedPlace = 'blood';
  delete legacy.city;
  const snapshot = JSON.stringify(legacy);
  const restored = core.restore(JSON.parse(snapshot));
  assert.equal(restored.city, 'spb');
  assert.deepEqual(restored.days.map(d => d.places), legacy.days.map(d => d.places));
  assert.equal(restored.selectedDay, legacy.selectedDay);
  assert.equal(restored.selectedPlace, legacy.selectedPlace);
  assert.equal(core.mapMode(restored.days[1]), 'walking');
  assert.equal(core.legMode(restored.days[1], core.place('kazan'), core.place('blood')), 'transit');
  assert.equal(moscowCore.restore(legacy), null);
  assert.equal(moscowCore.restore(restored), null);
  assert.equal(core.restore(moscowCore.createPlan()), null);
  assert.equal(JSON.stringify(legacy), snapshot);
});

test('Moscow edits restore their own stops, map mode and directional navigation choices', () => {
  const before = moscowCore.createPlan();
  const snapshot = JSON.stringify(before);
  let edited = moscowCore.assign(before, 'msk-vdnh', 'day-3');
  edited = moscowCore.setMapMode(edited, 'day-3', 'walking');
  edited = moscowCore.setLegMode(edited, 'day-3', 'msk-arbat', 'msk-moscow-city', 'walking');
  edited.selectedPlace = 'hermitage';
  edited.days[2].places.push('food-volchek-nevsky');
  edited.days[2].legModes['kazan>blood'] = 'transit';
  const restored = moscowCore.restore(JSON.parse(JSON.stringify(edited)));
  assert.equal(restored.selectedPlace, moscow.city.defaultPlace);
  assert.ok(restored.days.every(d => d.places.every(id => moscowCore.place(id))));
  assert.equal(moscowCore.mapMode(restored.days[2]), 'walking');
  assert.deepEqual(restored.days[2].legModes, { 'msk-arbat>msk-moscow-city': 'walking' });
  assert.equal(JSON.stringify(before), snapshot);
  const changed = moscowCore.reorder(restored, 'day-3', 'msk-vdnh', -1);
  assert.notEqual(moscowCore.routeEmbedUrl(changed.days[2].places.map(moscowCore.place)), moscowCore.routeEmbedUrl(restored.days[2].places.map(moscowCore.place)));
});

test('new walking clusters and Moscow cross-city trips generate explicit Yandex modes', () => {
  const walks = [
    [core, 'blood', 'mikhailovsky-garden'], [core, 'russian-museum', 'mikhailovsky-garden'], [core, 'mikhailovsky-garden', 'field-mars'],
    [moscowCore, 'msk-red-square', 'msk-basil'], [moscowCore, 'msk-tretyakov', 'msk-gorky']
  ];
  for (const [cityCore, a, b] of walks) for (const [from, to] of [[a, b], [b, a]]) {
    const link = new URL(cityCore.yandexUrl(cityCore.place(from), cityCore.place(to)));
    assert.equal(link.searchParams.get('rtt'), 'pd');
  }
  for (const [a, b] of [['msk-arbat', 'msk-moscow-city'], ['msk-sparrow', 'msk-arbat'], ['msk-red-square', 'msk-vdnh']]) {
    const link = new URL(moscowCore.yandexUrl(moscowCore.place(a), moscowCore.place(b)));
    assert.equal(link.searchParams.get('rtt'), 'mt');
    assert.equal(link.searchParams.get('rtext'), moscowCore.place(a).latLng.join(',') + '~' + moscowCore.place(b).latLng.join(','));
  }
  for (const p of moscow.places) {
    assert.ok(p.latLng[0] > 55 && p.latLng[0] < 56);
    if (p.id === 'msk-armed-cathedral') assert.ok(p.latLng[1] > 36 && p.latLng[1] < 37);
    else assert.ok(p.latLng[1] > 37 && p.latLng[1] < 38);
    const url = new URL(moscowCore.yandexPlaceUrl(p));
    assert.equal(url.searchParams.get('ll'), p.latLng[1] + ',' + p.latLng[0]);
  }
});

test('Moscow offline exports use the correct city and retain all visits, sources and navigation', () => {
  const plan = moscowCore.createPlan('extended');
  const html = moscowCore.exportHtml(plan);
  assert.ok(html.includes('<title>我的莫斯科行程 · 去俄看看</title>'));
  assert.ok(html.includes('<h1>我的莫斯科行程</h1>'));
  assert.ok(!html.includes('彼得堡'));
  for (const p of moscow.places) {
    assert.ok(html.includes(moscowCore.escape(p.name)));
    assert.ok(html.includes(moscowCore.escape(p.address)));
    assert.ok(html.includes(moscowCore.escape(p.source)));
  }
  for (const day of plan.days) {
    for (let i = 1; i < day.places.length; i++) {
      const from = moscowCore.place(day.places[i - 1]), to = moscowCore.place(day.places[i]);
      assert.ok(html.includes(moscowCore.escape(moscowCore.yandexUrl(from, to))));
    }
  }
  assert.ok(core.exportHtml(core.createPlan()).includes('<h1>我的彼得堡行程</h1>'));
});
