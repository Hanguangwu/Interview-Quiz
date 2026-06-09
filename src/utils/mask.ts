export interface MaskResult {
  version1: string
  version2: string
}

/**
 * 对文本进行遮蔽处理，生成两个互补的遮蔽版本。
 *
 * 算法说明：
 * 以 interval 为单位将文本分组，在每个分组中：
 *   - V1: 遮蔽组内第 1 个字符，保留其余字符
 *   - V2: 保留组内第 1 个字符，遮蔽其余字符
 * 两个版本合起来即为完整的原文。
 *
 * @param text      原始文本
 * @param character 遮蔽字符（如 "X"、"——"）
 * @param interval  遮蔽间隔（1-6）
 * @returns 两个互补的遮蔽版本
 */
export function maskText(text: string, character: string, interval: number): MaskResult {
  if (interval < 1) interval = 1
  if (text.length === 0) return { version1: '', version2: '' }

  const chars1: string[] = []
  const chars2: string[] = []

  for (let i = 0; i < text.length; i++) {
    const posInGroup = i % interval
    // 组内第 1 个字符 (pos === 0) → V1 遮蔽, V2 保留
    // 组内其余字符 (pos !== 0) → V1 保留, V2 遮蔽
    if (posInGroup === 0) {
      chars1.push(character)
      chars2.push(text[i])
    } else {
      chars1.push(text[i])
      chars2.push(character)
    }
  }

  return {
    version1: chars1.join(''),
    version2: chars2.join(''),
  }
}

/**
 * 从 HTML 中提取纯文本
 */
export function stripHtml(html: string): string {
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent || div.innerText || ''
}
