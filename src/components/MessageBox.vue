<script setup>
import DEFAULT_IMG from 'images/common/deleteConfirm.svg'
const emits = defineEmits(['close', 'confirm', 'cancelMethod'])
const props = defineProps({
  width: {
    type: Number,
    default: 672
  },
  height: {
    type: Number,
    default: 370
  },
  img: {
    type: String,
    default: DEFAULT_IMG
  },
  imgWidth: {
    type: Number,
    default: 64
  },
  imgHeight: {
    type: Number,
    default: 64
  },
  content: {
    type: String,
    default: '这是弹框内容'
  },
  notificationCount: {
    type: Number,
    default: 0
  },
  showWidgetNotification: {
    type: Boolean,
    default: false
  },
  showCloseBtn: {
    type: Boolean,
    default: true
  },
  showCancelBtn: {
    type: Boolean,
    default: true
  },
  showConfirmBtn: {
    type: Boolean,
    default: true
  },
  cancelBtnText: {
    type: String,
    default: '取消'
  },
  confirmBtnIcon: {
    type: String,
    default: ''
  },
  confirmBtnText: {
    type: String,
    default: '确定'
  },
  bodyClass: {
    type: String,
    default: ''
  },
  maskCancel: {
    type: Boolean,
    default: true
  }
})
function notification() {
  emits('close')
  emits('confirm', 'notification')
}
function handleConfirm() {
  emits('close')
  emits('confirm', 'confirm')
}
function other() {
  emits('close')
  emits('cancelMethod')
}
function cancel() {
  emits('close')
}
</script>
<template>
  <div class="message-box">
    <div class="message-mask" @click="maskCancel && cancel()" />
    <div
      class="message-modal common-section-wrap common-ladder-2"
      :style="{ width: width + 'px', height: height + 'px' }"
    >
      <div class="common-ladder-2__block" />
      <div v-if="showWidgetNotification" class="widget-notification" @click="notification">
        <i class="notification__icon" />
        <span class="notification__text notification__text--green">{{ notificationCount }}</span>
        <span class="notification__text">条未读</span>
      </div>
      <i v-if="showCloseBtn" class="close-icon" @click="cancel" />
      <div :class="['message-modal-body', bodyClass]">
        <img
          :src="img"
          :style="{
            width: imgWidth + 'px',
            height: imgHeight + 'px'
          }"
        />
        <p v-html="content" />
      </div>
      <div v-if="showCancelBtn || showConfirmBtn" class="message-modal-footer">
        <button v-if="showCancelBtn" class="btn-default" @click="other">
          {{ cancelBtnText }}
        </button>
        <button v-if="showConfirmBtn" class="btn-primary btn-confirm" @click="handleConfirm">
          <icon-svg v-if="confirmBtnIcon" :class-name="confirm - icon" :name="confirmBtnIcon" />{{
            confirmBtnText
          }}
        </button>
      </div>
    </div>
  </div>
</template>
<style lang="less" scoped>
.message-box {
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  z-index: 9999;

  .message-mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #00000066;
  }

  .message-modal {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 672px;
    height: 370px;
    padding-top: 40px;
    background: #ffffff;
    z-index: 1;
    border: none;

    .close-icon {
      position: absolute;
      top: 12px;
      right: 10px;
      display: block;
      width: 14px;
      height: 14px;
      mask-image: url('@/assets/images/btn/close.svg');
      mask-size: cover;
      cursor: pointer;
      background: rgba(0, 0, 0, 0.6);

      &:hover {
        background: rgba(0, 0, 0, 1);
      }
    }

    .message-modal-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      align-items: center;
      padding: 0 7%;
      height: 55%;

      img {
        height: 50%;
      }

      p {
        line-height: 50px;
        font-size: 30px;
        font-weight: 400;
        color: #14af64;
        text-align: center;
      }
    }

    .message-modal-footer {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 130px;

      button {
        width: 206px;
        height: 50px;
        line-height: 50px;
        font-weight: 600;
        font-size: 16px;
        text-align: center;
        cursor: pointer;
        border: none;

        .confirm-icon {
          font-size: 42px;
        }

        &.btn-default {
          background: url('@/assets/images/btn/dialog-btn-white.svg') no-repeat;
          background-size: 206px 50px;
          color: #000000;
        }

        &.btn-primary {
          background: url('@/assets/images/btn/dialog-btn-green.svg') no-repeat;
          background-size: 206px 50px;
          color: #ffffff;
        }

        &:not(:last-child) {
          margin-right: 12%;
        }
      }
    }
  }
}

.widget-notification {
  position: absolute;
  top: 12px;
  left: 28px;
  display: flex;
  align-items: center;
  cursor: pointer;

  .notification__icon {
    display: block;
    width: 24px;
    height: 24px;
    margin-right: 7px;
    background: url('@/assets/images/btn/notification.svg') no-repeat;
    background-size: 24px 24px;
  }

  .notification__text {
    font-size: 14px;
    line-height: 24px;
    color: #2c3330;

    &.notification__text--green {
      margin-right: 2px;
      color: #14af64;
      font-weight: 600;
    }
  }
}
</style>
