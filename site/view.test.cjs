const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require.resolve('./app.js'), 'utf8');

function setup() {
  const make = (key, value) => {
    const classes = new Set();
    return { dataset: { [key]: value }, classes, attributes: {},
      classList: { toggle(name, active) { active ? classes.add(name) : classes.delete(name); } },
      setAttribute(name, value) { this.attributes[name] = value; } };
  };
  const buttons = ['overview', 'discover', 'map', 'trip'].map(v => make('view', v));
  const panes = ['discover', 'map', 'trip'].map(v => make('pane', v));
  const workspace = { dataset: {} };
  const dialog = { open: false, showModal() { this.open = true; } };
  const context = { document: { querySelectorAll: s => s === '[data-view]' ? buttons : panes },
    $: id => id === 'workspace' ? workspace : dialog,
    core: { place: id => id === 'hermitage' ? { id } : null }, plan: {},
    save() {}, renderCatalog() {}, renderDetail() {}, renderMap() {} };
  vm.createContext(context);
  vm.runInContext(source.slice(source.indexOf('  function switchView(view)'), source.indexOf('  function selectDay(')), context);
  return { context, workspace, dialog, buttons, panes };
}

test('every focused view can return to the three-panel overview', () => {
  const { context, workspace, buttons, panes } = setup();
  for (const view of ['discover', 'map', 'trip']) {
    context.switchView(view);
    assert.equal(workspace.dataset.activeView, view);
    assert.equal(panes.filter(p => p.classes.has('pane-active')).length, 1);
    context.switchView('overview');
    assert.equal(workspace.dataset.activeView, undefined);
    assert.equal(panes.filter(p => p.classes.has('pane-active')).length, 3);
    assert.equal(buttons.filter(b => b.attributes['aria-pressed'] === 'true').length, 1);
    assert.equal(buttons[0].attributes['aria-pressed'], 'true');
  }
});

test('place details open without navigating away from overview or the itinerary', () => {
  const { context, workspace, dialog } = setup();
  for (const view of ['overview', 'trip', 'discover']) {
    context.switchView(view);
    dialog.open = false;
    context.selectPlace('hermitage', 'route');
    assert.equal(dialog.open, true);
    assert.equal(context.plan.selectedPlace, 'hermitage');
    assert.equal(workspace.dataset.activeView, view === 'overview' ? undefined : view);
  }
  dialog.open = false;
  context.selectPlace('unknown');
  assert.equal(dialog.open, false);
});
