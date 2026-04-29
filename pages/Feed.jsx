import { useState } from 'react'
import FilterModal from '../components/filterModal'
import SearchBar from '../components/serachBar'
import PostCard from '../components/PostCard'

const Feed = () => {
  const [visible, setVisible] = useState(false)

  return (
    <div className="w-full min-h-screen bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 py-6">
  
      <div className="flex justify-center items-center mb-6 border-b">
        <span className="mx-4 pb-2 border-b-2 border-orange-500 cursor-pointer font-medium">
          Nearby
        </span>
        <span className="mx-4 pb-2 border-b-2 border-transparent hover:border-orange-500 cursor-pointer font-medium">
          Worldwide
        </span>
      </div>
  
      <div className="flex items-center gap-4 mb-6">
          <div className='me-2 w-2/3'>
          <SearchBar />
          </div>
  
        <button className="bg-orange-500 text-white rounded-lg px-6 py-2 font-medium ">
          New Post
        </button>
      </div>
  
      <div className="flex gap-6">
  
        <div className="flex-1 bg-white rounded-xl shadow p-4">
        <PostCard
  profileImage="https://i.pravatar.cc/150?img=3"
  name="Yash Sharma"
  time="2 hours ago"
  content="Just explored a hidden waterfall near Rishikesh 🌿✨ Highly recommend visiting during monsoon!"
/>
        </div>
  
        <div className="w-64 p-4 hidden lg:block">
          <FilterModal />
        </div>
  
      </div>
    </div>
  </div>
  
  )
}

export default Feed
