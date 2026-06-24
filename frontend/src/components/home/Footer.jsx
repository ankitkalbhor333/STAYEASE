export default function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-100 py-12 px-6 md:px-12 text-slate-500 text-sm">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider mb-4">Support</h4>
          <ul className="space-y-2 text-xs">
            <li className="hover:underline cursor-pointer">Help Center</li>
            <li className="hover:underline cursor-pointer">Safety information</li>
            <li className="hover:underline cursor-pointer">Cancellation options</li>
            <li className="hover:underline cursor-pointer">Our COVID-19 Response</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider mb-4">Community</h4>
          <ul className="space-y-2 text-xs">
            <li className="hover:underline cursor-pointer">StayEase.org: disaster relief</li>
            <li className="hover:underline cursor-pointer">Support Afghan refugees</li>
            <li className="hover:underline cursor-pointer">Combating discrimination</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider mb-4">Hosting</h4>
          <ul className="space-y-2 text-xs">
            <li className="hover:underline cursor-pointer">Try hosting</li>
            <li className="hover:underline cursor-pointer">AirCover: protection for Hosts</li>
            <li className="hover:underline cursor-pointer">Explore hosting resources</li>
            <li className="hover:underline cursor-pointer">How to host responsibly</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider mb-4">LUXE</h4>
          <ul className="space-y-2 text-xs">
            <li className="hover:underline cursor-pointer">Newsroom</li>
            <li className="hover:underline cursor-pointer">Learn about new features</li>
            <li className="hover:underline cursor-pointer">Letter from our founders</li>
            <li className="hover:underline cursor-pointer">Careers</li>
          </ul>
        </div>
      </div>
      <hr className="border-slate-200 my-8 max-w-7xl mx-auto" />
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
        <p>&copy; 2026 LUXE Inc. All rights reserved.</p>
        <div className="flex gap-4">
          <span className="hover:underline cursor-pointer">Privacy</span>
          <span>&middot;</span>
          <span className="hover:underline cursor-pointer">Terms</span>
          <span>&middot;</span>
          <span className="hover:underline cursor-pointer">Sitemap</span>
        </div>
      </div>
    </footer>
  );
}
