import { Sequelize } from "sequelize";

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
  dialectOptions:
    process.env.NODE_ENV === "production"
      ? { ssl: { rejectUnauthorized: false } }
      : {},
});

async function connectToDataBase() {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}
connectToDataBase();
export default sequelize;



// import { Sequelize } from "sequelize";

// const sequelize = new Sequelize(
//   process.env.DB_NAME,     // EmployeeData
//   process.env.DB_USER,     // postgres
//   process.env.DB_PASS,
//      {
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT || 5432,
//     dialect: 'postgres',
//     logging: false,
//     dialectOptions:
//       process.env.NODE_ENV === 'production'
//         ? { ssl: { rejectUnauthorized: false } }  // required for Render Postgres
//         : {},
//   });

// async function connectToDataBase(){
//    try {
//   await sequelize.authenticate();
//   console.log('Connection has been established successfully.');
// } catch (error) {
//   console.error('Unable to connect to the database:', error);
// }
// }
// connectToDataBase()
// export default sequelize