/**
 * Backend lưu bài nộp cho bài kiểm tra Hóa 10.
 * Cách dùng: dán toàn bộ file này vào Google Apps Script gắn với một Google Sheet,
 * chạy setup() một lần, sau đó Deploy > New deployment > Web app,
 * Execute as: Me; Who has access: Anyone.
 */
var QUIZ_ID = 'hoa12-carbonyl-carboxylic-acid';
var SHEET_NAME = 'Submissions';
var HEADERS = ['id','quiz','name','className','score','grade','part1','part2','part3','submittedAt','submittedTs'];

function setup() {
  var sheet = getSheet_();
  if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
  else ensureHeaders_(sheet);
}

function doGet(e) {
  var p = (e && e.parameter) || {};
  var payload = {ok:true, quiz:QUIZ_ID, results:listResults_(p.quiz || QUIZ_ID)};
  return jsonp_(payload, p.callback);
}

function doPost(e) {
  try {
    var data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (data.quiz && data.quiz !== QUIZ_ID) return json_({ok:false, error:'wrong_quiz'});
    var sheet = getSheet_();
    ensureHeaders_(sheet);
    if (data.action === 'clear') {
      var removed = clearQuizResults_(sheet, data.quiz || QUIZ_ID);
      SpreadsheetApp.flush();
      return json_({ok:true, cleared:true, removed:removed, quiz:QUIZ_ID});
    }
    var id = String(data.id || '').trim();
    if (!id) return json_({ok:false, error:'missing_id'});
    var values = sheet.getDataRange().getValues();
    var idColumn = 1;
    for (var i = 1; i < values.length; i++) {
      if (String(values[i][idColumn - 1]) === id) return json_({ok:true, duplicate:true, id:id});
    }
    sheet.appendRow([id, QUIZ_ID, data.n || '', data.c || '', data.s == null ? '' : data.s,
      data.g || '', data.p1 == null ? '' : data.p1, data.p2 == null ? '' : data.p2,
      data.p3 == null ? '' : data.p3, data.t || '', data.ts || '']);
    return json_({ok:true, id:id});
  } catch (err) {
    return json_({ok:false, error:String(err)});
  }
}

function clearQuizResults_(sheet, quiz) {
  if (quiz !== QUIZ_ID) throw new Error('wrong_quiz');
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return 0;

  // Chỉ xóa các dòng của bài kiểm tra hiện tại, không ảnh hưởng dữ liệu
  // của bài kiểm tra khác nếu dùng chung sheet Submissions.
  var rows = sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues();
  var removed = 0;
  for (var i = rows.length - 1; i >= 0; i--) {
    if (String(rows[i][1]) === quiz) {
      sheet.deleteRow(i + 2);
      removed++;
    }
  }
  return removed;
}

function listResults_(quiz) {
  if (quiz !== QUIZ_ID) return [];
  var sheet = getSheet_();
  ensureHeaders_(sheet);
  var rows = sheet.getDataRange().getValues();
  return rows.slice(1).filter(function(row) { return row[1] === QUIZ_ID; }).map(function(row) {
    return {id:String(row[0]), quiz:String(row[1]), n:String(row[2]), c:String(row[3]),
      s:Number(row[4]), g:String(row[5]), p1:Number(row[6]), p2:Number(row[7]),
      p3:Number(row[8]), t:String(row[9]), ts:Number(row[10]) || 0};
  });
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  return sheet;
}
function ensureHeaders_(sheet) {
  if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
  var current = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  var different = HEADERS.some(function(h, i) { return current[i] !== h; });
  if (different) sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
}
function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
function jsonp_(value, callback) {
  var text = JSON.stringify(value).replace(/<\//g, '<\\/');
  if (callback && /^[A-Za-z_$][0-9A-Za-z_$\.]*$/.test(callback)) {
    return ContentService.createTextOutput(callback + '(' + text + ');').setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return json_(value);
}
