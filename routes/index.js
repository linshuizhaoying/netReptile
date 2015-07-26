var express = require('express');
var router = express.Router();

var cheerio = require('cheerio');
var superagent = require('superagent');
//数据操作对象
var NewsData = require('../data/news');
/* GET home page. */
function findAndInsert(findtitle,findhref){
	console.log(findhref);
	NewsData.findOne({ href: findhref.toString() }, function(err, content) {
		console.log(content);
		if(content!=null){
			console.log("找到了"); // { name: 'Frodo', inventory: { ringOfPower: 1 }}
		  
		}else{
			console.log("没找到");
			
			console.log("没重复我开始保存了。");
						//如果没重复
			var newsdata = new NewsData(NewsData);
			newsdata.title = findtitle.toString();
			
			newsdata.href = findhref.toString() ;
			
			newsdata.readed = false;
			newsdata.save(function(err) {
				if (err) {
					console.log('保存失败');
				}
				console.log('数据保存成功');
	  		});
		}
	});
}


function getresult(){
	NewsData.remove({ readed : "false" });
	var targetUrl = 'http://news.dbanotes.net/newest';
	superagent.get(targetUrl)
	    .end(function (err, res) {
			  var $ = cheerio.load(res.text);
			  console.log(cheerio.load(res.text));
			  $('.title a').each(function (idx, element) {
			    var $element = $(element);
					findAndInsert($element.text(),$element.attr('href'));
						//保存数据
	    });
	    });
}
function clearData(){
  	NewsData.find(function(err, newsdata) {
		NewsData.remove({
		}, function(err) {
			if (err) {
				console.log(err)
				return
			}
			console.log('清空成功');
		});
	});
}


router.get('/', function(req, res, next) {
	//clearData();
	getresult();
  	NewsData.find(function(err, newsdata) {
		res.render('index', {
			title: '每日资讯个人版  B临水照影' ,
			newsdata: newsdata
		});
	});
});
//删除数据
router.get('/delete/:id', function(req, res) {
	var id = req.params.id;
	NewsData.update({_id: id}, {
		$set: {readed: true}
	}, function(err) {
		if(err){
			console.log(err)
			return
		}
		console.log('删除成功')
		return res.redirect('/')
	});
})

module.exports = router;
