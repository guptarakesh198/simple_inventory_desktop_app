import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const Product = sequelize.define('Product', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  ProductName: { type: DataTypes.STRING, allowNull: false },
  Category: { type: DataTypes.STRING, allowNull: false },
  SquCode: { type: DataTypes.STRING, unique: true, allowNull: true },
  Quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  ThresholdQuantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  Price: { type: DataTypes.FLOAT, allowNull: false }
});

export default Product;
