const path = require('path')

module.exports = {
  basePath: '/app',
  webpack(config, options) {
    config.resolve.alias['@'] = path.join(__dirname, 'src')
    return config
  },
}
