#Cookie Pot
A XSS Cookies Receiver.

一个用于分发xss脚本与接收XSS得到的Cookies的微型NodeJS服务器。


##快速开始
+ 将需要分发的js脚本更名后复制入根目录下，覆盖xss.js文件。
+ 终端命令`node index.js [port|端口号]`即可运行

日志按照日期，一天一个文件，保存在根目录下Log文件夹中。

##TODO
+ 日志文件读取与写入异常处理。
+ [远期目标]使用AngularJS作为前端，将该项目拓展为包含前端Cookie查看器与筛选器的全栈项目。