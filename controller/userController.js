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
const fs = require('fs');
const path = require('path');

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
                type: req.body.type,

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
                type: getdata.type,

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
                password: req.body.password,
                type: req.body.type,

              
              };
            const nonRequired = {deviceToken:req.body.deviceToken,};

            const getdata = await helper.vaildObject(required, nonRequired, res)
            let verify_email = await db.users.findOne({
                where: {
                    email: getdata.email,
                    type: getdata.type,

                },
                raw: true
            })
            if (verify_email == null) {
                return helper.error(res,"email with this type does not exits",verify_email)
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
            const required = {
            };
            const nonRequired = {
              email: req.body.email,
              mobile_number: req.body.mobile_number,
            };
            const getdata = await helper.vaildObject(required, nonRequired, res)         
              if (req.files && req.files.images ) {
                var images = req.files.images;
                if (images) {
                req.body.images = (await helper.fileUpload(images, "images"));
                }
              }
            await db.users.update({
                email: getdata.email,
                mobile_number:getdata.mobile_number,
                images: req.body.images,
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
                mobile_number: req.body.mobile_number
            };

            const non_required = {
               
            };

            let requestdata = await helper.vaildObject(required, non_required);

            let existingUser = await db.users.findOne({
                where: {
                  mobile_number: requestdata.mobile_number,
                },
                raw: true
            });
            if (!existingUser)
            return helper.error(res,"Mobile Number does not exist.")
            const randomNum = Math.random() * 9000
            const otp = Math.floor(1000 + randomNum)
           
            return helper.success(res, "Otp Sent  successfully", {otp:otp})

        } catch (err) {
            return helper.error(res, err);
        }
    },

    resetPassword: async (req, res) => {
        try {
            const {
                password,
                mobile_number
            } = {
                ...req.body
            };
            const forgot_user = await db.users.findOne({
                where: {
                  mobile_number
                },
                raw: true
            });
            if (!forgot_user) throw "Something went wrong.";
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
                    type:2
                }
            })
            return helper.success(res, "All Records .", finduser)

        } catch (error) {
            return helper.error(res, "privacy_policy ", error)
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
     
   
      
    



