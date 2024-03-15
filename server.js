var createError = require('http-errors');
var express = require('express');
var app = express();
// const http = require("http").createServer(app);
// const io = require('socket.io')(http);
// let socket = require('./sockets/socket')(io)
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser')
const fileupload = require('express-fileupload')

var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

const http = require('http');
const socketIo = require('socket.io');
const port = 3000;
const mysql = require('mysql');
const server = http.createServer(app);
const io = socketIo(server);

const helper = require("./helper/helpers");
const { title } = require('process');

const pool  = mysql.createPool({
    connectionLimit : 10,
    host            : 'localhost',
    user            : 'root',
    password        : '',
    database        : 'surgiscribe'
})



io.on('connection', socket => {
  console.log('A user connected');


socket.on('chat_message', data => {
  const {status, sender_id, reciever_id, message } = data;

  // Query to check if chat history exists
  const selectQuery = 'SELECT * FROM user_chat_history WHERE sender_id = ? AND reciever_id = ?';
  pool.query(selectQuery, [sender_id, reciever_id], (error, results) => {
    if (error) {
      console.error('Error retrieving chat history:', error);
    } else {
      if (results.length > 0) {
        // Update existing chat history
        console.log("enter in if");

        const updateQuery = 'UPDATE user_chat_history SET  status = ? ,last_message = ? WHERE sender_id = ? AND reciever_id = ?';
        pool.query(updateQuery, [status,message, sender_id, reciever_id], (error1, res) => {
          if (error1) {
            console.error('Error updating last message:', error1);
          }
        });
      } 
      else {

          const selectQuery = 'SELECT * FROM user_chat_history WHERE sender_id = ? AND reciever_id = ?';
          pool.query(selectQuery, [reciever_id,sender_id], (error, results) => {
            if (error) {
              console.error('Error retrieving chat history:', error);
            } 
            else {
                if (results.length > 0) 
                {
                  console.log("enter in else");

                  // Update existing chat history
                  const updateQuery = 'UPDATE user_chat_history SET   status = ? , last_message = ? ,sender_id = ? ,reciever_id = ? WHERE sender_id = ? AND reciever_id = ?';
                  pool.query(updateQuery, [status,message,sender_id, reciever_id,reciever_id, sender_id], (error1, res) => {
                    if (error1) {
                      console.error('Error updating last message:', error1);
                    }
                  });
                }
                else{
                  const insertQuery = 'INSERT INTO user_chat_history (sender_id, reciever_id, last_message) VALUES (?, ?, ?)';
                  pool.query(insertQuery, [sender_id, reciever_id, message], (error3, res2) => {
                    if (error3) {
                      console.error('Error inserting new chat history:', error3);
                    }
                  });
                }
              }
            });
        }
      }
    })
                
        // Insert new chat
      
      const query = 'INSERT INTO user_chat (sender_id, reciever_id, message) VALUES (?, ?, ?)';
      pool.query(query, [sender_id, reciever_id, message], (error, results) => {
        if (error) {
          console.error('Error saving message:', error);
        } else {
          io.emit('chat_message', data);
          // Fetch sender details
          const senderDetailsQuery = 'SELECT id, first_name, last_name, images, city FROM users WHERE id = ?';
          pool.query(senderDetailsQuery, [sender_id], (senderError, senderResults) => {
            if (senderError) {
              console.error('Error fetching sender details:', senderError);
            } else {
              if (senderResults.length > 0) {
                const { id, first_name, last_name, images, city } = senderResults[0];

                // Fetch receiver's device token
                const selectQuery = 'SELECT deviceToken, isNotification FROM users WHERE id = ?';
                pool.query(selectQuery, [reciever_id], (err, res) => {
                  if (err) {
                    console.error('Error querying deviceToken:', err);
                  } else {
                    if (res && res.length > 0) {
                      const { deviceToken, isNotification } = res[0];

                      if (isNotification === 1) {
                        // Send push notification with sender details
                        const title = 'New Message Received';
                        const message = `${first_name} ${last_name} sent you a message.`;

                        helper.sendPushNotification(deviceToken, title, message, id, first_name, last_name, images, city);

                        const notificationQuery = 'INSERT INTO notification (title, messages, senderId, receiverId) VALUES (?, ?, ?, ?)';
                        pool.query(notificationQuery, [title, message, sender_id, reciever_id], (notificationError, notificationResults) => {
                          if (notificationError) {
                            console.error('Error saving message:', notificationError);
                          } else {
                            console.log('Inserted Success Message');
                          }
                        });
                      } else {
                        console.log('Receiver has disabled notifications');
                      }
                    }
                  }
                });
              }
            }
          });
        }
      });
    
  });




  socket.on('get_chat_history', data => {
    const { sender_id, reciever_id } = data;
  
    // Retrieve chat history for the specified conversation participants
    const query = `
      SELECT
        uc.*, u1.first_name AS sender_id1_username, u1.images AS sender_id1_profile_img,
        u2.first_name AS sender_id2_username, u2.images AS sender_id2_profile_img
      FROM user_chat uc
      LEFT JOIN users u1 ON uc.sender_id = u1.id
      LEFT JOIN users u2 ON uc.reciever_id = u2.id
      WHERE (uc.sender_id = ${sender_id} AND uc.reciever_id = ${reciever_id})
        OR (uc.sender_id = ${reciever_id} AND uc.reciever_id = ${sender_id})
      ORDER BY uc.created_at;
    `;
  
    pool.query(query, (error, results) => {
      if (error) {
        console.error('Error retrieving chat history:', error);
      } else {
        // Emit the chat history to the requesting socket
        console.log("hello chat history");
        socket.emit('get_chat_history', results);
      }
    });
  });
  

  // socket.on('get_chat_listing', data => {
  //   const { sender_id } = data;
  
  //   console.log(sender_id, reciever_id);
  //   const query = `
  //     SELECT
  //       uch.*,
  //       u.first_name AS receiver_username,
  //       u.images AS receiver_profile_img
  //     FROM
  //       user_chat_history AS uch
  //     LEFT JOIN
  //       users AS u
  //     ON
  //       uch.reciever_id = u.id
  //     WHERE
  //       (uch.sender_id = ${sender_id} AND uch.reciever_id = ${reciever_id})
  //       OR
  //       (uch.sender_id = ${reciever_id} AND uch.reciever_id = ${sender_id});
  //   `;
  
  //   pool.query(query, (error, results) => {
  //     if (error) {
  //       console.error('Error retrieving chat listing:', error);
  //     } else {
  //       // Emit the list of chat participants to the requesting socket
  //       console.log(results);
  //       socket.emit('get_chat_listing', results);
  //     }
  //   });
  
  
 
  socket.on('get_chat_listing', data => {
    const { sender_id } = data;
    const query = `SELECT
    uch.*,
    u.first_name AS sender_first_name,
    u2.first_name AS receiver_first_name,
    u.images AS sender_images,
    u2.images AS receiver_images,
    u.city AS sender_city,
    u2.city AS receiver_city,
    u.is_online AS sender_is_online,
    u2.is_online AS receiver_is_online
FROM user_chat_history AS uch
LEFT JOIN users AS u ON uch.sender_id = u.id
LEFT JOIN users AS u2 ON uch.reciever_id = u2.id
WHERE uch.sender_id = ${sender_id} OR uch.reciever_id =  ${sender_id};
`;
  //     const query = `SELECT
  //     uch.*,
  //     u.first_name AS reciever_username,
  //     u.images AS reciever_profile_img,
  //     u.city AS reciever_city,
  //     u.is_online AS reciever_online
      
  // FROM
  //     user_chat_history AS uch
  // LEFT JOIN
  //     users AS u
  // ON
  //     uch.reciever_id = u.id
  // WHERE
  // uch.sender_id = ${sender_id} OR uch.reciever_id = ${sender_id};

  // `;
  
      pool.query(query, (error, results) => {
      if (error) {
        console.error('Error retrieving chat listing:', error);
      } else {
        // Emit the list of chat participants to the requesting socket
        console.log(results);
        socket.emit('get_chat_listing', results);
      }
      });
  });




  
  socket.on("readUnread", (data) => {
    const messageId = data.messageId;
    const updateStatusQuery = `UPDATE user_chat_history SET status = 1 WHERE id = ?`;
  
    pool.query(updateStatusQuery, [messageId], (error, results) => {
      if (error) {
        console.error("Error updating status to 1:", error);
        return;
      }
  
      socket.emit("readUnread", { status: results });
    });
  });
  



  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use(fileupload());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
server.listen(port,()=>{
  console.log(`Example app listening on port ${port}`)
})

module.exports = app;