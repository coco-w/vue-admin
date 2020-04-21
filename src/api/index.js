let baseUrl = ''
const env = process.env
if (env.NODE_ENV === 'development') {
  baseUrl = '/api1' // 开发环境地址
} else if (env.NODE_ENV === 'production') {
  baseUrl = window.ipConfig // 生产环境地址
}

export {
  baseUrl
}
