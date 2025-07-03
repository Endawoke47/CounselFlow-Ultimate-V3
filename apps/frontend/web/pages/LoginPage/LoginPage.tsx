import { Separator } from '@/shared/ui/Separator';
import { LoginForm } from '@/widgets/login/ui';

export const LoginPage = ()=>{
  return (
    <div className="h-screen flex">
      <div className="bg-teal-700 text-white flex items-center justify-center w-1/2">
        <h1 className="text-4xl font-bold tracking-tight">COUNSEL<span className="font-normal">FLOW</span></h1>
      </div>
      <div className="bg-white flex flex-col justify-center items-center w-1/2 p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">LOGIN</h2>
        <Separator className="w-full my-4 bg-teal-700 max-w-md"/>
        <LoginForm />
      </div>
    </div>
  )
}
