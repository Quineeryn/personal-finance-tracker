'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Budget extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Budget.belongsTo(models.User, {
        foreignKey: 'userId'
      });
    }
  }
  Budget.init({
    userId: DataTypes.INTEGER,
    category: DataTypes.STRING,
    amount: DataTypes.DECIMAL,
    month: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Budget',
  });
  return Budget;
};