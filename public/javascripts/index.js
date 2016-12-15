
// 定义选择器方法
function $(s){
	return document.querySelectorAll(s);
}

var list = $("#list li");
var size ;
setSize();
// 线性渐变色
var line ;
var box =$("#box")[0];
var height,width;
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
	box.appendChild(canvas);
var dots = [];
var songNum = 0;

var mv = new MusicVisualizer({
	size:size,
	visualizer:draw
});
function setSize(){
	if( IsPC()){
		size = 128;
	}else{
		size = 64;
	}
}
// 页面加载完毕播放歌曲
window.onload = function(){
	list[0].onclick();
}
// 上一首
var forward = $("#forward")[0];
forward.onclick = function(){
	if(pause.innerHTML === "播放"){
		pause.innerHTML = "暂停";
	}
	if(songNum === 1){
		list[list.length-1].onclick();
	}else{
		list[songNum-2].onclick();
	}

}
// 下一首
var next = $("#next")[0];
next.onclick = function(){
	if(pause.innerHTML === "播放"){
		pause.innerHTML = "暂停";
	}
	if(songNum === list.length){
		list[0].onclick();
	}else{
		list[songNum].onclick();
	}
}
// 暂停
var pause = document.getElementById("pause");
pause.onclick = function(){
	if(pause.innerHTML  === "暂停"){
		mv.stop();
		pause.innerHTML ="播放";
	}else if(pause.innerHTML === "播放"){
		list[songNum-1].onclick();
		pause.innerHTML ="暂停";
	}
}

//歌曲点击事件
for(var i=0; i< list.length; i++){
	list[i].onclick = function(){
		for(var j=0; j<list.length; j++){
			list[j].className = "";
		}
		this.className = "selected"
		var titleNum = parseInt(this.title.substr(0,1));
		var titleName = this.title.substr(1);

		mv.play("../media/"+titleName);
		songNum = titleNum;
		if(pause.innerHTML === "播放"){
		pause.innerHTML = "暂停";
	}
	}
}
// 取随机数
function random(m,n){
	return Math.round(Math.random()*(n-m)+m);
}

function getDots(){
	dots =[];
	for(var i=0; i < size; i++){
		var x =random(0,width);
		var y = random(0,height);
		var color = "rgba("+random(0,255)+","+random(0,255)+","+random(0,255)+",0)";
		dots.push({
			x:x,
			y:y,
			dx:random(1,4),
			color:color,
			cap:0
		})
	}
}

//改变窗口大小
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

//绘制图形
function draw(arr){
	ctx.clearRect(0,0,width,height);
	var w = width/size;
	var cw = w*0.6;
	var capH = cw > 10? 10:cw ;
	ctx.fillStyle = line;
	for(var i =0 ; i < size; i++){
		var o = dots[i];
		if(draw.type =="column"){
			var h = arr[i]/256 * height;
			ctx.fillStyle = line;

			ctx.fillRect(w*i,height - h,cw,h);

			ctx.fillRect(w*i,height - (o.cap+capH),cw,capH);
			o.cap--;
			if(o.cap < 0){
				o.cap =0;
			}
			if(h > 0 && o.cap < h+40){
				o.cap=(h + 40)>(height-capH)?(height-capH):(h+40);
			}

		}else if(draw.type =="dot"){
			ctx.beginPath();
			var r = 10+arr[i]/256*(height > width ? width: height)/10;
			ctx.arc(o.x,o.y,r,0,Math.PI*2,true);
			var g = ctx.createRadialGradient(o.x,o.y,0,o.x,o.y,r);
			g.addColorStop(0,"#fff");
			g.addColorStop(1,o.color);
			ctx.fillStyle = g;
			ctx.fill();
			o.x += o.dx;
			o.x = o.x > width ? 0:  o.x;
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

//控制音量
$("#volume")[0].onchange = function(){
	mv.changeVolume(this.value/this.max);
}
$("#volume")[0].onchange();

// 判断是不是pc
function IsPC() {
    var userAgentInfo = navigator.userAgent;
    var Agents = ["Android", "iPhone",
                "SymbianOS", "Windows Phone",
                "iPad", "iPod"];
    var flag = true;
    for (var v = 0; v < Agents.length; v++) {
        if (userAgentInfo.indexOf(Agents[v]) > 0) {
            flag = false;
            break;
        }
    }
    return flag;
}

















