import User from './users.model.js';
import Shift from "./shift.model.js";

User.hasMany(Shift, {foreignKey: "user_id", as: "shifts" });
Shift.belongsTo(User, { foreignKey: "user_id", as: "worker" });

User.hasMany(Shift, { foreignKey: "assigned_by", as: "assignedShifts" });
Shift.belongsTo(User, { foreignKey: "assigned_by", as: "admin" });

export { User, Shift };
