export default function PageWrapper({ children, className = '' }) {
  return (
    <main className={`max-w-lg mx-auto w-full px-4 pt-4 pb-24 ${className}`}>
      {children}
    </main>
  )
}
