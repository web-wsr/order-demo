import { defineStore } from 'pinia'

export const useStore = defineStore('main', {
  state: () => {
    return {
      userInfo: {
        id: 1,
        nickname: 'Jax',
        avatar_url: 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png',
        mark_total: 700
      }
    }
  },
  actions: {
    USERINFO(userInfo) {
      this.userInfo = userInfo
    }
  }
})

export default useStore
