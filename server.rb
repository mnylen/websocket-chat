require 'rubygems'
require 'bundler'
Bundler.setup

require 'eventmachine'
require 'json'

class ChatServer < EventMachine::Connection
  def self.start(host = '127.0.0.1', port = 8000)
    @@channel = EM::Channel.new
    EM.start_server(host, port, self)
  end
  
  # Send message to a connection, unless the sender is same as the current
  # connection
  def send_message(message)
    puts "@sid = #{@sid}, message[:sid] = #{message[:sid]}"
    unless @sid == message[:sid]
      sid_copy = message.delete :sid
      send_data(message.to_json + "\n")
      
      message[:sid] = sid_copy
    end
  end
  
   def post_init
    puts "-- someone connected to the chat server"
    @sid = @@channel.subscribe { |m| send_message(m) }
  end

  def receive_data(data)
    puts "-- connection with SID #{@sid} sent data (#{data.strip} (stripped)) to chat server"
    data_hash = JSON(data)

    if data_hash.has_key? 'name' and data_hash.has_key? 'msg'
      puts ">> pushing message to channel by SID #{@sid}"
      @@channel.push(data_hash.merge({:sid => @sid}))
    end
  rescue JSON::ParserError => ex
    puts ">> invalid data: #{ex}"
  end

  def unbind
    ChatChannel.unsubscribe(@sid)
  end
end

EM.run do
  ChatServer.start
end

