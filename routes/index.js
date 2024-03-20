var express = require('express');

var router = express.Router();
const authenticateJWT = require('../helper/helpers').authenticateJWT;
const verifyUser = require('../helper/helpers').verifyUser;
const userController = require('../controller/userController');
const caseController = require('../controller/caseController');


////////////admin and userr section ///////
router.post("/sign_up",userController.sign_up);
router.post("/login",userController.login);
router.get("/get_user_profile",authenticateJWT,verifyUser,userController.get_user_profile);

router.post("/social_login",userController.social_login);
router.post("/edit_user_profile",authenticateJWT,verifyUser,userController.edit_user_profile);
router.put("/changePassword",authenticateJWT,verifyUser,userController.changePassword);
router.post("/log_out",authenticateJWT,verifyUser,userController.log_out)
router.post("/userlist",authenticateJWT,verifyUser,userController.userlist)

router.post('/forgot_password', userController.forgot_password);
router.post('/reset_password', userController.resetPassword);
/////cms/////////////
router.get("/terms_Conditions",authenticateJWT,verifyUser,userController.terms_Conditions);
router.get("/privacy_policy",authenticateJWT,verifyUser,userController.privacy_policy);
router.post("/add_user_Case",authenticateJWT,verifyUser,caseController.add_user_Case);
router.post("/add_user_quote",authenticateJWT,verifyUser,caseController.add_user_quote);
router.post("/user_ratings",authenticateJWT,verifyUser,caseController.user_ratings);

router.get("/my_cases",authenticateJWT,verifyUser,caseController.my_cases)


router.delete("/deleteuseraccount",authenticateJWT,verifyUser,userController.deleteuseraccount)
router.get("/view/:id",authenticateJWT,verifyUser,userController.view)

router.post("/activeinactive",authenticateJWT,verifyUser,userController.activeinactive)
// router.post("/acceptFriendRequestappandgmail",authenticateJWT,verifyUser,userController.acceptFriendRequestappandgmail)
module.exports = router;
