// Handles outputting the log
logHandler = function() {
  var chatLog = "#chat > #log";
  
  var createMessageDiv = function(messageObject) {
    return $("<div />").addClass("message")
      .append($("<span />").addClass("sender").append(messageObject.nick))
      .append(" ")
      .append($("<span />").addClass("message").append(messageObject.message));
  };
  
  var scrollToBottom = function() {
    $(chatLog).scrollTop($(chatLog)[0].scrollHeight);
  };
  
  return {
    appendMessage: function(messageObject) {
      createMessageDiv(messageObject).appendTo($(chatLog));
      scrollToBottom();
    }
  }
}();

// Handles user input
inputHandler = function() {
  var registerButton = "#registration button[name='register']";
  var sendButton = "#controls button[name='send']";
  var messageInput = "#controls input[name='message']";
  var nickInput = "#registration input[name='nick']";
  
  var clearMessageAndFocusIt = function() {
    $(messageInput).attr("value", "");
    $(messageInput).focus();
  };
  
  // returns the user provided nickname and message as JavaScript object 
  var messageObject = function() {
    var obj = {
      "nick" : $(nickInput).attr('value'),
      "message" : $(messageInput).attr('value')
    };
      
    if (obj.nick == "" || obj.message == "") {
      return null;
    } else {
      return obj;
    }
  };
  
  var sendMessage = function() {
    return chat.sendMessage(messageObject());
  };
   
  return {
    getNick: function() {
      return $(nickInput).attr("value");
    },
    
    init: function() {
      $(registerButton).click(function(event) {
        event.preventDefault();
        chat.initializeChat();  
      });
      
      $(sendButton).click(function(event) {
        event.preventDefault();
        if (sendMessage()) {
          clearMessageAndFocusIt();
        }
      });
      
      $(messageInput).keypress(function(event) {
        if (event.keyCode == '13') {
          event.preventDefault();
          if (sendMessage()) {
            clearMessageAndFocusIt();
          }
        }
      });
    } 
  };
}();


// Handles communication between client and server
commHandler = function() {
  var webSocket = null;
  
  var messageReceived = function(evt) {
    var messageObject = $.parseJSON(evt.data);
    chat.messageReceived(messageObject);
  };
  
  return {
    init: function() {
      webSocket = new WebSocket("ws://127.0.0.1:8000");
      webSocket.onmessage = messageReceived; 
    },
    
    serializeAndSend: function(messageObject) {
      webSocket.send(JSON.stringify(messageObject));
    }
  };
}();

// The chat module
chat = function() {
  var registrationView = "#registration";
  var chatView = "#chat";
  
  var appendNicks = function() {
    $(".js-chat-nick").each(function(i, v) {
      $(v).append(inputHandler.getNick());
    });
  };
  
  var validMessageObject = function(messageObject) {
    if (messageObject.nick == "" || messageObject.message == "") {
      return false;
    } else {
      return true;
    }
  };
  
  return {
    init: function() {
      inputHandler.init();
    },
    
    initializeChat: function() {
      if (inputHandler.getNick() != "") {
        commHandler.init();
        appendNicks();
        $(registrationView).hide();
        $(chatView).show();
      }
    },
    
    messageReceived: function(messageObject) {
      if (validMessageObject(messageObject)) {
        logHandler.appendMessage(messageObject);
      }
    },
    
    sendMessage: function(messageObject) {
      if (validMessageObject(messageObject)) {
        commHandler.serializeAndSend(messageObject);
        logHandler.appendMessage(messageObject);
        return true;
      } else {
        return false;
      }
    }
  }
}();

$(document).ready(function() {
  chat.init();
});