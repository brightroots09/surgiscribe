// const { Validator } = require("node-input-validator");


var jwt = require("jsonwebtoken");
const secretCryptoKey = "jwtSecretKey";
const db = require("../models")
const nodemailer = require("nodemailer");
const crypto = require('crypto');
var FCM = require("fcm-node");
var serverKey = "AAAAUfhvbiw:APA91bG0Hl0Qvz5UczQVlbRzaborIleCpAylt--ahYNwlT-1me1_SDC6SVmP8payASGAu56KeoUx0xap6iw1F06HU9XWXUzw5aENPtuPOAZzzAtPee2Af7akkaak_5C1Nf8TIU6hcaBS"; // Replace with your server key here
var fcm = new FCM(serverKey);
/////password for twillio abcdefrtyuiededed123@#
module.exports={


    vaildObject: async function (required, non_required, res) {
    let msg ='';
    let empty = [];
    let table_name = (required.hasOwnProperty('table_name')) ? required.table_name : 'users';
    
    for (let key in required) {
        if (required.hasOwnProperty(key)) {
            if (required[key] == undefined || required[key] == '') {
                empty.push(key)
;
            }
        }
    }

    if (empty.length != 0) {
        msg = empty.toString();
        if (empty.length > 1) {
            msg += " fields are required"
        } else {
            msg += " field is required"
        }
        res.status(400).json({
            'success': false,
            'msg': msg,
            'code': 400,
             'body': {}
        });
        return;
    } else {
        if (required.hasOwnProperty('security_key')) {
            if (required.security_key != "") {
                msg = "Invalid security key";
                res.status(403).json({
                    'success': false,
                    'msg': msg,
                    'code': 403,
                    'body': []
                });
                res.end();
                return false;
            }
        }
        if (required.hasOwnProperty('password')) {
            
        }
        const marge_object = Object.assign(required, non_required);
        delete marge_object.checkexit;

        for(let data in marge_object){
            if(marge_object[data]==undefined){
                delete marge_object[data];
            }else{
                if(typeof marge_object[data]=='string'){
                    marge_object[data]=marge_object[data].trim();
                } 
            }
        }

        return marge_object;
    }
},


unixTimestamp: function () {
    var time = Date.now();
    var n = time / 1000;
    return (time = Math.floor(n));
  },

  
 

  authenticateHeader: async function (req, res, next) {
    // console.log(req.headers, "--------in header check------------");
    const v = new Validator(req.headers, {
      secret_key: "required|string",
      publish_key: "required|string",
    });

    let errorsResponse = await helper.checkValidation(v);

    if (errorsResponse) {
      return helper.failed(res, errorsResponse);
    }

    if (
      req.headers.secret_key !== SECRET_KEY ||
      req.headers.publish_key !== PUBLISH_KEY
    ) {
      return helper.failed(res, "Key not matched!");
    }
    next();
  },

  authenticateJWT: async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const token = authHeader.split(" ")[1];

      jwt.verify(token, secretCryptoKey, async (err, payload) => {
        // console.log("🚀 ~ file: nextHelpers.js:41 ~ jwt.verify ~ payload:", payload)
        if (err) {
          return res.sendStatus(403);
        }

        const existingUser = await db.users.findOne({
          where:{
            id: payload.data.id,
            loginTime: payload.data.loginTime,
          }
        });

        if (existingUser) {
          req.user = existingUser;

          next();
        } else {
          res.sendStatus(403);
        }
      });
    } else {
      res.sendStatus(403);
    }
  },
 verifyUser: async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(" ")[1];
      console.log("object");
      jwt.verify(token, secretCryptoKey, async (err, payload) => {
        if (err) {
          return res.sendStatus(403);
        }
        console.log("object,,,,,,,,", payload.data.id);
        const existingUser = await db.users.findOne({
          where: {
            id: payload.data.id,
            loginTime: payload.data.loginTime,
          },
        });
       

        // const existingUser = await users.findOne({
        //   where: {
        //     id: payload.id,
        //     login_time: payload.login_time,
        //   },
        // });
        if (existingUser) {
          req.user = existingUser;
          next();
        } else {
          res.sendStatus(401);
        }
      });
    } else {
      res.sendStatus(401);
    }
  },
  
  
  



  fileUpload(file, folder = "users") {
    console.log(file, "===================================##@@");

    let file_name_string = file.name;
    var file_name_array = file_name_string.split(".");

    var file_ext = file_name_array[1];

    var letters = "ABCDE1234567890FGHJK1234567890MNPQRSTUXY";
    var result = "";
    while (result.length < 28) {
      var rand_int = Math.floor(Math.random() * 19 + 1);
      var rand_chr = letters[rand_int];
      if (result.substr(-1, 1) != rand_chr) result += rand_chr;
    }
    
    var resultExt = `${result}.${file_ext}`;
    file.mv(`public/${folder}/${result}.${file_ext}`, function (err) {
      if (err) {
        throw err;
      }
    });
    console.log(resultExt, "===========result");
    return resultExt;
  },


  vaildObject: async function (required, non_required, res) {
    let msg ='';
    let empty = [];
    let table_name = (required.hasOwnProperty('table_name')) ? required.table_name : 'users';
    
    for (let key in required) {
        if (required.hasOwnProperty(key)) {
            if (required[key] == undefined || required[key] == '') {
                empty.push(key)
;
            }
        }
    }

    if (empty.length != 0) {
        msg = empty.toString();
        if (empty.length > 1) {
            msg += " fields are required"
        } else {
            msg += " field is required"
        }
        res.status(400).json({
            'success': false,
            'msg': msg,
            'code': 400,
             'body': {}
        });
        return;
    } else {
        if (required.hasOwnProperty('security_key')) {
            if (required.security_key != "") {
                msg = "Invalid security key";
                res.status(403).json({
                    'success': false,
                    'msg': msg,
                    'code': 403,
                    'body': []
                });
                res.end();
                return false;
            }
        }
        if (required.hasOwnProperty('password')) {
            
        }
        const marge_object = Object.assign(required, non_required);
        delete marge_object.checkexit;

        for(let data in marge_object){
            if(marge_object[data]==undefined){
                delete marge_object[data];
            }else{
                if(typeof marge_object[data]=='string'){
                    marge_object[data]=marge_object[data].trim();
                } 
            }
        }

        return marge_object;
    }
},

success: function (res, message, body = {}) {
    return res.status(200).json({
        'success': 1,
        'status': 200,
        'message': message,
        'body': body
    });
},

error: function (res, err, body = {}) {
    console.log(err, '===========================>error');
    
    let status = (typeof err === 'object') ? (err.code) ? err.code : 400 : 400;
    let message = (typeof err === 'object') ? (err.message ? err.message : '') : err;
    res.status(status).json({
        'success': false,
        'status': status,
        'message': message,
        'body': body
    });
},

error401:function(res,err,body={}){
    let message = (typeof err === 'object') ? (err.message ? err.message : '') : err;
    let code=401;
    res.status(code).json({
    'success': false,
    'code': code,
    'message': message,
    'body': body
});

},

// send_emails: function(otp,email,resu) {
        
//   try {
//       const nodemailer = require('nodemailer');
      
//       var transport = nodemailer.createTransport({
//         host: "sandbox.smtp.mailtrap.io",
//         port: 2525,
//         auth: {
//           user: "eab1cc581bc030",
//           pass: "********c2e5"
//         }
//       });
        

//       var transport = nodemailer.createTransport({
//         host: "sandbox.smtp.mailtrap.io",
//         port: 2525,
//         auth: {
//           user: "eab1cc581bc030",
//           pass: "********c2e5"
//         }
//       });
          
//          /*  var mailOptions = {
//             from: 'test978056@gmail.co',
//             to: email,
//             subject:  'ProxApp: Forgot password',
//             template: 'forgetpassword',
//             data: {
//               email: email, 
//               otp: otp, 
//             },  
//           }; 
//            */
//           transport.sendMail(mailOptions, function (error, info) {
//           if (error) {
//           console.log(error);
//           } else {
//           console.log(info)
// ;
//           resu.send('Email send');
//           }
//         });
//        return resu;
//   } catch (err) {
//     throw err;
//   }
//   },

  
// sendEmail(object) {
//   try {
//       console.log("-------------------",object);
      
//       var transport = nodemailer.createTransport({
//         host: "sandbox.smtp.mailtrap.io",
//         port: 2525,
//         auth: {
//           user: "eab1cc581bc030",
//           pass: "********c2e5"
//         }
//       });
//       var mailOptions = {
//           from: `"Transit",<${object.to}>`,
//           ...object,
//       };

//       console.log(mailOptions);
//       transport.sendMail(mailOptions, function (error, info) {
//           if (error) {
//               console.log('error', error);
//           } else {
//               console.log('Email sent: ' + info.response);
//           }
//       });
//   } catch (err) {
//       throw err;
//   }
// },
// send_email: async function (get_param, req, res) {

//   console.log(get_param, "get_param");
//   var data = await db.users.findOne({
//       where: {
//           email: get_param.email,
//       },
//       raw: true,
//   });
 
//   if (data) {

//       var email_password_get = await this.email_password_for_gmail();

//       var url_data = await this.url_path(req);

//       let auth_data = await this.generate_auth_key();
//       await db.users.update({resetpassword_token:auth_data},{where:{
//         email:data.email
//       }})

    
//       var transport = nodemailer.createTransport({
//         host: "sandbox.smtp.mailtrap.io",
//         port: 2525,
//         auth: {
//           user: "eab1cc581bc030",
//           pass: "********c2e5"
//         }
//       });
    
//       var mailOptions = {

//           from: email_password_get.email_data,
//           to: get_param.email,
//           subject: 'Display Forgot Password',
//           html: 'Click here for change password <a href="' +
//               url_data +
//               "/api/reset_password/" +
//               auth_data +
//               '"> Click</a>'
//       };

//       transport.sendMail(mailOptions, function (error, info) {
//           if (error) {
//               console.log(error);
//           } else {
//               console.log('Email sent: ' + info.response);
//           }
//       });

//       save = await db.users.update({
//           forgotPassword: auth_data,
//       }, {
//           where: {

//               id: data.id

//           }
//       });
//       507
//       return transport;
//   } else {

//       let msg = 'Email not registered';
//       throw msg
//   }

// },
createSHA1: function () {
  let key = 'abc' + new Date().getTime();
  return crypto.createHash('sha1').update(key).digest('hex');
},




//  pushnotification:async (deviceToken, notificationData, title, message, timestamp, is_read) => {
//   try {
//     var message = {
//       to: deviceToken,deviceType,
//       notification: {
//         title: title,
//         body: message, 
//       },
//       data: notificationData,
//     };
    
//     const response = await fcm.send(message);
//     console.log('Push sent successfully:', response);
//   } catch (err) {
//     console.error("Push send error:", err);
//   }
// }

  

// sendPushNotification:(deviceTokens, title, message,first_name,last_name,images,city) => {
//   try {
//     const fcm = new FCM(serverKey);

//     const messageData = {
//       registration_ids: Array.isArray(deviceTokens) ? deviceTokens : [deviceTokens],
//       notification: {
//         title: title,
//         body: message,
//         first_name : first_name,
//         last_name : last_name,
//         images : images,
//         city : city
//       },
//     };

    
   
//     fcm.send(messageData, function (err, response) {
//       if (err) {
//         console.error('Error sending push notification:', err);
//       } else {
//         console.log('Successfully sent with response:', response);
//       }
//     });
//   } catch (err) {
//     console.error('Error sending push notification:', err);
//     throw err;
//   }
// },



sendPushNotification: (deviceTokens, title, message, first_name, last_name, images, city) => {
  try {
    // Create a new instance of FCM using your server key
    const fcm = new FCM(serverKey);

    // Define the message data for the push notification
    const messageData = {
      registration_ids: Array.isArray(deviceTokens) ? deviceTokens : [deviceTokens],
      notification: {
        title: title,               // Notification title
        body: message,             // Notification message body
        first_name: first_name,     // Custom data: first name
        last_name: last_name,       // Custom data: last name
        images: images,             // Custom data: images
        city: city                  // Custom data: city
      },
    };

    // Send the push notification
    fcm.send(messageData, function (err, response) {
      if (err) {
        console.error('Error sending push notification:', err);
      } else {
        console.log('Successfully sent with response:', response);
      }
    });
  } catch (err) {
    console.error('Error sending push notification:', err);
    throw err;
  }
},

send_emails: function(otp,email,resu) {
        
  try {
      const nodemailer = require('nodemailer');
      
          var transport = nodemailer.createTransport({
            host: "smtp.mailtrap.io",
            port: 2525,
            auth: {
              user: "116420d06ecfad",
              pass: "********e5b3"
            }
          });
        

          var mailOptions = {
          from: 'manishsingh8219739756@gmail.com',
          to: email,
          subject:  'PicMash App: Forgot password',
          html: `Hi, ${email} your otp is ${otp} please verify once and reset your password`     
          };  
          
         /*  var mailOptions = {
            from: 'test978056@gmail.co',
            to: email,
            subject:  'ProxApp: Forgot password',
            template: 'forgetpassword',
            data: {
              email: email, 
              otp: otp, 
            },  
          }; 
           */
          transport.sendMail(mailOptions, function (error, info) {
          if (error) {
          console.log(error);
          } else {
          console.log(info)
;
          res.send('Email send');
          }
        });
       return resu;
  } catch (err) {
    throw err;
  }
  },


sendEmail(object) {
  try {
      console.log("-------------------",object);
      
      var transport = nodemailer.createTransport({
          host: "smtp.mailtrap.io",
          port: 2525,
          auth: {
            user: "116420d06ecfad",
            pass: "********e5b3"
          }
        });
      var mailOptions = {
          from: `"Transit",<${object.to}>`,
          ...object,
      };

      console.log(mailOptions);
      transport.sendMail(mailOptions, function (error, info) {
          if (error) {
              console.log('error', error);
          } else {
              console.log('Email sent: ' + info.response);
          }
      });
  } catch (err) {
      throw err;
  }
},
send_email: async function (get_param, req, res) {

  console.log(get_param, "get_param");
  var data = await db.users.findOne({
      where: {
          email: get_param.email,
      },
      raw: true,
  });
  /  console.log(data) /
  if (data) {

      var email_password_get = await this.email_password_for_gmail();

      var url_data = await this.url_path(req);

      let auth_data = await this.generate_auth_key();
      await db.users.update({resetpassword_token:auth_data},{where:{
        email:data.email
      }})

      / console.log(auth_data,"auth_data"); 
    
      var transport = nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "116420d06ecfad",
          pass: "********e5b3"
        }
      });
    
      var mailOptions = {

          from: email_password_get.email_data,
          to: get_param.email,
          subject: 'Display Forgot Password',
          html: 'Click here for change password <a href="' +
              url_data +
              "/api/reset_password/" +
              auth_data +
              '"> Click</a>'
      };

      transport.sendMail(mailOptions, function (error, info) {
          if (error) {
              console.log(error);
          } else {
              console.log('Email sent: ' + info.response);
          }
      });

      save = await db.users.update({
          forgotPassword: auth_data,
      }, {
          where: {

              id: data.id

          }
      });
      507
      return transport;
  } else {

      let msg = 'Email not registered';
      throw msg
  }

},


};

