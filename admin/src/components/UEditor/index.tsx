import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import './index.css'

// 编辑器实例类型定义
interface UEditorInstance {
  getContent: () => string
  setContent: (content: string, isAppendTo?: boolean) => void
  getContentTxt: () => string
  getPlainTxt: () => string
  hasContents: () => boolean
  focus: () => void
  blur: () => void
  isFocus: () => boolean
  destroy: () => void
}

// 组件Props类型定义
interface UEditorProps {
  onChange?: (content: string) => void
  config?: any // UEditor配置项
  style?: React.CSSProperties
}

// 组件ref暴露的方法
export interface UEditorRef {
  setContent: (content: string) => void
  getContent: () => string
  getPlainContent: () => string
}

const UEditor = forwardRef<UEditorRef, UEditorProps>(({ onChange, config = {}, style }, ref) => {
  const editorRef = useRef<UEditorInstance | null>(null)
  const [isReady, setIsReady] = useState(false)
  const editorId = useRef(`editor_${Math.random().toString(36).slice(2)}`).current

  // 初始化编辑器
  useEffect(() => {
    // 确保UE对象存在
    let editor: any | null = null
    const timer = setTimeout(() => {
      if (typeof window.UE !== 'undefined') {
        editor = window.UE.getEditor(editorId, {
          initialFrameWidth: '100%',
          initialFrameHeight: 400,
          autoHeightEnabled: true,
          autoFloatEnabled: true,
          ...config
        })

        editor.ready(() => {
          editorRef.current = editor
          setIsReady(true)
        })

        editor.addListener('contentChange', () => {
          onChange?.(editor?.getContent() || '')
        })
      }
    }, 100)

    return () => {
      clearTimeout(timer)
      if (editor) {
        try {
          editor.destroy()
          editorRef.current = null
          setIsReady(false)
        } catch (e) {
          console.error('UEditor destroy error:', e)
        }
      }
    }
  }, [])

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    setContent: (content: string) => {
      if (editorRef.current) {
        editorRef.current.setContent(content)
      }
    },
    getContent: () => {
      if (editorRef.current) {
        return editorRef.current.getContent()
      }
      return ''
    },
    getPlainContent: () => {
      if (editorRef.current) {
        return editorRef.current.getPlainTxt()
      }
      return ''
    }
  }))

  return (
    <div style={{ width: '100%', ...style }}>
      {/* 编辑器容器 */}
      <div id={editorId}></div>

      {/* 加载状态 */}
      {!isReady && (
        <div className="editor-loading">
          <span>编辑器加载中...</span>
        </div>
      )}
    </div>
  )
})

export default UEditor
