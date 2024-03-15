const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user_chat', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    sender_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    reciever_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    read_unread: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "0=unread,read=1",
      defaultValue: 0,
    },
    message: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      message_status: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
   
  }, {
    sequelize,
    tableName: 'user_chat',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
