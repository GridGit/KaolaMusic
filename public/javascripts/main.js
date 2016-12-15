function $(s){
	return document.querySelectorAll(s);
}

var list = $("#list li");

for(var i=0; i< list.length; i++){
	list[i].onclick =function(){
		for(var j=0; j<list.length; j++){
			list[j].className = "";
		}
		this.className = "selected"
		loadMusic("/media/"+this.title)
	}
}

var xhr =new XMLHttpRequest();
var ac = new (window.AudioContext || window.webkitAudioContext)();
var gainNode = ac[ ac.createGain ? "createGain":"createGainNode"]();
	gainNode.connect(ac.destination);

var analyser = ac.createAnalyser();
var size = 128;
	analyser.fftSize = size * 2;
	analyser.connect(gainNode);

var source = null;
var count = 0;

var box =$("#box")[0];
var height,width;
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
	box.appendChild(canvas);
var dots = [];

function random(m,n){
	return Math.round(Math.random()*(n-m)+m);
}

function getDots(){
	dots =[];
	for(var i=0; i < size; i++){
		var x =random(0,width);
		var y = random(0,height);
		var color = "rgb("+random(0,255)+","+random(0,255)+","+random(0,255)+")";
		dots.push({
			x:x,
			y:y,
			color:color
		})
	}
}

var line ;
function resize(){
	width = box.clientWidth;
	height = box.clientHeight;
	canvas.height =height;
	canvas.width = width;
	line = ctx.createLinearGradient(0,0,0,height);
	line.addColorStop(0,"red");
	line.addColorStop(0.5,"yellow");
	line.addColorStop(1,"green");
	
	getDots();
}

resize();
window.onresize = resize;

function draw(arr){
	ctx.clearRect(0,0,width,height);
	var w = width/size;
		ctx.fillStyle = line;
	for(var i =0 ; i < size; i++){
		if(draw.type =="column"){
			var h = arr[i]/256 * height;

			ctx.fillRect(w*i,height - h,w*0.6,h);

		}else if(draw.type =="dot"){
			ctx.beginPath();
			var o = dots[i];
			var r = arr[i]/256*50
			ctx.arc(o.x,o.y,r,0,Math.PI*2,true);
			var g = ctx.createRadialGradient(o.x,o.y,0,o.x,o.y,r);
			g.addColorStop(0,"#fff");
			g.addColorStop(1,o.color);
			ctx.fillStyle = g;
			ctx.fill();
			//ctx.strokeStyle = "#fff";
			//ctx.stroke();
		}
	}
}
draw.type = "column";
//切换dot 和 column 的样式
var lis = $("#type li");
for(var i=0; i < lis.length ;i++){
	lis[i].onclick = function(){
		for(var j=0; j< lis.length; j++){
			lis[j].className="";
		}
		this.className = "selected";
		draw.type = this.getAttribute("data-type");
	}
}

function loadMusic(url){
	var n = ++count;
	source && source[source.stop? "stop":"noteOff"]();

	xhr.abort();
	xhr.open("GET",url);
	xhr.responseType = "arraybuffer";
	xhr.onload = function(){

		if(n != count ){
			return;
		}
		console.log(xhr.response);
		ac.decodeAudioData(xhr.response,function(buffer){
			if(n != count ){
				return;
			}
			var bufferSource = ac.createBufferSource();
			bufferSource.buffer = buffer;
			bufferSource.connect(analyser);
			bufferSource[bufferSource.start?"start" :"noteOn"](0);

			source = bufferSource;

		},function(error){
			console.log(error);
		});
	}
	xhr.send();
}


function visualizer(){
	var arr = new Uint8Array(analyser.frequencyBinCount);
	// analyser.getByteFrequencyData(arr);
	// console.log(arr);
	requestAnimationFrame = window.requestAnimationFrame ||
							window.webkitRequestAnimationFrame ||
							window.mozRequestAnimationFrame;
	function v(){
		analyser.getByteFrequencyData(arr);
		//console.log(arr);
		draw(arr);
		requestAnimationFrame(v);
	}
	requestAnimationFrame(v);
}

visualizer();


function changeVolume(percent){
	gainNode.gain.value = percent * percent;
}

$("#volume")[0].onclick = function(){
	changeVolume(this.value/this.max);
}







//获取音频文件
function fetechAudioSource(url,successCallback){
	if( url && url === "string"){
		var xhr = new XMLHttpRequest();
		xhr.abort();
		xhr.open("GET",url);
		//以二进制缓冲的方式存储音频文件数据
		xhr.responseType ="arrayBuffer";
		xhr.onload = function(){
			successCallback(xhr.rseponse);
		}
		xhr.send()
	}
}


//获取文件成功后的回调函数
function successCallback(res){
	//创建音频上下文对象
	var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
	//创建音源节点
	var sourceNode = audioCtx.createBufferSource();
	//创建一个增益节点，用于控制音量
	var gainNode = (audioCtx.createGain || audioCtx.createGainNode)();
	gainNode.gain.value =0.4;
	decodeAudio(audioCtx,res,function(sourceBuffer){
			sourceNode.buffer = sourceBuffer;
	});

	//连接各节点
	//sourceNode -- gainNode -- destinationNode
	sourceNode.connect(gainNode);
	gainNode.connect(audioCtx.destination);

	//播放
	(sourceNode.start || sourceNode.noteOn)(0);


}

//解码二进制缓冲的文件

function decodeAudio(audioCtx,audioData,callback){
	if(audioData){
		audioCtx.decodeAudioData(audioData,
			//on success
			function(buffer){
				callback && callback(buffer);
			},
			//on error
			function(e){
				console.log(e + ":fail to decode the file");
			}
		)
	}
}













