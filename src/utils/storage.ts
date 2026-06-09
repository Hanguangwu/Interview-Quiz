import type { Question } from '../types'

const DEFAULT_FILE_PATH = `${import.meta.env.BASE_URL}data/questions.json`

/**
 * 从 JSON 文件读取所有问题
 * 通过 Vite 的 BASE_URL 拼接路径，读取 public/data/questions.json
 */
export async function readQuestions(filePath?: string): Promise<Question[]> {
  const path = filePath || DEFAULT_FILE_PATH
  try {
    const response = await fetch(path)
    if (!response.ok) {
      throw new Error(`Failed to read questions: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.warn('读取问题数据失败，返回空数组:', error)
    return []
  }
}

/**
 * 将问题列表写入 JSON 文件
 * 通过 Vite 的 ?raw 或 API 写入数据
 * 本地开发环境通过 localStorage 模拟持久化
 */
export async function writeQuestions(questions: Question[], filePath?: string): Promise<void> {
  const path = filePath || DEFAULT_FILE_PATH
  try {
    // 在浏览器环境中，无法直接写入文件系统
    // 使用 localStorage 作为持久化方案
    localStorage.setItem('quiz_questions', JSON.stringify(questions))
    localStorage.setItem('quiz_questions_path', path)
    console.log(`数据已保存到 localStorage (模拟 ${path})`)
  } catch (error) {
    console.error('保存问题数据失败:', error)
    throw error
  }
}

/**
 * 读取本地存储的问题数据（回退方案）
 */
export function readQuestionsFromLocal(): Question[] {
  try {
    const data = localStorage.getItem('quiz_questions')
    if (data) {
      return JSON.parse(data)
    }
  } catch (error) {
    console.warn('从 localStorage 读取失败:', error)
  }
  return []
}

/**
 * 初始化数据：优先从 localStorage 读取，否则从 JSON 文件加载
 */
export async function initializeQuestions(jsonFilePath?: string): Promise<Question[]> {
  // 先检查 localStorage 是否有数据
  const localData = readQuestionsFromLocal()
  if (localData.length > 0) {
    return localData
  }

  // 否则从 JSON 文件读取
  const fileData = await readQuestions(jsonFilePath)
  if (fileData.length > 0) {
    // 同步到 localStorage
    await writeQuestions(fileData, jsonFilePath)
  }
  return fileData
}
