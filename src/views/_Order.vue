<script setup>
import { ref, onMounted, computed } from 'vue';
import { useStore } from '@/stores/index.js';
import { useRoute } from 'vue-router';
import { goPage } from '@/utils/routes';
import { ElMessage } from 'element-plus';
import router from '@/router';
import TheAvatar from '@/components/TheAvatar.vue';
import MessageBox from '@/components/MessageBox.vue';
import TheLoadingImage from '@/components/TheLoadingImage.vue';
import Countdown from '@/components/Countdown.vue';
import orderService from 'service/order';
import userService from 'service/user';
import courseService from 'service/course';
import vipService from 'service/vip';
import CAUTION_IMG from 'images/caution.png';

import {
  PAY_STATUS_PENDING,
  PAY_STATUS_SUCCESS,
  PAY_STATUS_FAILED,
  ORDER_TYPE_COURSE,
  ORDER_TYPE_COURSE_SERIES,
  ORDER_TYPE_VIP,
  ORDER_TYPE,
  PAY_METHOD_WECHAT,
  PAY_METHOD_ALIPAY,
  PAY_METHOD_HEART,
  PAY_STATUS_ICON,
  PAY_STATUS_DISPLAY,
  PAY_STATUS_ACTION_DISPLAY
} from '@/utils/const';

const store = useStore();
const route = useRoute();
const userInfo = computed(() => store.userInfo);

const loading = ref(true);
const payMethod = ref(0);
const order = ref({
  no: null,
  name: null,
  resource_id: null,
  resource_type: null,
  cancel_status: null,
  real_total_amount: null,
  total_heart_count: null,
  status: null,
  created_at: null,
});

const payStatusDialogVisible = ref(false);
const heartNotEnoughtDialogVisible = ref(false);
const messageBoxVisible = ref(false);
const messageBoxData = ref({});
const wechatQrcodeVisible = ref(false);
const wechatQrcodeImage = ref(null);
const routeCountDown = ref(5);

onMounted(() => {
  getData();
});

function getData() {
  let { resourceType, resourceId } = route.params;
  resourceType = Number(resourceType);
  resourceId = Number(resourceId);
  const orderResourcePromise = {
    [ORDER_TYPE_COURSE]: courseService.course,
    [ORDER_TYPE_COURSE_SERIES]: courseService.set,
    [ORDER_TYPE_VIP]: vipService.vipSku,
  };

  if(!Object.keys(orderResourcePromise).map(Number).includes(resourceType)) {
    return goPage('NotFound');
  }

  Promise.all([
    orderResourcePromise[resourceType](resourceId),
    orderService.order(resourceType, resourceId)
  ])
    .then(([resourceRes, orderRes]) => {
      order.value = {
        no: orderRes?.no,
        name: resourceRes.name,
        resource_id: resourceId,
        resource_type: resourceType,
        cancel_status: orderRes?.cancel_status,
        real_total_amount: orderRes?.real_total_amount || resourceRes.current_price,
        total_heart_count: orderRes?.total_heart_count || resourceRes.heart_count,
        status: orderRes?.status || PAY_STATUS_PENDING,
        created_at: orderRes?.created_at,
      };
    })
    .finally(() => {
      loading.value = false;
    });
}

function handleOrderPay() {
  if (!payMethod.value) {
    return ElMessage({ message: `请选择支付方式`, type: 'warning' });
  }
  const { resource_type, resource_id, name } = order.value;
  const orderNoPromise = order.value.no 
    ? () => Promise.resolve({ no: order.value.no  })
    : orderService.addOrder;
  loading.value = true;
  orderNoPromise({
      type: resource_type, 
      resource_id, 
      name: name + ' 购买'
    }).then(orderNoRes => {
    order.value = { ...order.value, ...orderNoRes };
    const no = order.value.no;
    if(payMethod.value == PAY_METHOD_WECHAT) {
      privateOrderPayByWechat(no);
    }
    if(payMethod.value == PAY_METHOD_ALIPAY) {
      privateOrderPayByAli(no);
    }
    if(payMethod.value == PAY_METHOD_HEART) {
      privateOrderPayByHeart();
    }
  }).finally(() => {
    loading.value = false;
  });
}

function handleOrderStatusCheck() {
  if (order.value.status === PAY_STATUS_FAILED) {
    payStatusDialogVisible.value = false;
    order.value.status = PAY_STATUS_PENDING;
  } else if (order.value.status === PAY_STATUS_SUCCESS) {
    privateOrderPaySuccess();
  } else {
    privateOrderPayCheck(true);
  }
}

function handleOrderCancel() {
  messageBoxData.value = {
    img: CAUTION_IMG,
    imgWidth: 150,
    imgHeight: 150,
    width: 670,
    showCloseBtn: false,
    content: `<p style='color:#2C3330;font-size:20px;line-height:28px;font-weight:600; margin-top: 8px;'>确认取消该笔订单？</p>`,
    confirmBtnText: '确认取消',
    cancelBtnText: '等等',
    showCancelBtn: true,
    maskCancel: false,
    confirm: privateOrderCancelByComfirm,
    cancelMethod: handleCloseMsgBox
  };
  messageBoxVisible.value = true;
}

function handleCloseMsgBox() {
  messageBoxData.value = {};
  messageBoxVisible.value = false;
}

function privateOrderPayByWechat(no) {
  loading.value = true;
  orderService.payByWechat(no).then((res) => {
    wechatQrcodeImage.value = res.qrcode;
    wechatQrcodeVisible.value = true;
    privateOrderPayCheck();
  })
  .finally(() => {
    loading.value = false;
  });
}

function privateOrderPayByAli(no) {
  let url = window.location.protocol + '//' + window.location.host;
  switch (order.value.resource_type) {
    case ORDER_TYPE_COURSE:
      url += router.resolve({
        name: 'AcademyCourseDetail',
        params: {
          id: order.value.resource_id
        }
      }).href;
      break;
    case ORDER_TYPE_COURSE_SERIES:
      url += router.resolve({
        name: 'AcademySeriesDetail',
        params: {
          id: order.value.resource_id
        }
      }).href;
      break;
    case ORDER_TYPE_VIP:
      url += router.resolve({
        name: 'MyPurchase'
      }).href;
      break;
    default:
      break;
  }
  orderService.payByAlipay(no, { return_url: url});
  payStatusDialogVisible.value = true;
  privateOrderPayCheck();
}

function privateOrderPayByHeart() {
  if (order.value.total_heart_count > userInfo.value.mark_total ) {
    heartNotEnoughtDialogVisible.value = true;
  } else {
    messageBoxData.value = {
      img: CAUTION_IMG,
      imgWidth: 150,
      imgHeight: 150,
      width: 670,
      showCloseBtn: false,
      content: `<p style='color:#2C3330;font-size:20px;line-height:28px;font-weight:600; margin-top: 8px;'>是否花费${order.value.total_heart_count}暖心兑换课程？</p>`,
      confirmBtnText: '确认兑换',
      cancelBtnText: '等等',
      showCancelBtn: true,
      maskCancel: false,
      confirm: privateOrderPayByHeartConfirm,
      cancelMethod: handleCloseMsgBox
    };
    messageBoxVisible.value = true;
  }
}

function privateOrderPayByHeartConfirm() {
  loading.value = true;
  orderService.payByHeart(order.value.no).then(() => {
    ElMessage({
      message: `${[PAY_METHOD_HEART].indexOf(payMethod.value) > -1 ? '兑换' : '支付'}成功`,
      type: 'success'
    });
    setTimeout(() => {
      messageBoxData.value = {};
      messageBoxVisible.value = false;
      privateOrderPaySuccess();
    }, 1000);
  }).finally(() => {
    loading.value = false;
  });
}

function privateOrderPayCheck(once = false) {
  const { no } = order.value;
  orderService.orderCheck(no).then((res) => {

    order.value.status = res.status;
    if(res.status === PAY_STATUS_SUCCESS) {
      wechatQrcodeVisible.value = false;
      payStatusDialogVisible.value = true;
      routeCountDown.value = 5;
      const timer = setInterval(() => {
        routeCountDown.value--;
        if (routeCountDown.value <= 0) {
          privateOrderPaySuccess();
          clearInterval(timer);
        }
      }, 1000);
      return;
    }

    if(res.status === PAY_STATUS_FAILED) {
      payStatusDialogVisible.value = true;
      wechatQrcodeVisible.value = false;
      return;
    }

    if(res.status === PAY_STATUS_PENDING) {
      if ((wechatQrcodeVisible.value || payStatusDialogVisible.value) && !once) {
        const timer = setTimeout(() => {
          privateOrderPayCheck();
          clearTimeout(timer);
        }, 1000 * 1);
      }
    }
  });
}

function privateOrderPaySuccess() {
  switch (order.value.resource_type) {
    case ORDER_TYPE_COURSE:
      goPage('AcademyCourseDetail', { id: order.value.resource_id });
      break;
    case ORDER_TYPE_COURSE_SERIES:
      goPage('AcademySeriesDetail', { id: order.value.resource_id });
      break;
    case ORDER_TYPE_VIP:
      userService.getUserInfo().then((userInfo) => {
        store.USERINFO({ ...userInfo });
      });
      goPage('MyPurchase', null, null, 'replace');
      break;
    default:
      break;
  }
}

function privateOrderCancelByComfirm() {
  orderService
    .cancelOrder(order.value.no)
    .then(() => {
      ElMessage({
        message: `订单已经取消`,
        type: 'success'
      });
    })
    .finally(() => {
      messageBoxData.value = {};
      messageBoxVisible.value = false;
      setTimeout(() => {
        goPage('MyPurchase');
      }, 1000);
    });
}

</script>
<template>
  <div v-loading="loading" class="order-page">
    <div class="page-header">
      <div class="page-header-left">
        <i class="page-header-logo" @click="() => goPage('Home', null, null, '_blank')"></i>
        <h4 class="page-header-title">结算台</h4>
      </div>
      <div class="page-header-right">
        <the-avatar
          :size="32"
          :url="userInfo.avatar_url"
          @click="() => goPage('MyClasses', null, null, '_blank')"
        />
      </div>
    </div>
    <div class="page-content">
      <div class="container-1180">
        <div class="page-content-commodity">
          <div
            v-if="order.no && order.status === PAY_STATUS_PENDING"
            class="page-content-tips common-ladder-1"
          >
            订单号：{{ order.no }} 请在<Countdown
              class="countdown"
              :created-time="
                new Date(order.created_at && order.created_at.replace(/-/g, '/')).valueOf() +
                24 * 60 * 60 * 1000
              "
              :show-unit-text="false"
              @update="order.cancel_status = 1"
            ></Countdown
            >内完成支付，超时订单将自动关闭
            <span @click="handleOrderCancel()">取消订单</span>
          </div>
          <h4 class="page-content-title">商品信息</h4>
          <ul class="commodity-table">
            <li class="table-th">
              <label v-if="order.cover_url" class="tb-pic">商品图</label>
              <label class="tb-name">商品名称</label>
              <label class="tb-type">类型</label>
              <label class="tb-price">单价</label>
              <label class="tb-count">数量</label>
              <label class="tb-sum">小计</label>
            </li>
            <li class="table-tr">
              <the-loading-image
                v-if="order.cover_url"
                class="tb-pic"
                :width="80"
                :height="80"
                :url="order.cover_url"
              />
              <label class="tb-name">
                <span class="commodity-name">{{ order.name }}</span>
              </label>
              <label class="tb-type">{{ORDER_TYPE[order.resource_type]}}</label>
              <label class="tb-price">
                <template v-if="order.real_total_amount > 0"> ¥{{ order.real_total_amount }} </template>
                <label v-if="order.total_heart_count" class="tb-price-heart">
                  <template v-if="order.real_total_amount > 0">或</template>
                  {{ order.total_heart_count }} <i class="heart-icon"></i>
                </label>
              </label>
              <label class="tb-count">1</label>
              <label class="tb-sum">¥{{ order.real_total_amount }}</label>
            </li>
          </ul>
        </div>

        <div class="page-content-pay">
          <h4 class="page-content-title">支付方式</h4>
          <div class="pay-list">
            <el-radio
              v-if="order.real_total_amount > 0"
              v-model="payMethod"
              class="pay-item"
              :label="PAY_METHOD_ALIPAY"
            >
              <div class="pay-item-left">
                <i class="alipay-icon"></i>
                <span class="pay-item-name">支付宝</span>
              </div>
            </el-radio>
            <el-radio
              v-if="order.real_total_amount > 0"
              v-model="payMethod"
              class="pay-item"
              :label="PAY_METHOD_WECHAT"
            >
              <div class="pay-item-left">
                <i class="wechat-icon"></i>
                <span class="pay-item-name">微信</span>
              </div>
            </el-radio>
            <el-radio
              v-if="order.total_heart_count > 0"
              v-model="payMethod"
              class="pay-item"
              :label="PAY_METHOD_HEART"
            >
              <div class="pay-item-left">
                <i class="heart-icon"></i>
                <span class="pay-item-name">使用暖心兑换</span>
              </div>
            </el-radio>
          </div>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <div class="page-footer-price">
        <template v-if="[PAY_METHOD_WECHAT, PAY_METHOD_ALIPAY].indexOf(payMethod) > -1">
          <span class="total">¥{{ order.real_total_amount }}</span>
          <span class="unit">元</span>
        </template>
        <template v-else-if="[PAY_METHOD_HEART].indexOf(payMethod) > -1">
          <span class="desc">暖心兑换</span>
          <span class="total">{{ order.total_heart_count }}</span>
          <i class="heart-icon"></i>
        </template>
      </div>
      <div class="page-footer-btn" @click="handleOrderPay">
        立即{{
          [PAY_METHOD_HEART].indexOf(payMethod) > -1 ||
          (order.total_heart_count > 0 && order.real_total_amount == 0)
            ? '兑换'
            : '支付'
        }}
      </div>
    </div>

    <el-dialog v-model="wechatQrcodeVisible" width="360px" :show-close="false">
      <img :src="wechatQrcodeImage" />
    </el-dialog>

    <el-dialog v-model="payStatusDialogVisible" class="status-dialog" width="380px" :show-close="false">
      <div class="status-dialog-top">
        <i
          :class="PAY_STATUS_ICON[order.status]"
        ></i>
        <h4 class="status-title">
          {{ PAY_STATUS_DISPLAY[order.status] }}
        </h4>
        <p v-if="order.status !== PAY_STATUS_PENDING" class="status-tips">
          {{ PAY_STATUS_SUCCESS ? routeCountDown + 's 后跳转' : '请检查订单支付状态' }}
        </p>
      </div>
      <div
        :class="['status-btn', order.status === PAY_STATUS_FAILED ? 'fail' : '']"
        @click="handleOrderStatusCheck"
      >
        {{  PAY_STATUS_ACTION_DISPLAY[order.status] }}
      </div>
    </el-dialog>


    <el-dialog v-model="heartNotEnoughtDialogVisible" class="heart-dialog" @close="heartNotEnoughtDialogVisible = false">
      <img src="~/images/order/close.svg" class="close" @click="heartNotEnoughtDialogVisible = false" />
      <img src="~/images/order/apply-dialog-heart-disabeld.svg" class="body__img" />
      暖心不足了 T T。<el-link
        class="body__description--green"
        :href="'https://daylab.feishu.cn/docs/doccnohbPVyA9FFaZG2EOp7Zs2d#NnQIoF'"
        target="_blank"
      >
        <img src="~/images/order/info.svg" class="info-icon" />
        去看看如何获取暖心
      </el-link>
      <div class="btn">
        <div class="button" @click="heartNotEnoughtDialogVisible = false">我知道了</div>
      </div>
    </el-dialog>

  </div>

  <MessageBox
    v-if="messageBoxVisible"
    :width="messageBoxData.width"
    :height="messageBoxData.height"
    :img="messageBoxData.img"
    :img-width="messageBoxData.imgWidth"
    :img-height="messageBoxData.imgHeight"
    :content="messageBoxData.content"
    :notification-count="messageBoxData.notificationCount"
    :show-widget-notification="messageBoxData.showWidgetNotification"
    :show-close-btn="messageBoxData.showCloseBtn"
    :show-cancel-btn="messageBoxData.showCancelBtn"
    :show-confirm-btn="messageBoxData.showConfirmBtn"
    :cancel-btn-text="messageBoxData.cancelBtnText"
    :confirm-btn-icon="messageBoxData.confirmBtnIcon"
    :confirm-btn-text="messageBoxData.confirmBtnText"
    :body-class="messageBoxData.bodyClass"
    :mask-cancel="messageBoxData.maskCancel"
    @cancel-method="messageBoxData.cancelMethod"
    @confirm="messageBoxData.confirm"
    @close="handleCloseMsgBox"
  />
</template>
<style lang="less" scoped>
@import '@/assets/styles/variable';
.order-page {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: #fff;
  .page-header {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 40px;
    height: 80px;
    border-bottom: 1px solid #efefef;
    .page-header-left {
      display: flex;
      align-items: center;
      .page-header-logo {
        display: inline-block;
        width: 168px;
        height: 60px;
        background: url('/images/order/logo.svg') no-repeat center;
        cursor: pointer;
      }
      .page-header-title {
        margin-left: 16px;
        line-height: 20px;
        font-weight: 600;
        font-size: 20px;
        color: #2c3330;
      }
    }
    .page-header-right {
      cursor: pointer;
    }
  }
  .page-content {
    flex: 1;
    padding: 20px 0;
    .page-content-tips {
      display: flex;
      align-items: center;
      padding: 8px 10px;
      margin-bottom: 24px;
      font-size: 16px;
      color: #c6821c;
      background: #f8ecda;
      border: 2px solid#FFB03A;

      .countdown {
        width: fit-content;
        margin: 0;
        padding: 0;
        font-size: 16px;
        color: #d34609;
      }

      span {
        color: #d34609;
        text-decoration: underline;
        cursor: pointer;
      }
    }
    .page-content-title {
      margin-bottom: 24px;
      line-height: 34px;
      font-weight: 600;
      font-size: 24px;
      color: #2c3330;
    }
    .commodity-table {
      .table-th {
        display: flex;
        align-items: center;
        text-align: left;
        padding-bottom: 24px;
        line-height: 20px;
        font-size: 14px;
        color: #81948b;
        border-bottom: 1px solid #efefef;
      }
      .table-tr {
        display: flex;
        align-items: center;
        text-align: left;
        padding: 24px 0;
        line-height: 22px;
        font-size: 16px;
        color: #2c3330;
        border-bottom: 1px solid #efefef;
        .tb-name {
          display: flex;
          flex-direction: column;
          .commodity-name {
            line-height: 22px;
            font-weight: 600;
            font-size: 16px;
            color: #2c3330;
          }
          .commodity-time {
            display: inline-block;
            margin-top: 4px;
            line-height: 17px;
            font-size: 12px;
            color: #81948b;
          }
        }
      }
      .tb-pic {
        width: 80px;
        margin-right: 40px;
      }
      .tb-name {
        width: 460px;
        margin-right: 40px;
      }
      .tb-type,
      .tb-price {
        width: 120px;
        margin-right: 40px;
      }
      .tb-price {
        display: flex;
        flex-direction: column;
        .tb-price-heart {
          display: flex;
          align-items: center;
          line-height: 16px;
          font-weight: 400;
          color: #81948b;
          .heart-icon {
            margin-left: 4px;
            width: 16px;
            height: 16px;
          }
        }
      }
      .tb-count {
        width: 80px;
        margin-right: 40px;
      }
      .tb-sum {
        width: 120px;
      }
    }
    .page-content-pay {
      margin-top: 40px;
      .pay-list {
        display: flex;
        align-items: center;
        justify-content: space-between;
        .pay-item {
          display: flex;
          flex-direction: row-reverse;
          align-items: center;
          justify-content: space-between;
          width: 580px;
          height: auto;
          padding: 19px 29px 19px 19px;
          border: 1px solid #efefef;
          .el-radio__label {
            padding: unset;
          }
          .el-radio__input {
            &:not(.is_checked) {
              border-color: #cccccc;
            }
          }
          .el-radio__inner {
            width: 20px;
            height: 20px;
            border-width: 2px;
            &::after {
              width: 6px;
              height: 6px;
            }
          }
          .pay-item-left {
            display: flex;
            align-items: center;
            .alipay-icon,
            .wechat-icon,
            .heart-icon {
              display: inline-block;
              width: 40px;
              height: 40px;
              margin-right: 16px;
              background-size: cover;
              background-repeat: no-repeat;
            }
            .alipay-icon {
              background-image: url('images/order/alipay.svg');
            }
            .wechat-icon {
              background-image: url('images/order/wechat.svg');
            }
            .pay-item-name {
              line-height: 22px;
              font-size: 16px;
              color: #2c3330;
            }
          }
        }
        :deep(.is-focus),
        .is-checked {
          background-color: #eff9f4;
          border: 1px solid #14af64;
        }
      }
    }
  }

  .page-footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    height: 80px;
    background: @primaryColor;
    .page-footer-price {
      margin-right: 20px;
      color: #fff;
      .desc {
        display: inline-block;
        margin-right: 10px;
        line-height: 19px;
        vertical-align: super;
        font-weight: 400;
        color: #ffffff;
      }
      .total {
        line-height: 50px;
        font-weight: 600;
        font-size: 36px;
      }
      .unit {
        display: inline-block;
        margin-left: 8px;
        line-height: 22px;
        font-size: 16px;
      }
      .heart-icon {
        margin-left: 4px;
      }
    }
    .page-footer-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 370px;
      height: 100%;
      line-height: 34px;
      font-weight: 600;
      font-size: 24px;
      color: #ffffff;
      background: #7a55ff;
      cursor: pointer;
    }
  }
  :deep(.el-dialog) {
    .el-dialog__header {
      display: none;
    }
  }
  :deep(.status-dialog) {
    .el-dialog__body {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      height: 269px;
      padding: 40px 0;
      .status-dialog-top {
        display: flex;
        flex-direction: column;
        align-items: center;
        .pending-icon,
        .success-icon,
        .fail-icon {
          display: inline-block;
          width: 40px;
          height: 40px;
          margin-top: 8px;
          background-size: cover;
          background-repeat: no-repeat;
        }
        .pending-icon {
          width: 48px;
          height: 48px;
          margin-top: 0;
          background-image: url('images/order/pending.svg');
        }
        .success-icon {
          background-image: url('images/order/success.svg');
        }
        .fail-icon {
          background-image: url('images/order/fail.svg');
        }
        .status-title {
          margin-top: 16px;
          line-height: 24px;
          font-weight: 600;
          font-size: 24px;
          color: #2c3330;
        }
        .status-tips {
          margin-top: 8px;
          line-height: 17px;
          font-size: 12px;
          color: #81948b;
        }
      }
      .status-btn {
        padding: 7px 23px;
        line-height: 20px;
        font-weight: 600;
        font-size: 14px;
        color: @primaryColor;
        border: 1px solid @primaryColor;
        cursor: pointer;
        &.fail {
          color: #2c3330;
          border-color: #2c3330;
        }
      }
    }
  }

  :deep(.heart-dialog) {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 500px;
    height: 384px;
    background: #fff;

    .el-dialog__header {
        display: none;
    }
    .el-dialog__body {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      line-height: 28px;
      height: 100%;
      padding: 0 60px;
      font-size: 20px;
      font-weight: 600;
      color: #2c3330;

      .close {
        position: absolute;
        width: 20px;
        height: 20px;
        right: -80px;
        top: 12px;
        cursor: pointer;
      }

      img {
        width: 150px;
        height: 150px;
        margin-bottom: 8px;
      }

      .body__description--green {
        margin-top: 16px;
        color: #14af64;
        line-height: 28px;

        .el-link--inner {
          display: flex;
          align-items: center;
        }

        .info-icon {
          width: 14px;
          height: 14px;
          margin-right: 4px;
          margin-bottom: 0;
        }
      }

      .btn {
        display: flex;
      }

      .button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 204px;
        height: 50px;
        margin-top: 40px;
        font-size: 16px;
        font-weight: 500;
        color: #ffffff;
        cursor: pointer;
        background-image: url('images/order/btn_bg.svg');
        background-size: cover;
        background-repeat: no-repeat;

        &:active {
          background-image: url('images/order/btn_pressing.svg');
        }
      }
    }
  }
}

@media screen and (max-width: 1214px) {
  .container-1180 {
    width: 100% !important;
    padding: 0 40px;
  }
}
</style>
