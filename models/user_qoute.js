module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user_quote', { // <-- Change 'user_qoute' to 'user_quote'
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    date: {
      type: DataTypes.DATE,
      allowNull: true // Change this if you want to allow null values for date
    },
    rep: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    facility: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    manufacturer: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    discount: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
  }, {
    sequelize,
    tableName: 'user_quote', // <-- Change the table name here
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
