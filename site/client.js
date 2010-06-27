var chatHandler = function() {
	return {
		addMessageToChatLog: function(nick, message) {
			var messageDiv = $("<div />").addClass("message");
			$("<span />").addClass("sender").append(nick).appendTo(messageDiv);
			$(messageDiv).append(" ");
			$("<span />").addClass("message").append(message).appendTo(messageDiv);
			
			$(messageDiv).appendTo($("#chat-frame"));
		}
	};
}();

$(document).ready(function() {
	var webSocket = new WebSocket("ws://127.0.0.1:8000");
	
	webSocket.onmessage = function(evt) {
		var obj = $.parseJSON(evt.data);
		chatHandler.addMessageToChatLog(obj.nick, obj.message);
	};
});