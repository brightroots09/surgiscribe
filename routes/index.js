var express = require('express');

var router = express.Router();
const authenticateJWT = require('../helper/helpers').authenticateJWT;
const verifyUser = require('../helper/helpers').verifyUser;
const userController = require('../controller/userController');
const playerController = require('../controller/playerController');
const notificationController = require('../controller/notificationController');
const notification = require('../models/notification');


////////////admin and userr section ///////
router.post("/sign_up",userController.sign_up);
router.post("/login",userController.login);
router.get("/get_user_profile",authenticateJWT,verifyUser,userController.get_user_profile);






















router.post("/social_login",userController.social_login);
router.post("/edit_user_profile",authenticateJWT,verifyUser,userController.edit_user_profile);
router.put("/changePassword",authenticateJWT,verifyUser,userController.changePassword);
router.post("/log_out",authenticateJWT,verifyUser,userController.log_out)
router.post("/userlist",authenticateJWT,verifyUser,userController.userlist)

//////////////player section////////////////
router.get("/getplayerlist",authenticateJWT,verifyUser,playerController.getplayerlist);
router.post("/searchplayer",authenticateJWT,verifyUser,playerController.searchplayer)


/////cms/////////////
router.get("/terms_Conditions",authenticateJWT,verifyUser,userController.terms_Conditions);
router.get("/privacy_policy",authenticateJWT,verifyUser,userController.privacy_policy);
router.post("/userside_contact_us",authenticateJWT,verifyUser,userController.userside_contact_us)

///////accept reject////
router.post("/friendRequest",authenticateJWT,verifyUser,userController.friendRequest)
router.post("/acceptFriendRequest",authenticateJWT,verifyUser,userController.acceptFriendRequest)
router.delete("/delterequest",authenticateJWT,verifyUser,userController.delterequest)
router.delete("/deleteuseraccount",authenticateJWT,verifyUser,userController.deleteuseraccount)
router.get("/view/:id",authenticateJWT,verifyUser,userController.view)
// router.post("/sendRequest",authenticateJWT,verifyUser,userController.sendRequest)


router.get("/connectedplayerlist",authenticateJWT,verifyUser,playerController.connectedplayerlist)
router.get("/connectrequestlist",authenticateJWT,verifyUser,userController.connectrequestlist)




////////////forgotpassword//section//

router.get('/forgot_url/:hash', userController.forgotUrl);
router.post('/forgot_password', userController.forgot_password);
router.post('/reset_password', userController.resetPassword);


///////////notification section ///////////////////
router.post("/updateNotificationStatus",authenticateJWT,verifyUser,userController.updateNotificationStatus)
router.put("/notification_status",authenticateJWT,verifyUser,notificationController.notification_status)
router.put("/updatenotification",authenticateJWT,verifyUser,notificationController.user_notification)
router.get("/notificationlisting",authenticateJWT,verifyUser,notificationController.notificationlisting)
router.post("/recomended",authenticateJWT,verifyUser,playerController.recomended)


router.post("/activeinactive",authenticateJWT,verifyUser,userController.activeinactive)

router.post("/acceptFriendRequestappandgmail",authenticateJWT,verifyUser,userController.acceptFriendRequestappandgmail)
module.exports = router;
