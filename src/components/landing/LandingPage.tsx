"use client";

import Image from "next/image";
import Link from "next/link";

function ChatLogoMark() {
  return (
    <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#7C5CFF] to-[#A78BFA] shadow-[0_10px_30px_rgba(124,92,255,0.35)]">
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M8.5 18.25 6 20.5v-3.25A5.25 5.25 0 0 1 .75 12V7.75A5.25 5.25 0 0 1 6 2.5h12A5.25 5.25 0 0 1 23.25 7.75V12A5.25 5.25 0 0 1 18 17.25H10.5"
          stroke="white"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#F6F2FF] to-white text-zinc-900">
      <header className="sticky top-0 z-20 border-b border-zinc-200/70 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <ChatLogoMark />
            <span className="text-base font-semibold tracking-tight">
              AnyChat
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="inline-flex items-center rounded-full bg-gradient-to-r from-[#7C5CFF] to-[#A78BFA] px-5 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(124,92,255,0.35)] transition hover:opacity-95"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-4 pb-14 pt-8 sm:px-6 sm:pb-20 sm:pt-12">
          <div className="relative overflow-hidden rounded-[32px] border border-zinc-200/70 bg-gradient-to-br from-white/70 via-white/40 to-[#EEE9FF] shadow-[0_30px_120px_rgba(17,24,39,0.10)]">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#EDE7FF] blur-3xl" />
              <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-[#E9F2FF] blur-3xl" />
            </div>

            <div className="relative grid min-h-[420px] gap-10 px-6 py-10 sm:px-10 sm:py-14 lg:min-h-[460px] lg:grid-cols-3 lg:items-center">
              {/* Left floating cards */}
              <div className="relative hidden md:block">
                <div className="absolute left-2 top-4 w-56 rounded-2xl bg-white/90 p-4 shadow-[0_20px_60px_rgba(17,24,39,0.12)]">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 overflow-hidden rounded-full bg-zinc-200">
                      <Image
                        src="/landing/avatar-1.png"
                        alt=""
                        width={36}
                        height={36}
                        className="h-9 w-9 object-cover"
                        priority
                      />
                    </div>
                    <div className="leading-tight">
                      <p className="text-sm font-medium text-zinc-900">Hi!!</p>
                      <p className="mt-1 text-xs text-zinc-500">
                        Just ask you one question
                      </p>
                    </div>
                  </div>
                </div>

                <div className="absolute left-10 top-36 w-64 rounded-2xl bg-white/90 p-4 shadow-[0_20px_60px_rgba(17,24,39,0.12)]">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 overflow-hidden rounded-full bg-zinc-200">
                      <Image
                        src="/landing/avatar-2.png"
                        alt=""
                        width={36}
                        height={36}
                        className="h-9 w-9 object-cover"
                        priority
                      />
                    </div>
                    <p className="text-xs text-zinc-700">
                      How do birds navigate
                      <br />
                      during migration?
                    </p>
                  </div>
                </div>

                <div className="absolute left-24 top-[285px] grid h-11 w-11 place-items-center rounded-full bg-white/90 shadow-[0_20px_60px_rgba(17,24,39,0.12)]">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 21s-6.5-4.4-9.2-8.1C.7 10.1 2.2 6.8 5.6 6.2c1.8-.3 3.6.5 4.6 2 1-1.5 2.8-2.3 4.6-2 3.4.6 4.9 3.9 2.8 6.7C18.5 16.6 12 21 12 21Z"
                      stroke="#7C5CFF"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <div className="absolute left-0 top-[345px] w-28 overflow-hidden rounded-2xl bg-white/90 shadow-[0_20px_60px_rgba(17,24,39,0.12)]">
                  <div className="relative h-28 w-28 bg-zinc-200">
                    <Image
                      src="/landing/side-dog.png"
                      alt=""
                      width={112}
                      height={112}
                      className="h-28 w-28 object-cover"
                      priority
                    />
                  </div>
                </div>
              </div>

              {/* Center CTA card */}
              <div className="lg:col-span-1">
                <div className="mx-auto w-full max-w-sm rounded-[28px] bg-white p-8 text-center shadow-[0_30px_120px_rgba(17,24,39,0.14)]">
                  <div className="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#7C5CFF] to-[#A78BFA]">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M6.5 18.5 4 20.8v-3.3A5.3 5.3 0 0 1 1 12.4V8.4A5.4 5.4 0 0 1 6.4 3h11.2A5.4 5.4 0 0 1 23 8.4v4a5.4 5.4 0 0 1-5.4 5.4H10.7"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>

                  <h1 className="text-balance text-3xl font-semibold tracking-tight text-zinc-900">
                    Unleash AnyChat
                    <br />
                    Conversations
                  </h1>
                  <p className="mt-3 text-sm text-zinc-500">
                    To continue, kindly log in with your account
                  </p>

                  <Link
                    href="/sign-up"
                    className="mt-7 inline-flex w-full items-center justify-center rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800"
                  >
                    Sign up
                  </Link>

                  <div className="mt-3">
                    <Link
                      href="/sign-in"
                      className="text-xs font-medium text-zinc-500 hover:text-zinc-800"
                    >
                      Sign in
                    </Link>
                  </div>

                  <p className="mt-7 text-[11px] text-zinc-400">
                    Trusted by 2M+ users worldwide
                  </p>
                </div>
              </div>

              {/* Right floating cards */}
              <div className="relative hidden md:block">
                <div className="absolute right-6 top-2 w-72 rounded-2xl bg-white/90 p-4 shadow-[0_20px_60px_rgba(17,24,39,0.12)]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold tracking-wide text-zinc-500">
                        GENERATED RESULT
                      </p>
                      <p className="mt-2 text-xs font-medium text-zinc-800">
                        “Create a cool cat wallpaper”
                      </p>
                    </div>
                    <div className="grid h-8 w-8 place-items-center rounded-full bg-white shadow-[0_10px_30px_rgba(17,24,39,0.10)]">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M12 21s-6.5-4.4-9.2-8.1C.7 10.1 2.2 6.8 5.6 6.2c1.8-.3 3.6.5 4.6 2 1-1.5 2.8-2.3 4.6-2 3.4.6 4.9 3.9 2.8 6.7C18.5 16.6 12 21 12 21Z"
                          stroke="#FF4D6D"
                          strokeWidth="2"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>

                  <div className="mt-3 overflow-hidden rounded-xl bg-zinc-100">
                    <Image
                      src="/landing/result-cat.png"
                      alt=""
                      width={320}
                      height={200}
                      className="h-40 w-full object-cover"
                      priority
                    />
                  </div>
                </div>

                <div className="absolute right-2 top-[265px] grid h-11 w-44 place-items-center rounded-full bg-white/90 px-4 text-xs text-zinc-500 shadow-[0_20px_60px_rgba(17,24,39,0.12)]">
                  <div className="flex w-full items-center justify-between gap-3">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-[#EAFBF1]">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M7 12.5 10.2 15.7 17 8.9"
                          stroke="#2EA44F"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <span className="truncate text-[11px] text-zinc-500">
                      Share with your team
                    </span>
                  </div>
                </div>

                <div className="absolute right-10 top-[345px] w-72 rounded-2xl bg-white/90 p-4 shadow-[0_20px_60px_rgba(17,24,39,0.12)]">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 overflow-hidden rounded-full bg-zinc-200">
                      <Image
                        src="/landing/avatar-3.png"
                        alt=""
                        width={36}
                        height={36}
                        className="h-9 w-9 object-cover"
                        priority
                      />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#7C5CFF]">
                        AnyChat AI{" "}
                        <span className="ml-1 font-medium text-zinc-400">
                          · 2s ago
                        </span>
                      </p>
                      <p className="mt-1 text-xs text-zinc-600">
                        Certainly! Here are some
                        <br />
                        creative prompt ideas for
                        <br />
                        your next project...
                      </p>
                      <button className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-[#7C5CFF] hover:opacity-90">
                        View more
                        <span aria-hidden="true">→</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile-only light decorations (keep center aligned) */}
              <div className="mx-auto block w-full max-w-sm lg:hidden">
                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-white/80 p-4 shadow-[0_20px_60px_rgba(17,24,39,0.10)]">
                    <p className="text-[10px] font-semibold tracking-wide text-zinc-500">
                      GENERATED RESULT
                    </p>
                    <div className="mt-3 overflow-hidden rounded-xl bg-zinc-100">
                      <Image
                        src="/landing/result-cat.png"
                        alt=""
                        width={320}
                        height={200}
                        className="h-24 w-full object-cover"
                        priority
                      />
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white/80 p-4 shadow-[0_20px_60px_rgba(17,24,39,0.10)]">
                    <p className="text-[10px] font-semibold tracking-wide text-zinc-500">
                      SAMPLE CHAT
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="h-9 w-9 overflow-hidden rounded-full bg-zinc-200">
                        <Image
                          src="/landing/avatar-3.png"
                          alt=""
                          width={36}
                          height={36}
                          className="h-9 w-9 object-cover"
                          priority
                        />
                      </div>
                      <p className="text-xs text-zinc-600">
                        Creative prompt ideas...
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Refined AnyChat Privacy Section */}
        <section className="relative overflow-hidden bg-[#F8F5FF] py-24 md:py-40">
          {/* Top Decorative Image */}
          <div className="pointer-events-none absolute -top-10 left-0 right-0 z-0 flex justify-center opacity-40 md:opacity-80">
            <img
              src="https://scontent.whatsapp.net/v/t39.8562-34/472789625_593649246596394_5449176563091833632_n.png?stp=dst-webp&ccb=1-7&_nc_sid=73b08c&_nc_ohc=qYLP3xLYFcUQ7kNvwEtZYhz&_nc_oc=AdnZJ2zJ2-5Gg9yeQCxV_jz8dRvINobuIMcMRowIcoZfoTCGbLRGKdTdFnKJwU7Ce8M&_nc_zt=3&_nc_ht=scontent.whatsapp.net&_nc_gid=dSbg1km5XrgQNlUTqkknwQ&oh=01_Q5Aa3wH0-Oo2EsiRg1ylUHx57-hvhmgnU5gS07vpEk3dXWPKnQ&oe=69A33A5E"
              alt=""
              className="max-w-[1200px] w-full"
            />
          </div>

          <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
            <span className="mb-4 inline-block rounded-full bg-[#7C5CFF]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#7C5CFF]">
              Privacy First
            </span>
            <h2 className="text-balance text-3xl font-semibold leading-[1.2] tracking-tight text-zinc-900 md:text-[48px] lg:text-[56px]">
              Where meaningful <span className="bg-gradient-to-r from-[#7C5CFF] to-[#4F8DFF] bg-clip-text text-transparent">conversations</span> happen. AnyChat brings you closer with seamless speed and iron-clad privacy.
            </h2>
          </div>

          {/* Bottom Decorative Image */}
          <div className="pointer-events-none absolute -bottom-10 left-0 right-0 z-0 flex justify-center opacity-40 md:opacity-80">
            <img
              src="https://scontent.whatsapp.net/v/t39.8562-34/473083383_985260680138627_8314586055954509622_n.png?stp=dst-webp&ccb=1-7&_nc_sid=73b08c&_nc_ohc=Mr84bRc_0RIQ7kNvwEnldNU&_nc_oc=AdkSma2JHOECyD7Xiwu4zgBlZAwDHXv7S2wsH-eLuYzhnV7hRKpY7cNJAlb5Skn7zQA&_nc_zt=3&_nc_ht=scontent.whatsapp.net&_nc_gid=dSbg1km5XrgQNlUTqkknwQ&oh=01_Q5Aa3wG-xl_OXLaZaO5Hhz4R2lAoFGRfFGwX8NEIR3iQrkwmaA&oe=69A3340E"
              alt=""
              className="max-w-[1200px] w-full"
            />
          </div>
        </section>

        {/* Groups Section */}
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-32">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            {/* Left Column: Text */}
            <div className="flex flex-col items-start text-left">
              <h2 className="text-balance text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl lg:text-[54px] lg:leading-[1.1]">
                Keep in touch <br className="hidden sm:block" /> with your groups
              </h2>
              <p className="mt-8 max-w-lg text-lg leading-relaxed text-zinc-600 sm:text-xl">
                Whether it&apos;s planning an outing with friends or simply staying on top of your family chats, group conversations should feel effortless.
              </p>
              <button className="mt-10 inline-flex items-center gap-2 text-base font-semibold text-purple-600  transition hover:underline group">
                Learn more
                <span className="text-xl transition-transform group-hover:translate-x-1">›</span>
              </button>
            </div>

            {/* Right Column: Phone Mockup & Decoration */}
            <div className="relative">
              {/* Phone Image Container */}
              <div className="relative mx-auto max-w-[420px] animate-in fade-in zoom-in duration-1000">
                <img
                  src="https://scontent.whatsapp.net/v/t39.8562-34/473285216_1384759809157265_1212522016876804051_n.png?stp=dst-webp&ccb=1-7&_nc_sid=73b08c&_nc_ohc=hF0xIf9mA4MQ7kNvwFMg6Qc&_nc_oc=Adl7OcJj-o4v0YdDB9JhDi3Dvwc3REQwrtlEvqzcEsdj_c_N6hnUiKpIEz648C4u9co&_nc_zt=3&_nc_ht=scontent.whatsapp.net&_nc_gid=dSbg1km5XrgQNlUTqkknwQ&oh=01_Q5Aa3wGUmd1mXRKj1YKDq0PWHxsoUQPsJqt78QjM6EsoPeUu9Q&oe=69A346ED"
                  alt="AnyChat Group Interface"
                  className="relative z-10 w-full drop-shadow-[0_35px_60px_rgba(0,0,0,0.15)]"
                />

                {/* Floating Chat Elements (URL 1) - Now placed ON TOP with z-20 */}
                <div className="absolute -inset-2 z-20 pointer-events-none sm:-inset-6">
                  <img
                    src="https://scontent.whatsapp.net/v/t39.8562-34/473133701_1117947663095492_624070062160080759_n.png?stp=dst-webp&ccb=1-7&_nc_sid=73b08c&_nc_ohc=lfoZ5RkfU7MQ7kNvwHKXhu0&_nc_oc=Adk5Wrhliq243t0PllpmXAOWjB61DY434dyyydrYn5If2nhWBCG66jHAchk0S0K-AMo&_nc_zt=3&_nc_ht=scontent.whatsapp.net&_nc_gid=dSbg1km5XrgQNlUTqkknwQ&oh=01_Q5Aa3wGUjVmfQJvJQ_ZYydgKr27j3mNif4zO1NfHRbXK3uhT1w&oe=69A34755"
                    alt=""
                    className="h-full w-full object-contain"
                  />
                </div>

                {/* Subtle shadow glow */}
                <div className="absolute inset-0 z-0 scale-95 rounded-[60px] bg-gradient-to-b from-[#7C5CFF]/10 to-transparent blur-3xl" />
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-zinc-200/70 bg-white/60">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-5">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3">
                <ChatLogoMark />
                <span className="text-base font-semibold tracking-tight">
                  AnyChat
                </span>
              </div>
              <p className="mt-4 max-w-sm text-sm text-zinc-500">
                The most seamless way to talk to anyone, anywhere.
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-zinc-900">Product</p>
              <ul className="mt-4 space-y-2 text-sm text-zinc-500">
                <li>Features</li>
                <li>Integrations</li>
                <li>Enterprise</li>
              </ul>
            </div>

            <div>
              <p className="text-sm font-semibold text-zinc-900">Support</p>
              <ul className="mt-4 space-y-2 text-sm text-zinc-500">
                <li>Help Center</li>
                <li>API Docs</li>
                <li>Community</li>
              </ul>
            </div>

            <div>
              <p className="text-sm font-semibold text-zinc-900">Legal</p>
              <ul className="mt-4 space-y-2 text-sm text-zinc-500">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Cookie Policy</li>
              </ul>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

