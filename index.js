const app = require("./app");
const { PORT } = require("./utils/config");
const { info } = require("./utils/logger");

const port = PORT || 3003;
app.listen(PORT, () => {
  info(`Server running on port ${port}`);
});
