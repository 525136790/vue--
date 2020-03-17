module.exports = {
  // publicpath: process.env.NODE_ENV === 'production' ? '192.0.0.1:8808' : '192.0.0.1:8808',
  devServer: {
    port: 8000,
    open: true,
    Proxy: {
      '/php': {
        target: 'http://localhost/php/interface/',
        changeOrigin: true,
        secure: false,
        pathRewrite: {
          '^/php': ''
        }
      },
      '/douban': {
        target: 'https://douban.uieee.com/v2',
        changeOrigin: true,
        secure: false,
        pathRewrite: {
          '^/douban': ''
        }
      },
      '/elem': {
        target: 'https://elm.cangdu.org',
        changeOrigin: true,
        pathRewrite: {
          '^/elem': ''
        }
      }
    }
  }
}
