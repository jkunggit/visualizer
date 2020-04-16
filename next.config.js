const path = require('path')

module.exports = {
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.plugins.push(new webpack.IgnorePlugin(/\/__tests__\//))
    config.module.rules.push({
      exclude: [
        path.resolve('node_modules')
      ]
    })
    return config
  }
}
