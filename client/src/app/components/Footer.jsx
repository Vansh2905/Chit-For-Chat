// components/Footer.jsx
export default function Footer() {
  return (
    <footer className="bg-white border-t mt-12">
      <div className="max-w-6xl mx-auto px-6 py-6 text-sm text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div>© {new Date().getFullYear()} Chit-For-Chat. Built with ❤️</div>
        <div className="flex gap-4">
          <a href="/terms" className="hover:underline">Terms</a>
          <a href="/privacy" className="hover:underline">Privacy</a>
        </div>
      </div>
    </footer>
  );
}
