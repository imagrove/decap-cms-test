---
name: TelePilot 远传遥控终端
model: TP-L1
category: connectivity
summary: 面向户外设备的 LoRa 远传遥控与遥测终端，内置本地逻辑，链路中断时仍按预设策略继续执行
cover: /decap-cms-test/uploads/product-placeholder.svg
gallery:
  - /decap-cms-test/uploads/product-placeholder.svg
features:
  - title: 断链兜底
    detail: 与主机失联后按预设动作继续运行，不依赖云端在线
  - title: 双链路设计
    detail: LoRa 承担数据，Wi-Fi 用于现场配置与应急接管
  - title: 宽压输入
    detail: 9–36V DC 供电，适配工业控制柜与车载电源
specs:
  - label: 主控
    value: ESP32-S3
  - label: 无线
    value: LoRa 470 / 868 / 915 MHz（按区域选型）
  - label: 接口
    value: RS485 ×1，继电器输出 ×2
  - label: 供电
    value: 9–36V DC
  - label: 工作温度
    value: -20 ~ 70 °C
moq: 50 台
lead_time: 4–6 周
status: active
featured: true
order: 10
---

TelePilot 解决的是"现场没有可靠网络，但设备必须继续按规则动作"的问题。遥控指令与设备状态通过 LoRa 传输，配置和固件升级走 Wi-Fi，两条链路互不占用。

## 适用场景

- 山地、林地等无公网覆盖区域的泵站与闸门控制
- 厂区内跨车间、跨楼栋的分散设备联动
- 临时施工现场的远程启停

## 定制边界

外壳、接口定义与天线方案可按项目调整；主控与射频方案保持平台化，避免每个项目重做认证。
