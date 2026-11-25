---
name: SmartEnergy 电能监测网关
model: SE-12
category: power
summary: 单相与三相电能采集网关，Modbus 与 MQTT 双协议输出，适合工厂车间与商业楼宇的分项计量。
cover: /decap-cms-test/uploads/product-placeholder.svg
features:
  - title: 双协议并存
    detail: 下行 Modbus RTU 采集，上行 MQTT 推送，旧设备无需改造
  - title: 断网缓存
    detail: 网络恢复后自动补传，数据不丢点
  - title: 本地告警
    detail: 阈值越限在设备侧直接输出干接点，不等云端
specs:
  - label: 主控
    value: ESP32-S3
  - label: 计量通道
    value: 三相四线 ×1，可扩展
  - label: 通信
    value: RS485 / Modbus RTU，以太网，Wi-Fi
  - label: 上报协议
    value: MQTT / HTTP
  - label: 供电
    value: 220V AC
status: active
featured: true
order: 20
---

SmartEnergy 的定位是"不换表也能做分项计量"。现场已有电表只要支持 Modbus，网关负责把读数、需量、越限事件整理成结构化数据推给上层平台。

## 适用场景

- 工厂车间与产线的分项能耗考核
- 商业楼宇按租户计量
- 光伏与储能的本地侧数据接入

## 交付形态

标准品为导轨式安装；批量项目可调整通道数与通信组合，外壳与端子按客户配电柜规范改。
