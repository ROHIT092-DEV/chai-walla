import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <SignIn 
        appearance={{
          elements: {
            card: 'shadow-xl border-0',
            headerTitle: 'text-2xl font-bold',
            socialButtonsBlockButton: 'bg-white border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50'
          }
        }}
      />
    </div>
  )
}