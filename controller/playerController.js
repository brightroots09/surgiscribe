const db = require("../models")
// const { Sequelize, QueryTypes } = require('sequelize');

const helper = require("../helper/helpers")
// var jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');

const saltRounds = 10;
var jwt = require("jsonwebtoken");

const secretCryptoKey = "jwtSecretKey";

const { Sequelize, Op } = require('sequelize');


// Define associations in your users model
db.users.hasMany(db.chatconstants, { foreignKey: 'senderId', as: 'cc_sender' });

db.users.hasMany(db.chatconstants, { foreignKey: 'receiverId', as: 'cc_receiver' });

db.chatconstants.belongsTo(db.users, { foreignKey: 'receiverId', as: 'receiverdetails' });
db.chatconstants.belongsTo(db.users, { foreignKey: 'receiverId', as: 'senderdetails' });



module.exports = {


  // searchplayer: async (req, res) => {
  //   try {
  //     const required = {};
  //     const nonRequired = {
  //       latitude: req.body.latitude,
  //       longitude: req.body.longitude,
  //       ratingtype: req.body.ratingtype,
  //       rating: req.body.rating,
  //       location_range: req.body.location_range,
  //       player_name: req.body.player_name,
  //     };
  //     const getdata = await helper.vaildObject(required, nonRequired, res);

  //     let whereClause = {};

  //     if (typeof getdata.player_name !== 'undefined') {
  //       const nameParts = getdata.player_name.split(' ');

  //       if (nameParts.length === 1) {
  //         // If there's only one part, search in both first_name and last_name
  //         whereClause[Sequelize.Op.or] = [
  //           {
  //             first_name: {
  //               [Sequelize.Op.like]: `%${nameParts[0]}%`,
  //             },
  //           },
  //           {
  //             last_name: {
  //               [Sequelize.Op.like]: `%${nameParts[0]}%`,
  //             },
  //           },
  //         ];
  //       } else if (nameParts.length === 2) {
  //         // If there are two parts, assume the first part is the first_name
  //         // and the second part is the last_name
  //         whereClause.first_name = {
  //           [Sequelize.Op.like]: `%${nameParts[0]}%`,
  //         };
  //         whereClause.last_name = {
  //           [Sequelize.Op.like]: `%${nameParts[1]}%`,
  //         };
  //       }
  //     }

  //     const haversine = `
  //       6371 * acos(
  //         cos(radians(:latitude))
  //         * cos(radians(latitude))
  //         * cos(radians(longitude) - radians(:longitude))
  //         + sin(radians(:latitude)) * sin(radians(latitude))
  //       )
  //     `;

  //     const distanceConversionFactor = 0.621371;
  //     const distanceInMiles = `${haversine} * ${distanceConversionFactor}`;

  //     // Conditionally include latitude and longitude filters
  //     if (typeof getdata.latitude !== 'undefined' && typeof getdata.longitude !== 'undefined') {
  //       whereClause.latitude = getdata.latitude;
  //       whereClause.longitude = getdata.longitude;
  //     }

  //     // Conditionally include rating and ratingType filters
  //     if (typeof getdata.ratingtype !== 'undefined') {
  //       whereClause.ratingtype = getdata.ratingtype;
  //     }

  //     if (typeof getdata.rating !== 'undefined') {
  //       whereClause.rating = {
  //         [Sequelize.Op.lte]: getdata.rating,
  //       };
  //     }

  //     const users = await db.users.findAll({
  //       attributes: [
  //         'id',
  //         'first_name',
  //         'last_name',
  //         'city',
  //         'latitude',
  //         'longitude',
  //         'location_range',
  //         'rating',
  //         'ratingtype',
  //         'images',

  //         [
  //           Sequelize.literal(distanceInMiles),
  //           'distance',
  //         ],

  //       ],
  //       where: whereClause,
  //       raw: true,
  //       order: Sequelize.col('distance'),
  //       // Conditionally include the HAVING clause if location_range is provided
  //       ...(getdata.location_range
  //         ? {
  //             having: Sequelize.literal(
  //               `distance <= ${getdata.location_range === 0 ? 100 : getdata.location_range}`
  //             ),
  //           }
  //         : {}),
  //       replacements: {
  //         latitude: getdata.latitude || 0, // Replace with a default value if undefined
  //         longitude: getdata.longitude || 0, // Replace with a default value if undefined
  //       },
  //     });

  //     return helper.success(res, 'success', users);
  //   } catch (error) {
  //     console.error(error);

  //   }
  // },




  connectedplayerlist: async (req, res) => {
    try {
      const userId = req.user.id; // User's ID from token
      const connectedPlayers = []; // Initialize an array to store connected players' details

      // Find all chat constants where the user is either the sender or receiver
      const chatConstants = await db.chatconstants.findAll({
        where: {
          [Sequelize.Op.or]: [
            {
              senderId: userId,
            },
            {
              receiverId: userId,
            },
          ],
          status: 2,
        },
      });

      if (!chatConstants || chatConstants.length === 0) {
        // If no chat constants found for the user, return an empty response or an error
        return helper.success(res, 'No connected players found', []);
      }

      for (const chatConstant of chatConstants) {
        let connectedUserId;

        if (chatConstant.senderId === userId) {
          // User is the sender, store the receiver's ID
          connectedUserId = chatConstant.receiverId;
        } else if (chatConstant.receiverId === userId) {
          // User is the receiver, store the sender's ID
          connectedUserId = chatConstant.senderId;
        }

        // Check if the connectedUserId is already in the connectedPlayers array
        const existingConnectedUser = connectedPlayers.find(
          (user) => user.id === connectedUserId
        );

        if (!existingConnectedUser) {
          // Fetch the details of the connected user (sender or receiver)
          const connectedUser = await db.users.findOne({
            where: {
              id: connectedUserId,
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
          });

          connectedPlayers.push(connectedUser);
        }
      }

      return helper.success(
        res,
        'Connected players retrieved successfully',
        connectedPlayers
      );
    } catch (error) {
      console.error(error);
    }
  },

  // searchplayer: async (req, res) => {
  //   try {

  //     const required = {};
  //     const nonRequired = {
  //       latitude: req.body.latitude,
  //       longitude: req.body.longitude,
  //       ratingtype: req.body.ratingtype,
  //       rating: req.body.rating,
  //       location_range: req.body.location_range,
  //       player_name: req.body.player_name,
  //     };
  //     const getdata = await helper.vaildObject(required, nonRequired, res);
  //     let whereClause = {};
  //     if (typeof getdata.player_name !== 'undefined') {
  //       const nameParts = getdata.player_name.split(' ');

  //       if (nameParts.length === 1) {
  //         whereClause[Sequelize.Op.or] = [
  //           {
  //             first_name: {
  //               [Sequelize.Op.like]: `%${nameParts[0]}%`,
  //             },
  //           },
  //           {
  //             last_name: {
  //               [Sequelize.Op.like]: `%${nameParts[0]}%`,
  //             },
  //           },
  //         ];
  //       } else if (nameParts.length === 2) {
  //         whereClause.first_name = {
  //           [Sequelize.Op.like]: `%${nameParts[0]}%`,
  //         };
  //         whereClause.last_name = {
  //           [Sequelize.Op.like]: `%${nameParts[1]}%`,
  //         };
  //       }
  //     }

  //     const haversine = `
  //       6371 * acos(
  //         cos(radians(:latitude))
  //         * cos(radians(latitude))
  //         * cos(radians(longitude) - radians(:longitude))
  //         + sin(radians(:latitude)) * sin(radians(latitude))
  //       )
  //     `;

  //     const distanceConversionFactor = 0.621371;
  //     const distanceInMiles = `${haversine} * ${distanceConversionFactor}`;

  //     if (typeof getdata.latitude !== 'undefined' && typeof getdata.longitude !== 'undefined') {
  //       whereClause.latitude = getdata.latitude;
  //       whereClause.longitude = getdata.longitude;
  //     }

  //     if (typeof getdata.ratingtype !== 'undefined') {
  //       whereClause.ratingtype = getdata.ratingtype;
  //     }

  //     if (typeof getdata.rating !== 'undefined') {
  //       whereClause.rating = {
  //         [Sequelize.Op.lte]: getdata.rating,
  //       };
  //     }
  //     if (req.user) {
  //       whereClause.id = {
  //         [Sequelize.Op.ne]: req.user.id,
  //       };
  //     }
  //     var currentUserId =  req.user.id
  //     // SQL query to retrieve user information along with request status
  //     const requestStatusQuery = `
  //     SELECT u.*, 
  //     cc_sender.status AS sender_status, 
  //     cc_receiver.status AS receiver_status
  // FROM users u
  // LEFT JOIN chatconstants cc_sender ON (u.id = ${currentUserId} AND cc_sender.senderId = ${currentUserId} AND cc_sender.receiverId = u.id)
  // LEFT JOIN chatconstants cc_receiver ON (u.id = u.id AND cc_receiver.senderId = ${currentUserId} AND cc_receiver.receiverId = u.id)
  // `;


  //     const users = await db.sequelize.query(requestStatusQuery, {
  //       replacements: {
  //         currentUserId: currentUserId, // Replace with the appropriate user ID
  //       },
  //       type: db.sequelize.QueryTypes.SELECT,
  //       attributes: [


  //         [
  //           Sequelize.literal(distanceInMiles),
  //           'distance',
  //         ],
  //       ],
  //       where: whereClause,
  //       raw: true,
  //       order: Sequelize.col('distance'),
  //       ...(getdata.location_range
  //         ? {
  //             having: Sequelize.literal(
  //               `distance <= ${getdata.location_range === 0 ? 100 : getdata.location_range}`
  //             ),
  //           }
  //         : {}),
  //       replacements: {
  //         latitude: getdata.latitude || 0,
  //         longitude: getdata.longitude || 0,
  //       },
  //     });

  //     return helper.success(res, 'success', users);
  //   } catch (error) {
  //     console.error(error);
  //     // Handle the error as needed
  //   }
  // },


  ///live tested
  // searchplayer : async (req, res) => {
  //   try {
  //     const required = {};
  //     const nonRequired = {
  //       full_name: req.body.full_name, // Use a single parameter for full_name
  //       rating: req.body.rating,
  //       ratingtype: req.body.ratingtype,
  //     };

  //     const getdata = await helper.vaildObject(required, nonRequired, res);

  //     const whereClause = {};

  //     if (typeof getdata.full_name !== 'undefined') {
  //       const nameParts = getdata.full_name.split(' ');

  //       if (nameParts.length === 1) {
  //         whereClause[Sequelize.Op.or] = [
  //           {
  //             first_name: {
  //               [Sequelize.Op.like]: `%${nameParts[0]}%`,
  //             },
  //           },
  //           {
  //             last_name: {
  //               [Sequelize.Op.like]: `%${nameParts[0]}%`,
  //             },
  //           },
  //         ];
  //       } else if (nameParts.length === 2) {
  //         whereClause.first_name = {
  //           [Sequelize.Op.like]: `%${nameParts[0]}%`,
  //         };
  //         whereClause.last_name = {
  //           [Sequelize.Op.like]: `%${nameParts[1]}%`,
  //         };
  //       }
  //     }

  //     if (req.user) {
  //       whereClause.id = {
  //         [Sequelize.Op.ne]: req.user.id,
  //       };
  //     }

  //     const currentUserId = req.user.id;

  //     const requestStatusQuery = `
  //       SELECT u.*, 
  //       cc_sender.status AS sender_status, 
  //       cc_receiver.status AS receiver_status,
  //       (
  //         6371 * acos(
  //           cos(radians(:latitude))
  //           * cos(radians(u.latitude))
  //           * cos(radians(u.longitude) - radians(:longitude))
  //           + sin(radians(:latitude)) * sin(radians(u.latitude))
  //         )
  //       ) * 0.621371 AS distance
  //       FROM users u
  //       LEFT JOIN chatconstants cc_sender ON (u.id = :currentUserId AND cc_sender.senderId = :currentUserId AND cc_sender.receiverId = u.id)
  //       LEFT JOIN chatconstants cc_receiver ON (u.id = u.id AND cc_receiver.senderId = :currentUserId AND cc_receiver.receiverId = u.id)
  //       WHERE u.id != :currentUserId
  //       HAVING distance <= :location_range
  //       ${getdata.rating ? 'AND u.rating <= :rating' : ''}
  //       ${getdata.ratingtype ? 'AND u.ratingtype = :ratingtype' : ''}
  //       ${getdata.full_name ? 'AND (u.first_name LIKE :full_name OR u.last_name LIKE :full_name)' : ''}
  //       ORDER BY distance;
  //     `;

  //     const users = await db.sequelize.query(requestStatusQuery, {
  //       replacements: {
  //         currentUserId: currentUserId,
  //         latitude: req.user.latitude || 0,
  //         longitude: req.user.longitude || 0,
  //         location_range: getdata.location_range || 100,
  //         rating: getdata.rating,
  //         ratingtype: getdata.ratingtype,
  //         full_name: `%${getdata.full_name}%`, // Use % for partial matching
  //       },
  //       type: db.sequelize.QueryTypes.SELECT,
  //     });

  //     return helper.success(res, 'success', users);
  //   } catch (error) {
  //     console.error(error);
  //     // Handle the error as needed
  //     return res.status(500).json({ error: 'An error occurred' });
  //   }
  // },



  // searchplayer: async (req, res) => {
  //   try {
  //     const required = {};
  //     const nonRequired = {
  //       latitude: req.body.latitude,
  //       longitude: req.body.longitude,
  //       ratingtype: req.body.ratingtype,
  //       rating: req.body.rating,
  //       location_range: req.body.location_range,
  //       player_name: req.body.player_name,
  //     };
  //     const getdata = await helper.vaildObject(required, nonRequired, res);

  //     let whereClause = {};
  //     if (typeof getdata.player_name !== 'undefined') {
  //       const nameParts = getdata.player_name.split(' ');

  //       if (nameParts.length === 1) {
  //         whereClause[Sequelize.Op.or] = [
  //           {
  //             first_name: {
  //               [Sequelize.Op.like]: `%${nameParts[0]}%`,
  //             },
  //           },
  //           {
  //             last_name: {
  //               [Sequelize.Op.like]: `%${nameParts[0]}%`,
  //             },
  //           },
  //         ];
  //       } else if (nameParts.length === 2) {
  //         whereClause.first_name = {
  //           [Sequelize.Op.like]: `%${nameParts[0]}%`,
  //         };
  //         whereClause.last_name = {
  //           [Sequelize.Op.like]: `%${nameParts[1]}%`,
  //         };
  //       }
  //     }

  //     const haversine = `
  //       6371 * acos(
  //         cos(radians(:latitude))
  //         * cos(radians(latitude))
  //         * cos(radians(longitude) - radians(:longitude))
  //         + sin(radians(:latitude)) * sin(radians(latitude))
  //       )
  //     `;

  //     const distanceConversionFactor = 0.621371;
  //     const distanceInMiles = `${haversine} * ${distanceConversionFactor}`;

  //     if (typeof getdata.latitude !== 'undefined' && typeof getdata.longitude !== 'undefined') {
  //       whereClause.latitude = getdata.latitude;
  //       whereClause.longitude = getdata.longitude;
  //     }

  //     if (typeof getdata.ratingtype !== 'undefined') {
  //       whereClause.ratingtype = getdata.ratingtype;
  //     }

  //     if (typeof getdata.rating !== 'undefined') {
  //       whereClause.rating = {
  //         [Sequelize.Op.lte]: getdata.rating,
  //       };
  //     }
  //     if (req.user) {
  //       whereClause.id = {
  //         [Sequelize.Op.ne]: req.user.id,
  //       };
  //     }

  //     // SQL query to retrieve user information along with request status
  //     const requestStatusQuery = `
  //       SELECT u.*, 
  //              COALESCE(MAX(cc_sender.status), MAX(cc_receiver.status)) AS request_status
  //       FROM users u
  //       LEFT JOIN chatconstants cc_sender ON (u.id = cc_sender.receiverId AND cc_sender.senderId = :currentUserID)
  //       LEFT JOIN chatconstants cc_receiver ON (u.id = cc_receiver.receiverId AND cc_receiver.senderId = :currentUserID)
  //       GROUP BY u.id
  //     `;

  //     const usersWithRequestStatus = await db.sequelize.query(requestStatusQuery, {
  //       replacements: {
  //         currentUserID: req.user.id, // Replace with the appropriate user ID
  //       },
  //       type: db.sequelize.QueryTypes.SELECT,
  //     });

  //     const users = await db.users.findAll({
  //       attributes: [
  //         'id', 'first_name', 'last_name', 'email', 'phone', 'country', 'country_code', 'loginTime',
  //         'latitude', 'longitude', 'location_range', 'otp', 'images', 'gender', 'dob', 'deviceToken',
  //         'deviceType', 'height', 'about', 'city', 'desired_partner', 'ratingtype', 'rating', 'playingstyle',
  //         'dominnant_hand', 'country_flag', 'social_type', 'social_id',

  //         [
  //           Sequelize.literal(distanceInMiles),
  //           'distance',
  //         ],
  //         'status'
  //       ],
  //       where: whereClause,
  //       raw: true,
  //       order: Sequelize.col('distance'),
  //       ...(getdata.location_range
  //         ? {
  //             having: Sequelize.literal(
  //               `distance <= ${getdata.location_range === 0 ? 100 : getdata.location_range}`
  //             ),
  //           }
  //         : {}),
  //       replacements: {
  //         latitude: getdata.latitude || 0,
  //         longitude: getdata.longitude || 0,
  //       },
  //     });

  //     return helper.success(res, 'success', users);
  //   } catch (error) {
  //     console.error(error);
  //     // Handle the error as needed
  //   }
  // },


  getplayerlist: async (req, res) => {
    try {
      var currentUserID = req.user.id;

      const query = `
      SELECT u.*,
    cc_sender.status AS sender_status_1,
    cc_receiver.status AS receiver_status_1,
    cc_sender_2.status AS sender_status_2,
    cc_receiver_2.status AS receiver_status_2
      FROM users u
      LEFT JOIN chatconstants cc_sender ON (u.id = ${currentUserID} AND cc_sender.senderId = ${currentUserID} AND cc_sender.receiverId = u.id)
      LEFT JOIN chatconstants cc_receiver ON (u.id =u.id AND cc_receiver.senderId = ${currentUserID} AND cc_receiver.receiverId = u.id)
      LEFT JOIN chatconstants cc_sender_2 ON (u.id = u.id AND cc_sender_2.senderId = u.id AND cc_sender_2.receiverId =${currentUserID})
      LEFT JOIN chatconstants cc_receiver_2 ON (u.id = ${currentUserID} AND cc_receiver_2.senderId = u.id AND cc_receiver_2.receiverId = ${currentUserID});

    `;
      const usersWithStatus = await db.sequelize.query(query, {
        replacements: {
          currentUserID: currentUserID,
        },
        type: Sequelize.QueryTypes.SELECT,
      });

      return helper.success(res, "user list", usersWithStatus);
    } catch (error) {
      console.error(error);
      // Handle the error appropriately
      return helper.error(res, "Error fetching user list");
    }
  },


  recomended: async (req, res) => {
    try {
      const currentUserID = req.user.id;
      const currentUserCoordinates = { latitude: req.user.latitude, longitude: req.user.longitude }; // Replace with actual user coordinates

      // Define the distance in miles (100 miles in this case)
      const maxDistanceInMiles = 100;

      // Use a SQL function or formula to calculate the distance between users
      const distanceFormula = `(6371 * acos(cos(radians(${currentUserCoordinates.latitude})) * cos(radians(u.latitude)) * cos(radians(u.longitude) - radians(${currentUserCoordinates.longitude})) + sin(radians(${currentUserCoordinates.latitude})) * sin(radians(u.latitude)))) * 0.621371`;

      const query = `
        SELECT u.*,
          cc_sender.status AS sender_status_1,
          cc_receiver.status AS receiver_status_1,
          cc_sender_2.status AS sender_status_2,
          cc_receiver_2.status AS receiver_status_2
        FROM users u
        LEFT JOIN chatconstants cc_sender ON (u.id = ${currentUserID} AND cc_sender.senderId = ${currentUserID} AND cc_sender.receiverId = u.id)
        LEFT JOIN chatconstants cc_receiver ON (u.id = u.id AND cc_receiver.senderId = ${currentUserID} AND cc_receiver.receiverId = u.id)
        LEFT JOIN chatconstants cc_sender_2 ON (u.id = u.id AND cc_sender_2.senderId = u.id AND cc_sender_2.receiverId =${currentUserID})
        LEFT JOIN chatconstants cc_receiver_2 ON (u.id = ${currentUserID} AND cc_receiver_2.senderId = u.id AND cc_receiver_2.receiverId = ${currentUserID})
        WHERE ${distanceFormula} <= ${maxDistanceInMiles}
      `;

      const usersWithStatus = await db.sequelize.query(query, {
        replacements: {
          currentUserID: currentUserID,
        },
        type: Sequelize.QueryTypes.SELECT,
      });

      return helper.success(res, "user list", usersWithStatus);
    } catch (error) {
      console.error(error);
      // Handle the error appropriately
      return helper.error(res, "Error fetching user list");
    }
  },


  searchplayer: async (req, res) => {
    try {
      // Define the required and non-required parameters
      const required = {};
      const nonRequired = {
        full_name: req.body.full_name,
        rating: req.body.rating,
        ratingtype: req.body.ratingtype,
        location_range: req.body.location_range || 100, // Default location range is 100 miles
      };

      // Validate the non-required parameters
      const getdata = await helper.vaildObject(required, nonRequired, res);

      // Initialize the WHERE clause for the SQL query
      const whereClause = {};

      // Check if the full_name parameter is provided
      if (typeof getdata.full_name !== 'undefined') {
        const nameParts = getdata.full_name.split(' ');

        if (nameParts.length === 1) {
          // Search by first name or last name if only one name is provided
          whereClause[Sequelize.Op.or] = [
            {
              first_name: {
                [Sequelize.Op.like]: `%${nameParts[0]}%`,
              },
            },
            {
              last_name: {
                [Sequelize.Op.like]: `%${nameParts[0]}%`,
              },
            },
          ];
        } else if (nameParts.length === 2) {
          // Search by both first name and last name if two names are provided
          whereClause.first_name = {
            [Sequelize.Op.like]: `%${nameParts[0]}%`,
          };
          whereClause.last_name = {
            [Sequelize.Op.like]: `%${nameParts[1]}%`,
          };
        }
      }

      // Check if the user is authenticated and exclude their own user ID from results
      if (req.user) {
        whereClause.id = {
          [Sequelize.Op.ne]: req.user.id,
        };
      }

      // Get the current user's ID
      const currentUserId = req.user.id;

      // Construct the SQL query for user search with distance calculation
      const requestStatusQuery = `
        SELECT u.*, 
        cc_sender.status AS sender_status_1,
        cc_receiver.status AS receiver_status_1,
        cc_sender_2.status AS sender_status_2,
        cc_receiver_2.status AS receiver_status_2,
        (
          6371 * acos(
            cos(radians(:latitude))
            * cos(radians(u.latitude))
            * cos(radians(u.longitude) - radians(:longitude))
            + sin(radians(:latitude)) * sin(radians(u.latitude))
          )
        ) * 0.621371 AS distance
        FROM users u
        LEFT JOIN chatconstants cc_sender ON (u.id = :currentUserId AND cc_sender.senderId = :currentUserId AND cc_sender.receiverId = u.id)
        LEFT JOIN chatconstants cc_receiver ON (u.id = u.id AND cc_receiver.senderId = :currentUserId AND cc_receiver.receiverId = u.id)
        LEFT JOIN chatconstants cc_sender_2 ON (u.id = u.id AND cc_sender_2.senderId = u.id AND cc_sender_2.receiverId = :currentUserId)
        LEFT JOIN chatconstants cc_receiver_2 ON (u.id = :currentUserId AND cc_receiver_2.senderId = u.id AND cc_receiver_2.receiverId = :currentUserId)
        HAVING distance <= :location_range
        ${getdata.rating ? 'AND u.rating <= :rating' : ''}
        ${getdata.ratingtype ? 'AND u.ratingtype = :ratingtype' : ''}
        ${getdata.full_name ? 'AND (u.first_name LIKE :full_name OR u.last_name LIKE :full_name)' : ''}
        ORDER BY distance;
      `;

      // Execute the SQL query
      const users = await db.sequelize.query(requestStatusQuery, {
        replacements: {
          currentUserId: currentUserId,
          latitude: req.user.latitude || 0,
          longitude: req.user.longitude || 0,
          location_range: getdata.location_range,
          rating: getdata.rating,
          ratingtype: getdata.ratingtype,
          full_name: `%${getdata.full_name}%`,
        },
        type: db.sequelize.QueryTypes.SELECT,
      });

      // Respond with the search results
      return helper.success(res, 'success', users);
    } catch (error) {
      console.error(error);
      // Handle error response here
    }
  },
}