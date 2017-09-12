/**
 * Created by Administrator on 2017/9/5 0005.
 */





//按钮输入框样式改变的js
const socket = io.connect();//与服务器进行连接


//发送按钮变化js
$('#textarea').focus(function(){
    $('.uploadBtn').eq(0).addClass('sel');
}).blur(function(){
    if($(this).val().trim() === ''){
        $('.uploadBtn').eq(0).removeClass('sel');
    }else{
        $('.uploadBtn').eq(0).addClass('sel');
    }
});




//自己的内容
function htmlStr(str,nickname,imgR){
    if(str.trim() === '' && !imgR){
        layer.msg('内容不能为空！',{time:1000});
    }else{
        //发送一个名为sendInf的事件，并且传递输入的内容(判断内容是图片还是文字)
        socket.emit('sendInf', (imgR ? imgR : str), nickname, (imgR ? 'image' : 'inf'),($('.myMsg').length));
        // console.log('发送：'+str.trim());
        $('#textBox>div').append('<div class="clientBox clearfix myMsg">' +
            '<div class="cntName f-r">' +
            '<div class="name t-r">'+ nickname +'</div>' +
            '<div class="infCntR">' +
            (imgR ? '<img src="'+ imgR +'" data-action="zoom">' : _showEmoji(HTMLEncode(str)))+
            '</div>' +
            '<div class="loadingBox"><img src="images/loading-2.gif" alt=""></div></div>' +
            '</div>');
        //成功发送消息后
        socket.on('sendSuccess',(num)=>{
            $('.myMsg').eq(Number(num)).find('.loadingBox').remove();
        });

    }
    $('#textarea').val('');
    scroll();
}


//若含有表情，则将返回来的文字转换成图片
function _showEmoji(msg) {
    var match, result = msg,
        reg = /\[emoji:\d+\]/g,
        emojiIndex,
        totalEmojiNum = $('#emoji ul li img').length; //表情图片的总数量
    while (match = reg.exec(msg)) {
        emojiIndex = match[0].slice(7, -1);
        if (emojiIndex > totalEmojiNum) {
            result = result.replace(match[0], '[X]');
        } else {
            result = result.replace(match[0], '&nbsp;<img class="emojiImg" src="emoji/' + emojiIndex + '.gif" />&nbsp;');
        }
    }
    return result;
}


//    html转义
function HTMLEncode(html) {
    var temp = document.createElement("div");
    (temp.textContent != null) ? (temp.textContent = html) : (temp.innerText = html);
    var output = temp.innerHTML;
    temp = null;
    return output;
}

function scroll(){
    var h = $('#textBox>div').height(),
        h2 = $('#textBox').height();
    if(h >= h2 ){
        $('#textBox').scrollTop(h);
    }
}