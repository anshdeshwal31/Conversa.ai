import { SignIn } from '@clerk/nextjs'

export default function Page() {
    return (
        <div className='min-h-[calc(100vh-120px)] flex items-center justify-center px-4 py-10'>
            <div className='surface-frame ambient-panel p-6 md:p-8 w-full max-w-md'>
                <SignIn />
            </div>
        </div>
    )
}