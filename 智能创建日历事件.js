#!/usr/bin/env node

// Required parameters:
// @raycast.schemaVersion 1
// @raycast.title 智能创建日历事件
// @raycast.mode fullOutput
// @raycast.packageName 日历工具

// Optional parameters:
// @raycast.icon 📅
// @raycast.argument1 { "type": "text", "placeholder": "描述你的日程...", "optional": false }

// Documentation:
// @raycast.description 根据自然语言描述创建日历事件
// @raycast.author shylock
// @raycast.authorURL https://github.com/shylock

const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const execPromise = promisify(exec);

// 从环境变量或配置文件读取配置
function getConfig() {
  const config = {
    apiKey: null,
    model: 'google/gemini-2.0-flash-001' // 默认模型
  };
  
  // 首先尝试从环境变量读取
  if (process.env.OPENROUTER_API_KEY) {
    config.apiKey = process.env.OPENROUTER_API_KEY;
  }
  if (process.env.AI_MODEL) {
    config.model = process.env.AI_MODEL;
  }
  
  // 如果环境变量不存在，尝试从 .env 文件读取
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    for (const line of lines) {
      const [key, value] = line.split('=');
      if (key && value) {
        const trimmedKey = key.trim();
        const trimmedValue = value.trim();
        if (trimmedKey === 'OPENROUTER_API_KEY' && !config.apiKey) {
          config.apiKey = trimmedValue;
        } else if (trimmedKey === 'AI_MODEL') {
          config.model = trimmedValue;
        }
      }
    }
  }
  
  if (!config.apiKey) {
    throw new Error('未找到 OPENROUTER_API_KEY。请在 .env 文件中设置或作为环境变量提供。');
  }
  
  return config;
}

async function main() {
  try {
    // 获取配置
    const config = getConfig();
    const OPENROUTER_API_KEY = config.apiKey;
    const AI_MODEL = config.model;
    
    console.log(`使用模型: ${AI_MODEL}`);
    
    const userInput = process.argv.slice(2).join(" ");
    
    if (!userInput) {
      console.log("请提供日程描述");
      return;
    }
    
    console.log("处理中，请稍候...");
    console.log("用户输入:", userInput);
    
    // 清理用户输入，移除或转义可能导致问题的特殊字符（只是针对特殊的例子，不全面）
    const sanitizedInput = userInput.replace(/●/g, '').trim();
    console.log("清理后的输入:", sanitizedInput);
    
    // 获取当前日期时间，针对中国东八区(UTC+8)进行优化
    const currentDate = new Date().toLocaleString('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
    }).replace(/\//g, '-');

    console.log(`当前日期时间: ${currentDate}`);
    
    // 构建 prompt
    const prompt = `将用户输入的内容转换为符合以下 JSON schema 的纯粹 JSON 数组用来作为在 mac 日历中通过 apple script 创建日程的原始信息，仅返回严格格式的 JSON 数据，不包含多余字符或标点，确保格式正确。
1. 如果未提供时间，使用当前日期（"${currentDate}"）和当前小时作为开始时间，持续时间为 1 小时。
2. 如果只提供了开始日期而未提供结束日期，默认将结束日期设置为与开始日期相同。
3. 用户输入的原始内容作为 description
用户输入: "${sanitizedInput}"

JSON Schema:
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "array",
  "items": {
    "type": "object",
    "required": ["summary", "startDate", "endDate", "description"],
    "properties": {
      "summary": {
        "type": "string",
        "description": "Brief summary of the event"
      },
      "startDate": {
        "type": "string",
        "description": "Start date and time in YYYY-MM-DD HH:MM:SS format",
        "pattern": "^\\\\d{4}-\\\\d{2}-\\\\d{2} \\\\d{2}:\\\\d{2}:\\\\d{2}$",
        "examples": ["2025-03-13 17:25:00"]
      },
      "endDate": {
        "type": "string",
        "description": "End date and time in YYYY-MM-DD HH:MM:SS format",
        "pattern": "^\\\\d{4}-\\\\d{2}-\\\\d{2} \\\\d{2}:\\\\d{2}:\\\\d{2}$",
        "examples": ["2025-03-13 21:00:00"]
      },
      "description": {
        "type": "string",
        "description": "用户输入的原始内容"
      }
    },
    "additionalProperties": false
  },
  "minItems": 1,
  "uniqueItems": true
}`;

    // 使用 JSON.stringify 正确处理 API 请求体
    const requestBody = JSON.stringify({
      "model": AI_MODEL,
      "messages": [
        {
          "role": "user",
          "content": prompt
        }
      ]
    });

    // 构建 curl 命令
    const curlCommand = `curl -s https://openrouter.ai/api/v1/chat/completions \\
      -H "Content-Type: application/json" \\
      -H "Authorization: Bearer ${OPENROUTER_API_KEY}" \\
      -d '${requestBody}'`;

    console.log("调试: 准备执行API请求...");
    // 为了调试可以打印部分curl命令（不包括API密钥）
    console.log("curl命令前50个字符:", curlCommand.substring(0, 50) + "...");

    // 执行 curl 请求
    const { stdout, stderr } = await execPromise(curlCommand);
    
    if (stderr) {
      console.error("curl命令执行错误:", stderr);
    }
    
    console.log("API原始响应:", stdout);
    
    // 检查stdout是否为空或无效
    if (!stdout || stdout.trim() === "") {
      throw new Error("API返回为空");
    }
    
    // 尝试解析API响应
    let response;
    try {
      response = JSON.parse(stdout);
      console.log("API响应解析成功");
    } catch (e) {
      console.error("API响应解析失败:", e.message);
      console.error("响应内容:", stdout);
      throw new Error("无法解析API响应");
    }
    
    // 检查response结构
    if (!response || !response.choices || !response.choices[0]) {
      console.error("API响应格式错误:", stdout);
      throw new Error("API响应格式不符合预期");
    }
    
    // 提取 AI 生成的 JSON 内容
    const aiContent = response.choices[0].message.content;
    console.log("AI返回内容:", aiContent);
    
    // 解析 AI 返回的 JSON 数据
    let events;
    try {
      // 尝试直接解析
      events = JSON.parse(aiContent);
      console.log("AI返回JSON解析成功");
    } catch (e) {
      console.error("直接解析AI返回JSON失败:", e.message);
      // 如果直接解析失败，尝试提取 JSON 部分
      console.log("尝试提取JSON部分...");
      const jsonMatch = aiContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          events = JSON.parse(jsonMatch[0]);
          console.log("提取JSON部分解析成功");
        } catch (e2) {
          console.error("提取JSON部分后解析仍失败:", e2.message);
          throw new Error("无法解析AI返回的JSON数据");
        }
      } else {
        console.error("未能找到有效的JSON数据");
        throw new Error("无法提取AI返回的JSON数据");
      }
    }
    
    if (!Array.isArray(events) || events.length === 0) {
      console.error("AI返回的数据不是有效数组或为空数组");
      throw new Error("AI未返回有效的事件数据");
    }
    
    console.log(`AI解析完成，识别到 ${events.length} 个事件，事件数据:`, JSON.stringify(events, null, 2));
    console.log("正在创建日历事件...");
    
    // 为每个事件创建 AppleScript 命令
    for (const event of events) {
      const { summary, startDate, endDate, description } = event;
      
      console.log("处理事件:", summary);
      console.log("  开始时间:", startDate);
      console.log("  结束时间:", endDate);
      
      const appleScript = `
      tell application "Calendar"
        set inbox to first calendar whose name is "收件箱"
        
        set startDate to (date "${startDate}")
        set endDate to (date "${endDate}")
        
        tell inbox
          make new event with properties {summary:"${summary.replace(/"/g, '\\"')}", start date:startDate, end date:endDate, description:"${description.replace(/"/g, '\\"')}"}
        end tell
      end tell
      `;
      
      console.log("执行AppleScript...");
      
      try {
        const { stdout: scriptOut, stderr: scriptErr } = await execPromise(`osascript -e '${appleScript}'`);
        
        if (scriptErr) {
          console.error(`创建事件 "${summary}" 时出错:`, scriptErr);
        } else {
          console.log(`成功创建事件: "${summary}"`);
          console.log(`开始时间: ${startDate}`);
          console.log(`结束时间: ${endDate}`);
          console.log(`描述: ${description}`);
          if (scriptOut) {
            console.log("AppleScript输出:", scriptOut);
          }
          console.log("------------------------");
        }
      } catch (scriptError) {
        console.error(`执行AppleScript时发生错误:`, scriptError.message);
        if (scriptError.stderr) {
          console.error("AppleScript错误详情:", scriptError.stderr);
        }
      }
    }
    
    console.log("所有日历事件已创建完成!");
    
  } catch (error) {
    console.error("错误:", error.message);
    if (error.stderr) {
      console.error("详细错误信息:", error.stderr);
    }
    if (error.stack) {
      console.error("错误堆栈:", error.stack);
    }
  }
}

main();
