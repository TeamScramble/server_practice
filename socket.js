const SocketIO = require('socket.io');
const Room = require('./room/Createroom');
const rooms = require('./room/rooms.js');

module.exports = (server) => {
    const io = SocketIO(server, {path: '/socket.io', transports: ['websocket']});
    
    io.on('connection', (socket) => {
        const req = socket.request;
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        console.log( ip + '의 새로운 유저가 접속하였습니다.');

        socket.on('createRoom', function(data) {
            console.log("CreateRoom Event");
            room = new Room(data);
            
            socket.join('room:' + room.roomId);
            room.host = data.name;
            if (data.password == null) {
                room.isOpen = true;
            } else {
                room.isOpen = false;
                room.password = data.password;
            }
            room.max_user = data.max_user;
            room.members.push(data.name);
            rooms.push(room);
        });
        
        socket.on('JoinRoom', function(data) {
            console.log("JoinRoom Event");
            if (!rooms.room.data.roomId) {
                console.log("방이 존재하지 않습니다.");
                socket.emit("Fail", { command : 'not existed'});
            } else {
                const currentRoom = rooms.room.data.roomIds;
                if (!currentRoom.isOpen && currentRoom.password !== data.password) {
                    console.log("비밀번호가 틀렸습니다.")
                    socket.emit("again");
                    // 다시 화면으로
                } else if (currentRoom.max_user < data.max_user) {
                    console.log("방에 인원이 다 차있습니다.");
                    socket.emit("Fail");
                } else {
                    socket.join('room:' + data.roomId);
                }
            }
        });
        socket.on('Update', function(data) {
            const currentRoom = rooms.room.data.roomId;
            currentRoom.name = data.roomName;
            currentRoom.password = data.password;
            currentRoom.host = data.name;
            currentRoom.max_user = data.max_user;
        });

        socket.on('DeleteRoom', function(data) {
            // 방소유주가 아닐 경우
            if (rooms.room.data.roomId) { 
                // 방이 만들어지지 않은 경우
                console.log('방이 만들어져있지 않습니다.')
            } else {
                const currentRoom = rooms.room.data.roomId;

                if (currentRoom.host == data.name) {
                    socket.leave(currentRoom);
                    rooms.remove(room.roomId);
                    socket.broadcast.to(currentRoom).emit("Delete", { message :
                    '방이 삭제되었습니다.' }); // 본인제외 방없어진 메시지 보내기
                } else {
                    console.log("권한이 없습니다.");
                    socket.emit("Fail_delete",); // event 수정
                }
            }
        });

        socket.on('LeaveRoom', function(data) {
            const currentRoom = rooms.room.data.roomId;
            if (currentRoom.host == data.name) {
                const randomNum = Math.random() * currentRoom.length();
                currentRoom.host = currentRoom.members[Math.floor(randomNum)];
                currentRoom.members.remove(data.name);
                socket.leave(currentRoom);
            } else if (currentRoom.host == data.name && currentRoom.members.length == 1){
                socket.leave(currentRoom);
                rooms.remove(room.roomId);
            } else {
                currentRoom.members.remove(data.name);
                socket.leave(currentRoom);
            }
        });
    });
};
