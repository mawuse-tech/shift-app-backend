import { Sequelize } from "sequelize";

const sequelize = new Sequelize('EmployeeData', 'postgres', 'Dream@27',{
    host: 'localhost',
    dialect: 'postgres',
    logging: false, // hides the plenty SQL logs in the console
});

async function connectToDataBase(){
   try {
  await sequelize.authenticate();
  console.log('Connection has been established successfully.');
} catch (error) {
  console.error('Unable to connect to the database:', error);
}
}
connectToDataBase()
export default sequelize