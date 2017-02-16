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


$('#logOutBtn').click(function() {
  console.log('logging out');
  $.ajax({
    type: 'POST',
    dataType: 'json',
    url: '/logout',
    success: function(response) {
      if(response.success) {
        window.location.href = '/';
      }
      else {
        alert('logout failed');
        window.location.href = '/';
      }
    }
  })
});


$('#saveBoardBtn').click(function() {
  console.log('saving Board');
  const data = {};
  data.user_id = user_id;
  let canvas = $('#drawing');
  data.boardData = canvas[0].toDataURL('image/png');

  console.log('Saving board', data);

  $.ajax({
    type: 'POST',
    dataType: 'json',
    url: '/saveboard',
    data: data,
    success: function(response) {
      if(response.success) {
        alert('Board saved');
      }
      else {
        alert('Board Save failed');
      }
    },
    error: function() {
        alert('Board Save failed');
    }
  })
});

$('#loadBoardBtn').click(function() {
  const data = {};
  data.user_id = user_id;

  console.log('loading saved boards', data);

  $.ajax({
    type: 'POST',
    dataType: 'html',
    url: '/loadboards',
    data: data,
    success: function(response) {
      if( $('.loadBoardDialog')[0] ) {
        $('.loadBoardDialog')[0] = response;
      } else  {
        $('#loadBoardModal').append(response);
      }
    },
    error: function() {
      alert('Board load failed');
    }
  })
});

function fetchBoard (boardId) {
  console.log('boardname clicked');
  const data = {};
  console.log('fetch', boardId);
  data.board_id = boardId;

  //console.log('loading saved boards', data);

  $.ajax({
    type: 'POST',
    dataType: 'json',
    url: '/selectboard',
    data: data,
    success: function(response) {
      if (response.success) {
        console.log('success - remove modal');
        //$("#loadBoardClose").trigger('click');
        $('#loadBoardModal').modal('toggle');
        //$('#loadBoardModal').remove();
      }
      let canvas = $('#drawing');
      let ctx = canvas[0].getContext('2d');
      ctx.clearRect(0, 0, canvas[0].width, canvas[0].height);
      let newBoard = new Image;
      newBoard.onload = function() {
        ctx.drawImage(newBoard, 0, 0);
        //$('#drawing')[0].drawImage(img,0,0);
      }
      newBoard.src = response.board_data;
      //$("#registerClose").trigger('click');
    },
    error: function() {
      alert('Board load failed');
      //$("#registerClose").trigger('click');
    }
  })
};

$(".js-ajax").submit(function() {
  let data = $(this).serialize();
  console.log('serialized', data);
  let route = data.match(/route=(.*?)&/);
  let url = '/' + route[1];
  event.preventDefault();
  console.log('data', data, 'route', route[1]);

  $.ajax({
    type: "POST",
    dataType: "json",
    url: url,
    data: data,
    success: function(data) {
      if (data.success) {
        window.location.href = '/'
      }
      else {
        alert(data.status);
        window.location.href = '/'
      }

    },

    error: function(jqXHR,exception) {
      $("#registerClose").trigger('click');
     console.log(jqXHR);
     //alert(jqXHR.status + " exc:[" + exception + "] text[" +  jqXHR.responseText + "]");

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

let socket;

  function swapSocket(userName) {
    let nameSpace = '/' + userName;
    console.log("swapping socket to ", nameSpace);
    socket = io(nameSpace);
  }

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

  const rect = canvas.getBoundingClientRect();
  console.log(rect);

  // console.log('passing ' + namespace )
  // if it in pulbic namespace string will be empty so socket = io('/')
  let socket = io('/' + namespace);

  // let socket = io('/new') //=== FOR TESTING PURPOSE<DELETE THIS LINE

  // initialize pen color
  let lineColor = '#000000';

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
