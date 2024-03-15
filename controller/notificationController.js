
const db = require("../models")
const helper = require("../helper/helpers")
// var jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');

const saltRounds = 10;
var jwt = require("jsonwebtoken");
// const { get } = require("../app");
const chatconstants = require("../models/chatconstants");
const { Sequelize,Op } = require('sequelize');
const notification = require("../models/notification");

const user_chat = require("../models/user_chat");
const secretCryptoKey = "jwtSecretKey";

db.notification.belongsTo(db.users,{foreignKey:'receiverId'});

module.exports ={

// togglenotification: async (req, res) => {
//   try {
//     const userId = req.params.userId;
//     const notification = await Notification.findOne({
//       where: { user_id: userId },
//     });

//     if (!notification) {
//       return res.status(404).json({ message: 'Notification not found' });
//     }

 
//     notification.gmail_enabled = !notification.gmail_enabled;
//     notification.app_enabled = !notification.app_enabled;
//     await notification.save();

//     res.status(200).json(notification);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// },


// sendpushnotification: async (req, res) => {
//   try {
//     const userId = req.params.userId;
//     const notification = await Notification.findOne({
//       where: { user_id: userId },
//     });

//     if (!notification) {
//       return res.status(404).json({ message: 'Notification not found' });
//     }


//     if (notification.app_enabled) {
   
//       sendPushNotification(userId, 'Your message');
//     } else {
//       return res.status(400).json({ message: 'Notifications are disabled' });
//     }

//     res.status(200).json({ message: 'Push notification sent' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// }


// updateNotificationgmail :async (req, res) => {
//     try {
//       const userId = req.user.id; 
  
      
//       const newNotificationStatus = req.body.gmail_enabled === 0 ? 0 : req.body.isNotification;

//       const [_, updatedRows] = await db.notification.update(
//         { app_enabled: newNotificationStatus },
//         { where: { user_id: userId } }
//       );
  
//       if (updatedRows === 0) {
//         return error(res, 'Notification status update failed');
//       }
  
//       return success(res, 'Notification status updated');
//     } catch (err) {
//       console.error(err);
//       }
//   },

//   updateNotificationapp :async (req, res) => {
//     try {
//       const userId = req.user.id; 
//   const notification = await db.notification.create({
//     user_id: userId ,
//     gmail_enabled:req.body.gmail_enabled,
//     messages:req.body.messages,
//     title:req.body.title,
//     read_unread:req.body.read_unread
    
//   })
      
//       const newNotificationStatus = req.body.app_enabled === 0 ? 0 : req.body.isNotification;

//       const [_, updatedRows] = await db.notification.update(
//         { app_enabled: newNotificationStatus,
//             read_unread:req.body.read_unread},
//         { where: { user_id: userId } }
//       );
  
//       if (updatedRows === 0) {
//         return error(res, 'Notification status update failed');
//       }
  
//       return success(res, 'Notification status updated');
//     } catch (err) {
//       console.error(err);
//       }
//   },
  

notification_status: async (req, res) => {
    try {
    

        const required = {};
        const nonRequired = {
            isNotification: req.body.isNotification,
            phonenotification:req.body.phonenotification,
            gmailnotification:req.body.gmailnotification
        };

        const userData = await helper.vaildObject(required,nonRequired, res);

        const user_notification_status = await db.users.findOne({
            attributes: ['isNotification','phonenotification','gmailnotification'],
            where: {
                id: req.user.id
            }
        })

        const noti_status = await db.users.update({
            isNotification: userData.isNotification,
            phonenotification: userData.phonenotification,
            gmailnotification: req.body.gmailnotification
        },{
            where:{id:req.user.id}
        })
       

    
        return helper.success(res, "Notification status updated", user_notification_status);
    } catch (error) {

        console.error("Error in notification_status:", error);
       
    }
},

user_notification: async (req, res) => {
    try {
        const _notifications = await db.push_notifications.findAll({
            where: {
                recevier_Id: req.auth.id
            }
        })
     
        return helper.success(res, "notifications", _notifications)
    } catch (error) {
        return helper.error(res, error)

    }
},


user_notification: async (req, res) => {
    try {
        const _notifications = await db.notification.findAll({
            where: {
                recevierId: req.user.id
            }
        })
        var view_offers = await db.notification.update({
            read_unread:req.body.read_unread,
        }, {
            where: {
                recevierId: req.user.id
            }
        })
        return helper.success(res, "notifications", _notifications)
    } catch (error) {
        return helper.error(res, error)
  
    }
  },

 
  notificationlisting:async(req,res) =>{
    try {
        
        const receiverId = req.user.id;
    
        const notificationlisting = await db.notification.findAll({
          include: [
            {
              model: db.users,
           
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
              ],
            },
          ],
          where: {
            receiverId: receiverId,
          
          },
        });
        return helper.success(res,"Notification get success",notificationlisting)
    } catch (error) {
        
    }
  },


  chatmessagenotification: async (req, res) => {
    try {
        const _notifications = await db.user_chat.findAll({
            where: {
                id: req.user.id
            }
        })
        var view_offers = await db.user_chat.update({
            read_unread:req.body.read_unread,
        }, {
            where: {
                id: req.user.id
            }
        })
        return helper.success(res, "notifications", _notifications)
    } catch (error) {
        return helper.error(res, error)
  
    }
  },
 




}