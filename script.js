/**
 * Created by yusuke on 2013/12/20.
 * Modified by rotsuya on 2014/06/07.
 */

// APIキー
var APIKEY = '19887cda-ec9e-11e3-ab0c-7380ef9fa423';

// ユーザーリスト
var userList = [];

// Callオブジェクト
var existingCall;

// Compatibility
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

// PeerJSオブジェクトを生成
var peer = new Peer({ key: APIKEY, debug: 3});

// 初期化
$(document).on('ready', function(){

    // 相手に接続
    $('#make-call').click(function(){
        var call = peer.call($('#contactlist').val(), window.localStream);
        makeCall(call);
    });

    // 切断
    $('#end-call').click(function(){
        existingCall.close();
        showCallUI();
    });

    // メディアストリームを再取得
    $('#showLocalVideo-retry').click(function(){
        $('#showLocalVideo-error').hide();
        showLocalVideo();
    });

    // ステップ１実行
    showLocalVideo();

    //ユーザリス取得開始
    setInterval(getUserList, 2000);

});

// PeerIDを生成
peer.on('open', function(){
    $('#my-id').val(peer.id);
});

// 相手からのコールを受信したら自身のメディアストリームをセットして返答
peer.on('call', function(call){
    call.answer(window.localStream);
    makeCall(call);
});

// エラーハンドラー
peer.on('error', function(err){
    alert(err.message);
    showCallUI();
});

// ローカルのカメラ映像を表示する
function showLocalVideo () {
    // メディアストリームを取得する
    navigator.getUserMedia({audio: true, video: true}, function(stream){
        // ビデオタグのsrc属性に設定する
        $('#my-video').prop('src', URL.createObjectURL(stream));
        window.localStream = stream;
        showCallUI();
    }, function(){ $('#get-local-video-error').show(); });
}

function showCallUI () {
    //UIコントロール
    $('#get-local-video, #finish-call').hide();
    $('#call-others').show();
}

function makeCall (call) {
    // すでに接続中の場合はクローズする
    if (existingCall) {
        existingCall.close();
    }

    // 相手からのメディアストリームを待ち受ける
    call.on('stream', function(stream){
        $('#their-video').attr('src', URL.createObjectURL(stream));
    });

    // 相手がクローズした場合
    call.on('close', showCallUI);

    // Callオブジェクトを保存
    existingCall = call;

    // UIコントロール
    $('#their-id').val(call.peer);
    $('#get-local-video, #call-others').hide();
    $('#finish-call').show();

}

function getUserList () {
    //ユーザリストを取得
    $.get('https://skyway.io/active/list/'+APIKEY,
        function(list){
            for(var cnt = 0;cnt < list.length;cnt++){
                if($.inArray(list[cnt],userList)<0 && list[cnt] != peer.id){
                    userList.push(list[cnt]);
                    $('#contactlist').append($('<option>', {"value":list[cnt],"text":list[cnt]}));
                }
            }
        }
    );
}

