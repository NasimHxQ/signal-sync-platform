import { writeFileSync, appendFileSync, existsSync } from "fs"
import { join } from "path"

export interface LogEntry {
  ts: string
  level: "info" | "warn" | "error" | "debug"
  reqId?: string
  path?: string
  method?: string
  durationMs?: number
  status?: number
  msg: string
  data?: Record<string, unknown>
}

class Logger {
  private logFile: string

  constructor() {
    // Create logs directory if it doesn't exist
    const logsDir = join(process.cwd(), "logs")
    this.logFile = join(logsDir, "signal-sync.log")
    
    // Ensure logs directory exists
    try {
      const fs = require("fs")
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true })
      }
    } catch (error) {
      console.error("Failed to create logs directory:", error)
    }
  }

  private writeLog(entry: LogEntry) {
    const logLine = JSON.stringify({
      ...entry,
      ts: new Date().toISOString(),
    }) + "\n"

    try {
      // Write to file
      appendFileSync(this.logFile, logLine)
      
      // Also log to console in development
      if (process.env.NODE_ENV === "development") {
        const consoleMsg = `[${entry.level.toUpperCase()}] ${entry.msg}`
        switch (entry.level) {
          case "error":
            console.error(consoleMsg, entry.data || "")
            break
          case "warn":
            console.warn(consoleMsg, entry.data || "")
            break
          case "debug":
            console.debug(consoleMsg, entry.data || "")
            break
          default:
            console.log(consoleMsg, entry.data || "")
        }
      }
    } catch (error) {
      // Fallback to console if file write fails
      console.error("Failed to write to log file:", error)
      console.log(logLine.trim())
    }
  }

  info(msg: string, data?: Record<string, unknown>, reqId?: string) {
    this.writeLog({ level: "info", msg, data, reqId, ts: "" })
  }

  warn(msg: string, data?: Record<string, unknown>, reqId?: string) {
    this.writeLog({ level: "warn", msg, data, reqId, ts: "" })
  }

  error(msg: string, data?: Record<string, unknown>, reqId?: string) {
    this.writeLog({ level: "error", msg, data, reqId, ts: "" })
  }

  debug(msg: string, data?: Record<string, unknown>, reqId?: string) {
    this.writeLog({ level: "debug", msg, data, reqId, ts: "" })
  }

  // Request logging helper
  request(
    reqId: string,
    method: string,
    path: string,
    status: number,
    durationMs: number,
    data?: Record<string, unknown>
  ) {
    this.writeLog({
      level: "info",
      reqId,
      method,
      path,
      status,
      durationMs,
      msg: `${method} ${path} ${status} ${durationMs}ms`,
      data: this.redactSensitiveData(data),
      ts: "",
    })
  }

  private redactSensitiveData(data?: Record<string, unknown>): Record<string, unknown> | undefined {
    if (!data) return data

    const sensitiveKeys = ["password", "token", "key", "secret", "credentials", "auth"]
    const redacted = { ...data }

    for (const key in redacted) {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        redacted[key] = "[REDACTED]"
      }
    }

    return redacted
  }
}

export const logger = new Logger()

// Request ID generator
export function generateRequestId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
