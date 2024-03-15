const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('notification', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
  


    senderId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    receiverId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    messages: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    read_unread: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "0=unread,read=1",
      defaultValue: 0
    },
  }, {
    sequelize,
    tableName: 'notification',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },]
  });
};
