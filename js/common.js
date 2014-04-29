var videoElement;
var audioElement;
var audioContext;
var analyser;
var mediastreamsource;

function showResult(){
    
    //var scoreMovie =100;
	if(window.sessionStorage != null){
		var score = {
			movie: scoreMovie,
			audio: scoreAudio
		};
		window.sessionStorage.setItem("score", JSON.stringify(score));
		document.location  ="questionnaire.html";
	}else{
		document.location = "questionnaire.html?data="+encodeURIComponent(scoreMovie+","+scoreAudio);
	}
}

function calibStart(){
  var audio = new Audio("");
  audio.autoplay = false;
  audio.src = "tenko.mp3";
  audio.load();
  audio.play();
  audio.onended=onEnded;
  document.querySelector("#point").innerHTML = "準備中1・・・・";
  setFilter(calib);
};
function onEnded(){
    startCalibTime = (new Date).getTime();    
    audioInit();
    threshAudio = -1;
    //alert("ok");
}
function onClickStart(){
    var btn1 = document.getElementById("buttonStart");
	if(processing){
		//btn1.innerHTML="スタート"
		//processing=false;
		showResult();
	} else {
		calibStart();
		btn1.innerHTML="ストップ"		
		processing=true;
		//onClickStart();
	}
}
function onClickShowProcess(){
	var btn2 = document.getElementById("buttonShow");
	if(showProcess==true){
		btn2.innerHTML="過程表示OFF"
		showProcess=false;
		//document.getElementById("frequency").visibility=false;
	}else{
		btn2.innerHTML="過程表示ON"
		showProcess=true;
	}
}

function init(){
	 videoElement= document.getElementById('video');
     videoElement.volume=0.0;
     contextVideo = document.getElementById('videoCanvas').getContext('2d');
    //var localMediaStream = null; 
    audioInit();
    videoInit();
    window.URL = window.URL || window.webkitURL;
    navigator.getUserMedia  = 	navigator.getUserMedia || 
    							navigator.webkitGetUserMedia ||
                              	navigator.mozGetUserMedia || 
                              	navigator.msGetUserMedia;
    //カメラ使えるかチェック
    if (!navigator.getUserMedia) {
        alert("未対応ブラウザです。");
    }
    var localMediaStream;
    var videoObj={audio : true, video : true, toString : function(){return "video, audio";}};
    navigator.getUserMedia(
    	videoObj,
        function(stream) {
        	localMediaStream = stream;
        	videoElement.src = window.URL.createObjectURL(localMediaStream);
			audioContext = new AudioContext();
			mediastreamsource = audioContext.createMediaStreamSource(stream);
			analyser = audioContext.createAnalyser();
			mediastreamsource.connect(analyser);
        	var animation = function(){
        		audioAnimation();
        		videoAnimation();
        		requestAnimationFrame(animation);
        	}
        	animation();
        },
        function(e) {
           alert(e);
        }
    );
}
window.addEventListener("load", init, false);


