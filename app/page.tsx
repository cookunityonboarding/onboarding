export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans">
      {/* simple centered card with title and login form */}
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <div className="flex items-center gap-3 mb-6 text-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chef-hat h-7 w-7 text-primary-foreground" aria-hidden="true">
              <path d="M17 21a1 1 0 0 0 1-1v-5.35c0-.457.316-.844.727-1.041a4 4 0 0 0-2.134-7.589 5 5 0 0 0-9.186 0 4 4 0 0 0-2.134 7.588c.411.198.727.585.727 1.041V20a1 1 0 0 0 1 1Z"></path>
              <path d="M6 17h12"></path>
            </svg>
          </div>
          <span className="text-sm font-medium text-sidebar-foreground/70 uppercase tracking-wider">CookUnity CX</span>
        </div>
        <h1 className="mb-6 text-center text-2xl font-bold text-orange-700">
          CX Lead Onboarding Program
        </h1>
        <form className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              type="email"
              id="email"
              placeholder="you@example.com"
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-orange-600 py-2 text-white hover:bg-orange-700"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
