/**
 * Created by Administrator on 2017/9/5 0005.
 */

window.onload = () => {
    //实例化程序
    var chart = new CqChart();
    chart.init();
};

//定义我们的chart类
var CqChart = function () {
    this.socket = null;
};

//向原型添加业务方法
CqChart.prototype = {
    //初始化程序
    //该方法用于登录+显示人数和退出登录信息
    init() {
        //此方法初始化程序
        var that = this;
        var loading1 = layer.load(2);
        //建立到服务器的socket连接
        this.socket = io.connect();
        //监听socket的connect事件，此事件表示连接已经建立
        this.socket.on('connect', function () {
            layer.close(loading1);
            //标题改变
            $('.loginTitle').text('欢迎登录...');
            //显示输入框
            $('.loginBox').eq(0).show();
            //连接到服务器后，显示昵称输入框
            $('#nicknameInput').focus();
        });
        $('#loginSure').click(() => {
            var nickName = $('#nicknameInput').val();
            var loading = layer.load(2);
            //设置昵称不为空
            if (nickName.trim().length != 0) {
                //不为空，则发起一个login事件并将输入的昵称发送到服务器
                that.socket.emit('login', nickName);
                layer.close(loading);
            } else {
                layer.msg('请输入昵称...', { time: 1000 });
                $('#nicknameInput').val('').focus();
                layer.close(loading);
            }
        });

        //昵称重复时调用
        this.socket.on('nickExisted', () => {
            layer.msg('昵称已拥有...', { time: 1000 }); //显示昵称被占用的提示
        });
        //登录成功后的操作
        this.socket.on('loginSuccess', nickname => {
            $('#shadowBox').hide(); //隐藏弹出层
            layer.msg('欢迎回来~  ' + nickname, { time: 1000 });
            $('#nickName').text(nickname);

            //判断在线人数（只有在登录后才能进行人数判断）
            that.socket.on('system', (nickName, userCount, type) => {
                //判断用户是连接还是离开以显示不同的信息
                var msg = '<div class="someDate clearfix">' + '<span>' + nickName + '&nbsp;' + (type == 'login' ? ' 加入' : ' 离开') + '房间</span>' + '</div>';

                $('#contentBox').append(msg);
                scroll();
                //将在线人数显示到页面顶部
                $('#onlineN').text(userCount);
            });

            //发送消息
            $('#uploadBtn').click(function () {
                var str = $('#textarea').val();
                //当点击提交按钮时
                htmlStr(str, nickname); //页面显示内容（同时发送该用户的昵称）
                scroll(); //框跟随内容变动而变动
            });

            //接收消息并对消息进行处理(内容+名字+发送类别[文字or图片])
            that.socket.on('getInf', (msg, name, type) => {
                //当不为本人时
                if (name != nickname) that.showNewMsg(name, msg, type);

                // console.log('接收：' + msg.trim());
            });

            //发送图片操作
            $('#uploadImg').change(e => {
                var _that = e.target;
                // console.log(e.target);
                // console.log($(this));
                //检查是否有文件被选中
                if (_that.files.length != 0) {
                    //获取文件并用FileReader进行读取
                    var file = _that.files[0],
                        reader = new FileReader();

                    //判断浏览器是否支持fileReader
                    if (!reader) {
                        layer.msg('你的浏览器暂不支持fileReader', { time: 1000 });
                        _that.value = '';
                        return;
                    }
                    reader.onload = function (e) {
                        //读取成功，显示到页面并发送到服务器
                        _that.value = '';
                        // that.socket.emit('uploadImg', e.target.result);
                        // that._displayImage('me', e.target.result);
                        htmlStr('', nickname, e.target.result);
                    };
                    reader.readAsDataURL(file);
                    scroll(); //框跟随内容变动而变动
                }
            });
        });
    }
    // 该方法用于将接收的消息显示在页面上(非自己的额内容)
    , showNewMsg(user, msg, type, color) {
        var msgStr = '<div class="clientBox clearfix">' + '<div class="cntName f-l">' + '<div class="name">' + user + '</div>'; //名字
        if (type == 'image') {
            msgStr += '<div class="infCnt">' + '<img src="' + msg + '" />' + '</div>' + //内容
            '</div></div>';
        } else {
            msgStr += '<div class="infCnt" style="color: ' + (color || '#333') + ';">' + _showEmoji(msg) + '</div>' + //内容
            '</div></div>';
        }

        $('#contentBox').append(msgStr);
        scroll();
    }
};

//# sourceMappingURL=connect-compiled.js.map