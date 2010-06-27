var chatHandler = function() {
  return {
    addMessageToChatLog: function(nick, message) {
      chatHandler.createMessageContainer(nick, message).appendTo($("#chat-log"));
      chatHandler.autoScrollToBottom();
    },
    
    createMessageContainer: function(nick, message) {
      var $messageDiv = $("<div />").addClass("message");
      $("<span />").addClass("sender").append(nick).appendTo($messageDiv);
      $messageDiv.append(" ");
      $("<span />").addClass("message").append(message).appendTo($messageDiv);
      return $messageDiv;
    },

    autoScrollToBottom: function() {
      var scrollTop = $("#chat-log")[0].scrollHeight
      $("#chat-log").scrollTop(scrollTop);
    }
  };
}();

$(document).ready(function() {
  var webSocket = new WebSocket("ws://127.0.0.1:8000");
  webSocket.onmessage = function(evt) {
    var obj = $.parseJSON(evt.data);
    chatHandler.addMessageToChatLog(obj.nick, obj.message);
  };

  $("#chat-controls button[name='send']").click(function() {
    var messageObject = {
      "nick": $("input[name='nick']").attr('value'),
      "message": $("input[name='message']").attr('value')};

      if (messageObject.nick != "" && messageObject.message != "") {
        webSocket.send(JSON.stringify(messageObject));
        chatHandler.addMessageToChatLog(messageObject.nick, messageObject.message);
      }
    });
  });