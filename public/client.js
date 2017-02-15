$("#registerBtn").click( function() {

  event.preventDefault();
  var errorMessage="<ul>";

  if(!isValidUsername($("#username").val())) {
    errorMessage = errorMessage + "<li> Your username cannot start with a number, contain special characters, or be fewer than three alpha number characters!</li>";
  }

  if( ! $("#password").val()) {
    errorMessage = errorMessage + "<li> Please enter a password!</li>";
  }else if( $("#password").val() != $("#passwordConfirm").val()) {
    errorMessage = errorMessage + "<li> Your password did not match your confirmation password!</li>";
    $("#passwordConfirm")[0].innerHTML = "";
  }

  if (errorMessage == "<ul>") {
    $("#registrationError")[0].innerHTML = "";
    $("#registrationForm").submit();
  }
  else {
    errorMessage = errorMessage + "</ul>";
    $("#registrationError")[0].innerHTML = errorMessage;
  }

});

$(".js-ajax").submit(function() {

  let data = $(this).serialize();
  console.log('serialized', data);
  let route = data.match(/route=(.*?)&/);
  let url = 'http://localhost:8080' + '/' + route[1];
  event.preventDefault();

  console.log('data', data, 'route', route[1]);

  $.ajax({
    type: "POST",
    dataType: "json",
    url: url,
    data: data,
    success: function(rData) {

      switch(rData['rType']) {
        case 'ERROR':
          alert(rData['errorText']);
          break;
        case 'registered':
          $("#registerClose").trigger('click');
          $("#username")[0].value = "";
          $("#password")[0].value = "";
          $("#passwordConfirm")[0].value = "";
          break;
        case 'login':
          $("#userId")[0].value = rData['userId'];
          $("#loginBar").hide();
          $("#userText")[0].innerHTML = rData['userName'] + " logged in";
          $("#logOutBtn").show();
          $("#loginUsername")[0].value = "";
          $("#loginPassword")[0].value = "";
          break;
        default:
          console.log("Did not parse rType: [" + rData['rType'] + "]");
      }
    },
    error: function(jqXHR,exception) {
     /*console.log(jqXHR);*/
     alert(jqXHR.status + " exc:[" + exception + "] text[" +  jqXHR.responseText + "]");
     },
  });
  return false;
});

function isValidUsername(username) {
  /*Username must be at least three characters, all alphanumberic */
  let pattern = new RegExp(/^[A-z]\w\w+$/);
  return pattern.test(username);
}

$('#submitRegistration').click(function () {
  $('#registrationForm').submit();
});

document.addEventListener('DOMContentLoaded', () => {
  let mouse = {
    click: false,
    move: false,
    pos: { x: 0, y: 0 },
    pos_prev: false
  };

  // get canvas element and create context
  const canvas = document.getElementById('drawing');
  const lineSlider = document.getElementById('lineSize');
  const colorPick = document.getElementById('color-picker');

  const context = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const socket = io.connect();
  const rect = canvas.getBoundingClientRect();
  console.log(rect);


  let randomColor = ['#FF0000', '#888888', '#1200d6']
  // let penColor = randomColor[Math.floor(Math.random() * 3)];

  // initialize pen color
  let lineColor = '#000000'

  canvas.style.cursor = 'crosshair';

  // register mouse event handlers
  canvas.onmousedown = (e) => { mouse.click = true; };
  canvas.onmouseup = (e) => { mouse.click = false; };

  canvas.onmousemove = (e) => {
    const x = window.scrollX;
    mouse.pos.x = e.clientX + x - rect.left;
    
    const y = window.scrollY;
    mouse.pos.y = e.clientY + y - rect.top;

    mouse.move = true;
  };

  // draw line received from server
  socket.on('draw_line', (data) => {
    let line = data.line;
    context.beginPath();

    //  set line width
    context.strokeStyle = data.line[2];
    context.lineWidth = data.line[3];

    // set end cap of line 'round' 'square' 'butt'
    context.lineJoin = 'round'
    context.lineCap = 'round';

    context.moveTo(line[0].x, line[0].y);
    context.lineTo(line[1].x, line[1].y);

    context.stroke();
  });

  // main loop, running every 5ms
  function mainLoop() {
    // check if the user is drawing
    if (mouse.click && mouse.move && mouse.pos_prev) {

      lineWidth = lineSlider.value;
      lineColor = colorPick.style.backgroundColor.toString();


      // send line to to the server
      socket.emit('draw_line', { line: [mouse.pos, mouse.pos_prev, lineColor, lineWidth] });
      mouse.move = false;
    }
    mouse.pos_prev = { x: mouse.pos.x, y: mouse.pos.y };
    setTimeout(mainLoop, 5);
  }

  var rangeSlider = function(){
    var slider = $('.range-slider'),
        range = $('.range-slider__range'),
        value = $('.range-slider__value');
      
    slider.each(function(){

      value.each(function(){
        var value = $(this).prev().attr('value');
        $(this).html(value);
      });

      range.on('input', function(){
        $(this).next(value).html(this.value);
      });
    });
  };

  rangeSlider();

  mainLoop();
});
