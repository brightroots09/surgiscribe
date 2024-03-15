const db = require("../models")
const helper = require("../helper/helpers")
// var jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');
// const pushnotification = require("../helper/pushnotification")
const saltRounds = 10;
var jwt = require("jsonwebtoken");
// const { get } = require("../app");
const chatconstants = require("../models/chatconstants");
const { Sequelize,Op } = require('sequelize');
const notification = require("../models/notification");


const secretCryptoKey = "jwtSecretKey";
db.users.hasMany(db.chatconstants,{foreignKey:'senderId'});
// Define the relationship in your models
// db.users.hasMany(db.chatconstants, { foreignKey: 'receiverId' });
db.chatconstants.belongsTo(db.users, { foreignKey: 'senderId',as:'sender1'});

db.users.hasMany(db.chatconstants,{foreignKey:'senderId'});


// const helper = require('../helper/helper.js')
module.exports={



  
    sign_up: async function (req, res) {
        try {
            const required = {
                email: req.body.email,
                mobile_number: req.body.mobile_number,
                password: req.body.password,
             };

             const nonRequired = {
              
            };
    
          const getdata = await helper.vaildObject(required, nonRequired, res);
          const emailfind = await db.users.findOne({
                where: {
                    email: getdata.email
                }
          });

            if (emailfind) 
            return helper.error(res,"Email Already exits");
    
            const findnumber = await db.users.findOne({
                where: {
                  mobile_number: getdata.mobile_number
                }
            });
            if (findnumber) 
            return helper.error(res, "Please used another number this number is already exits")
    
            const password = await bcrypt.hash(getdata.password, saltRounds);
    
            let time = helper.unixTimestamp();
            const data = await db.users.create({
                mobile_number:getdata.mobile_number,
                email: getdata.email,
                password: password,
            });
    
            const userDetail = await db.users.findOne({
                where: {
                    email: getdata.email,
           
                },
                raw: true
            });
            let token = jwt.sign(
                {
                  data: {
                    id: userDetail.id,
                    email: userDetail.email,
                    loginTime: time,
                  },
                },
                secretCryptoKey,
                // { expiresIn: "365d" }
              );
    
            userDetail.token = token;
            return helper.success(res, "SignUp Successfully", userDetail);
        } catch (error) {
          console.log(error);
        }
    },
   
 
     changePassword : async (req, res) => {
      try {
        const required = {
          oldpassword: req.body.oldpassword,
          newpassword: req.body.newpassword,
          confirm_password: req.body.confirm_password,
        };
    
        const nonRequired = {};
    
        let requestData = await helper.vaildObject(required, nonRequired, res);
    
        const user = await db.users.findOne({
          where: {
            id: req.user.id,
          },
        });
    
        if (requestData.newpassword !== requestData.confirm_password) {
          throw 'New Password and confirm password must be the same!';
        }
    
        const hash = bcrypt.hashSync(requestData.newpassword, saltRounds);
        const match = await bcrypt.compare(requestData.oldpassword, user.password);
        if (!match) {
            return helper.error(res, 'Old password does not match');
        }

    await db.users.update(
          {
            password: hash,
          },
          {
            where: {
              id: req.user.id,
            },
          }
        );
    
        const updatedUser = await db.users.findOne({
          where: {
            id: req.user.id,
          },
        });
    
        return helper.success(res, 'Password changed successfully', updatedUser);
      } catch (error) {
        return helper.error(res, error); // Send an error response to the client
      }
    },
    
   
    
    
    log_out: async (req, res) => {
        try {
            const user = await db.users.findOne({
                where: {
                    id: req.user.id,
                }
            })
            if (user) {
                await db.users.update({
                  
                    loginTime: 0,
                    is_onlin:0
                
                }, {
                    where: {
                        id: req.user.id,
                    }
                })
                return helper.success(res, 'Logout successfully',user)
            }
        } catch (error) {
            console.log(error);
        }

    },

    login: async function (req, res) {
        try {
            const required = {
                email: req.body.email,
                password: req.body.password,};
            const nonRequired = {deviceToken:req.body.deviceToken,};

            const getdata = await helper.vaildObject(required, nonRequired, res)
            let verify_email = await db.users.findOne({
                where: {
                    email: getdata.email,
                  
                },
                raw: true
            })
            if (verify_email == null) {
                return helper.error(res,"email does not exits",verify_email)
            };
            let time = helper.unixTimestamp();

            let checkPassword = await bcrypt.compare(getdata.password, verify_email.password)
            if (!checkPassword)  
            return helper.error(res,'Incorrect email or password');
            await db.users.update({
                loginTime: time,
                
                deviceToken:getdata.deviceToken

            }, {
                where: {
                    email: getdata.email,
                  
                }
            });
          
 let userDetail = await db.users.findOne({
                where: {
                    id: verify_email.id
                },
                raw: true
            })

            let token = jwt.sign(
                {
                  data: {
                    id: userDetail.id,
                    email: userDetail.email,
                    loginTime: time,
                  },
                },
                secretCryptoKey,
                // { expiresIn: "365d" }
              );
    
            userDetail.token = token;
        
            return helper.success(res, "User Login successfully", userDetail)

        } catch (error) {
            helper.error(res, error);
        }
    },

    get_user_profile: async (req, res) => {
        try {
                   const find_login_user_profie = await db.users.findOne({
             where: {
                    id:req.user.id
                },
                

            })
            
            return helper.success(res, "Get profile successfully",find_login_user_profie)

        } catch (error) {
            console.log(error);

        }

    },

    edit_user_profile: async (req, res) => {

        try {
            const required = {};
            const nonRequired = {
                first_name: req.body.first_name,
                last_name:req.body.last_name,
            
                country: req.body.country,
                phone: req.body.phone,
                images: req.body.images,
                dob:req.body.dob,
                totalexperience:req.body.totalexperience,
                height:req.body.height,
                gender:req.body.gender,
                ratingtype:req.body.ratingtype,
                rating:req.body.rating,
                city:req.body.city,
                about:req.body.about,
                desired_partner:req.body.desired_partner,
                playingstyle:req.body.playingstyle,
                dominnant_hand:req.body.dominnant_hand,
                country_flag:req.body.country_flag,
                location_range:req.body.location_range,
              
            };

            const getdata = await helper.vaildObject(required, nonRequired, res)

     
if (req.files && req.files.images ) {
  var images = req.files.images;

  if (images) {
   req.body.images = (await helper.fileUpload(images, "images"));
 
  }
}
            const ligin_user_profile_change = await db.users.update({
                first_name: getdata.first_name,
                last_name:getdata.last_name,
          
                country: getdata.country,
                phone: getdata.phone,
                images: req.body.images,
                dob:getdata.dob,
                totalexperience:getdata.totalexperience,
                height:getdata.height,
                country_flag:getdata.country_flag,
                gender:getdata.gender,
                ratingtype:getdata.ratingtype,
                rating:getdata.rating,
                city:getdata.city,
                about:getdata.about,
                desired_partner:getdata.desired_partner,
                playingstyle:getdata.playingstyle,
                dominnant_hand:getdata.dominnant_hand,
                location_range:req.body.location_range
            }, {
                where: {
                    id: req.user.id
                }

            })
            const find_login_user_new_profie = await db.users.findOne({
              
                where: {
                    id: req.user.id
                },
                raw: true

            })
            return helper.success(res, "Profile updated  successfully", find_login_user_new_profie)
        } catch (error) {
           console.log(error);


        }
    },



    forgot_password: async (req, res) => {
        try {
            const required = {
                // roolType: req.body.roolType,
                email: req.body.email
            };

            const non_required = {
                // roolType: req.body.roolType,
                // security_key: req.headers.security_key
            };

            let requestdata = await helper.vaildObject(required, non_required);

            let existingUser = await db.users.findOne({
                where: {
                    email: requestdata.email,
                    //   role: requestdata.roolType
                },
                raw: true
            });
            if (!existingUser)
            return helper.error(res,"Email does not exist")

            existingUser.forgotPasswordHash = helper.createSHA1();

            let html = `Click here to change your password <a href="${
                req.protocol
                }://${req.get("host")}/api/forgot_url/${
                existingUser.forgotPasswordHash
                }"> Click</a>`;

            let emailData = {
                to: requestdata.email,
                subject: "Transit Forgot Password",
                html: html
            };
            console.log("9999999999999", existingUser.forgotPasswordHash);

            await helper.sendEmail(emailData);
            const ligin_user_profile_change = await db.users.update({
                forgotPasswordHash: existingUser.forgotPasswordHash,
            }, {
                where: {
                    email: requestdata.email
                }

            })
            return helper.success(
                res,
                "Forgot Password email sent successfully.", {}
            );
        } catch (err) {
            return helper.error(res, err);
        }
    },

    forgotUrl: async (req, res) => {
        try {
            console.log("77777777777777777777777", req.params.hash);

            let user_detail = await db.users.findOne({
                where: {
                    forgotPasswordHash: req.params.hash
                }
            });
            console.log("0000000000000000000000000", user_detail);

            if (user_detail) {
                console.log("111111111111111111111111111");

                res.render("reset_password", {
                    title: "Transit",
                    response: user_detail,
                    msg: req.flash('msg'),
                    hash: req.params.hash
                });
            } else {
                const html = `
                <br/>
                <br/>
                <br/>
                <div style="font-size: 50px;" >
                    <b><center>Link has been expired!</center><p>
                </div>
              `;
                res.status(403).send(html);
            }
        } catch (err) {
            throw err;
        }
    },
    
    resetPassword: async (req, res) => {
        try {
            const {
                password,
                forgotPasswordHash
            } = {
                ...req.body
            };

            const forgot_user = await db.users.findOne({
                where: {
                    forgotPasswordHash
                },
                raw: true
            });
            if (!forgot_user) throw "Something went wrong.";
            console.log("================================", password);

            const updateObj = {};
            updateObj.password = await bcrypt.hash(password, 12)
           
            
            updateObj.forgotPasswordHash = "";
            updateObj.id = forgot_user.id;
            const ligin_user_profile_change = await db.users.update({
                forgotPasswordHash: "",
                password: updateObj.password
            }, {
                where: {
                    id: forgot_user.id
                }

            })

            console.log("111111111111111111111111111", ligin_user_profile_change);

            if (ligin_user_profile_change) {
                return helper.success(res, "Password updated successfully.", {});

            } else {
                throw "Invalid User.";
            }
        } catch (err) {
            return helper.error(res, err);

        }
    },

    terms_Conditions: async (req, res) => {
        try {
            const terms_Conditions = await db.cms.findOne({
                where: {
                    id: 1
                }
            })
            console.log(">>>>>>>>>>>>>>>>>>........", terms_Conditions)

            return helper.success(res, "Terms&Conditions ", terms_Conditions)

        } catch (error) {
            return helper.error(res, error);


        }
    },
    
    privacy_policy: async (req, res) => {
        try {
            const privacy_policy = await db.cms.findOne({
                where: {
                    id: 2
                }
            })
            return helper.success(res, "privacy_policy ", privacy_policy)

        } catch (error) {
            return helper.error(res, error);

        }
    },

    userlist:async (req,res) =>{
        try {
            const finduser = await db.users.findAll({
                where:{
                    role:i
                }
            })
        } catch (error) {
            return helper.success(res, "privacy_policy ", finduser)
        }
    },

    friendRequest: async (req, res) => {
      try {
        const senderId = req.user.id; // Sender ID from the token
        const receiverId = req.body.receiverId; // Receiver ID from the request body
    
        // Check if a friend request already exists between sender and receiver
        const existingRequest = await db.chatconstants.findOne({
          where: {
            senderId: senderId,
            receiverId: receiverId,
            status: 1, // Status 1 indicates a friend request
          },
        });
    
        if (existingRequest) {
          // A friend request already exists, you can handle this case accordingly
          return helper.error(res, "Friend request already sent.");
        }
    
        // If there's no existing request, create a new friend request
        const request = await db.chatconstants.create({
          senderId: senderId,
          receiverId: receiverId,
          status: 1, // Status 1 indicates a friend request
        });
    
        // Send a push notification to the receiver
        const receiverUser = await db.users.findByPk(receiverId, {
          attributes: ['deviceToken', 'deviceType'],
        });
    
        if (receiverUser) {
          const { deviceToken, deviceType } = receiverUser;
          const title = 'New Friend Request';
          const message = 'You have received a new friend request!';
         
          helper.sendPushNotification(deviceToken, title, message);
    
          // Create a notification record in the notification table
          await db.notification.create({
            senderId: senderId,
            receiverId: receiverId,
            title: title,
            message: message,
            read_unread: '0', // Mark as unread
          });
        }
    
        return helper.success(res, "Friend request sent successfully.", request);
      } catch (error) {
        console.error(error);
      
      }
    },

    acceptFriendRequest: async (req, res) => {
      try {
        const senderId = req.body.senderId;
        const receiverId = req.user.id;
    
        const existingRequest = await db.chatconstants.findOne({
          where: {
            senderId: senderId,
            receiverId: receiverId,
            status: 1, // Check for pending requests only
          },
        });
    
        if (existingRequest) {
          const updatedStatus = req.body.status == 2 ? 2 : 3; // 2 for accept, 3 for reject
    
          // Update the existing request to the specified status
          await db.chatconstants.update(
            { status: updatedStatus },
            {
              where: {
                senderId: senderId,
                receiverId: receiverId,
                status: 1, // Update only pending requests
              },
            }
          );
    
          if (updatedStatus == 2) {
            // Send a push notification to the sender indicating acceptance
            const senderUser = await db.users.findByPk(senderId, {
              attributes: ['deviceToken', 'deviceType'],
            });
    
            if (senderUser) {
              const { deviceToken, deviceType } = senderUser;
              const title = 'Friend Request Accepted';
              const message = 'Your friend request has been accepted!';
              // You need to implement the sendPushNotification function
              // to send the actual push notification
              helper.sendPushNotification(deviceToken, title, message,);
    
              // Create a notification record in the notification table
              await db.notification.create({
                senderId: senderId,
                receiverId: receiverId,
                title: title,
                message: message,
                read_unread: '0', // Mark as unread
              });
            }
    
            return helper.success(res, 'Friend request accepted successfully');
          } else if (updatedStatus == 3) {
            // Send a push notification to the sender indicating rejection
            const senderUser = await db.users.findByPk(senderId, {
              attributes: ['deviceToken', 'deviceType'],
            });
    
            if (senderUser) {
              const { deviceToken, deviceType } = senderUser;
              const title = 'Friend Request Rejected';
              const message = 'Your friend request has been rejected!';
              // You need to implement the sendPushNotification function
              // to send the actual push notification
              helper.sendPushNotification(deviceToken, title, message);
    
              // Create a notification record in the notification table
              await db.notification.create({
                senderId: senderId,
                receiverId: receiverId,
                title: title,
                message: message,
                read_unread: '1', // Mark as read
              });
            }
    
            return helper.success(res, 'Friend request rejected successfully');
          }
        } else {
          return helper.error(res, 'No pending friend request found', {});
        }
      } catch (error) {
        console.error(error);
        // Handle the error appropriately
        // You may want to return an error response here
      }
    },
  
// ...



acceptFriendRequestappandgmail: async (req, res) => {
      try {
        const senderId = req.body.senderId;
        const receiverId = req.user.id;
    
        const existingRequest = await db.chatconstants.findOne({
          where: {
            senderId: senderId,
            receiverId: receiverId,
            status: 1, // Check for pending requests only
          },
        });
    
        if (existingRequest) {
          const updatedStatus = req.body.status == 2 ? 2 : 3; // 2 for accept, 3 for reject
    
          // Update the existing request to the specified status
          await db.chatconstants.update(
            { status: updatedStatus },
            {
              where: {
                senderId: senderId,
                receiverId: receiverId,
                status: 1, // Update only pending requests
              },
            }
          );
    
          if (updatedStatus == 2) {
            // Send a push notification to the sender indicating acceptance
            const senderUser = await db.users.findByPk(senderId, {
              attributes: ['deviceToken', 'deviceType','isNotification'],
            });
    
            if (senderUser.isNotification === 1) {
              const { deviceToken, deviceType } = senderUser;
              const title = 'Friend Request Accepted';
              const message = 'Your friend request has been accepted!';
              // You need to implement the sendPushNotification function
              // to send the actual push notification
              helper.sendPushNotification(deviceToken, title, message,);
    
              // Create a notification record in the notification table
              await db.notification.create({
                senderId: senderId,
                receiverId: receiverId,
                title: title,
                message: message,
                read_unread: '0', // Mark as unread
              });
            }
    
            return helper.success(res, 'Friend request accepted successfully');
          } else if (updatedStatus == 3) {
            // Send a push notification to the sender indicating rejection
            const senderUser = await db.users.findByPk(senderId, {
              attributes: ['deviceToken', 'deviceType','isNotification'],
            });
    
            if (senderUser.isNotification === 1) {
              const { deviceToken, deviceType } = senderUser;
              const title = 'Friend Request Rejected';
              const message = 'Your friend request has been rejected!';
              // You need to implement the sendPushNotification function
              // to send the actual push notification
              helper.sendPushNotification(deviceToken, title, message);
    
              // Create a notification record in the notification table
              await db.notification.create({
                senderId: senderId,
                receiverId: receiverId,
                title: title,
                message: message,
                read_unread: '1', // Mark as read
              });
            }
             const senderUser1 = await db.users.findByPk(senderId, {
              attributes: ['deviceToken', 'deviceType','phonenotification'],
            });
    if (senderUser1.phonenotification === 1) {
              const { deviceToken, deviceType } = senderUser;
              const title = 'Friend Request Accepted';
              const message = 'Your friend request has been accepted!';
              // You need to implement the sendPushNotification function
              // to send the actual push notification
              helper.sendPushNotification(deviceToken, title, message,);
    
              // Create a notification record in the notification table
              await db.notification.create({
                senderId: senderId,
                receiverId: receiverId,
                title: title,
                message: message,
                read_unread: '0', // Mark as unread
              });
            }
    
            return helper.success(res, 'Friend request accepted successfully');
          } else if (updatedStatus == 3) {
            // Send a push notification to the sender indicating rejection
              const senderUser1 = await db.users.findByPk(senderId, {
              attributes: ['deviceToken', 'deviceType','phonenotification'],
            });
       
            if (senderUser1.phonenotification === 1) {
              const { deviceToken, deviceType } = senderUser1;
              const title = 'Friend Request Rejected';
              const message = 'Your friend request has been rejected!';
              // You need to implement the sendPushNotification function
              // to send the actual push notification
              helper.sendPushNotification(deviceToken, title, message);
    
              // Create a notification record in the notification table
              await db.notification.create({
                senderId: senderId,
                receiverId: receiverId,
                title: title,
                message: message,
                read_unread: '1', // Mark as read
              });
            }
           const senderUser2 = await db.users.findByPk(senderId, {
              attributes: ['deviceToken', 'deviceType','gmailnotification'],
            });
            if (senderUser2.gmailnotification === 1) {
              const { deviceToken, deviceType } = senderUser2;
              const title = 'Friend Request Accepted';
              const message = 'Your friend request has been accepted!';
              // You need to implement the sendPushNotification function
              // to send the actual push notification
              helper.sendPushNotification(deviceToken, title, message,);
    
              // Create a notification record in the notification table
              await db.notification.create({
                senderId: senderId,
                receiverId: receiverId,
                title: title,
                message: message,
                read_unread: '0', // Mark as unread
              });
            }
    
            return helper.success(res, 'Friend request accepted successfully');
          } else if (updatedStatus == 3) {
            // Send a push notification to the sender indicating rejection
           const senderUser2 = await db.users.findByPk(senderId, {
              attributes: ['deviceToken', 'deviceType','gmailnotification'],
            });
    
            if (senderUser2.gmailnotification === 1) {
              const { deviceToken, deviceType } = senderUser2;
              const title = 'Friend Request Rejected';
              const message = 'Your friend request has been rejected!';
              // You need to implement the sendPushNotification function
              // to send the actual push notification
              helper.sendPushNotification(deviceToken, title, message);
    
              // Create a notification record in the notification table
              await db.notification.create({
                senderId: senderId,
                receiverId: receiverId,
                title: title,
                message: message,
                read_unread: '1', // Mark as read
              });
            }
            return helper.success(res, 'Friend request rejected successfully');
          }
        } else {
          return helper.error(res, 'No pending friend request found', {});
        }
      } catch (error) {
        console.error(error);
        // Handle the error appropriately
        // You may want to return an error response here
      }
    },

    
connectrequestlist: async (req, res) => {
  try {
    const receiverId = req.user.id; // Sender ID from the token

    const sentRequests = await db.chatconstants.findAll({
      include: [
        {
          model: db.users,
          as: 'sender1', // Alias for the sender user
          where: {
            id: { [Op.not]: receiverId },
          },
          attributes: [
            'id',
            'first_name',
            'last_name',
            'email',
            'phone',
            'country',
            'country_code',
            'loginTime',
            'latitude',
            'longitude',
            'location_range',
            'otp',
            'images',
            'gender',
            'dob',
            'deviceToken',
            'deviceType',
            'height',
            'about',
            'city',
            'desired_partner',
            'ratingtype',
            'rating',
            'playingstyle',
            'dominnant_hand',
            'country_flag',
            'social_type',
            'social_id',
            'is_online',
           
          ],
        },
      ],
      where: {
        receiverId: receiverId,
        status: 1, // Filter by status 1 (assuming this represents sent requests)
      },
    });

    return helper.success(res, 'Connection request list', sentRequests);
  } catch (error) {
    console.error(error);
  }
},


  
createtogglenotification: async (req, res) => {
    try {
      // Validate request body
      const required = {
        notificationtype: req.body.notificationtype,
        isnotification: req.body.isnotification,
        messages: req.body.messages,
        title: req.body.title,
        read_unread: req.body.read_unread,
      };
  
      const nonRequired = {};
  
      const getdata = await helper.vaildObject(required, nonRequired, res);
      const user_id = req.user.id;
      let notification = await db.notification.findOne({
        where: {
          user_id: user_id,
        },
      });
  
    //   if (!notification) {
         notification = await db.notification.create({
          user_id: user_id,
          notificationtype: getdata.notificationtype,
          isnotification: getdata.isnotification,
          messages: getdata.messages,
          title: getdata.title,
          read_unread: getdata.read_unread,
        });
   
      
  
      return helper.success(res, 'Notification created/updated successfully', notification);
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  delterequest:async(req,res)=>{
    const senderId = req.user.id
    const receiverId = req.body.receiverId
    try {
        const dlt = await db.chatconstants.destroy({
            where:{
                senderId:senderId,
                receiverId:receiverId
            }
        })
        return helper.success(res,"Request delete successfully")
    } catch (error) {
        console.log(error);
    }
  },

  deleteuseraccount: async (req, res) => {
    const { delete_reason } = req.body; // Assuming you send the delete reason in the request body
  
    try {
      const user = await db.users.findOne({
        where: {
          id: req.user.id,
        },
      });
 
      if (user) {
        await db.deketeddata.create({
            userid: req.user.id, 
            email: req.user.email, 
            delete_reason:req.body.delete_reason
          });
        await db.users.destroy({
          where: {
            id: req.user.id,
          },
        });
  
        return helper.success(res, 'User account deleted successfully', user);
      }
    } catch (error) {
      console.error(error);
     console.log(error);
    }
  },

  


updateNotificationStatus: async (req, res) => {
    try {
        let check_user_id = await db.notification.findOne({
            where: {
                user_id: req.user.id
            }
        });

        if (check_user_id) {
            if (req.body.gmail_enabled === 1 || req.body.app_enabled === 1) {
                
                await db.notification.update({
                    gmail_enabled: req.body.gmail_enabled,
                    app_enabled: req.body.app_enabled,
                    title: req.body.title,
                    read_unread: req.body.read_unread,
                    messages: req.body.messages
                }, {
                    where: {
                        user_id: req.user.id
                    }
                });

                // Send push notifications here if required
                if (req.body.gmail_enabled === 1) {
                    // Send Gmail push notification
                }
                if (req.body.app_enabled === 1) {
                    // Send app push notification
                }
            } else {
                // User wants to disable notifications, remove the status
                await db.notification.destroy({
                    where: {
                        user_id: req.user.id
                    }
                });

                // No push notifications should be sent when notifications are turned off.
            }
        } else {
            await db.notification.create({
                user_id: req.user.id,
                title: req.body.title,
                messages: req.body.messages,
                read_unread: req.body.read_unread,
                gmail_enabled: req.body.gmail_enabled,
                app_enabled: req.body.app_enabled
            });

            // Send push notifications here if required
            if (req.body.gmail_enabled === 1) {
                // Send Gmail push notification
            }
            if (req.body.app_enabled === 1) {
                // Send app push notification
            }
        }

        let get_updated_status = await db.notification.findOne({
            where: {
                user_id: req.user.id
            }
        });

        return helper.success(res, "Update Notification Status", get_updated_status);

    } catch (error) {
        console.log(error);
       
    }
},
social_login: async (req, res) => {
  try {
    const required = {
      social_type: req.body.social_type,
      social_id: req.body.social_id,
    };
    const nonRequired = {
      email: req.body.email,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      deviceType: req.body.deviceType,
      deviceToken: req.body.deviceToken,
      images: req.files && req.files.images,
      loginTime: helper.unixTimestamp(),
    };
    const getdata = await helper.vaildObject(required, nonRequired, res);

    if (!getdata.email) {
      return helper.error(res, "Email is required.");
    }

    // Check if the email already exists
    const emailExists = await db.users.findOne({
      where: {
        email: getdata.email,
      },
      raw: true,
    });

    if (!emailExists) {
      return helper.error(res, "Email does not exist.");
    }

    if (req.files && req.files.images) {
      var images = req.files.images;
      if (images) {
        req.body.images = (await helper.fileUpload(images, "images"));
      }
    }

    var findUser = await db.users.findOne({
      where: {
        social_id: getdata.social_id,
        social_type: getdata.social_type,
      },
      raw: true,
    });

    if (!findUser) {
      var social_user = await db.users.create({
        social_id: getdata.social_id,
        social_type: getdata.social_type,
        first_name: getdata.name,
        last_name: getdata.name,
        email: getdata.email,
        role: getdata.role,
        deviceType: getdata.deviceType,
        deviceToken: getdata.deviceToken,
        images: getdata.images,
        loginTime: getdata.loginTime,
      });

      var social_user = await db.users.findOne({
        where: {
          id: social_user.id,
        },
        raw: true,
      });

      let token = jwt.sign(
        {
          data: {
            id: social_user.id,
            email: social_user.email,
            loginTime: social_user.loginTime,
          },
        },
        secretCryptoKey
      );

      social_user.token = token;

      return helper.success(res, "Social Login successfully", social_user);
    } else {
      if (
        findUser.social_id == getdata.social_id &&
        findUser.social_type == getdata.social_type &&
        findUser.role == getdata.role
      ) {
        var iiojk9o = await db.users.update(
          {
            deviceToken: getdata.deviceToken,
            deviceType: getdata.deviceType,
            loginTime: getdata.loginTime,
          },
          {
            where: {
              id: findUser.id,
            },
          }
        );

        var social_user = await db.users.findOne({
          where: {
            id: findUser.id,
          },
          raw: true,
        });

        let token = jwt.sign(
          {
            data: {
              id: social_user.id,
              email: social_user.email,
              loginTime: social_user.loginTime,
            },
          },
          secretCryptoKey,
          { expiresIn: "365d" }
        );

        social_user.token = token;

        return helper.success(res, "Social login successfully", social_user);
      }
    }
  } catch (error) {
    console.error(error);
    return helper.error(res, error);
  }
},

view: async (req, res) => {
  try {
    const viewdata = await db.users.findOne({
      attributes: [
        'id','first_name','last_name','email','phone','country','country_code','loginTime',
        'latitude','longitude','location_range','otp','images','gender','dob','deviceToken',
        'deviceType','height','about','city','desired_partner','ratingtype','rating','playingstyle',
        'dominnant_hand','country_flag','social_type','social_id','is_online',
         [Sequelize.literal('(SELECT status FROM chatconstants WHERE users.id = chatconstants.senderId AND chatconstants.receiverId = :currentUserId)'), 'sender_status_1'],
        [Sequelize.literal('(SELECT status FROM chatconstants WHERE users.id = chatconstants.receiverId AND chatconstants.senderId = :currentUserId)'), 'receiver_status_1'],
        [Sequelize.literal('(SELECT status FROM chatconstants WHERE users.id = chatconstants.senderId AND chatconstants.receiverId = users.id)'), 'sender_status_2'],
        [Sequelize.literal('(SELECT status FROM chatconstants WHERE users.id = chatconstants.receiverId AND chatconstants.senderId = users.id)'), 'receiver_status_2'],
      ],
      where: {
        id: req.params.id,
      },
      replacements: { currentUserId: req.user.id }, // Replace req.user.id with your actual current user ID
      raw: true, // This will give you raw data instead of model instances
    });

    if (viewdata) {
      return helper.success(res, 'Success view User Data', viewdata);
    } else {
      // Handle the case when the user is not found
      return helper.error(res, 'User not found', 404);
    }
  } catch (error) {
    console.log(error);

  }
},




activeinactive: async (req, res) => {
  try {
    const user = await db.users.findOne({
      where: {
        id: req.user.id,
      },
    });

    if (user) {
      // Update the user's is_online status based on the value provided in the request body
      const is_online = req.body.is_online;

      // Update the user's login time and last activity time
      await db.users.update(
        {
          // loginTime: helper.unixTimestamp(),
          // lastActivityTime: helper.unixTimestamp(),
          is_online: is_online,
        },
        {
          where: {
            id: req.user.id,
          },
        }
      );

      return helper.success(res, 'Status updated successfully', {
        is_online: is_online,
      });
    } else {
      return helper.error(res, 'User not found');
    }
  } catch (error) {
    console.log(error);
    return helper.error(res, 'An error occurred');
  }
},
userside_contact_us: async (req, res) => {

  try {

    const required = {

      message: req.body.message,
      type: req.body.type
    };
    const nonRequired = {

    };

    const getdata = await helper.vaildObject(required, nonRequired, res)
    const find_user = await db.users.findOne({
      where: {
        id: req.user.id,
      },
      raw: true
    })

    if (find_user) {
      await db.contactsupport.create({
        userid: find_user.id,
        message: getdata.message,
        type: getdata.type
      })
    }
    return helper.success(res, "Your form  submited ")
  } catch (error) {
    console.log(error);



  }
},


}
     
   
      
    



