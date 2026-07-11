import Link from 'next/link'

const FOOTER_LINKS = {
  Platform: [
    { label: 'Explore gigs', href: '/explore' },
    { label: 'Scout jobs', href: '/scout' },
    { label: 'Marketplace', href: '/marketplace' },
    { label: 'Community', href: '/community' },
    { label: 'Directory', href: '/directory' },
  ],
  Sellers: [
    { label: 'Become a seller', href: '/auth/signup' },
    { label: 'Seller levels', href: '/about#levels' },
    { label: 'Nolance Pro', href: '/pro' },
    { label: 'Nolance Learn', href: '/learn' },
    { label: 'Managed Services', href: '/managed' },
  ],
  Company: [
    { label: 'About us', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Blog', href: '/blog' },
    { label: 'Press', href: '/press' },
    { label: 'Transparency', href: '/transparency' },
  ],
  Support: [
    { label: 'Help center', href: 'https://help.nolance.com' },
    { label: 'Contact us', href: '/contact' },
    { label: 'Resolution center', href: '/resolution' },
    { label: 'Trust & safety', href: '/legal/community-guidelines' },
    { label: 'Affiliate program', href: '/affiliate' },
  ],
}

export function Footer() {
  return (
    <footer className="bg-navy-950 pt-16 pb-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="text-xl font-semibold text-white">Nol<span className="text-green-500">ance</span></span>
            </Link>
            <p className="text-sm text-gray-600 leading-relaxed max-w-[180px]">
              The world's greatest freelancing platform. Five sections. One account.
            </p>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-xs font-semibold text-green-700 uppercase tracking-widest mb-4">{heading}</h4>
              <ul className="space-y-2.5">
                {links.map(link => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-gray-600 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
            <span>© {new Date().getFullYear()} Nolance. All rights reserved.</span>
            <Link href="/legal/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/legal/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/legal/cookies" className="hover:text-white transition-colors">Cookies</Link>
          </div>
          <div className="flex gap-3">
            {['Twitter', 'Instagram', 'LinkedIn', 'TikTok'].map(platform => (
              <button key={platform}
                className="w-8 h-8 rounded-lg bg-white/4 hover:bg-white/8 flex items-center justify-center text-gray-600 hover:text-white transition-colors text-xs">
                {platform[0]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
