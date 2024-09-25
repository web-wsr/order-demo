export default {
  addOrder: () => {
    return Promise.resolve({ no: Date.now(), created_at: new Date() })
  },
  orderCheck: () => {
    return Promise.resolve({ status: 1 })
  },
  payByAlipay: () => {
    return Promise.resolve({})
  },
  payByWechat: () => {
    return Promise.resolve({})
  },
  payByHeart: () => {
    return Promise.resolve({})
  },
  order: () => {
    return Promise.resolve({})
  },
  cancelOrder: () => {
    return Promise.resolve({ status: 2 })
  }
}
