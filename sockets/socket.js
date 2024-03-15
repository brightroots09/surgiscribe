// User socket.js const { socket } = require("socket.io");
const { socket } = require("socket.io");

const fs = require('fs');
const path = require('path');

const { Op } = require("sequelize");

const db = require("../models");
db.messages.belongsTo(db.users,{foreignKey:'senderId',as:'sender_details'});  
db.messages.belongsTo(db.users,{foreignKey:'receiverId',as:'receiver_details'});
db.chatconstants.belongsTo(db.users,{foreignKey:'senderId',as:'sender_details'});
db.chatconstants.belongsTo(db.users,{foreignKey:'receiverId',as:'receiver_details'});
db.chatconstants.belongsTo(db.messages,{foreignKey:'last_msg_id',as:'last_msg_deatils'});



module.exports = function (io) {
  io.on('connection', (socket) => {

    
    socket.on('connect_user', async (data) => {
      try {
        console.log('Received connect_listener event:',data);
        var socket_id = socket.id;
        console.log(socket_id, 'rerere');
  
        let checkUser = await db.socketuser.findOne({
          where: { userId: data.userId },
        });
     if (checkUser) {
          await checkUser.update(
            {
              isOnline: '1',
              socketId: socket_id,
            },
            {
              where: {
                userId: data.userId,
              },
            }
          );
        } else {
          await db.socketuser.create({
            userId: data.userId,
            socketId: socket_id,
            isOnline: '1',
          });
        }
  
        let success_message = {
          success_message: 'connected successfully',
        };
        socket.emit('connect_listner', success_message);
      } catch (error) {
        throw error;
      }
    });
 
     socket.on('disconnect_user', async function () {

      let socket_id = socket.id
      let socket_disconnect = await my_function.socket_disconnect(socket_id)

      console.log('socket user disconnected');

      success_message = [];
      success_message = {
        'success_message': 'User disconnected successfully'
      }
      socket.emit('disconnect_listener', success_message);
    });



    /////here are send message///
    
    socket.on("send_message", async function (data) {
      try {
        let get_chatConstant = await db.chatconstants.findOne({
          where:{ [Op.or]: [ {
            senderId: data.senderId,
            receiverId: data.receiverId,
          },
          {
            senderId: data.senderId,
            senderId: data.receiverId,
          }
        ]
        }
        });
    
        var id = 0;
    
        if (!get_chatConstant) {
          let create_chatConstant = await db.chatconstants.create({
            senderId: data.senderId,
            receiverId: data.receiverId,
          });
    
          let message_create = await db.messages.create({
            senderId: data.senderId,
            receiverId: data.receiverId,
            messageType: data.messageType,
            message: data.message,
            chat_const_id: create_chatConstant.id,
          });
          if (message_create) {
            let update_last_msg = await db.chatconstants.update(
              {
                last_msg_id: message_create.id,
              },
              {
                where: { id: create_chatConstant.id },
              }
            );
          }
          id = message_create.id;
        } else {
          let message_create = await db.messages.create({
            senderId: data.senderId,
            receiverId: data.receiverId,
            messageType: data.messageType,
            message: data.message,
            chat_const_id: get_chatConstant.id,
          });
    
          let update_last_msg = await db.chatconstants.update(
            {
              last_msg_id: message_create.id,
            },
            {
              where: {
                id: get_chatConstant.id,
              },
            }
          );
    
          id = message_create.id;
        }
        let get_message = await db.messages.findOne({
          where: { id: id },
        });
        let socket_user = await db.socketuser.findOne({
          where: {
            userId: data.receiverId,
          },
        });
        // socket.to(socket_user.socket_id).emit("send_message_emit", get_message);
        socket.emit("send_message_emit", get_message)
      } catch (error) {
        console.log(error, "=====>");
      }
    });
    
    
    ///////////////////////////  get message   /// 



    socket.on("get_messages", async function (data) {
      try {
      
        let check_constant = await db.chatconstants.findOne({
          where: {
            [Op.or] : [
              {receiverId:data.receiverId, senderId: data.senderId},
              {senderId:data.receiverId, receiverId: data.senderId}
            ]
          },
          raw:true
        });
        var get_messages = await db.messages.findAll({
          include : [
            {
              attributes: ['id','name','images'],
              // attributes : ['id','first_name','last_name','images'],
              model : db.users, as:"sender_details"
            },
            {
              attributes : ['id','name','images'],
              // attributes : ['id','first_name','last_name','images'],
              model : db.users, as:"receiver_details"
            },
            
          ],
          where : {
            chat_const_id : check_constant.id 
          }
        })
         
        socket.emit("get_messages", get_messages);

      } catch (error) {
        console.log(error);
      }
    });
  
    socket.on("get_chat_list", async function (data) {
      try {
        let get_msg_list = await db.chatconstants.findAll({
          include : [ 
            {
              attributes : ['id','name','images'],
              model : db.users, as:"sender_details"
            },
            {
              attributes : ['id','name','images'],    
              model : db.users, as:"receiver_details"
            },
            
            {
              // attributes : ['id','first_name','last_name','images'],
              model : db.messages,as:"last_msg_deatils"
            },
            
          ],
          where: {
            [Op.or] : [
              {receiverId:data.senderId},
              {senderId: data.senderId}
            ]
          },
        });         
        socket.emit("get_chat_list", get_msg_list);
      } catch (error) {
        console.log(error);
      }
    })
   

     
    

   

  });
}