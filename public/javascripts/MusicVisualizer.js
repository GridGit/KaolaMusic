function MusicVisualizer(obj){
	this.source = null;
	this.count = 0;
	//获取分析节点
	this.analyser = MusicVisualizer.ac.createAnalyser();
	this.size = obj.size;
	this.analyser.fftSize = this.size*2;
	//获取音量节点
	this.gainNode = MusicVisualizer.ac[MusicVisualizer.ac.createGain?"createGain":"createGainNode"]();
	//连接到destination
	this.gainNode.connect(MusicVisualizer.ac.destination);
	//连接到音量节点
	this.analyser.connect(this.gainNode);
	//ajax对象
	this.xhr = new XMLHttpRequest();
	this.visualizer = obj.visualizer;

	this.visualize();

}
//获取AudioContext
MusicVisualizer.ac = new (window.AudioContext || window.webkitAudioContext)();

//加载播放数据
MusicVisualizer.prototype.load = function(url,fun){
	this.xhr.abort();
	this.xhr.open("GET",url);
	this.xhr.responseType = "arraybuffer";
	var self = this;
	this.xhr.onload = function(){
		fun(self.xhr.response);
	}
	this.xhr.send();

}
//解码加载的数据
MusicVisualizer.prototype.decode = function(arraybuffer,fun){
	MusicVisualizer.ac.decodeAudioData(arraybuffer,function(buffer){
		fun(buffer);
	},function(err){
		console.log(err);
	});
}



//播放
MusicVisualizer.prototype.play = function(url){
	var n = ++this.count ;
	var self = this;
	this.source && this.stop();
	this.load(url,function(arraybuffer){
		if(n != self.count) return;
		self.decode(arraybuffer,function(buffer){
			if(n != self.count) return;
			var bs = MusicVisualizer.ac.createBufferSource();
			bs.connect(self.analyser);
			bs.buffer = buffer;
			bs[bs.start?"start":"noteOn"](0);
			self.source = bs;

		});
	})
}

//暂停

MusicVisualizer.prototype.stop = function(){
	this.source[this.source.stop? "stop":"noteOff"](0);
}

//音量控制
MusicVisualizer.prototype.changeVolume = function(percent){
	this.gainNode.gain.value = percent*percent;
}

//可视化
MusicVisualizer.prototype.visualize = function(){
	var arr = new Uint8Array(this.analyser.frequencyBinCount);
	// analyser.getByteFrequencyData(arr);
	// console.log(arr);
	requestAnimationFrame = window.requestAnimationFrame ||
							window.webkitRequestAnimationFrame ||
							window.mozRequestAnimationFrame;
	var self = this;
	function v(){
		self.analyser.getByteFrequencyData(arr);
		//console.log(arr);
		self.visualizer(arr);
		requestAnimationFrame(v);
	}
	requestAnimationFrame(v);
}












