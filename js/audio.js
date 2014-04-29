var now = window.performance && (
	performance.now || 
	performance.mozNow || 
	performance.msNow || 
	performance.oNow || 
	performance.webkitNow );
var getTime = function() {
	return ( now && now.call( performance ) ) || ( new Date().getTime() );
}
function mkAudioFilter(array){
	for(var i=0;i<freqWidth;i++){
		if(i < 60) {
			filterData[i]=0;
		}else if(i < 120){
			filterData[i]=parseFloat(i-60)/parseFloat(60)
		}else if(i < 300){
			filterData[i]=1;
		}else if(i < 360){
			filterData[i]=parseFloat(360 - i) / 60;
		}else {
			filterData[i]=0;
		}
	}
}
var _width = 640;
var _height = 256;
var freqWidth = 1024;
var showProcess = true;
var processing = false;

var frequencyElement;
var frequencyContext;
var powerTransElement;
var powerTransContext;

var audioContext;

var threshAudio=15;
var frequencyData;
//var timeDomainData = new Uint8Array(analyser.frequencyBinCount);
var powerTransData;
//var scoreData;
var scoreTransition;
var largePowerCountData;
var veryLargePowerCountData;
var excitingData;
var filterData;
var startTime;
var orgTime;
var avgpower;
var frameCount;
var deltaT;
var drawCount;
var thcoef;
var meetingScore;
//var meetingScoreTemp;
var scoreAudio=0;
var blankTime;
var avgthresh;
var avgmax;

var drawPowerTrans = function(){
	if(threshAudio<0)
	{
		powerTransContext.clearRect(0,0,_width,_height);
		powerTransContext.beginPath();
		//powerTransContext.fillText("準備中・・・3秒お待ちください", 10, 20, 80);
		document.getElementById("scoreText").innerHTML = "準備中・・・";
		powerTransContext.stroke();	
		return;
	}
	var gainForDraw = 4;
	var offset = 10;
	powerTransContext.clearRect(0,0,_width,_height);
	powerTransContext.beginPath();
	//状態の描画(沈黙)
	for(var i=1;i<powerTransElement.width;i++)
	{
		if(powerTransData[i] < threshAudio*thcoef && powerTransData[i-1]<threshAudio*thcoef)
		{
			powerTransContext.fillRect(i-1, _height-thcoef*threshAudio*gainForDraw - offset, 1,  thcoef*threshAudio*gainForDraw );
			//powerTransContext.lineTo(i, 256 - powerTransData[i] * gainForDraw - offset);
		}
	}
	powerTransContext.fillStyle = "rgb(128, 255, 128)";
	powerTransContext.stroke();
	//状態の描画(発話)
	powerTransContext.beginPath();
	for(var i=1;i<powerTransElement.width;i++)
	{
		if(powerTransData[i] >= threshAudio*thcoef || powerTransData[i-1]>=threshAudio*thcoef)
		{
			powerTransContext.fillRect(i-1, _height-thcoef*threshAudio*gainForDraw - offset, 1,  thcoef*threshAudio*gainForDraw );
		}
	}
	powerTransContext.fillStyle = "rgb(200, 200, 255)";
	powerTransContext.stroke();

	//音量の描画
	powerTransContext.beginPath();
	powerTransContext.moveTo(0, 256 - powerTransData[i-1] * gainForDraw - offset );
	for(var i=1;i<powerTransElement.width;i++)
	{
		powerTransContext.lineTo(i, 256 - powerTransData[i] * gainForDraw - offset);
	}
	powerTransContext.strokeStyle = "rgb(128,128,128)";
	powerTransContext.stroke();
	var scoreContext = document.getElementById("scoreText");
	//scoreAudio=Math.min(100,parseInt(1000*meetingScore/(getTime()-orgTime)));
	scoreAudio=parseInt(1000*meetingScore/(getTime()-orgTime));
	//scoreTransition[0]=scoreAudio;
	scoreTransition[0] = Math.round( Math.min( Math.max(0,   42*Math.log10(scoreAudio)), 100));
	scoreAudio = scoreTransition[0];
	scoreContext.innerHTML = "声の得点："+ scoreTransition[0];

	powerTransContext.beginPath();			
	powerTransContext.moveTo(0, _height - scoreTransition[0]*2 - offset);
	for(var i=1;i<powerTransElement.width-10;i++){
		powerTransContext.lineTo(i, _height - scoreTransition[i]*2 -offset);
		//score
	}
	powerTransContext.strokeStyle = "rgb(255, 128, 128)";
	powerTransContext.stroke();
	
}
function drawFrequency(){
	//平均パワーのデータ更新
	//周波数成分の描画
	frequencyContext.clearRect(0, 0, _width, _height);
	frequencyContext.beginPath();
	frequencyContext.moveTo(0, _height - frequencyData[0]);
	var currentPower=0;
	currentPower+=frequencyData[0];
	for (var i = 1, l = frequencyData.length; i < l; i++) {
		frequencyContext.lineTo(i, _height - frequencyData[i]);
		currentPower+=frequencyData[i];
	}
	currentPower/=frequencyData.length;
	avgpower+=currentPower;
	if(currentPower>threshAudio){
		largePowerCount++;
	}
	frequencyContext.stroke();

}

function audioInit() {
	powerTransElement = document.getElementById("powertransition")
	powerTransContext = powerTransElement.getContext("2d");
	var scoreContext = document.getElementById("scoreText");
	//scoreContext.innerHTML="Score:";

	powerTransElement.width = _width;
	powerTransElement.height = _height;
	//閾値
	//threshAudio = -1;
	audioContext = new AudioContext();
	frequencyData = new Uint8Array(freqWidth);
	timeDomainData = new Uint8Array(freqWidth);
	filterData = new Float32Array(freqWidth);
	powerTransData = new Uint8Array(powerTransElement.width);
	largePowerCountData = new Uint8Array(powerTransElement.width);
	veryLargePowerCountData = new Uint8Array(powerTransElement.width);
	excitingData = new Uint8Array(powerTransElement.width);
	scoreTransition = new Uint8Array(powerTransElement.width);
	for(var i=0;i<powerTransElement.width;i++){
		powerTransData[i] = 0;
		largePowerCountData[i]=0;
		excitingData[i]=0;
		scoreTransition[i]=0;
	}
	mkAudioFilter(filterData);
	startTime=getTime();
	orgTime = startTime;
	avgpower = 0;
	frameCount =0;
	deltaT=100;
	drawCount=1;
	thcoef=2.;
	meetingScore = 0;
	blankTime = 0;
	cnt4decideThresh=0;
	cntmax=70;//約3秒
	avgthresh=0;
	avgmax=0;
	largePowerCount=0;

}
function updateData(){
	for(var i=powerTransElement.width-1;i>0;i--){
		powerTransData[i] = powerTransData[i-1];
		largePowerCountData[i]= largePowerCountData[i-1];
		excitingData[i]=excitingData[i-1];
		scoreTransition[i]=scoreTransition[i-1];
	}	
}
function calcThresh(){
	//avgthresh+=avgpower;+""
	if(frameCount>0){
		var avg = avgpower/frameCount;
		avgthresh+=avg;
		if(avgmax<avg){
			avgmax=avg;
		}
		cnt4decideThresh++;
		if(cnt4decideThresh>cntmax){
			//threshAudio=avgthresh/cnt4decideThresh;
			threshAudio = (avgmax+avgthresh/cnt4decideThresh)/3;
			//alert(threshAudio);
			//alert(Math.round(avgmax)+","+Math.round(avgthresh)+","+Math.round(cnt4decideThresh)+","+Math.round(threshAudio));
			//threshAudio = 15;
			var audio = new Audio("");
        	audio.autoplay = false;
        	audio.src = "wait.mp3";
        	audio.load();
        	audio.play();

		}
		avgpower=0;
		frameCount=0;

	}
}

function audioAnimation(){
	var lastTime=getTime();
	//1秒ごとの処理
	if(lastTime-startTime>deltaT){
		startTime=lastTime;
		drawPowerTrans();
		updateData();
		if(threshAudio<0){
			calcThresh();
		} else {
			powerTransData[0] = avgpower/frameCount;
			largePowerCountData[0] = largePowerCount;
			if(largePowerCountData[0]>largePowerCountData[1])
			{
				blankTime=0;
			}
			var cnt=0;
			for(var i=0;i<10;i++){
				//1秒間
				if(powerTransData[i]>thcoef*threshAudio)
				{
					cnt++;
				}
			}
			excitingData[i]=cnt;
			avgpower=0;
			largePowerCount=0;
			frameCount=0;
			blankTime++;
			if(blankTime>50){
				meetingScore-=0.2;
			}
			if(meetingScore<0){
				meetingScore=0;
			}
			meetingScore+=cnt*5;
		}
	}
	if(lastTime<startTime)
	{
		startTime = lastTime;
	}
	//以下フル速度
	analyser.getByteFrequencyData(frequencyData);
	//盛り上がり判定
	var currentPower=0;
	currentPower+=frequencyData[0];
	for (var i = 1, l = frequencyData.length; i < l; i++) {
		currentPower+=frequencyData[i];
	}
	currentPower/=frequencyData.length;
	avgpower+=currentPower;
	if(currentPower>threshAudio){
		largePowerCount++;
	}
	if(showProcess==true){
		//drawFrequency();
	}
	frameCount++;
}
