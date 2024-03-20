const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user_cases', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    user_id : {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    case_name: {
      type: DataTypes.STRING(125),
      allowNull: true
    },
    facility	: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    dos: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    surgeon: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    patient_identifier: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    manufacturer: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    procedures: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },

  }, {
    sequelize,
    tableName: 'user_cases',
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
