// 支付结果
export const PAY_STATUS_PENDING = 0
export const PAY_STATUS_SUCCESS = 1
export const PAY_STATUS_FAILED = 2

// 订单类型
export const ORDER_TYPE_COURSE = 1
export const ORDER_TYPE_CAMP = 2
export const ORDER_TYPE_BIBLE = 3
export const ORDER_TYPE_VIP = 4
export const ORDER_TYPE_COURSE_SERIES = 5
export const ORDER_TYPE_DECORATION = 6

export const ORDER_TYPE = {
  [ORDER_TYPE_COURSE]: '课程',
  [ORDER_TYPE_CAMP]: '实战营',
  [ORDER_TYPE_BIBLE]: '宝典',
  [ORDER_TYPE_VIP]: 'VIP',
  [ORDER_TYPE_COURSE_SERIES]: '体系课',
  [ORDER_TYPE_DECORATION]: '家装设计'
}

// 支付方式
export const PAY_METHOD_WECHAT = 1
export const PAY_METHOD_ALIPAY = 2
export const PAY_METHOD_HEART = 3

export const PAY_METHOD = {
  [PAY_METHOD_WECHAT]: '微信支付',
  [PAY_METHOD_ALIPAY]: '支付宝支付',
  [PAY_METHOD_HEART]: '暖心兑换'
}

export const PAY_STATUS_ICON = {
  [PAY_STATUS_PENDING]: 'pending-icon',
  [PAY_STATUS_SUCCESS]: 'success-icon',
  [PAY_STATUS_FAILED]: 'fail-icon'
}

export const PAY_STATUS_DISPLAY = {
  [PAY_STATUS_PENDING]: '等待支付中...',
  [PAY_STATUS_SUCCESS]: '支付成功',
  [PAY_STATUS_FAILED]: '支付失败'
}

export const PAY_STATUS_ACTION_DISPLAY = {
  [PAY_STATUS_PENDING]: '我已支付',
  [PAY_STATUS_SUCCESS]: '手动跳转',
  [PAY_STATUS_FAILED]: '返回结算台'
}
