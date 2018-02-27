/**
 * Created by luowen on 2018/2/27
 */

let totalDays;
let csrfToken = '';
let tingyunId = '';

function getTotalDays() {
  if (!totalDays) {
    totalDays = moment().daysInMonth()
  }
  return totalDays;
}

function start(day) {
  if (!day) {
    day = 1;
  } else if (day > getTotalDays()) {
    loggerSuccess('加班申请完成！');
    return
  }

  setTimeout(() => send(day), 2000)
}

function send(day) {
  //start_date = "2018-02-01 19:00"
  const date = moment().set('date', day).format('YYYY-MM-DD');
  const start_date = `${date} 19:00`;
  const end_date = `${date} 22:00`;
  const url = 'https://e.xinrenxinshi.com/attendance/ajax-start-attendance-approval';
  $.ajax({
    url,
    type: 'post',
    data: {
      start_date,
      end_date,
      flow_type: 9,
      overtime_hour: 4,
      reason: '加班',
      overtime_compensation_rule: 1,
      custom_field: []
    },
    dataType: 'json',
    headers: {
      'X-CSRF-TOKEN': getCSRFToken(),
      'X-Tingyun-Id': getTingyunId()
    }
  })
  // $.post('', /*, a => {
  //   let msg;
  //   if (a && a.status) {
  //     msg = a.message + start_date + '~ 22:00';
  //     loggerSuccess(msg);
  //   } else {
  //     msg = a.message + start_date;
  //     loggerInfo(msg);
  //   }
  //   start(++day)
  // }*/)
    .done(function (data) {
      const msg = data.message + start_date + ' ~ 22:00';
      loggerInfo(msg);
    })
    .fail(function (data) {
      const msg = data.message + start_date;
      loggerInfo(msg);
    })
    .always(function () {
      start(++day)
    })
}

function getCSRFToken() {
  if (csrfToken) return csrfToken;

  const text = $('.vc-table-col.vc-max-height.vc-min-height').html();
  const match = text && text.match(/csrf.*"/m);
  if (!match) {
    loggerError('获取 CSRFToken 失败');
    return csrfToken;
  }
  csrfToken = match[0].split('"')[2];
  $('#__vconsole').remove(); // 移除监控
  return csrfToken
}

function getTingyunId() {
  if (tingyunId) {
    return `${tingyunId};r=${(+new Date) % 1e9}`
  }

  // 初始化获取 tingyunId
  const url = 'https://static.xinrenxinshi.com/commonFile/tingyun-rum-shine.js';
  $.get(url)
    .done(src => {
      const match = src.match(/id:'(\w+)'/);
      if (!match) {
        loggerError('获取 TingyunId 失败');
        return;
      }
      tingyunId = match[1]
    })
    .fail(() => {
      loggerError('获取 TingyunId 失败');
    })
}

function loggerSuccess(msg) {
  logger('success', msg)
}

function loggerInfo(msg) {
  logger('info', msg)
}

function loggerError(msg) {
  logger('error', msg)
}

function logger(type, msg) {
  console.log(`[${type.toUpperCase()}] ` + msg);
  Lobibox.notify(type, {
    icon: null,
    width: 400,
    position: 'top right',
    size: 'mini',
    rounded: true,
    delayIndicator: false,
    sound: false,
    msg: msg
  });
}

// ----------------------------- 自动运行

// 自动添加 "加班" 按钮
let autoInjectBtnNum = setInterval(autoInjectBtn, 1000);

function autoInjectBtn() {
  const dashboard = $('.index-content > .clearfix')
  if (!dashboard) return;

  const jiaBanItem = $(`
    <li id="jiaBanItem">
        <span class='icon-colorfull'>
            <div class='content'>加班</div>
            <p class="p1">一键申请</p>
        </span>
    </li>
  `);
  dashboard.append(jiaBanItem);
  const jbItem = $('#jiaBanItem');
  jbItem.hide();
  setTimeout(() => jbItem.fadeIn(200), 500);
  clearInterval(autoInjectBtnNum);

  jbItem.on('click', () => {
    loggerInfo('开始批量申请加班中...');
    start()
  })

}

getTingyunId();



