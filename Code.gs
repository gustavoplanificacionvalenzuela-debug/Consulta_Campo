const SHEET_NAME = 'Respuestas';

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || 'status';
  if (action === 'data') return jsonResponse_(readData_());
  return jsonResponse_({ ok: true, service: 'Copahue Balneoterapia', timestamp: new Date().toISOString() });
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    if (!payload._id || !payload.encuestador || !payload.fecha_hora) throw new Error('Faltan campos obligatorios');
    const lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      const sheet = getSheet_();
      const headers = ensureHeaders_(sheet, Object.keys(payload));
      const ids = sheet.getLastRow() > 1 ? sheet.getRange(2, headers.indexOf('_id') + 1, sheet.getLastRow() - 1, 1).getValues().flat() : [];
      if (!ids.includes(payload._id)) sheet.appendRow(headers.map(h => normalizeCell_(payload[h])));
    } finally { lock.releaseLock(); }
    return jsonResponse_({ ok: true, id: payload._id });
  } catch (error) {
    return jsonResponse_({ ok: false, error: error.message });
  }
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
}

function ensureHeaders_(sheet, incoming) {
  let headers = sheet.getLastColumn() ? sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].filter(String) : [];
  const preferred = ['_id', '_capturado_en', 'fecha_hora', 'encuestador', 'lugar'];
  const missing = incoming.filter(k => !headers.includes(k));
  if (!headers.length) headers = [...preferred.filter(k => incoming.includes(k)), ...incoming.filter(k => !preferred.includes(k))];
  else headers.push(...missing);
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#2b3e4c').setFontColor('#ffffff');
  return headers;
}

function normalizeCell_(value) {
  if (value === undefined || value === null) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return value;
}

function readData_() {
  const values = getSheet_().getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values.shift();
  return values.map(row => Object.fromEntries(headers.map((h, i) => [h, row[i]])));
}

function jsonResponse_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
