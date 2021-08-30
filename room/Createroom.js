const CreateID = require('./CreateID.js');

module.exports = class Room{
    constructor(data){
        this.Id = CreateID();
        this.roomname = data.roomname;
        this.password = data.password;
        this.host = data.user;
        if (this.password) {
            this.isOpen = true;
        } else {
            this.isOpen = false;
        }
        this.max_users = data.max_users;
        this.members = []
    }

    JoinRoom (data) {
        // data 는 user 이름
        this.members.append(data);
    }

    LeaveRoom (data) {
        this.members.remove(data);
    }

    CountUsers() {
        return this.members.length
    }
}
