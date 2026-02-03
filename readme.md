# 📅 CalendarGenie - 智能日程提取与创建工具 ✨

> 将自然语言转化为精确日程，瞬间整理你的时间安排

![GitHub stars](https://img.shields.io/github/stars/yourusername/CalendarGenie?style=social)
![GitHub license](https://img.shields.io/github/license/yourusername/CalendarGenie)
![Raycast Extension](https://img.shields.io/badge/Raycast-Extension-blue)

<p align="center">
  <img src="assets/calendar-genie-demo.gif" alt="CalendarGenie Demo" width="80%">
</p>

## 🪄 魔法般的体验

你是否曾经收到过这样的消息？

> "下周二下午3点我们在会议室讨论Q3计划，周五上午10点和客户开视频会议，别忘了下下周一早上9点的团队早会"

手动创建这些日程是如此繁琐...直到现在！

**CalendarGenie** 借助先进的AI技术，能够从任何文本中智能识别时间安排，并将其直接添加到你的"收件箱"日历中，让你的日程管理变得轻松无比。

## ✨ 主要特点

- 🧠 智能识别文本中的多个日程安排
- 🗓️ 自动提取日期、时间、标题和地点
- ⚡️ 一键将所有识别的日程添加到"收件箱"日历
- 🔍 处理模糊时间表述（"明天"、"下周"、"月底"等）
- 📝 保留原始描述作为日程备注
- 🌐 支持多语言输入（中文、英文等）
- 🔒 安全本地处理，保护你的隐私

## 🚀 安装指南

### 前提条件

- [Raycast](https://raycast.com/) 已安装
- macOS 系统

### 安装步骤

1. 在 Raycast 中搜索 "Store"
2. 搜索 "CalendarGenie"
3. 点击 "安装"

或者通过 npm 手动安装:

```bash
npm install -g @raycast/api
git clone https://github.com/yourusername/CalendarGenie.git
cd CalendarGenie
npm install
npm run dev
```

## 🎯 使用方法

1. 复制 `.env.example` 文件为 `.env`：
   ```bash
   cp .env.example .env
1. 在 Raycast 中输入 "Calendar Genie"
2. 粘贴或输入包含日程信息的文本（如邮件、消息或会议纪要）
3. 按下回车，让魔法发生
4. 确认识别的日程信息
5. 完成！所有日程将自动添加到你的"收件箱"日历

<p align="center">
  <img src="assets/calendar-genie-flow.png" alt="使用流程" width="80%">
</p>

## 💡 示例

### 输入:
```
明天下午3点和市场团队开会讨论Q4营销计划，地点在会议室A。
后天早上9:30我需要参加线上产品评审，链接将提前发送。
下周五12:00和David吃午饭，地点待定。
```

### 输出:
CalendarGenie 将自动创建3个日历事件:
1. "Q4营销计划讨论" - 明天下午3:00，地点：会议室A
2. "线上产品评审" - 后天上午9:30，地点：线上会议
3. "与David的午餐" - 下周五12:00，地点：待定

## ⚙️ 技术细节

CalendarGenie 可使用 OpenRouter 或火山引擎（豆包）模型来分析文本并提取结构化的日程信息。工作流程如下:

1. 用户输入文本被发送到 OpenRouter 或火山引擎 API
2. 模型分析文本并返回结构化的JSON数据
3. 脚本解析JSON并提取所有日程信息
4. 使用 AppleScript 将日程添加到macOS "收件箱"日历中

整个过程通常在几秒钟内完成，取决于文本的复杂程度。

## 🛡️ 隐私说明

我们重视您的隐私:
- 所有文本处理通过 OpenRouter API 进行，遵循其隐私政策
- 日历事件创建完全在本地进行
- 不存储或收集任何用户数据
- 不需要日历访问权限之外的任何额外权限

## 🔮 未来计划

我们正在开发以下功能:

- 📱 支持从剪贴板自动获取文本
- 🌈 自定义日历选择
- 🔔 智能提醒设置
- 🔄 双向同步功能
- 🌐 更多语言支持优化
- 🧩 与更多生产力工具集成

## 🤝 贡献指南

欢迎贡献！如果您有任何想法或改进建议:

1. Fork 此仓库
2. 创建您的功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开一个 Pull Request

## 📜 许可证

该项目采用 MIT 许可证 - 详情请参阅 [LICENSE](LICENSE) 文件

## 🙏 致谢

- [OpenRouter](https://openrouter.ai/) 提供强大的AI模型接口
- [火山引擎](https://www.volcengine.com/) 提供豆包模型接口
- [Raycast Team](https://raycast.com/) 提供卓越的扩展平台
- 所有测试和反馈的早期用户

---

<p align="center">
  用 ❤️ 打造于 Silicon Valley
</p>

<p align="center">
  <a href="https://twitter.com/yourusername">Twitter</a> •
  <a href="https://github.com/yourusername">GitHub</a>
</p>
