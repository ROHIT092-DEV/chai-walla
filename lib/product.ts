import clientPromise from './mongodb'
import { ObjectId } from 'mongodb'

export interface Product {
  _id?: string
  name: string
  price: number
  description: string
  categoryId: string
  image?: string
  stock: number
  featured?: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  _id?: string
  name: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

export async function createProduct(productData: Omit<Product, '_id' | 'createdAt' | 'updatedAt'>) {
  const client = await clientPromise
  const db = client.db('tea-stall')
  
  const product = {
    ...productData,
    createdAt: new Date(),
    updatedAt: new Date()
  }
  
  const result = await db.collection('products').insertOne(product)
  return result
}

export async function getAllProducts() {
  const client = await clientPromise
  const db = client.db('tea-stall')
  
  const products = await db.collection('products').find({}).sort({ createdAt: -1 }).toArray()
  return products as Product[]
}

export async function getFeaturedProducts() {
  const client = await clientPromise
  const db = client.db('tea-stall')
  
  const products = await db.collection('products').find({ featured: true }).limit(8).sort({ createdAt: -1 }).toArray()
  return products as Product[]
}

export async function getProductById(id: string) {
  const client = await clientPromise
  const db = client.db('tea-stall')
  
  const product = await db.collection('products').findOne({ _id: new ObjectId(id) })
  return product as Product | null
}

export async function updateProduct(id: string, productData: Partial<Product>) {
  const client = await clientPromise
  const db = client.db('tea-stall')
  
  const result = await db.collection('products').updateOne(
    { _id: new ObjectId(id) },
    { 
      $set: { 
        ...productData,
        updatedAt: new Date()
      }
    }
  )
  return result
}

export async function deleteProduct(id: string) {
  const client = await clientPromise
  const db = client.db('tea-stall')
  
  const result = await db.collection('products').deleteOne({ _id: new ObjectId(id) })
  return result
}

export async function updateProductStock(id: string, quantity: number) {
  const client = await clientPromise
  const db = client.db('tea-stall')
  
  const result = await db.collection('products').updateOne(
    { _id: new ObjectId(id) },
    { 
      $inc: { stock: -quantity },
      $set: { updatedAt: new Date() }
    }
  )
  return result
}

// Category functions
export async function createCategory(categoryData: Omit<Category, '_id' | 'createdAt' | 'updatedAt'>) {
  const client = await clientPromise
  const db = client.db('tea-stall')
  
  const category = {
    ...categoryData,
    createdAt: new Date(),
    updatedAt: new Date()
  }
  
  const result = await db.collection('categories').insertOne(category)
  return result
}

export async function getAllCategories() {
  const client = await clientPromise
  const db = client.db('tea-stall')
  
  const categories = await db.collection('categories').find({}).sort({ createdAt: -1 }).toArray()
  return categories as Category[]
}

export async function deleteCategory(id: string) {
  const client = await clientPromise
  const db = client.db('tea-stall')
  
  const result = await db.collection('categories').deleteOne({ _id: new ObjectId(id) })
  return result
}