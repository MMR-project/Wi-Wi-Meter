
var canvasVideo;
var contextVideo;

var imageFilter;
var imageMemory;
var frameNumberForFPS = 0;
var frameNumber = 0;
var startTime = null;
var startCalibTime = null;
var calibSpan = 5000;//キャリブレーションを行う時間
var requestID;
var moveCount = 0;
var sumCount = 0;
var numFrame = 0;
var startTimeV=0;
var scoreMovie=0;//動画のによる得点
var brightThresh =10;//輝度差が閾値より10高ければ差分ありとする
var movePixelThresh = 0.02;//2%が動いていたら動いていることとする


//過去の画像を保存するためのクラス
function ImageMemory(iwidth, iheight){
  this.iwidth = iwidth;
  this.iheight = iheight;
  this.numPixel = iwidth*iheight;
  this.threshPixels = new Array(this.numPixel);
  this.lastPixels = new Array(this.numPixel);
  for(var i=0; i< this.numPixel; i++){
    this.threshPixels[i] = 0;
    this.lastPixels[i] = 0;
  }
};

//ロード時に呼ばれる関数
function videoInit(){
  startTimeV = getTime();
  setFilter(null);
  canvasVideo= document.getElementById('videoCanvas');
  contextVideo = canvasVideo.getContext("2d");
};

function calcScore(_moveCount, _sumCount){
  var ratio = _moveCount / _sumCount;
  ratio *= 250;
  if(ratio <= 1){
     return 0;
  }
  var saturation =  42 * Math.log10(ratio);
  if(saturation > 100){
     saturation = 100;
  }
  return Math.floor(saturation);
}

//フレームの処理
function update(){
  processVideoFrame();
  frameNumberForFPS++;
  
  if (startTime == null)
    startTime = (new Date).getTime(); 
  if (frameNumberForFPS >= 60) {
      var currentTime = (new Date).getTime();            // in milliseconds
      var deltaTime = (currentTime - startTime)/1000.0;  // in seconds      
     if(sumCount>0){
        scoreMovie = calcScore(moveCount, sumCount);
        document.querySelector("#point").innerHTML = "動きの得点："+ scoreMovie;
      } else  {
        scoreMovie = 0;
        document.querySelector("#point").innerHTML = "準備中2・・・・";
      }
      startTime = currentTime;
      frameNumberForFPS = 0;
  }		   

  if(startCalibTime != null){
     var currentTime = (new Date).getTime(); 
     if(currentTime - startCalibTime > calibSpan){
        startCalibTime = null;
        //cancelAnimationFrame(requestID);
        window.localStorage.setItem("threshPixels", ""+imageMemory.threshPixels)
        setFilter(dif);
     }
   }
};

//画像処理のフィルタをセットする関数
function setFilter(f) {
  frameNumber = 0;
  imageFilter = f;
};

//画像を処理する関数
function processImage() {
  if (canvasVideo.width > 0 && canvasVideo.height > 0) {
    if (imageFilter) {      
      contextVideo.putImageData(imageFilter.apply(null, [contextVideo.getImageData(0, 0, 
        canvasVideo.width, canvasVideo.height)]), 0, 0);
    }
  }
};

//キャリブレーション処理
calib = function(pixels, args) {
  var d = pixels.data;
  var avg = 0;
  if(frameNumber == 0){
    for (var i = 0; i < imageMemory.numPixel; i ++) {
      imageMemory.lastPixels[i] = d[4 * i + 1];
      imageMemory.threshPixels[i] = 0;
    }
  }
  else{
    for (var i = 0; i < imageMemory.numPixel; i ++) {
      var pixVal = d[4 * i + 1];
      var dl = Math.abs(pixVal - imageMemory.lastPixels[i]);
      imageMemory.lastPixels[i] = pixVal;

      if(dl < 10){
         dl = 10;
       }
      imageMemory.threshPixels[i] = Math.max(imageMemory.threshPixels[i], dl);
      d[4 * i] = imageMemory.threshPixels[i];
      d[4 * i + 1] = imageMemory.threshPixels[i];
      d[4 * i + 2] = imageMemory.threshPixels[i];
    }
  }
  frameNumber++;
  return pixels;
};


//動画の処理を行う関数
function processVideoFrame() {
  if (contextVideo && video != null && video.videoWidth > 0 && video.videoHeight > 0) {
    // Resize the canvas to match the current video dimensions
    if( imageMemory == null){
      imageMemory = new ImageMemory(video.videoWidth, video.videoHeight);
    }
    if (canvasVideo.width != video.videoWidth) 
      canvasVideo.width = video.videoWidth;
    if (canvasVideo.height != video.videoHeight) 
      canvasVideo.height = video.videoHeight;

    contextVideo.drawImage(video, 0, 0, canvasVideo.width, canvasVideo.height);
    processImage(canvasVideo); 
  }
};
// filter to make difference
dif = function (pixels, args) {
  var d = pixels.data;
  var avg = 0;
  var count = 0;
  if(frameNumber <= 0){
    for (var i = 0; i < imageMemory.numPixel; i ++) {
      imageMemory.lastPixels[i] = d[4 * i + 1];
    }
  }
  else{
    for (var i = 0; i < imageMemory.numPixel; i ++) {
      var pixVal = d[4 * i + 1];
      var dl = Math.abs(pixVal - imageMemory.lastPixels[i]);
      imageMemory.lastPixels[i] = pixVal;
      dl -= imageMemory.threshPixels[i];
      if(dl < 0){
        dl = 0;
      }
      else if(dl > brightThresh){
        count++;
      }
    }
  }
  if(count > imageMemory.numPixel * movePixelThresh){
     moveCount ++;
  }

  sumCount++;
  frameNumber ++;
  return pixels;
};

function videoAnimation(){
  var lastTimeV=getTime();
  //1秒ごとの処理
  var dT = 333;
  if(lastTimeV-startTimeV>dT){
    startTimeV=lastTimeV;
    update();
  }

}