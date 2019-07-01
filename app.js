/**
 * Created by Administrator on 2017/9/5 0005.
 */

var express = require('express'), //引入express模块
    app = express(),
    server = require('http').createServer(app),//引入http模块
    io = require('socket.io').listen(server); //引入socket.io模块并绑定到服务器
app.use('/',express.static(__dirname + '/src')); //设定静态html文件的位置

//socket部分
var users = [];//保存所有在线用户的昵称
io.on('connection',socket => {
    //接收消息并对消息进行处理
    socket.on('sendInf',(msg,nickname,type, num) => {
        // console.log(type);
        //消息发送成功后返回成功发送信息
        socket.emit('sendSuccess', num);

        //确认在没有退出登录后发送消息
        if (users.indexOf(nickname) > -1){
            //将消息输出到除自己外的所有人
            socket.broadcast.emit('getInf', msg ,nickname,type);
            //将消息输出到控制台
            // console.log(nickname+':'+msg);
        }else{
            // socket.broadcast.emit('getInfError', msg ,nickname);
        }
    });

    //登录 + 昵称设置
    socket.on('login', (nickname) => {
        if (users.indexOf(nickname) > -1) {
            socket.emit('nickExisted');
        } else {
            socket.userIndex = users.length;
            socket.nickname = nickname;
            users.push(nickname);
            console.log('登录:'+users);
            socket.emit('loginSuccess',nickname);
            // socket.emit('foo') //只有自己收得到这个事件
            // socket.broadcast.emit('foo') //表示向除自己外的所有人发送该事件
            //向所有连接到服务器的客户端发送当前登陆用户的昵称，当前用户的数量（状态为登录）
            io.sockets.emit('system', nickname, users.length, 'login');

            //断开连接的事件（只有在登录后才能触发断开连接事件）
            socket.on('disconnect', function() {
                //将断开连接的用户从users中删除
                users.splice(socket.userIndex, 1);
                //通知除自己以外的所有人
                socket.broadcast.emit('system', socket.nickname, users.length, 'logout');
                console.log('断开连接:'+users);
            });
        }
    });
});

server.listen(8111,function(){
    var host = server.address().address;
    console.log('服务器开启成功！地址为： http://localhost:8111/');
    console.log(server.address());
});
