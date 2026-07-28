const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { port, publicOrigin } = require('./config');
const adsRoutes = require('./routes/ads');
const healthRoutes = require('./routes/health');
const errorHandler = require('./middleware/errorHandler');
const { startCronjob } = require('./services/cronjob');

const app = express();
const upload = multer();

app.use(cors({ origin: publicOrigin }));
app.use(express.json({ limit: '12mb' }));
app.use(express.urlencoded({ extended: true, limit: '12mb' }));

app.use('/api/ads', upload.single('photo'), adsRoutes);
app.use('/api/health', healthRoutes);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Mag Obyava backend listening on port ${port}`);
});

startCronjob();
