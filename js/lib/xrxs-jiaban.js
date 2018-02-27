/**
 * Created by luowen on 2018/2/27
 */

let iconSvg = `<svg id="图层_1" data-name="图层 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 47.84 38.12"><defs><style>.cls-1{fill:#ffe15c;}.cls-2{fill:#3f3e39;}.cls-3{fill:#19ccad;}.cls-4{fill:#77ddca;}.cls-5{fill:#f2e657;}.cls-6{fill:#72c0e9;}</style></defs><title>加班</title><circle class="cls-1" cx="20.04" cy="17.98" r="17.48"/><path class="cls-2" d="M21,36.72a18,18,0,1,1,18-18A18,18,0,0,1,21,36.72Zm0-35a17,17,0,1,0,17,17A17,17,0,0,0,21,1.75Z" transform="translate(-0.99 -0.75)"/><circle class="cls-3" cx="30.6" cy="29.19" r="8.43"/><path class="cls-2" d="M31.59,38.88A8.93,8.93,0,1,1,40.52,30,8.95,8.95,0,0,1,31.59,38.88Zm0-16.86A7.93,7.93,0,1,0,39.52,30,7.94,7.94,0,0,0,31.59,22Z" transform="translate(-0.99 -0.75)"/><path class="cls-2" d="M21,19.31h0a.58.58,0,0,1-.62-.53V7.09A.58.58,0,0,1,21,6.55h0a.58.58,0,0,1,.61.54V18.78A.58.58,0,0,1,21,19.31Z" transform="translate(-0.99 -0.75)"/><path class="cls-2" d="M21.64,18.74h0a.58.58,0,0,1-.53.61H9.42a.58.58,0,0,1-.54-.61h0a.58.58,0,0,1,.54-.62H21.11A.58.58,0,0,1,21.64,18.74Z" transform="translate(-0.99 -0.75)"/><rect class="cls-2" x="30.17" y="24.09" width="0.85" height="10.2" rx="0.43" ry="0.43"/><rect class="cls-2" x="25.5" y="28.77" width="10.2" height="0.85" rx="0.43" ry="0.43"/><rect class="cls-4" x="3.15" y="30.35" width="0.78" height="6.62" rx="0.34" ry="0.34" transform="translate(-24.59 12.69) rotate(-47.31)"/><rect class="cls-4" x="0.24" y="33.27" width="6.62" height="0.78" rx="0.34" ry="0.34" transform="translate(-24.59 12.69) rotate(-47.31)"/><rect class="cls-5" x="45.23" y="19.42" width="0.78" height="6.62" rx="0.34" ry="0.34" transform="translate(10.67 59.98) rotate(-74.71)"/><rect class="cls-5" x="42.31" y="22.34" width="6.62" height="0.78" rx="0.34" ry="0.34" transform="translate(10.67 59.98) rotate(-74.71)"/><path class="cls-6" d="M42.65,8.13,40.7,8.05A.7.7,0,0,1,40.13,7l1-1.66a.7.7,0,0,1,1.22.05l.92,1.73A.71.71,0,0,1,42.65,8.13Z" transform="translate(-0.99 -0.75)"/></svg>`
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
            <div class='content'>${iconSvg}</div>
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



