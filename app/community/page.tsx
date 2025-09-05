'use client';

import { useUser } from '@clerk/nextjs';
import Navbar from '@/components/Navbar';
import Loading from '@/components/Loading';
import { useEffect, useState } from 'react';
import { Star, MessageCircle, Coffee, Plus, Image, Video, Send, Heart, Smile, MoreVertical, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { IKImage, IKUpload } from 'imagekitio-next';

interface Post {
  _id: string;
  userId: string;
  content: string;
  image?: string;
  video?: string;
  likes: string[];
  reactions: { [emoji: string]: string[] };
  comments: Array<{
    _id: string;
    userId: string;
    comment: string;
    createdAt: string;
  }>;
  createdAt: string;
  user: Array<{ email: string }>;
}

export default function CommunityPage() {
  const { user } = useUser();
  const [userRole, setUserRole] = useState<string>('user');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({ content: '', image: '', video: '' });
  const [commentInputs, setCommentInputs] = useState<{[key: string]: string}>({});
  const [expandedComments, setExpandedComments] = useState<{[key: string]: boolean}>({});
  const [showEmojiPicker, setShowEmojiPicker] = useState<{[key: string]: boolean}>({});
  const [showLikesModal, setShowLikesModal] = useState<{[key: string]: boolean}>({});
  const [isPosting, setIsPosting] = useState(false);
  const [likingPosts, setLikingPosts] = useState<{[key: string]: boolean}>({});
  const [reactingPosts, setReactingPosts] = useState<{[key: string]: boolean}>({});
  const [commentingPosts, setCommentingPosts] = useState<{[key: string]: boolean}>({});
  const [showPostMenu, setShowPostMenu] = useState<{[key: string]: boolean}>({});
  const [deletingPosts, setDeletingPosts] = useState<{[key: string]: boolean}>({});
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchPosts();
    if (user) {
      fetchUserRole();
    }
  }, [user]);

  const fetchUserRole = async () => {
    try {
      const response = await fetch('/api/user/role');
      if (response.ok) {
        const data = await response.json();
        setUserRole(data.role || 'user');
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts?limit=10');
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async () => {
    if (!user || !newPost.content.trim() || isPosting) return;
    
    setIsPosting(true);
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost)
      });
      
      if (response.ok) {
        setNewPost({ content: '', image: '', video: '' });
        setShowCreatePost(false);
        fetchPosts();
      }
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsPosting(false);
    }
  };

  const toggleLike = async (postId: string) => {
    if (!user || likingPosts[postId]) return;
    
    setLikingPosts({ ...likingPosts, [postId]: true });
    try {
      await fetch('/api/posts/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId })
      });
      fetchPosts();
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLikingPosts({ ...likingPosts, [postId]: false });
    }
  };

  const addReaction = async (postId: string, emoji: string) => {
    if (!user || reactingPosts[postId]) return;
    
    setReactingPosts({ ...reactingPosts, [postId]: true });
    try {
      await fetch('/api/posts/react', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, emoji })
      });
      setShowEmojiPicker({ ...showEmojiPicker, [postId]: false });
      fetchPosts();
    } catch (error) {
      console.error('Error adding reaction:', error);
    } finally {
      setReactingPosts({ ...reactingPosts, [postId]: false });
    }
  };

  const addComment = async (postId: string) => {
    if (!user || !commentInputs[postId]?.trim() || commentingPosts[postId]) return;
    
    setCommentingPosts({ ...commentingPosts, [postId]: true });
    try {
      await fetch('/api/posts/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, comment: commentInputs[postId] })
      });
      setCommentInputs({ ...commentInputs, [postId]: '' });
      fetchPosts();
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setCommentingPosts({ ...commentingPosts, [postId]: false });
    }
  };

  const deletePost = async (postId: string) => {
    if (deletingPosts[postId]) return;
    
    setDeletingPosts({ ...deletingPosts, [postId]: true });
    try {
      const response = await fetch('/api/posts/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId })
      });
      
      if (response.ok) {
        fetchPosts();
        setShowPostMenu({ ...showPostMenu, [postId]: false });
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    } finally {
      setDeletingPosts({ ...deletingPosts, [postId]: false });
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pt-16 pb-20">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-light mb-4">Community</h1>
            <p className="text-gray-500 mb-6">Share your tea moments</p>
            
            {user && (
              <button
                onClick={() => setShowCreatePost(!showCreatePost)}
                className="bg-black text-white px-6 py-3 font-medium hover:bg-gray-800 transition-colors flex items-center space-x-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                <span>CREATE POST</span>
              </button>
            )}
          </div>
          
          {/* Create Post Form */}
          {showCreatePost && user && (
            <motion.div
              className="border border-gray-200 p-3 sm:p-4 mb-6 sm:mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="space-y-3">
                {/* User Info */}
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-medium text-xs">
                      {user.emailAddresses[0]?.emailAddress?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {user.emailAddresses[0]?.emailAddress?.split('@')[0]}
                  </span>
                </div>
                
                {/* Textarea */}
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  placeholder="Share your tea experience..."
                  className="w-full p-3 border border-gray-200 resize-none focus:outline-none focus:border-black rounded text-sm"
                  rows={4}
                />
                
                {/* Image Preview */}
                {newPost.image && (
                  <div className="relative">
                    <IKImage
                      urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!}
                      path={newPost.image}
                      alt="Preview"
                      width={400}
                      height={300}
                      className="w-full max-h-48 sm:max-h-64 object-cover rounded"
                    />
                    <button
                      onClick={() => setNewPost({ ...newPost, image: '' })}
                      className="absolute top-2 right-2 bg-black text-white w-6 h-6 flex items-center justify-center text-sm rounded-full hover:bg-gray-800"
                    >
                      ×
                    </button>
                  </div>
                )}
                
                {/* Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <div className="flex items-center space-x-4">
                    <IKUpload
                      publicKey={process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!}
                      urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!}
                      authenticator={async () => {
                        try {
                          const response = await fetch('/api/imagekit-auth');
                          return await response.json();
                        } catch (error) {
                          throw new Error('Authentication failed');
                        }
                      }}
                      onUploadStart={() => setUploading(true)}
                      onSuccess={(result) => {
                        setNewPost({ ...newPost, image: result.filePath, video: '' });
                        setUploading(false);
                      }}
                      onError={() => setUploading(false)}
                      className="hidden"
                      id="image-upload"
                      folder="/community"
                      accept="image/*"
                    />
                    <label
                      htmlFor="image-upload"
                      className="flex items-center space-x-2 text-sm text-gray-500 hover:text-black cursor-pointer transition-colors"
                    >
                      <Image className="w-4 h-4" />
                      <span className="hidden sm:inline">PHOTO</span>
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => {
                        setShowCreatePost(false);
                        setNewPost({ content: '', image: '', video: '' });
                      }}
                      className="text-sm text-gray-500 hover:text-black transition-colors px-3 py-2"
                    >
                      CANCEL
                    </button>
                    <button
                      onClick={createPost}
                      disabled={!newPost.content.trim() || isPosting || uploading}
                      className="bg-black text-white px-4 py-2 text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center space-x-2 rounded"
                    >
                      {isPosting || uploading ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                      ) : (
                        <Send className="w-3 h-3" />
                      )}
                      <span className="text-xs sm:text-sm">
                        {isPosting ? 'POSTING...' : uploading ? 'UPLOADING...' : 'POST'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Posts */}
          {posts.length === 0 ? (
            <div className="text-center py-16">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-light mb-2">No Posts Yet</h3>
              <p className="text-gray-500">Be the first to share your tea story</p>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post, index) => (
                <motion.div
                  key={post._id}
                  className="border-b border-gray-100 pb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {/* Post Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-xs">
                          {post.user[0]?.email?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">
                          {post.user[0]?.email?.split('@')[0] || 'Anonymous'}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    {userRole === 'admin' && (
                      <div className="relative">
                        <button
                          onClick={() => setShowPostMenu({ ...showPostMenu, [post._id]: !showPostMenu[post._id] })}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-500" />
                        </button>
                        
                        {showPostMenu[post._id] && (
                          <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded shadow-lg z-10 w-24">
                            <button
                              onClick={() => deletePost(post._id)}
                              disabled={deletingPosts[post._id]}
                              className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Post Content */}
                  <p className="text-gray-700 mb-3 text-sm leading-relaxed">{post.content}</p>
                  
                  {/* Post Image */}
                  {post.image && (
                    <div className="mb-3">
                      <IKImage
                        urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!}
                        path={post.image}
                        alt="Post image"
                        width={500}
                        height={400}
                        className="w-full max-h-80 object-cover rounded"
                      />
                    </div>
                  )}
                  
                  {/* Actions */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => toggleLike(post._id)}
                        disabled={likingPosts[post._id]}
                        className="flex items-center space-x-1 text-sm"
                      >
                        <Heart className={`w-5 h-5 ${
                          post.likes.includes(user?.id || '') 
                            ? 'text-red-500 fill-current' 
                            : 'text-gray-600'
                        }`} />
                        <span>{post.likes.length}</span>
                      </button>
                      
                      <button className="flex items-center space-x-1 text-sm">
                        <MessageCircle className="w-5 h-5 text-gray-600" />
                        <span>{post.comments.length}</span>
                      </button>
                      
                      <div className="relative">
                        <button
                          onClick={() => setShowEmojiPicker({ ...showEmojiPicker, [post._id]: !showEmojiPicker[post._id] })}
                          className="flex items-center space-x-1 text-sm"
                        >
                          <Smile className="w-5 h-5 text-gray-600" />
                        </button>
                        
                        {showEmojiPicker[post._id] && (
                          <div className="absolute top-8 left-0 bg-white border border-gray-200 rounded p-2 shadow-lg z-10 flex space-x-1">
                            {['😍', '😂', '😮', '😢', '😡', '👍'].map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => addReaction(post._id, emoji)}
                                className="text-lg hover:scale-125 transition-transform p-1"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Reactions */}
                  {post.reactions && Object.keys(post.reactions).length > 0 && (
                    <div className="flex items-center space-x-2 mb-3">
                      {Object.entries(post.reactions).map(([emoji, users]) => (
                        <div key={emoji} className="flex items-center space-x-1 bg-gray-100 rounded-full px-2 py-1">
                          <span className="text-sm">{emoji}</span>
                          <span className="text-xs text-gray-600">{users.length}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Comments */}
                  {post.comments.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {post.comments.slice(-2).map((comment) => (
                        <div key={comment._id} className="text-sm">
                          <span className="font-medium mr-2">user</span>
                          <span className="text-gray-700">{comment.comment}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Add Comment */}
                  {user && (
                    <div className="flex items-center space-x-3 pt-3 border-t border-gray-100">
                      <input
                        type="text"
                        value={commentInputs[post._id] || ''}
                        onChange={(e) => setCommentInputs({ ...commentInputs, [post._id]: e.target.value })}
                        placeholder="Add a comment..."
                        className="flex-1 text-sm border-none outline-none bg-transparent placeholder-gray-500"
                        onKeyPress={(e) => e.key === 'Enter' && addComment(post._id)}
                      />
                      {commentInputs[post._id]?.trim() && (
                        <button
                          onClick={() => addComment(post._id)}
                          disabled={commentingPosts[post._id]}
                          className="text-blue-500 hover:text-blue-700 font-medium text-sm"
                        >
                          Post
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}