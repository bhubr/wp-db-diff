require('dotenv').config();

function getDbSettingsFromEnv() {
  const dbSettings = [];
  const varNames = ['HOST', 'USER', 'DATABASE', 'PASSWORD', 'WP_PREFIX'];
  for (let i = 1; i <= 2; i += 1) {
    const prefix = `DB${i}`;
    const entry = [];
    varNames.forEach((varName) => {
      entry[varName.toLowerCase()] = process.env[`${prefix}_${varName}`];
    });
    dbSettings.push(entry);
  }
  return dbSettings;
}

// Feel free to add your own settings,
// e.g. DB connection settings
module.exports = {
  port: process.env.PORT || 5000,
  dbs: getDbSettingsFromEnv(),
};
