import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Send, MoreVertical, Phone, Video } from 'lucide-react';

const MessagingMainContent = () => {
  const [selectedChat, setSelectedChat] = useState(1);
  const [messageText, setMessageText] = useState('');

  const conversations = [
    {
      id: 1,
      name: 'Amara Okafor',
      lastMessage: 'Looking forward to our collaboration on the fintech project!',
      time: '2m ago',
      unread: 2,
      online: true
    },
    {
      id: 2,
      name: 'Kwame Asante',
      lastMessage: 'Great insights on the investment opportunities in Ghana.',
      time: '1h ago',
      unread: 0,
      online: false
    },
    {
      id: 3,
      name: 'Dr. Fatima Al-Rashid',
      lastMessage: 'The healthcare innovation summit was amazing!',
      time: '3h ago',
      unread: 1,
      online: true
    },
    {
      id: 4,
      name: 'Marcus Johnson',
      lastMessage: 'Thanks for connecting me with the Cape Town startup ecosystem.',
      time: '1d ago',
      unread: 0,
      online: false
    }
  ];

  const currentChat = conversations.find(c => c.id === selectedChat);
  
  const messages = [
    {
      id: 1,
      sender: 'them',
      text: 'Hi! I saw your post about blockchain applications in Africa. Very interesting perspective!',
      time: '10:30 AM'
    },
    {
      id: 2,
      sender: 'me',
      text: 'Thank you! I\'ve been working on several projects in this space. Are you involved in fintech as well?',
      time: '10:35 AM'
    },
    {
      id: 3,
      sender: 'them',
      text: 'Yes, I\'m building a payment platform for small businesses in Nigeria. Would love to discuss potential collaboration.',
      time: '10:38 AM'
    },
    {
      id: 4,
      sender: 'me',
      text: 'That sounds fantastic! I\'d be happy to share some insights from our work in Kenya. Should we schedule a call?',
      time: '10:42 AM'
    },
    {
      id: 5,
      sender: 'them',
      text: 'Looking forward to our collaboration on the fintech project!',
      time: '10:45 AM'
    }
  ];

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // Add message logic here
      setMessageText('');
    }
  };

  return (
    <div className="h-[600px] grid grid-cols-3 gap-4">
      {/* Conversations List */}
      <Card className="col-span-1">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-dna-forest">Messages</CardTitle>
            <Button size="sm" variant="outline">New</Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search conversations"
              className="pl-10 h-9"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[450px]">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => setSelectedChat(conversation.id)}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedChat === conversation.id ? 'bg-dna-mint/20 border-l-4 border-dna-copper' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-dna-emerald text-white">
                        {conversation.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {conversation.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-dna-forest truncate">{conversation.name}</p>
                      <p className="text-xs text-gray-500">{conversation.time}</p>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                  </div>
                  {conversation.unread > 0 && (
                    <div className="w-5 h-5 bg-dna-copper text-white text-xs rounded-full flex items-center justify-center">
                      {conversation.unread}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="col-span-2">
        {currentChat ? (
          <>
            {/* Chat Header */}
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-dna-emerald text-white">
                      {currentChat.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-dna-forest">{currentChat.name}</p>
                    <p className="text-sm text-gray-600">
                      {currentChat.online ? 'Active now' : 'Last seen 1h ago'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="ghost">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Video className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="p-0">
              <ScrollArea className="h-[400px] p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender === 'me'
                            ? 'bg-dna-copper text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender === 'me' ? 'text-white/80' : 'text-gray-500'
                        }`}>
                          {message.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Type a message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    className="bg-dna-copper hover:bg-dna-gold text-white"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Select a conversation to start messaging</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default MessagingMainContent;