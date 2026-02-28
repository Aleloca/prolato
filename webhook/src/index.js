import { createApp } from './server.js';

const app = createApp();
const PORT = process.env.PORT || 9000;

app.listen(PORT, () => {
  console.log(`Prolato webhook listening on port ${PORT}`);
});
