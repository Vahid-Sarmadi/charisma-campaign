const userController = require("./controllers/userController");
const connectDB = require("./config/db");

connectDB().then(async () => {
  await userController.init();
  process.exit(1);
}).catch((e) => {
  console.error(e);
  process.exit(1);
});

