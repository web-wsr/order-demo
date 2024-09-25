<!-- <template>
  <main>
    <ul>
      <li><a href="/order/type/1/resource/1">视频课订单测试入口</a></li>
      <li><a href="/order/type/4/resource/4">VIP订单测试入口</a></li>
      <li><a href="/order/type/5/resource/5">系列课订单测试入口</a></li>
    </ul>
  </main>
</template> -->
<template>
  <main>
    <ul>
      <li>
        <router-link :to="{ name: 'order', params: { resourceType: 1, resourceId: 1 }}">视频课订单测试入口</router-link>
      </li>
      <li>
        <router-link :to="{ name: 'order', params: { resourceType: 4, resourceId: 4 }}">VIP订单测试入口</router-link>
      </li>
      <li>
        <router-link :to="{ name: 'order', params: { resourceType: 5, resourceId: 5 }}">系列课订单测试入口</router-link>
      </li>
    </ul>
  </main>
</template>
