function bindToggle() {
  var requestBlock = document.getElementsByClassName('trigger');

  Array.from(requestBlock).forEach(function(element) {
    element.addEventListener('click', function(event) {
      event.target.parentNode.classList.toggle("active");
    });
  });
}

/**
 * Structure sample
  <li class="request active">
    <span class="trigger"></span>
    <div class="title">
      Query: <span class="query">categoryPage...</span>
      Execution time: <span class="time">11ms</span></div>>
    <div class="content">
      <div class="info">
        <span class="query">categoryPage ...</span>
      </div>
      <div class="outgoing">
        <div class="out">Out1</div>
        <div class="out">Out2</div>
      </div>
    </div>
  </li>
*/
function onReaderLoad(ev) {
  var obj = ev;
  if (ev.target) {
    JSON.parse(ev.target.result);
  }
  var ulRecords = document.getElementById('records');
  Array.from(obj).forEach(function(item) {
    var li = document.createElement('li');
    li.setAttribute('class', 'request');
    li.innerHTML = '<span class="trigger"></span>' +
    '<div class="title">' +
    '<div><span class="query">' + item.request.query.substring(0, 50) + '...</span></div>' + 
    '<div><span class="execution-time">' +  item.response['execution-time'] + '</span></div>' +
    '</div>';
    var divContent = document.createElement('div');
    divContent.setAttribute('class', 'content');
    divContent.append('Content');
    var content = '<div class="info"><div class="query"><pre>' +
      item.request.query +
      '</pre></div></div><div class="outgoing">';
    
    Array.from(item.outgoingRequests).forEach(function(out) {
      content += '<div class="out">';
      content += '<span class="data-source">' + out.dataSource + '</span>';
      content += '<span class="method">' + out.method + '</span>';
      content += '<span class="arguments">' + out.args + '</span>';
      content += '<span class="execution-time">' + out['execution-time'] + '</span>';
      content += '</div>';
    });
    content += '</div>';
    divContent.innerHTML = content;
    li.append(divContent);
    ulRecords.append(li);
  });

  bindToggle();
}

window.onload = function() {
  var fileLoader = document.getElementById("file-loader");
  
  fileLoader.onchange = function() {
    var reader = new FileReader();
    reader.onload = onReaderLoad;
    reader.readAsText(event.target.files[0]);
  }

  // Will try to find a file in the root path
  fetch("/apollo-prof.json")
    .then(function(response) {
      return response.json();
    })
    .then(function(json) {
      onReaderLoad(json);
    });
}