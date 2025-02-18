import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Menu from './menu';

const socket = io('http://localhost:8083'); // Kết nối tới server

const ChatAdmin = () => {
    const admin = JSON.parse(sessionStorage.getItem('admin') || '{}'); // Lấy thông tin admin từ localStorage
    const [groupChats, setGroupChats] = useState([]); // Danh sách nhóm chat
    const [selectedGroup, setSelectedGroup] = useState(null); // Nhóm chat được chọn
    const [message, setMessage] = useState(''); // Nội dung tin nhắn mới
    const [messages, setMessages] = useState([]); // Danh sách tin nhắn

    // Lấy danh sách nhóm chat khi component mount
    useEffect(() => {
        socket.emit('get all groups'); // Gửi yêu cầu lấy danh sách nhóm

        socket.on('all groups', (groups) => {
            setGroupChats(groups);
        });

        return () => {
            socket.off('all groups'); // Cleanup listener
        };
    }, []);

    // Xử lý khi nhóm được chọn
    useEffect(() => {
        if (selectedGroup) {
            socket.emit('join group', selectedGroup._id); // Tham gia nhóm

            socket.on('previous messages', (oldMessages) => {
                setMessages(oldMessages); // Hiển thị tin nhắn cũ
            });

            socket.on('chat message', (msg) => {
                if (msg.groupId === selectedGroup._id) {
                    setMessages((prev) => [...prev, msg]); // Thêm tin nhắn mới
                }
            });

            return () => {
                socket.off('previous messages');
                socket.off('chat message');
            };
        }
    }, [selectedGroup]);

    // Gửi tin nhắn mới
    const handleSendMessage = () => {
        if (message.trim() && selectedGroup) {
            const newMessage = {
                senderId: admin.id,
                text: message,
                role: 'admin',
                groupId: selectedGroup._id,
                timestamp: new Date().toISOString(),
            };

            socket.emit('chat message', newMessage); // Gửi tin nhắn tới server
            setMessage(''); // Reset ô nhập tin nhắn
        }
    };

    return (
        <div>
            <Menu />
            <main className="app-content">
                <div>
                    <div className="app-title">
                        <ul className="app-breadcrumb breadcrumb side">
                            <li className="breadcrumb-item active">
                                <a href="#"><b>Chăm Sóc Khách Hàng</b></a>
                            </li>
                        </ul>
                    </div>
                    <div style={{ display: 'flex' }}>
                        {/* Danh sách nhóm chat */}
                        <div style={{ width: '30%' }}>
                            <h3>Tin nhắn khách hàng</h3>
                            {groupChats.map((group) => (
                                <div
                                    key={group._id}
                                    onClick={() => setSelectedGroup(group)} // Chọn nhóm
                                    style={{
                                        cursor: 'pointer',
                                        padding: '10px',
                                        border: '1px solid #ccc',
                                        marginBottom: '10px',
                                    }}
                                >
                                    <img src={group.userId.avatar} alt="" style={{
                                        width: '50px',
                                        height:'50px',
                                        borderRadius:'50%'
                                    }}  />
                                    <strong style={{marginLeft:'5px'}}>{group.userId.name}</strong>
                                </div>
                            ))}
                        </div>

                        {/* Giao diện chat */}
                        <div style={{ width: '70%' }}>
                            {selectedGroup ? (
                                <>
                                    <h3>Chat với: {selectedGroup.userId.name}</h3>
                                    <div
                                        style={{
                                            height: '400px',
                                            overflowY: 'scroll',
                                            backgroundColor: '#f9f9f9',
                                            padding: '10px',
                                        }}
                                    >
                                        {messages.length === 0 ? (
                                            <p>Chưa có tin nhắn</p>
                                        ) : (
                                            messages.map((msg, index) => {
                                                const currentUserId = JSON.parse(sessionStorage.getItem('admin')).id;

                                                // Phân biệt tin nhắn cũ và mới
                                                let isUser, isAdmin;
                                                if ('role' in msg) {
                                                    // Tin nhắn mới
                                                    isUser = msg.role === 'user' && msg.senderId === currentUserId;
                                                    isAdmin = msg.role === 'admin';
                                                } else {
                                                    // Tin nhắn cũ
                                                    isUser = msg.userId && msg.userId === currentUserId;
                                                    isAdmin = msg.adminId && !msg.userId;
                                                }
                                                // const isAdmin = msg.adminId === admin.id; // Tin nhắn của admin
                                                return (
                                                    <div
                                                        key={index}
                                                        style={{
                                                            marginBottom: '10px',
                                                            textAlign: isAdmin ? 'right' : 'left', // Tin nhắn admin bên phải
                                                        }}
                                                    >
                                                        <p
                                                            style={{
                                                                display: 'inline-block',
                                                                maxWidth: '70%',
                                                                fontSize: '14px',
                                                                wordWrap: 'break-word',
                                                                margin: 0,
                                                                padding: '10px',
                                                                borderRadius: '8px',
                                                                background: isAdmin ? '#e5e5ea' : '#6a11cb', // Admin màu xám, user màu tím
                                                                color: isAdmin ? 'black' : 'white',
                                                            }}
                                                        >
                                                            {msg.text}
                                                        </p>
                                                        <span
                                                            style={{
                                                                display: 'block',
                                                                fontSize: '0.8em',
                                                                color: '#999',
                                                                marginTop: '5px',
                                                            }}
                                                        >
                                                            {new Date(msg.timestamp).toLocaleString()}
                                                            {isAdmin && ' (Admin)'}
                                                        </span>

                                                    </div>

                                                );
                                            })

                                        )}

                                    </div>
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '10px',
                                            borderTop: '1px solid #ddd',
                                            backgroundColor: 'white',
                                        }}
                                    >
                                        <input
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Nhập tin nhắn"
                                            style={{
                                                flex: 1,
                                                padding: '10px',
                                                borderRadius: '5px',
                                                fontSize: '14px',
                                                border: '1px solid #ddd',
                                            }}
                                        />
                                        <button
                                            onClick={handleSendMessage}
                                            style={{
                                                marginLeft: '10px',
                                                padding: '10px',
                                                backgroundColor: '#6a11cb',
                                                color: 'white',
                                                fontSize: '14px',
                                                border: 'none',
                                                borderRadius: '5px',
                                            }}
                                        >
                                            Gửi
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <p>Vui lòng chọn khách hàng để trả lời.</p>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ChatAdmin;
