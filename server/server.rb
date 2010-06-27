require 'rubygems'
require 'bundler'
Bundler.setup

require 'eventmachine'
require 'em-websocket'
require 'json'

module WebSocketChat
  module Connection
    attr_accessor :sid
    
    def send_message_unless_current(message)
      unless message[:sid] == sid
        send message.to_json
      end
    end
  end
  
  class Messages
    def self.to_hash(sid, raw_msg)
      msg_hash = JSON(raw_msg)
      
      if msg_hash.has_key? 'nick' and msg_hash.has_key? 'message'
        return msg_hash.merge(:sid => sid)
      else
        puts ">> invalid message format: 'nick' and/or 'message' missing"
      end
    rescue JSON::ParserError => ex
      puts ">> invalid message format: #{ex}"
    end
  end
end

EventMachine::WebSocket::Connection.send :include, WebSocketChat::Connection

EM.run do
  @channel = EM::Channel.new
  
  EventMachine::WebSocket.start(:host => '127.0.0.1', :port => 8000) do |ws|
    ws.onopen {
      puts "-- someone opened WebSocket to the chat server"
      ws.sid = @channel.subscribe { |m| ws.send_message_unless_current(m) }
      
      puts ">> assigned SID #{ws.sid}"
    }
    
    ws.onmessage { |raw_msg|
      puts "-- user with SID #{ws.sid} sent data to server"
      
      msg_hash = WebSocketChat::Messages.to_hash(ws.sid, raw_msg)
      @channel.push(msg_hash) if msg_hash
      puts ">> data was pushed to channel" if msg_hash
    }
    
    ws.onclose {
      puts "-- user with SID #{ws.sid} closed WebSocket connection"
      @channel.unsubscribe(ws.sid)
    }
  end
end
