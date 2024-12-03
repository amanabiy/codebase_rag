import { useToast } from '@apideck/components'
import { ChatCompletionRequestMessage } from 'openai'
import { ReactNode, createContext, useContext, useEffect, useState } from 'react'
import config from './config'

interface ContextProps {
  messages: ChatCompletionRequestMessage[]
  addMessage: (content: string) => Promise<void>
  isLoadingAnswer: boolean
  selectedRepo: string
  setSelectedRepo: (repo: string) => void
  initializeChat: (s: string) => void
}

const ChatsContext = createContext<Partial<ContextProps>>({})

export function MessagesProvider({ children }: { children: ReactNode }) {
  const { addToast } = useToast()
  const [messages, setMessages] = useState<ChatCompletionRequestMessage[]>([])
  const [isLoadingAnswer, setIsLoadingAnswer] = useState(false)
  const [selectedRepo, setSelectedRepo] = useState('')
  const BACKEND_URL = config.backendUrl;

  useEffect(() => {
    if (!messages?.length) {
      initializeChat()
    }
  }, [messages?.length, setMessages])

  const addMessage = async (content: string) => {
    setIsLoadingAnswer(true)
    try {
      const newMessage: ChatCompletionRequestMessage = {
        role: 'user',
        content
      }
      const newMessages = [...messages, newMessage]

      // Add the user message to the state so we can see it immediately
      setMessages(newMessages)

      console.log("message")
      // Send the message to the back-end and get the response
      const response = await fetch(`${BACKEND_URL}/chat`, { // Adjust the endpoint as necessary
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "query": content,
          "repo_url": selectedRepo,
          "chat_history": messages
        }),
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const data = await response.json()
      const assistantMessage: ChatCompletionRequestMessage = {
        role: 'assistant',
        content: data // Assuming the response contains a 'reply' field
      }

      // Add the assistant's response to the messages
      setMessages((prevMessages) => [...prevMessages, assistantMessage])

    } catch (error) {
      // Show error when something goes wrong
      addToast({ title: 'An error occurred', type: 'error' })
    } finally {
      setIsLoadingAnswer(false)
    }
  }

  const initializeChat = (repo: string = '') => {
    const systemMessage: ChatCompletionRequestMessage = {
      role: 'system',
      content: 'You are ChatGPT, a large language model trained by OpenAI.'
    }
    const repoName = repo?.split('/').pop()?.replace('.git', '') ?? '';
    let mess = `
Hello! How can I assist you today? I can help you understand, debug, and more with the ${repoName} repository.`
    if (repoName == '')
      mess = ''
    const welcomeMessage: ChatCompletionRequestMessage = {
      role: 'assistant',
      content: `Hi, How can I help you today? ${mess}`
    }
    setMessages([systemMessage, welcomeMessage])
  }

  return (
    <ChatsContext.Provider value={{ messages, addMessage, isLoadingAnswer, selectedRepo, setSelectedRepo, initializeChat }}>
      {children}
    </ChatsContext.Provider>
  )
}

export const useMessages = () => {
  return useContext(ChatsContext) as ContextProps & { initializeChat: () => void }
}
