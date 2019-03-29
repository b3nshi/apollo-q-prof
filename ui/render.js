const EXECUTION_TIME = "executionTime";
const START_TIMESTAMP = "startTimestamp";
const ENDS_TIMESTAMP = "endsTimestamp";
const PARAMETERS     = "params";
const METHOD_NAME    = "method";
const DATA_SOURCE    = "dataSource";

window.onload = () => {
  let openedFile;

  const bindToggle = () => {
    let requestBlock = document.getElementsByClassName('trigger');
    Array.from(requestBlock).forEach((element) => {
      element.addEventListener('click', (event) => {
        event.target.parentNode.classList.toggle("active");
      });
    });
  }

  const onReaderLoad = (ev) => {
    let obj = ev;
    if (ev.target) {
     obj = JSON.parse(ev.target.result);
    }
    let ulRecords = document.getElementById('records');
    ulRecords.innerHTML = "";
    Array.from(obj).forEach((item) => {
      let li = document.createElement('li');
      li.setAttribute('class', 'request');
      li.innerHTML = '<span class="trigger"></span>' +
      '<div class="title">' +
      '<div><span class="query">' + item.request.query.substring(0, 50) + '...</span></div>' + 
      '<div><span class="execution-time">' +  item.response[EXECUTION_TIME] + 'ms</span></div>' +
      '</div>';
      let divContent = document.createElement('div');
      divContent.setAttribute('class', 'content');
      divContent.append('Content');
      let content = '<div class="info"><div class="query"><pre>' +
        item.request.query +
        '</pre></div></div><div class="outgoing">';
      
      Array.from(item.outgoingRequests).forEach((out) => {
        content += '<div class="out">';
        content += '<span class="data-source">' + out[DATA_SOURCE] + '</span>';
        content += '<span class="method">' + out[METHOD_NAME] + '</span>';
        content += '<span class="arguments">' + out[PARAMETERS] + '</span>';
        content += '<span class="execution-time">' + out[EXECUTION_TIME] + 'ms</span>';
        content += '</div>';
      });
      content += '</div>';
      divContent.innerHTML = content;
      li.append(divContent);
      ulRecords.append(li);
    });

    bindToggle();
  }


  const reader = new FileReader();
  reader.onload = onReaderLoad;

  const fileLoader = document.getElementById("file-loader");
  const fileRefresh = document.getElementById("btn-refresh");

  fileLoader.onchange = (event) => {
    openedFile = event.target.files[0];
    fileRefresh.removeAttribute("disabled");
    reader.readAsText(event.target.files[0]);
  }
  
  fileRefresh.onclick = () => {
    if (openedFile) {
      reader.readAsText(openedFile);
    }
  }

  fetch("/sample.json")
    .then(function(response) {
      return response.json();
    })
    .then(function(json) {
      onReaderLoad(json);
    });
}