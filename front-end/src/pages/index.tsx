import MessageForm from 'components/MessageForm'
import MessagesList from 'components/MessageList'
import LeftBar from 'components/LeftBar' // Import the new LeftBar component
import { NextPage } from 'next'
import { MessagesProvider } from 'utils/useMessages'
import Layout from '../components/Layout'

const IndexPage: NextPage = () => {
  return (
    <MessagesProvider>
      <Layout>
        <div className="flex"> 
          <div className="fixed left-0 top-0 bottom-0 overflow-y-auto">
            <LeftBar />
          </div>
          <div className="flex-1 ml-64 mb-64">
            <MessagesList />
          </div>
        </div>
        <div className="fixed ml-64 bottom-0 right-0 left-0">
          <MessageForm />
        </div>
      </Layout>
    </MessagesProvider>
  )
}

export default IndexPage