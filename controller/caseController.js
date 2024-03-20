const helper = require("../helper/helpers")
// var jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');
// const pushnotification = require("../helper/pushnotification")
const saltRounds = 10;
var jwt = require("jsonwebtoken");
const db = require("../models");

// const { User, user_cases, user_qoute, user_ratings } = db; // Import the User model along with other models

// Define associations between models
// user_cases.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
// User.hasMany(user_cases, { foreignKey: 'user_id' });

// user_qoute.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
// User.hasMany(user_qoute, { foreignKey: 'user_id' });

// user_ratings.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
// User.hasMany(user_ratings, { foreignKey: 'user_id' });
// const helper = require('../helper/helper.js')
module.exports={
 
    add_user_Case: async function (req, res) {
        try {
            const required = {
                user_id: req.body.user_id,
                case_name: req.body.case_name,
                facility: req.body.facility,
                dos: req.body.dos,
                surgeon: req.body.surgeon,
                patient_identifier: req.body.patient_identifier,
                manufacturer: req.body.manufacturer,
                procedures: req.body.procedures,
                notes: req.body.notes,
             };
             const nonRequired = {
              
            };
          const getdata = await helper.vaildObject(required, nonRequired, res);
            const data = await db.user_cases.create({
                user_id: getdata.user_id,
                case_name: getdata.case_name,
                facility: getdata.facility,
                dos: getdata.dos,
                surgeon: getdata.surgeon,
                patient_identifier: getdata.patient_identifier,
                manufacturer: getdata.manufacturer,
                procedures: getdata.procedures,
                notes: getdata.notes,

            });          
            return helper.success(res, "Case added Successfully.", data);
        } catch (error) {
          console.log(error);
        }
    },
    add_user_quote: async function (req, res) {
        try {
            const required = {
                user_id: req.body.user_id,
                rep: req.body.rep,
                facility: req.body.facility,
                discount: req.body.discount,
                manufacturer: req.body.manufacturer,
                date: req.body.date,

             };

             const nonRequired = {
              
            };
    
          const getdata = await helper.vaildObject(required, nonRequired, res);
            const data = await db.user_quote.create({
                user_id: getdata.user_id,
                facility: getdata.facility,
                manufacturer: getdata.manufacturer,
                discount: getdata.discount,
                rep: getdata.rep,
                date:getdata.date,
            });          
            return helper.success(res, "Case added Successfully.", data);
        } catch (error) {
          console.log(error);
        }
    },
    
    user_ratings: async function (req, res) {
      try {
          const required = {
              user_id: req.body.user_id,
              ratings: req.body.ratings,
              description: req.body.description,
           

           };

           const nonRequired = {
            
          };
  
        const getdata = await helper.vaildObject(required, nonRequired, res);
          const data = await db.user_ratings.create({
              user_id: getdata.user_id,
              ratings: getdata.ratings,
              description: getdata.description,
             
          });          
          return helper.success(res, "Case added Successfully.", data);
      } catch (error) {
        console.log(error);
      }
  },


  
   
  my_cases: async function (req, res) {
    try {
      const finduser = await db.user_cases.findAll({
          where:{
              user_id:req.user.id
          }
      })
      return helper.success(res, "All Records .", finduser)

  } catch (error) {
      return helper.error(res, "privacy_policy ", error)
  }
},
}