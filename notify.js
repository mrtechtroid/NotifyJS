/*
NotifyJS v1.0 by MTTOne (mrtechtroid)
Released Under MIT License - github.com/mrtechtroid/notifyjs

Thanks to https://codepen.io/juliepark/pen/vjMOKQ
for UI of notification toasts. Released under MIT.
*/

let DATA_SOURCE = ""

DATA_SOURCE = document.querySelector("script[_notify_js_]").getAttribute("data_source")

let notif_root = document.createElement("ul")
notif_root.setAttribute("id","notify_js_root")
notif_root.setAttribute("style","z-index:1000;position:fixed;top:10px;right:10px;")
document.getElementsByTagName("body")[0].appendChild(notif_root)
/* 
    {
        type: [hostname|url(hostname+pathname)|regex],
        identifier: "",  - blank affects all pages defined. 
        "displayTime":{"from":"[UNIXTIME]","to":"[UNIXTIME]"}  
        NOTE: - (to:"-1" - Display always after from. | from:"0" - Display always before to)
        "notif_type": [success|error|warning|info]
        "notif_text": "This is a sample notification"
        "action": [none|button|html],
        "action_fn": "",
        "max_shown_time":5000,
    }
*/
function parseNotifications(json){
  if (!json.notify_version == 1){
    console.log("Invalid Notify Version")
    return false;
  }

  for (let i = 0;i<json.websites.length;i++){
    let webCheck = json.websites[i];
    if (webCheck.type=="hostname"){
      if (document.location.hostname != webCheck.identifier){
        continue;
      }
    }else if (webCheck.type == "url"){
      if (document.location.host+document.location.pathname != webCheck.identifier){
        continue
      }
    }else if (webCheck.type == "regex"){
      let f = `${location.protocol}//${location.host}${location.pathname}`
      if (f.match(webCheck.identifier)){
        continue;
      }
    }else{
      console.log("error in type")
    }

    if (!(webCheck.displayTime.from < Date.now() && (webCheck.displayTime.to> Date.now()||webCheck.displayTime.to==-1))){
      continue;
    }
    addToast(webCheck)
  }
  for (let i = 0;i<json.linked_json_set.length;i++){
    fetchNotification(json.linked_json_set[i]);
  }
}
function fetchNotification(DATA_SOURCE){
  const myRequest = new Request(DATA_SOURCE)
fetch(myRequest)
  .then((response) => response.json())
  .then((data) => {
    parseNotifications(data)
  })
}

fetchNotification(DATA_SOURCE);

function dE(ele){
  return document.getElementById(ele);
}

function toastTimer(id, time) {
  dE(id).setAttribute("timedone", 0)
  dE(id).setAttribute("timestarted", Date.now())
  dE(id).setAttribute("toastInterval", setInterval(function () {
    let timenow = Date.now()
    dE(id).style.width = String(100 * (timenow - parseInt(dE(id).getAttribute("timestarted"))) / (time)) + "%"
    dE(id).setAttribute("timedone", parseInt(dE(id).getAttribute("timedone")) + 1)
    if (parseInt(dE(id).getAttribute("timedone")) * 10 === time) {
      clearInterval(dE(id).getAttribute('toastInterval'));
      dE("toast" + id.split("toasttimer")[1]).remove()
    }
  }, 10))
  dE(id).parentElement.onclick = function(){
    clearInterval(dE(id).getAttribute('toastInterval'));
    dE("toast" + id.split("toasttimer")[1]).remove()
  }
}

function addToast(webCheck) {
  if (webCheck.max_shown_time == "" || webCheck.max_shown_time == undefined) {
    webCheck.max_shown_time = 5000
  }
  let namo = ""
  let idno = Math.floor(Math.random() * 10000)
  let web_html_ = ``
  if (webCheck.action == "button"){
    web_html_ = `<button class="button-box" onclick = ${webCheck.action_fn}><h1>continue</h1></button>`
  }else if (webCheck.action == "html"){
    web_html_ = webCheck.action_fn
  }
  
  if (webCheck.notif_type == "success") {
    namo = `<div class="success-box"><div class="dot"></div><div class="dot two"></div><div class="face"><div class="eye"></div><div class="eye right"></div><div class="mouth happy"></div></div><div class="message"><h1 class="alert">${webCheck.notif_title}</h1><p>${webCheck.notif_text}</p></div>${web_html_}<div class = "toasttimer" id = "toasttimer` + idno + `"></div><span class = "watermark">NotifyJS v1.0</span></div>`
  } else if (webCheck.notif_type == "warning") {
    namo = `<div class="warning-box"><div class="dot"></div><div class="dot two"></div><div class="face2"><div class="eye"></div><div class="eye right"></div><div class="mouth bruh"></div></div><div class="message"><h1 class="alert">${webCheck.notif_title}</h1><p>${webCheck.notif_text}</p></div>${web_html_}<div class = "toasttimer" id = "toasttimer` + idno + `"></div><span class = "watermark">NotifyJS v1.0</span></div>`
  } else if (webCheck.notif_type == "error") {
    namo = `<div class="error-box"><div class="dot"></div><div class="dot two"></div><div class="face2"><div class="eye"></div><div class="eye right"></div><div class="mouth sad"></div></div><div class="message"><h1 class="alert">${webCheck.notif_title}</h1><p>${webCheck.notif_text}</p></div>${web_html_}<div class = "toasttimer" id = "toasttimer` + idno + `"></div><span class = "watermark">NotifyJS v1.0</span></div>`
  } else {
    namo = `<div class="info-box"><div class="dot"></div><div class="dot two"></div><div class="face2"><div class="eye"></div><div class="eye right"></div><div class="mouth huh"></div></div><div class="message"><h1 class="alert">${webCheck.notif_title}</h1><p>${webCheck.notif_text}</p></div>${web_html_}<div class = "toasttimer" id = "toasttimer` + idno + `"></div><span class = "watermark">NotifyJS v1.0</span></div>`
  }
  dE("notify_js_root").insertAdjacentHTML('afterbegin', `
  <li class = "toast" id = "toast`+ idno + `">${namo}</li>
  `)
  toastTimer("toasttimer" + idno, webCheck.max_shown_time)
  return "toast" + idno
}