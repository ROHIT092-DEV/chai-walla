'use client';

import { useUser } from '@clerk/nextjs';
import Navbar from '@/components/Navbar';
import Loading from '@/components/Loading';
import { useEffect, useState } from 'react';
import { MessageCircle, Plus, Heart, Send, Image, Smile, MoreVertical, Trash2 } from 'lucide-react';
import { IKImage, IKUpload } from 'imagekitio-next';

interface Post {
  _id: string;
  userId: string;
  content: string;
  image?: string;
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
  const [newPost, setNewPost] = useState({ content: '', image: '' });
  const [commentInputs, setCommentInputs] = useState<{[key: string]: string}>({});
  const [showEmojiPicker, setShowEmojiPicker] = useState<{[key: string]: boolean}>({});
  const [showPostMenu, setShowPostMenu] = useState<{[key: string]: boolean}>({});
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
      const response = await fetch('/api/posts?limit=20');
      if (response.ok) {
        const data = await response.json();
        setPosts(data.sort((a: Post, b: Post) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ));
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async () => {
    if (!user || (!newPost.content.trim() && !newPost.image)) return;
    
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost)
      });
      
      if (response.ok) {
        setNewPost({ content: '', image: '' });
        setShowCreatePost(false);
        fetchPosts();
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const toggleLike = async (postId: string) => {
    if (!user) return;
    
    try {
      await fetch('/api/posts/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId })
      });
      fetchPosts();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const addReaction = async (postId: string, emoji: string) => {
    if (!user) return;
    
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
    }
  };

  const addComment = async (postId: string) => {
    if (!user || !commentInputs[postId]?.trim()) return;
    
    try {
      await fetch('/api/posts/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, comment: commentInputs[postId].trim() })
      });
      setCommentInputs({ ...commentInputs, [postId]: '' });
      fetchPosts();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const deletePost = async (postId: string) => {
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
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-16 pb-20">
        <div className="max-w-lg mx-auto px-4 py-6">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2">Tea Community</h1>
            <p className="text-gray-600 text-sm">Share your tea moments</p>
          </div>
          
          {/* Create Post Button */}
          {user && (
            <div className="mb-6">
              <button
                onClick={() => setShowCreatePost(!showCreatePost)}
                className="w-full bg-white border border-gray-200 rounded-lg p-4 flex items-center space-x-3 hover:bg-gray-50"
              >
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-xs">
                    {user.emailAddresses[0]?.emailAddress?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-gray-500 flex-1 text-left">Share your tea experience...</span>
                <Plus className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          )}
          
          {/* Create Post Form */}
          {showCreatePost && user && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-xs">
                    {user.emailAddresses[0]?.emailAddress?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="font-medium text-sm">
                  {user.emailAddresses[0]?.emailAddress?.split('@')[0]}
                </span>
              </div>
              
              <textarea
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                placeholder="What's brewing? Share your tea story..."
                className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:border-black text-sm"
                rows={3}
                maxLength={500}
              />
              
              {/* Image Preview */}
              {newPost.image && (
                <div className="relative mt-3">
                  <IKImage
                    urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!}
                    path={newPost.image}
                    alt="Preview"
                    width={400}
                    height={300}
                    className="w-full max-h-64 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => setNewPost({ ...newPost, image: '' })}
                    className="absolute top-2 right-2 bg-black bg-opacity-50 text-white w-6 h-6 flex items-center justify-center text-sm rounded-full hover:bg-opacity-70"
                  >
                    ×
                  </button>
                </div>
              )}
              
              <div className="flex items-center justify-between mt-4">
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
                      setNewPost({ ...newPost, image: result.filePath });
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
                    className="flex items-center space-x-2 text-sm text-gray-500 hover:text-black cursor-pointer"
                  >
                    <Image className="w-5 h-5" />
                    <span>Photo</span>
                  </label>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      setShowCreatePost(false);
                      setNewPost({ content: '', image: '' });
                    }}
                    className="text-sm text-gray-500 hover:text-black px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createPost}
                    disabled={(!newPost.content.trim() && !newPost.image) || uploading}
                    className="bg-black text-white px-4 py-2 text-sm font-medium hover:bg-gray-800 disabled:opacity-50 rounded-lg"
                  >
                    {uploading ? 'Uploading...' : 'Share'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Posts */}
          {posts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Posts Yet</h3>
              <p className="text-gray-500">Be the first to share your tea story</p>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <div key={post._id} className="bg-white rounded-lg border border-gray-200">
                  {/* Post Header */}
                  <div className="flex items-center justify-between p-4">
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
                  
                  {/* Post Image */}
                  {post.image && (
                    <div className="w-full">
                      <IKImage
                        urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!}
                        path={post.image}
                        alt="Post image"
                        width={500}
                        height={400}
                        className="w-full max-h-96 object-cover"
                      />
                    </div>
                  )}
                  
                  {/* Post Content */}
                  {post.content && (
                    <div className="px-4 py-3">
                      <p className="text-gray-800 text-sm leading-relaxed">
                        <span className="font-medium mr-2">
                          {post.user[0]?.email?.split('@')[0] || 'Anonymous'}
                        </span>
                        {post.content}
                      </p>
                    </div>
                  )}
                  
                  {/* Actions */}
                  <div className="px-4 py-2">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => toggleLike(post._id)}
                          className="flex items-center space-x-1"
                        >
                          <Heart className={`w-6 h-6 ${
                            post.likes.includes(user?.id || '') 
                              ? 'text-red-500 fill-current' 
                              : 'text-gray-700'
                          }`} />
                        </button>
                        
                        <button className="flex items-center space-x-1">
                          <MessageCircle className="w-6 h-6 text-gray-700" />
                        </button>
                        
                        <div className="relative">
                          <button
                            onClick={() => setShowEmojiPicker({ ...showEmojiPicker, [post._id]: !showEmojiPicker[post._id] })}
                            className="flex items-center space-x-1"
                          >
                            <Smile className="w-6 h-6 text-gray-700" />
                          </button>
                          
                          {showEmojiPicker[post._id] && (
                            <div className="absolute top-8 left-0 bg-white border border-gray-200 rounded-lg p-2 shadow-lg z-10 flex space-x-1">
                              {['😍', '😂', '😮', '😢', '😡', '👍', '❤️', '🔥'].map((emoji) => (
                                <button
                                  key={emoji}
                                  onClick={() => addReaction(post._id, emoji)}
                                  className="text-lg hover:scale-125 transition-transform p-1 hover:bg-gray-100 rounded"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Likes Count */}
                    {post.likes.length > 0 && (
                      <p className="text-sm font-medium mb-1">
                        {post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}
                      </p>
                    )}
                    
                    {/* Reactions */}
                    {post.reactions && Object.keys(post.reactions).length > 0 && (
                      <div className="flex items-center space-x-2 mb-2">
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
                      <div className="space-y-1 mb-2">
                        {post.comments.slice(-3).map((comment) => (
                          <div key={comment._id} className="text-sm">
                            <span className="font-medium mr-2">
                              {comment.userId === user?.id ? 'You' : 'User'}
                            </span>
                            <span className="text-gray-700">{comment.comment}</span>
                          </div>
                        ))}
                        {post.comments.length > 3 && (
                          <button className="text-sm text-gray-500">
                            View all {post.comments.length} comments
                          </button>
                        )}
                      </div>
                    )}
                    
                    {/* Add Comment */}
                    {user && (
                      <div className="flex items-center space-x-3 pt-2 border-t border-gray-100">
                        <input
                          type="text"
                          value={commentInputs[post._id] || ''}
                          onChange={(e) => setCommentInputs({ ...commentInputs, [post._id]: e.target.value })}
                          placeholder="Add a comment..."
                          className="flex-1 text-sm border-none outline-none bg-transparent placeholder-gray-500 py-2"
                          onKeyPress={(e) => e.key === 'Enter' && addComment(post._id)}
                          maxLength={200}
                        />
                        {commentInputs[post._id]?.trim() && (
                          <button
                            onClick={() => addComment(post._id)}
                            className="text-blue-500 hover:text-blue-700 font-medium text-sm"
                          >
                            Post
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}