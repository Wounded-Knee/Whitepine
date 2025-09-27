const config = {
  mongodb: {
    url: process.env.MONGODB_URI_PROD || process.env.MONGODB_URI || 'mongodb://localhost:27017/whitepine',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  },
  migrationsDir: 'migrations',
  changelogCollectionName: 'changelog',
  migrationFileExtension: '.js',
  useFileHash: false,
  moduleSystem: 'commonjs',
};

module.exports = config;
