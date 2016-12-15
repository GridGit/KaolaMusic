var express = require('express');
var router = express.Router();
var path = require("path");
var media = path.join(__dirname,"../public/media");
var fs = require("fs");

/* GET home page. */
router.get('/', function(req, res, next) {
	//异步读取文件夹中的文件
	fs.readdir(media,function(error,names){
		if(error){
			console.log(error);
		}else{
			var musicList =[];
			if(names[0] === ".DS_Store") {
				for(var i = 1; i <names.length;i++){
					musicList.push(names[i]);
				}
			}else{
				musicList = names;
			}
			res.render('index', { title: 'Kaola Music',music:musicList });
		}
	});
});

module.exports = router;
