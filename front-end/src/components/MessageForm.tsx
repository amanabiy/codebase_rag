import { Button, TextArea } from '@apideck/components'
import { useState } from 'react'
import { useMessages } from 'utils/useMessages'

const MessageForm = () => {
  const [content, setContent] = useState('')
  const { addMessage } = useMessages()

  const handleSubmit = async (e?: any) => {
    if (e?.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      addMessage(content)
      setContent('')
    }
  }

  return (
    <form className="relative mx-auto max-w-3xl rounded-t-xl" onSubmit={handleSubmit}>
      <div className=" border-gray-200 mb-2 rounded-t-xl backdrop-blur">
        <label htmlFor="content" className="sr-only">
          Your message
        </label>
        <div className="relative">
          <TextArea
            name="content"
            placeholder="Enter your message here..."
            rows={1}
            value={content}
            autoFocus
            className="!p-3 text-gray-900 border-0 ring-1 dark:ring-0 ring-gray-300/40 focus:ring-gray-300/80 focus:outline-none dark:text-white dark:placeholder-gray-400 dark:bg-gray-800/80 backdrop-blur shadow-none w-full"
            onChange={(e: any) => setContent(e.target.value)}
            onKeyDown={(e: any) => handleSubmit(e)}
          />
          <Button className="bg-blue-500 absolute right-3 bottom-3 " type="submit" size="small">
            Send
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4 ml-1"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
              />
            </svg>
          </Button>
        </div>
      </div>
    </form>
  )
}

export default MessageForm
