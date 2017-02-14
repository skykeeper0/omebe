/** function hasUserMedia()
 *  Determine if the user's browser supports UserMedia
 * @returns {boolean}
 */
function hasUserMedia() {
  navigator.getUserMedia =
    navigator.getUserMedia        ||
    navigator.webkitGetUserMedia  ||
    navigator.mozGetUserMedia     ||
    navigator.msGetUserMedia;

  return !!navigator.getUserMedia;
}

if (hasUserMedia()) {
  // determine which browser-specific UserMedia protocol we'll use
  navigator.getUserMedia =
    navigator.getUserMedia       ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia    ||
    navigator.msGetUserMedia;

  //get both video and audio streams from user's camera
  navigator.getUserMedia({ video: true, audio: true }, function (stream) {
    let video = document.querySelector('video');

    //insert stream into the video tag
    video.src = window.URL.createObjectURL(stream);

  }, function (err) { console.log(err) });

}else {
  alert('Error. WebRTC is not supported!');
}
